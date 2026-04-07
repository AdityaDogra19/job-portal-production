const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      userId: req.user.id,
      content: req.body.content
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/posts?page=1&limit=10
const getFeed = async (req, res) => {
  try {
    // SCALABILITY UPGRADE: Pagination
    // Sending 100,000 posts to a mobile phone crashes the phone and the database.
    // Instead, we slice the data into bite-sized "Pages" using .skip() and .limit().
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .lean(); // SCALABILITY: .lean() strips heavy Mongoose wrappers, making data reads 3x faster!

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user.id);

    // SCALABILITY UPGRADE: Atomic Native Operators
    // We do NOT modify the raw javascript array and save() the whole document.
    // Instead, we command MongoDB to directly inject/remove the ID using $pull and $addToSet.
    // This prevents massive race-conditions if 5,000 users like the post at the absolute exact millisecond!
    if (alreadyLiked) {
      await Post.updateOne({ _id: post._id }, { $pull: { likes: req.user.id } });
      res.status(200).json({ message: "Post unliked" });
    } else {
      await Post.updateOne({ _id: post._id }, { $addToSet: { likes: req.user.id } });
      
      // --- REAL-TIME SOCKET NOTIFICATIONS ---
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      
      // Ensure we don't notify the user when they like their own post
      if (post.userId.toString() !== req.user.id) {
        const receiverSocketId = connectedUsers.get(post.userId.toString());
        
        // If the author is currently online (socket exists), FIRE an instant event to their screen!
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            message: `Someone just liked your post!`,
            postId: post._id
          });
        }
      }

      res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      postId: req.params.id,
      userId: req.user.id,
      text: req.body.text
    });

    // --- REAL-TIME SOCKET NOTIFICATIONS ---
    const post = await Post.findById(req.params.id);
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    // Notify the author live if they are online
    if (post && post.userId.toString() !== req.user.id) {
      const receiverSocketId = connectedUsers.get(post.userId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', {
          message: `Someone just commented on your post!`,
          postId: post._id
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getFeed, toggleLike, addComment };
