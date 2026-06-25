import express from "express";
import { createUserProject, getUserCredits, getUSerProject, getUSerProjects, purchaseCredits, togglePublish } from "../controllers/userControllers.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get('/credits', protect, getUserCredits)
userRouter.post('/project', protect, createUserProject)
userRouter.get('/project/:projectId', protect, getUSerProject)
userRouter.get('/projects', protect, getUSerProjects)
userRouter.get('/publish-toggle/:projectId', protect, togglePublish)
userRouter.post('/pruchase-credits', protect, purchaseCredits)

export default userRouter;