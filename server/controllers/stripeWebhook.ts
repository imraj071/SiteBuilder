import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const stripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.sendStatus(400);
    }

    try {
        switch (event.type) {

            case "payment_intent.succeeded": {

                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                const { transactionId, appId } = paymentIntent.metadata;

                if (
                    appId !== "ai-site-builder" ||
                    !transactionId
                ) {
                    console.log("Ignoring unrelated payment.");
                    break;
                }

                const transaction = await prisma.transaction.findUnique({
                    where: {
                        id: transactionId,
                    },
                });

                if (!transaction) {
                    console.error("Transaction not found:", transactionId);
                    break;
                }

                // Idempotency
                if (transaction.isPaid) {
                    console.log("Transaction already processed.");
                    break;
                }

                await prisma.$transaction([
                    prisma.transaction.update({
                        where: {
                            id: transactionId,
                        },
                        data: {
                            isPaid: true,
                        },
                    }),

                    prisma.user.update({
                        where: {
                            id: transaction.userId,
                        },
                        data: {
                            credits: {
                                increment: transaction.credits,
                            },
                        },
                    }),
                ]);

                console.log(
                    `Payment processed successfully: ${transactionId}`
                );

                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }

        return res.status(200).json({
            received: true,
        });

    } catch (err) {
        console.error("Webhook processing error:", err);
        return res.sendStatus(500);
    }
};