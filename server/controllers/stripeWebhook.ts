import { Request, Response } from "express"
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

export const stripeWebhook = async (request: Request, response: Response) => {
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    
    if (!endpointSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET is missing from environment variables.");
        return response.sendStatus(500);
    }

    const signature = request.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            request.body, // Assumes raw body parser config is active
            signature,
            endpointSecret
        );
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
        // 🚀 OPTIMIZED: Listen to checkout completion directly to save API overhead roundtrips
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            
            // Extract metadata immediately from the payload body
            const { transactionId, appId, userId } = (session.metadata || {}) as { 
                transactionId?: string; 
                appId?: string; 
                userId?: string; 
            };

            if (appId === 'ai-site-builder' && transactionId && userId) {
                try {
                    // Execute database queries atomically in a single transaction pool block
                    await prisma.$transaction(async (tx) => {
                        // 1. Update the unique transaction status flag
                        const transaction = await tx.transaction.update({
                            where: { id: transactionId },
                            data: { isPaid: true }
                        });

                        // 2. Increment user credit balance using the extracted userId
                        await tx.user.update({
                            where: { id: userId },
                            data: {
                                credits: {
                                    increment: transaction.credits
                                }
                            }
                        });
                        
                        console.log(`✅ Credits successfully provisioned for User: ${userId}`);
                    });
                } catch (dbError: any) {
                    console.error("❌ Database transaction failed, webhook will retry:", dbError.message);
                    return response.status(500).json({ error: "Internal Database Error" });
                }
            }
            break;
        }
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Always acknowledge receipt cleanly back to Stripe gateway instantly
    response.json({ received: true });
}