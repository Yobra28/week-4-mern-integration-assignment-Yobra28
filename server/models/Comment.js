const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for isLiked (will be populated by controller)
commentSchema.virtual('isLiked').get(function() {
  return false; // Will be set by controller
});

// Index for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

// Static method to get comments for a post
commentSchema.statics.getCommentsForPost = async function(postId, userId = null) {
  const comments = await this.find({ 
    post: postId, 
    parentComment: null,
    isApproved: true 
  })
  .populate('author', 'username avatar')
  .populate({
    path: 'replies',
    match: { isApproved: true },
    populate: {
      path: 'author',
      select: 'username avatar'
    },
    options: { sort: { createdAt: 1 } }
  })
  .sort({ createdAt: -1 });

  // If user is logged in, check if they liked each comment
  if (userId) {
    comments.forEach(comment => {
      comment.isLiked = comment.likes.includes(userId);
      if (comment.replies) {
        comment.replies.forEach(reply => {
          reply.isLiked = reply.likes.includes(userId);
        });
      }
    });
  }

  return comments;
};

// Method to toggle like
commentSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Comment', commentSchema); 