import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import Profile from './pages/Profile'
import Categories from './pages/Categories'
import CategoryPosts from './pages/CategoryPosts'
import SearchResults from './pages/SearchResults'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Helmet>
        <title>MERN Blog - Modern Blogging Platform</title>
        <meta name="description" content="A modern MERN stack blog application with beautiful UI and advanced features" />
      </Helmet>
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="categories" element={<Categories />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="category/:slug" element={<CategoryPosts />} />
          <Route path="search" element={<SearchResults />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="create-post" element={<CreatePost />} />
            <Route path="edit-post/:id" element={<EditPost />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App 