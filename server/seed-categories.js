const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const defaultCategories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech news, tutorials, and insights',
    color: '#3B82F6',
    icon: '💻'
  },
  {
    name: 'Programming',
    slug: 'programming',
    description: 'Coding tutorials, best practices, and development tips',
    color: '#10B981',
    icon: '⚡'
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend, backend, and full-stack development',
    color: '#F59E0B',
    icon: '🌐'
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design, graphics, and creative content',
    color: '#8B5CF6',
    icon: '🎨'
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, startups, and business insights',
    color: '#EF4444',
    icon: '💼'
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Personal development, health, and lifestyle tips',
    color: '#06B6D4',
    icon: '🌟'
  },
  {
    name: 'Tutorial',
    slug: 'tutorial',
    description: 'Step-by-step guides and how-to articles',
    color: '#84CC16',
    icon: '📚'
  },
  {
    name: 'News',
    slug: 'news',
    description: 'Latest updates and current events',
    color: '#F97316',
    icon: '📰'
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert default categories
    const categories = await Category.insertMany(defaultCategories);
    console.log(`✅ Created ${categories.length} categories:`);
    
    categories.forEach(category => {
      console.log(`  - ${category.icon} ${category.name}`);
    });

    console.log('\n🎉 Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories(); 