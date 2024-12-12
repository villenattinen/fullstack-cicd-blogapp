import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, username, updateBlog, deleteBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const [blogObject, setBlogObject] = useState(blog)
  const [isExtended, setIsExtended] = useState(false)
  console.log(blogObject)
  console.log(blog)
  const updateLikes = () => {
    const updatedBlog = { ...blogObject, likes: blogObject.likes + 1 }
    updateBlog(updatedBlog)
    setBlogObject(updatedBlog)
  }

  const removeBlog = () => {
    deleteBlog(blogObject)
  }

  const toggleVisibility = () => {
    setIsExtended(!isExtended)
  }

  const buttonLabel = isExtended ? 'hide' : 'view'

  return (
    <div style={blogStyle} className="blog" name="blog">
      <div>
        {blogObject.title} {blogObject.author}
        {
          <button onClick={toggleVisibility} name={buttonLabel}>
            {buttonLabel}
          </button>
        }
        {isExtended && (
          <div>
            {blogObject.url}
            <br />
            likes {blogObject.likes}
            <button onClick={updateLikes} name="like">
              like
            </button>
            <br />
            {blogObject.user?.name}
            <br />
            {username === blogObject.user?.username && (
              <button
                style={{ backgroundColor: 'red' }}
                onClick={removeBlog}
                name="remove"
              >
                remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
}

Blog.displayName = 'Blog'

export default Blog
