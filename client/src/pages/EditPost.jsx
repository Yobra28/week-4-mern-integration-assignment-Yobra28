import { useParams } from 'react-router-dom'

const EditPost = () => {
  const { id } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Edit Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This is the edit page for post ID: <strong>{id}</strong>
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-4">
          This component will be implemented with a pre-filled form for editing existing posts.
        </p>
      </div>
    </div>
  )
}

export default EditPost 