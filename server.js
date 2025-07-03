import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRouter.js";
import chatRouter from "./routes/chatRoutes.js";
import ImageKit from "imagekit";
import userStory from "./models/userStory.js";
import storyRouter from "./routes/storyRoutes.js";

// --- App Setup ---
const app = express();

const port = process.env.PORT|| 4000
connectDB();

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'https://community-hub-frontend-render.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// app.get("/api/images", async (req, res) => {
//   try {
//     const files = await imagekit.listFiles({
//       path: "/User-Post",
//       limit: 100,
//     });

//     // Convert file paths into full image URLs with transformation
//     const images = files.map(file => ({
//       fileId: file.fileId,
//       name: file.name,
//       url: imagekit.url({
//         path: file.filePath,
//         transformation: [
//           { height: "300", width: "400", crop: "maintain_ratio" }
//         ]
//       }),
//     }));

//     res.json(images);
//   } catch (error) {
//     console.error("Error fetching files", error);
//     res.status(500).json({ error: "Failed to fetch images" });
//   }
// });


// API Endpoints 
app.get('/', (req, res)=> res.send("API Working"))
app.use('/api/auth', authRouter)
app.use("/api", userRouter);
app.use("/api/images", postRouter)
app.use("/api/chats", chatRouter);
app.use("/api/stories", storyRouter)



// --- WebSocket Events ---
// io.on("connection", (socket) => {
//   console.log(`🟢 New client connected: ${socket.id}`);

//   socket.on("joinRoom", (userId) => {
//     socket.join(userId);
//     console.log(`👤 User ${userId} joined their room`);
//   });

//   socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
//     try {
//       const msg = new Message({ sender: senderId, receiver: receiverId, text });
//       console.log("💾 Attempting to save message:", {
//         senderId,
//         receiverId,
//         text
//       });
//       await msg.save();

//       io.to(receiverId).emit("receiveMessage", msg);
//       io.to(senderId).emit("receiveMessage", msg);

//     } catch (err) {
//       console.error("Error saving message:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`🔴 Client disconnected: ${socket.id}`);
//   });
// });



// --- Start Server ---
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));

// // -------- React Frontend Build Support (for Refresh and Direct Access) --------
// import path from "path";
// import { fileURLToPath } from "url";

// // Setup __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve static files from React build
// app.use(express.static(path.join(__dirname, "frontend", "dist")));

// // Handle any other route by returning React's index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });
