// import User from '../models/userModel.js';

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export async function getAllUsers(req, res) {
  try {
    const users = await userModel.find({}, "-password"); // exclude passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { username, bio, gender } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      decoded.id,
      {
        username,
        bio,
        gender
      },
      { new: true, runValidators: true }
    ).select('_id name email username bio gender avatar');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};


export async function onBoard(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      username,
      bio,
      gender,
      dob,
      location,
      website,
      interests,
      profession,
      coverImage,
      socialLinks // Should be an object: { instagram, twitter, linkedin, github }
    } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          username,
          bio,
          gender,
          dob,
          location,
          website,
          interests,
          profession,
          coverImage,
          socialLinks,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Onboarding completed",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ success: false, message: "Onboarding failed", error: error.message });
  }
}
