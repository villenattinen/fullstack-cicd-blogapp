import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { test } from 'vitest'

test('calls event handler with right details when a new blog is created', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByRole('textbox', { name: 'title:' })
  const authorInput = screen.getByRole('textbox', { name: 'author:' })
  const urlInput = screen.getByRole('textbox', { name: 'url:' })
  const submitButton = screen.getByRole('button', { name: 'create' })

  await user.type(titleInput, 'title')
  await user.type(authorInput, 'author')
  await user.type(urlInput, 'url')
  await user.click(submitButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'title',
    author: 'author',
    url: 'url',
  })
})
