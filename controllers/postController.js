import Post from '../models/userPost.js';
import User from '../models/userModel.js';

export const createPost = async (req, res) => {
  try {
    const { email, caption, visibility, media } = req.body;

    if (!email || !media || media.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing email or media' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create post
    const post = new Post({
      author: user._id,
      caption,
      visibility,
      media, // [{ url: ..., type: ... }]
    });

    await post.save();

    return res.status(201).json({ success: true, post });

  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email avatar');
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email avatar');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};











// import Post from '../models/userPost.js';
// import mongoose from 'mongoose';

// // Create a post
// export const createPost = async (req, res) => {
//   try {
//     const { caption, visibility, media, tags } = req.body;
//     const userId = req.user._id; // Assuming you're attaching the authenticated user via middleware

//     if (!media || media.length === 0) {
//       return res.status(400).json({ message: 'Media is required' });
//     }

//     const post = new Post({
//       author: userId,
//       caption,
//       visibility,
//       media,
//       tags
//     });

//     const savedPost = await post.save();

//     res.status(201).json({
//       message: 'Post created successfully',
//       post: savedPost
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error creating post' });
//   }
// };

// // Get all posts
// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .populate('author', 'name username avatar')
//       .populate('tags', 'name username avatar')
//       .populate('reactions.hearts', 'name username')
//       .populate('reactions.smiles', 'name username')
//       .populate('reactions.teardrops', 'name username')
//       .populate('comments.user', 'name username')
//       .sort({ createdAt: -1 });

//     res.status(200).json(posts);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error fetching posts' });
//   }
// };

// // Get a single post by ID
// export const getPostById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid post ID' });
//     }

//     const post = await Post.findById(id)
//       .populate('author', 'name username avatar')
//       .populate('tags', 'name username avatar')
//       .populate('reactions.hearts', 'name username')
//       .populate('reactions.smiles', 'name username')
//       .populate('reactions.teardrops', 'name username')
//       .populate('comments.user', 'name username');

//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     res.status(200).json(post);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error fetching post' });
//   }
// };
