import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ createBlog }) => {
  const [newBlogTitle, setNewBlogTitle] = useState('')
  const [newBlogAuthor, setNewBlogAuthor] = useState('')
  const [newBlogUrl, setNewBlogUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newBlogTitle,
      author: newBlogAuthor,
      url: newBlogUrl,
    })
    setNewBlogTitle('')
    setNewBlogAuthor('')
    setNewBlogUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          <label>
            title:
            <input
              value={newBlogTitle}
              onChange={({ target }) => setNewBlogTitle(target.value)}
              name='title'
            />
          </label>
        </div>
        <div>
          <label>
            author:
            <input
              value={newBlogAuthor}
              onChange={({ target }) => setNewBlogAuthor(target.value)}
              name='author'
            />
          </label>
        </div>
        <div>
          <label>
            url:
            <input
              value={newBlogUrl}
              onChange={({ target }) => setNewBlogUrl(target.value)}
              name='url'
            />
          </label>
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}

BlogForm.displayName = 'BlogForm'

export default BlogForm