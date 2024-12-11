import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationClassName, setNotificationClassName] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const createBlog = (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      blogService
        .create(blogObject)
        .then(data => {
          setNotificationMessage(
            `New blog ${blogObject.title} by ${blogObject.author} created`
          )
          setNotificationClassName('success')
          setBlogs(blogs.concat(data))
        })
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    } catch (exception) {
      setNotificationMessage('Error creating blog')
      setNotificationClassName('error')
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    }
  }

  const updateBlog = (blogObject) => {
    try {
      blogService
        .update(blogObject)
        .then(data => {
          setBlogs(blogs.map(blog => blog.id !== blogObject.id ? blog : data))
        })
    } catch (exception) {
      setNotificationMessage('Error updating blog')
      setNotificationClassName('error')
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    }
  }

  const deleteBlog = (blogObject) => {
    try {
      if (
        window.confirm(
          `Delete blog ${blogObject.title} by ${blogObject.author}`
        )
      ) {
        blogService
          .remove(blogObject.id)
          .then(() => {
            setBlogs(blogs.filter(blog => blog.id !== blogObject.id))
            setNotificationMessage(`Blog ${blogObject.title} deleted`)
            setNotificationClassName('success')
            setTimeout(() => {
              setNotificationMessage(null)
              setNotificationClassName(null)
            }, 5000)
          })
      }
    } catch (exception) {
      setNotificationMessage('Error deleting blog')
      setNotificationClassName('error')
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    }
  }

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setNotificationMessage(`Logged in as ${user.name}`)
      setNotificationClassName('success')
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    } catch (exception) {
      setNotificationMessage('Wrong username or password')
      setNotificationClassName('error')
      setTimeout(() => {
        setNotificationMessage(null)
        setNotificationClassName(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    blogService.setToken(null)
  }

  const blogFormRef = useRef()

  return (
    <div>
      <Notification
        message={notificationMessage}
        className={notificationClassName}
      />

      {!user &&
        <LoginForm handleLogin={handleLogin} />
      }

      {user &&
        <div>
          <h2>blogs</h2>
          <div>
            {user.name} logged in
            <button onClick={handleLogout}>
              logout
            </button>
          </div>
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm createBlog={createBlog} />
          </Togglable>
          {
            blogs
              .sort((firstBlog, secondBlog) => {
                return firstBlog.likes < secondBlog.likes ? 1: -1
              })
              .map(blog =>
                <Blog
                  key={blog.id}
                  blog={blog}
                  username={user.username}
                  updateBlog={updateBlog}
                  deleteBlog={deleteBlog}
                />
              )
          }
        </div>
      }
    </div>
  )
}

export default App