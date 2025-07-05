import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Users, Calendar } from 'lucide-react'
import { categoriesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Categories = () => {
  const { user } = useAuth()
  
  const { data: categoriesData, isLoading, error } = useQuery(
    ['categories'],
    categoriesAPI.getAll,
    {
      staleTime: 10 * 60 * 1000,
    }
  )

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load categories. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const categories = categoriesData?.data?.categories || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore posts by category
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Link
              to="/admin/categories/create"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Link>
          )}
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300 group"
              >
                {/* Category Header */}
                <div 
                  className="h-32 rounded-t-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                </div>

                {/* Category Content */}
                <div className="card-content">
                  <h3 className="card-title mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <Link to={`/category/${category.slug}`}>
                      {category.name}
                    </Link>
                  </h3>
                  
                  {category.description && (
                    <p className="card-description mb-4">
                      {category.description}
                    </p>
                  )}

                  {/* Category Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{category.postCount || 0} posts</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Link
                      to={`/category/${category.slug}`}
                      className="btn btn-outline w-full group-hover:btn-primary transition-colors"
                    >
                      View Posts
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Categories will appear here once they are created.
            </p>
          </div>
        )}

        {/* Stats Section */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-12"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Category Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <div className="text-primary-100">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0)}
                  </div>
                  <div className="text-primary-100">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {categories.filter(cat => (cat.postCount || 0) > 0).length}
                  </div>
                  <div className="text-primary-100">Active Categories</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Categories 