import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  X,
  Plus,
  Tag
} from 'lucide-react'
import { postsAPI, categoriesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm()

  const content = watch('content', '')

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    ['categories'],
    categoriesAPI.getAll,
    {
      staleTime: 10 * 60 * 1000,
      onSuccess: (data) => {
        console.log('Categories API success:', data);
      },
      onError: (error) => {
        console.error('Categories API error:', error);
      }
    }
  )

  // Debug log
  console.log('Fetched categories:', categoriesData);
  console.log('Categories loading:', categoriesLoading);
  console.log('Categories error:', categoriesError);

  // Extract categories safely
  const categories =
    categoriesData?.data?.categories ||
    categoriesData?.data?.data?.categories ||
    [];

  // Create post mutation
  const createPostMutation = useMutation(
    (postData) => postsAPI.create(postData),
    {
      onSuccess: (data) => {
        toast.success('Post created successfully!')
        queryClient.invalidateQueries(['posts'])
        navigate(`/posts/${data.data.post.slug}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post')
      }
    }
  )

  // Upload image mutation
  const uploadImageMutation = useMutation(
    (imageData) => postsAPI.uploadImage(imageData),
    {
      onSuccess: (data) => {
        setImageUrl(data.data.imageUrl)
        setValue('featuredImage', data.data.imageUrl)
        setIsUploading(false)
        toast.success('Image uploaded successfully!')
      },
      onError: (error) => {
        setIsUploading(false)
        toast.error('Failed to upload image')
      }
    }
  )

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadImageMutation.mutate({ image: e.target.result })
    }
    reader.readAsDataURL(file)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('You must be logged in to create a post')
      return
    }

    const postData = {
      ...data,
      tags,
      status: data.status || 'draft'
    }

    createPostMutation.mutate(postData)
  }

  if (categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your thoughts and ideas with the world
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters'
                }
              })}
              className="input"
              placeholder="Enter your post title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            {categoriesError && (
              <p className="text-red-600 dark:text-red-400 mb-2">Failed to load categories. Please try again later.</p>
            )}
            <select
              id="category"
              {...register('category', {
                required: 'Category is required'
              })}
              className="input"
              disabled={categoriesLoading || categoriesError || categories.length === 0}
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : categories.length === 0 ? 'No categories available' : 'Select a category'}</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrl}
                      alt="Featured"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setImageUrl('')
                        setValue('featuredImage', '')
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </div>
                )}
              </label>
              <input
                type="hidden"
                {...register('featuredImage')}
                value={imageUrl}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input flex-1"
                  placeholder="Add a tag"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.length >= 10}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tags.length}/10 tags (press Enter to add)
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-outline btn-sm"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            
            {showPreview ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 min-h-[300px]">
                <div className="prose dark:prose-invert max-w-none">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Preview will appear here...</p>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                id="content"
                {...register('content', {
                  required: 'Content is required',
                  minLength: {
                    value: 10,
                    message: 'Content must be at least 10 characters long'
                  }
                })}
                className="textarea min-h-[300px]"
                placeholder="Write your post content here... You can use Markdown formatting."
              />
            )}
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={createPostMutation.isLoading}
              className="btn btn-primary btn-lg flex items-center space-x-2"
            >
              {createPostMutation.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Post</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-outline btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CreatePost 