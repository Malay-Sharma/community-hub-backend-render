import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };  // attach user info to req

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};


// import admin from 'firebase-admin';
// import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// const verifyUser = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Token verification failed:', err);
//     return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//   }
// };

export default verifyUser;


// module.exports = verifyUser;



// const verifyUser = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await userModel.findById(decoded.id).select("_id name email avatar");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     req.user = user; // attach user info to request
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     return res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };

// export default verifyUser;
