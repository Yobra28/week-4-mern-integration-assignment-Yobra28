const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  icon: {
    type: String,
    default: '📝'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for posts in this category
categorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for post count
categorySchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to get categories with post counts
categorySchema.statics.getCategoriesWithCounts = async function() {
  return await this.aggregate([
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'category',
        as: 'posts'
      }
    },
    {
      $addFields: {
        postCount: { $size: '$posts' }
      }
    },
    {
      $project: {
        posts: 0
      }
    },
    {
      $sort: { postCount: -1, name: 1 }
    }
  ]);
};

module.exports = mongoose.model('Category', categorySchema); 