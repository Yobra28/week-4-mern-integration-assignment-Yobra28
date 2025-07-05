const express = require('express');
const Post = require('../models/Post');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts with pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const tag = req.query.tag;
    const sort = req.query.sort || '-createdAt';

    const query = { status: 'published' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    // Get posts with pagination
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // Check if user liked each post
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likes.includes(req.user._id.toString());
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/featured
// @desc    Get featured posts
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await Post.getFeaturedPosts(limit);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get featured posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('category', 'name color icon')
      .populate('comments', 'content author createdAt')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user liked the post
    if (req.user) {
      post.isLiked = post.likes.includes(req.user._id.toString());
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   GET /api/posts/slug/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio')
      .populate('category', 'name color icon')
      .populate('comments', 'content author createdAt')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user liked the post
    if (req.user) {
      post.isLiked = post.likes.includes(req.user._id.toString());
    }

    // Increment view count
    await Post.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, validatePost, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user._id
    };

    const post = await Post.create(postData);
    await post.populate('author', 'username avatar');
    await post.populate('category', 'name color icon');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', protect, validatePost, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can edit this post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'username avatar')
    .populate('category', 'name color icon');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can delete this post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete featured image from Cloudinary if it exists
    if (post.featuredImage && post.featuredImage.includes('cloudinary')) {
      try {
        const publicId = post.featuredImage.split('/').pop().split('.')[0];
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: {
        isLiked: likeIndex === -1,
        likeCount: post.likes.length
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

// @route   POST /api/posts/upload-image
// @desc    Upload image for post
// @access  Private
router.post('/upload-image', protect, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    const result = await uploadImage(image, 'blog-featured-images');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl: result.url }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
});

module.exports = router; 