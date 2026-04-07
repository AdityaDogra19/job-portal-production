const express = require('express');
const router = express.Router();
const { createPost, getFeed, toggleLike, addComment } = require('../controllers/postController');
const { checkAuth } = require('../middlewares/authMiddleware');

router.post('/', checkAuth, createPost);
router.get('/', getFeed); // Publicly viewable infinite scrolling route

router.put('/:id/like', checkAuth, toggleLike);
router.post('/:id/comment', checkAuth, addComment);

module.exports = router;
