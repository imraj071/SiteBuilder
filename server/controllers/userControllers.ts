import {Request, Response} from 'express'
import prisma from '../lib/prisma.js';

//Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {

    try{

        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'Unauthorized'})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        res.json({credits: user?.credits})

    } catch(error: any){
        console.log(error.code || error.message)
        res.status(500).json({message: error.message});
    }

}