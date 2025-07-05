const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a specific post
// @access  Public
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user._id : null;

    const comments = await Comment.getCommentsForPost(postId, userId);

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', protect, validateComment, async (req, res) => {
  try {
    const { content, post: postId, parentComment } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if parent comment exists (for replies)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: postId,
      parentComment
    });

    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating comment'
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', protect, validateComment, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can edit this comment
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment'
      });
    }

    const { content } = req.body;

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment'
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can delete this comment
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.id });

    // Delete the comment itself
    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment'
    });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.toggleLike(req.user._id);

    res.json({
      success: true,
      message: comment.likes.includes(req.user._id) ? 'Comment liked' : 'Comment unliked',
      data: {
        isLiked: comment.likes.includes(req.user._id),
        likeCount: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking comment'
    });
  }
});

// @route   GET /api/comments/user/:userId
// @desc    Get comments by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      author: userId,
      parentComment: null // Only top-level comments
    })
    .populate('author', 'username avatar')
    .populate('post', 'title slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Comment.countDocuments({ 
      author: userId,
      parentComment: null
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user comments'
    });
  }
});

module.exports = router; 