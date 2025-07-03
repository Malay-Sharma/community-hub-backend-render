import express from 'express';
import ImageKit from 'imagekit';
import UserStory from '../models/userStory.js';
import verifyUser from '../middlewares/verifyUser.js';

const storyRouter = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

storyRouter.post('/upload', async (req, res) => {
  try {
    console.log("Received upload request:", req.body);

    const { fileName, fileData, caption, visibility, author } = req.body;

    if (!author || !fileName || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // 1️⃣ Upload to ImageKit
    const result = await imagekit.upload({
      file: fileData,
      fileName,
      folder: '/Filter-Post'
    });

    console.log("✅ ImageKit upload success:", result.url);

    // 2️⃣ Create MongoDB story
    const story = new UserStory({
      caption,
      visibility,
      author,
      media: {
        url: result.url,
        fileId: result.fileId,
        uploadedAt: new Date(result.createdAt || Date.now())
      }
    });

    await story.save();

    res.json({ success: true, story });
  } catch (err) {
    console.error("❌ Story upload failed:", err);
    res.status(500).json({
      success: false,
      message: 'Server error during story upload',
      error: err.message
    });
  }
});


// 2️⃣ GET /api/stories/imagekit — all imagekit files (My-Story folder)
storyRouter.get("/imagekit", async (req, res) => {
  try {
    const files = await imagekit.listFiles({
      path: "/Filter-Post",
      limit: 100
    });

    const images = files.map(file => ({
      fileId: file.fileId,
      name: file.name,
      url: imagekit.url({
        path: file.filePath,
        transformation: [],
        queryParameters: { noTransform: "true" }
      }),
      filePath: file.filePath,
      fileType: file.fileType,
      height: file.height,
      width: file.width,
      size: file.size,
      createdAt: file.createdAt
    }));

    res.json(images);
  } catch (err) {
    console.error("Error fetching imagekit files", err);
    res.status(500).json({ message: "Failed to fetch imagekit files" });
  }
});

storyRouter.get("/imagekit/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await imagekit.getFileDetails(fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: "Image not found in ImageKit" });
    }

    const image = {
      fileId: file.fileId,
      name: file.name,
      url: imagekit.url({
        path: file.filePath,
        transformation: [],
        queryParameters: { noTransform: "true" }
      }),
      filePath: file.filePath,
      fileType: file.fileType,
      height: file.height,
      width: file.width,
      size: file.size,
      createdAt: file.createdAt
    };

    res.json({ success: true, image });

  } catch (err) {
    console.error("Error fetching ImageKit file by ID", err);
    res.status(500).json({ success: false, message: "Failed to fetch ImageKit file" });
  }
});


// Get ALL MongoDB stories with full author details
storyRouter.get("/mongo", async (req, res) => {
  try {
    const stories = await UserStory.find()
      .populate("author", "email name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    console.error("Error fetching mongo stories", err);
    res.status(500).json({ success: false, message: "Failed to fetch MongoDB stories" });
  }
});

// Get ONE MongoDB story by ID with full author details
storyRouter.get("/mongo/:id", async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id)
      .populate("author", "email name avatar");

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    res.json({ success: true, story });
  } catch (err) {
    console.error("Error fetching mongo story", err);
    res.status(500).json({ success: false, message: "Failed to fetch MongoDB story" });
  }
});




export default storyRouter;



// GET /api/stories/imagekit - List all files in My-Story folder on ImageKit
// storyRouter.get("/imagekit", async (req, res) => {
//   try {
//     const files = await imagekit.listFiles({
//       path: "/My-Story",
//       limit: 100,
//     });

//     const videos = files.map(file => ({
//       fileId: file.fileId,
//       name: file.name,
//       url: imagekit.url({
//         path: file.filePath,
//         transformation: [],
//         queryParameters: { noTransform: "true" }, 
//       }),
//       filePath: file.filePath,
//       fileType: file.fileType,
//       height: file.height,
//       width: file.width,
//       size: file.size,
//       createdAt: file.createdAt,
//     }));

//     res.json(videos);

//   } catch (err) {
//     console.error("Error fetching videos from ImageKit", err);
//     res.status(500).json({ error: "Failed to fetch videos", details: err.message });
//   }
// });