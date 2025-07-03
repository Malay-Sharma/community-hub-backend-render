import express from "express";
import { getAllUsers, onBoard, updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers)
userRouter.get("/onboarding", onBoard)
userRouter.put('/update', updateProfile);

export default userRouter;