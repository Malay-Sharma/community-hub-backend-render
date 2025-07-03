import express from 'express'
import { getCurrentUser, google, login, logout, register } from '../controllers/authController.js';
import userModel from "../models/userModel.js"; 

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/google', google);
authRouter.get('/me', getCurrentUser);

// GET /api/users/all?exclude={userId}
authRouter.get("/all", async (req, res) => {
  try {
    const users = await userModel.find({}, "_id name avatar email"); // get all users
    res.status(200).json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authRouter