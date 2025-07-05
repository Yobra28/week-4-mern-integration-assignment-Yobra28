import { useParams } from 'react-router-dom'

const PostDetail = () => {
  const { slug } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Post Detail Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This is the detail page for post: <strong>{slug}</strong>
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-4">
          This component will be implemented with full post display, comments, and interaction features.
        </p>
      </div>
    </div>
  )
}

export default PostDetail 