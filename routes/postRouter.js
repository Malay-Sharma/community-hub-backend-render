// server/routes/imageRoutes.js
import express from 'express'
import ImageKit from "imagekit";
import Post from "../models/userPost.js";  // Assuming your MongoDB Post model is set up
import verifyUser from '../middlewares/verifyUser.js';
import mongoose from 'mongoose';

const postRouter = express.Router();


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});



// You might have auth middleware like `verifyUser`
// router.post('/', verifyUser, createPost);
// router.get('/', verifyUser, getAllPosts);



postRouter.post('/upload', async (req, res) => {
  try {
    const { fileName, fileData, caption, visibility, author } = req.body;

    
    if (!author) {
      return res.status(400).json({
        success: false,
        message: 'Author (email) is required',
      });
    }

    // 1️⃣ Pre-create MongoDB document to get _id
    const post = new Post({
      caption,
      visibility,
      author,
      media: []  // will push image info after upload
    });

    await post.validate();  // ensure no validation errors

    const fileExtension = fileName.split('.').pop();
    const generatedFileName = `${post._id.toString()}.${fileExtension}`;
    const mimeType = fileData.split(';')[0].split(':')[1];

    // 2️⃣ Upload to ImageKit using the _id in filename
    const result = await imagekit.upload({
      file: fileData,
      fileName: generatedFileName,
      folder: '/User-Post',
      customMetadata: {
        postId: post._id.toString(),
      }
    });

    // 3️⃣ Update post with image info
    post.media.push({
      url: result.url,
      fileId: result.fileId,
    });

    await post.save();

    return res.json({
      success: true,
      post
    });

  } catch (err) {
    console.error('Upload failed', err);
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
});


// Get all images
postRouter.get("/", async (req, res) => {
  try {
    const files = await imagekit.listFiles({
      path: "/User-Post",
      limit: 100,
    });

    // Fetch posts linked to these files
    const fileIds = files.map(f => f.fileId);
    const posts = await Post.find({ "media.fileId": { $in: fileIds } })
      .populate("tags", "email")
      .populate("author", "email");

    // Map posts by fileId for easy lookup
    const postMap = {};
    posts.forEach(post => {
      post.media.forEach(media => {
        postMap[media.fileId] = {
          mongoId: post._id,
          caption: post.caption,
          visibility: post.visibility,
          tags: post.tags,
          author: post.author
        };
      });
    });

    const images = files.map(file => ({
      fileId: file.fileId,
      name: file.name,
      url: imagekit.url({
        path: file.filePath,
        transformation: [],
        queryParameters: { noTransform: "true" }, 
      }),
      filePath: file.filePath,
      fileType: file.fileType,
      height: file.height,
      width: file.width,
      size: file.size,
      createdAt: file.createdAt,
      post: postMap[file.fileId] || null
    }));

    res.json(images);
  } catch (err) {
    console.error("Error fetching images", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

postRouter.get('/mongo', async (req, res) => {
  try {
    const posts = await Post.find({}, 'author caption visibility'); 
    // ^ only select caption and visibility fields

    res.json(posts);
  } catch (err) {
    console.error("Error fetching post data", err);
    res.status(500).json({
      message: "Failed to fetch post data",
      error: err.message
    });
  }
});



// ✅ Get single image by fileId or postId
// postRouter.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     let post = await Post.findOne({ "media.fileId": id })
//       .populate("tags", "email")
//       .populate("author", "email");

//     let fileDetails = null;

//     if (post) {
//       fileDetails = await imagekit.getFileDetails(id);
//     } else {
//       // Try by post _id
//       post = await Post.findById(id)
//         .populate("tags", "email")
//         .populate("author", "email");

//       if (post && post.media.length > 0 && post.media[0].fileId) {
//         fileDetails = await imagekit.getFileDetails(post.media[0].fileId);
//       }
//     }

//     if (!post || !fileDetails) {
//       return res.status(404).json({ message: "Post or image not found" });
//     }

//     res.json({
//       image: {
//         fileId: fileDetails.fileId,
//         name: fileDetails.name,
//         url: fileDetails.url,
//         filePath: fileDetails.filePath,
//         fileType: fileDetails.fileType,
//         height: fileDetails.height,
//         width: fileDetails.width,
//         size: fileDetails.size,
//         createdAt: fileDetails.createdAt,
//       },
//       post,
//     });

//   } catch (err) {
//     console.error("Error fetching image by ID", err);
//     res.status(500).json({ error: "Failed to fetch image" });
//   }
// });


// In your /mongo/:postId API:
postRouter.get("/mongo/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Fetch only caption + visibility
    const post = await Post.findById(postId, 'author caption visibility');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post });

  } catch (err) {
    console.error("Error fetching MongoDB post", err);
    res.status(500).json({ message: "Failed to fetch post data", error: err.message });
  }
});



// GET /api/posts/imagekit/:fileId
postRouter.get("/imagekit/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileDetails = await imagekit.getFileDetails(fileId);

    if (!fileDetails) {
      return res.status(404).json({ message: "File not found on ImageKit" });
    }

    res.json({
      image: {
        fileId: fileDetails.fileId,
        name: fileDetails.name,
        url: fileDetails.url,
        filePath: fileDetails.filePath,
        fileType: fileDetails.fileType,
        height: fileDetails.height,
        width: fileDetails.width,
        size: fileDetails.size,
        createdAt: fileDetails.createdAt,
      }
    });

  } catch (err) {
    console.error("Error fetching ImageKit file", err);
    res.status(500).json({ message: "Failed to fetch image data" });
  }
});



export default postRouter    