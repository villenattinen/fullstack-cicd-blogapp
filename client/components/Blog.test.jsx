import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { test } from 'vitest'

test('renders title and author, but not url and likes by default', () => {
  const blog = {
    title: 'Blog title',
    author: 'Blog author',
    url: 'Blog url',
    likes: 1,
  }

  render(
    <Blog
      blog={blog}
      username='username'
      updateBlog={() => {}}
      deleteBlog={() => {}}
    />
  )

  expect(screen.getByRole('button', { name: /view/ })).toBeDefined()
  expect(screen.getByText('Blog title Blog author')).toBeDefined()
  expect(screen.queryByText('Blog url')).toBeNull()
  expect(screen.queryByText('likes')).toBeNull()
})

test('renders also url and likes when blog view is expanded', async () => {
  const blog = {
    title: 'Blog title',
    author: 'Blog author',
    url: 'Blog url',
    likes: 1,
    user: {
      username: 'username',
      name: 'Firstname Lastname',
    },
  }

  render(
    <Blog
      blog={blog}
      username='username'
      updateBlog={() => {}}
      deleteBlog={() => {}}
    />
  )

  const user = userEvent.setup()
  const viewButton = screen.getByRole('button', { name: /view/ })
  await user.click(viewButton)

  expect(screen.queryByRole('button', { name: /view/ })).toBeNull()
  expect(screen.getByRole('button', { name: /hide/ })).toBeDefined()
  expect(screen.getByText('Blog title Blog author')).toBeDefined()
  expect(screen.getByText(/Blog url/)).toBeDefined()
  expect(screen.getByText(/likes 1/)).toBeDefined()
  expect(screen.getByText(/Firstname Lastname/)).toBeDefined()
})

test('clicking the like button twice calls the event handler twice', async () => {
  const blog = {
    title: 'Blog title',
    author: 'Blog author',
    url: 'Blog url',
    likes: 1,
  }

  const mockUpdateBlog = vi.fn()

  render(
    <Blog
      blog={blog}
      username='username'
      updateBlog={mockUpdateBlog}
      deleteBlog={() => {}}
    />
  )

  const user = userEvent.setup()
  const viewButton = screen.getByRole('button', { name: /view/ })
  await user.click(viewButton)
  const likeButton = screen.getByRole('button', { name: /like/ })
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockUpdateBlog).toHaveBeenCalledTimes(2)
})
