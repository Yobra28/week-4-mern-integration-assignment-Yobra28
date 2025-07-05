import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  User, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react'
import { useQuery } from 'react-query'
import { postsAPI, categoriesAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch featured posts
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    ['featured-posts'],
    () => postsAPI.getFeatured({ limit: 3 }),
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  // Fetch all posts with filters
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['posts', currentPage, selectedCategory, searchQuery],
    () => postsAPI.getAll({
      page: currentPage,
      limit: 9,
      category: selectedCategory,
      search: searchQuery
    }),
    {
      staleTime: 2 * 60 * 1000,
    }
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    ['categories'],
    categoriesAPI.getAll,
    {
      staleTime: 10 * 60 * 1000,
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
    setCurrentPage(1)
  }

  const PostCard = ({ post, featured = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
        featured ? 'col-span-1 md:col-span-2' : ''
      }`}
    >
      <div className="relative">
        <img
          src={post.featuredImage}
          alt={post.title}
          className={`w-full object-cover ${
            featured ? 'h-64' : 'h-48'
          }`}
        />
        <div className="absolute top-4 left-4">
          <span
            className="badge badge-default"
            style={{ backgroundColor: post.category?.color }}
          >
            {post.category?.icon} {post.category?.name}
          </span>
        </div>
        {post.isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="badge badge-secondary">⭐ Featured</span>
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className={`font-bold text-gray-900 dark:text-white mb-2 ${
          featured ? 'text-xl' : 'text-lg'
        }`}>
          <Link 
            to={`/posts/${post.slug}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{post.author?.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (featuredLoading || postsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
            MERN Blog
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Discover amazing stories, share your thoughts, and connect with writers from around the world.
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>
      </motion.div>

      {/* Featured Posts */}
      {featuredData?.data?.posts?.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured Posts
            </h2>
            <Link
              to="/featured"
              className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredData.data.posts.map((post, index) => (
              <PostCard key={post._id} post={post} featured={index === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      {categoriesData?.data?.categories?.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`badge ${
                selectedCategory === '' 
                  ? 'badge-default' 
                  : 'badge-outline'
              }`}
            >
              All Posts
            </button>
            {categoriesData.data.categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryChange(category._id)}
                className={`badge ${
                  selectedCategory === category._id 
                    ? 'badge-default' 
                    : 'badge-outline'
                }`}
                style={{
                  backgroundColor: selectedCategory === category._id ? category.color : 'transparent',
                  borderColor: category.color
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCategory ? 'Filtered Posts' : 'Recent Posts'}
          </h2>
          <span className="text-gray-500 dark:text-gray-400">
            {postsData?.data?.pagination?.totalPosts || 0} posts
          </span>
        </div>
        
        {postsData?.data?.posts?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postsData.data.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            
            {/* Pagination */}
            {postsData.data.pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: postsData.data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${
                      currentPage === page 
                        ? 'btn-primary' 
                        : 'btn-outline'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === postsData.data.pagination.totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Be the first to create a post!'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home 