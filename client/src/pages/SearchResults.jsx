import { useSearchParams } from 'react-router-dom'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search query: <strong>{query}</strong>
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-4">
          This component will be implemented with search results, highlighting, and relevance sorting.
        </p>
      </div>
    </div>
  )
}

export default SearchResults 