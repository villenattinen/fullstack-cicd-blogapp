const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Reset the database (delete blogs and users)
    await request.post('http:localhost:3003/api/testing/reset')
    // Add a single user
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'New User',
        username: 'newuser',
        password: 'password',
      },
    })

    // Open the application
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    // Check that the login text is visible
    const locator = page.getByText('Log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Enter the username and password
      await page.getByRole('textbox').first().fill('newuser')
      await page.getByRole('textbox').last().fill('password')
      // Click the login button
      await page.getByRole('button', { name: 'login' }).click()

      // Check that the user is logged in
      await expect(page.getByText('New User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      // Enter the username and password
      await page.getByRole('textbox').first().fill('newuser')
      await page.getByRole('textbox').last().fill('wrong')
      // Click the login button
      await page.getByRole('button', { name: 'login' }).click()

      // Check that the error message is visible
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // Log in as default user
      await page.getByRole('textbox').first().fill('newuser')
      await page.getByRole('textbox').last().fill('password')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title')
      await page.getByRole('textbox', { name: 'author' }).fill('test author')
      await page.getByRole('textbox', { name: 'url' }).fill('test url')
      // Submit the form
      await page.getByRole('button', { name: 'create' }).click()

      // Check that the new blog is shown
      await expect(page.getByText('test title test author')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title')
      await page.getByRole('textbox', { name: 'author' }).fill('test author')
      await page.getByRole('textbox', { name: 'url' }).fill('test url')
      // Submit the form
      await page.getByRole('button', { name: 'create' }).click()
      // Open the blog
      await page.getByRole('button', { name: 'view' }).click()
      // Like the blog
      await page.getByRole('button', { name: 'like' }).click()

      // Check that likes have increased to one
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('a blog can be deleted', async ({ page }) => {
      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title')
      await page.getByRole('textbox', { name: 'author' }).fill('test author')
      await page.getByRole('textbox', { name: 'url' }).fill('test url')
      // Submit the form
      await page.getByRole('button', { name: 'create' }).click()
      // Open the blog
      await page.getByRole('button', { name: 'view' }).click()
      // Will auto-accept the dialog when it pops up
      page.on('dialog', (dialog) => dialog.accept())
      // Delete the blog
      await page.getByRole('button', { name: 'remove' }).click()

      // Check that the blog is no longer shown
      await expect(page.getByText('test title test author')).toHaveCount(0)
    })

    test('only the user who created a blog sees the remove button', async ({
      page,
      request,
    }) => {
      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title')
      await page.getByRole('textbox', { name: 'author' }).fill('test author')
      await page.getByRole('textbox', { name: 'url' }).fill('test url')
      // Submit the form
      await page.getByRole('button', { name: 'create' }).click()
      // Log out of default user
      await page.getByRole('button', { name: 'logout' }).click()
      // Create second user
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Another User',
          username: 'anotheruser',
          password: 'drowssap',
        },
      })
      // Log in as second user
      await page.getByRole('textbox').first().fill('anotheruser')
      await page.getByRole('textbox').last().fill('drowssap')
      await page.getByRole('button', { name: 'login' }).click()
      // Open the blog
      await page.getByRole('button', { name: 'view' }).click()
      // Check that the remove button is not visible
      await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })

    test('blogs are ordered by number of likes', async ({ page }) => {
      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title 1')
      await page.getByRole('textbox', { name: 'author' }).fill('test author 1')
      await page.getByRole('textbox', { name: 'url' }).fill('test url 1')
      // Submit the form to add first blog
      await page.getByRole('button', { name: 'create' }).click()

      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title 2')
      await page.getByRole('textbox', { name: 'author' }).fill('test author 2')
      await page.getByRole('textbox', { name: 'url' }).fill('test url 2')
      // Submit the form to add second blog
      await page.getByRole('button', { name: 'create' }).click()

      // Open the new blog form
      await page.getByRole('button', { name: 'new blog' }).click()
      // Fill in the form
      await page.getByRole('textbox', { name: 'title' }).fill('test title 3')
      await page.getByRole('textbox', { name: 'author' }).fill('test author 3')
      await page.getByRole('textbox', { name: 'url' }).fill('test url 3')
      // Submit the form to add third blog
      await page.getByRole('button', { name: 'create' }).click()

      // Open the blogs
      const firstBlog = page.locator('[name="blog"]', {
        hasText: 'test title 1 test author 1',
      })
      const secondBlog = page.locator('[name="blog"]', {
        hasText: 'test title 2 test author 2',
      })
      const thirdBlog = page.locator('[name="blog"]', {
        hasText: 'test title 3 test author 3',
      })

      await firstBlog.getByRole('button', { name: 'view' }).click()
      await secondBlog.getByRole('button', { name: 'view' }).click()
      await thirdBlog.getByRole('button', { name: 'view' }).click()

      // Like the blogs

      // Like the first blog once
      await firstBlog.getByRole('button', { name: 'like' }).click()
      // Like the second blog twice
      await secondBlog.getByRole('button', { name: 'like' }).click()
      await secondBlog.getByRole('button', { name: 'like' }).click()
      // Like the third blog thrice
      await thirdBlog.getByRole('button', { name: 'like' }).click()
      await thirdBlog.getByRole('button', { name: 'like' }).click()
      await thirdBlog.getByRole('button', { name: 'like' }).click()

      const firstBlogListed = page.locator('[name="blog"]').first()
      const secondBlogListed = page.locator('[name="blog"]').nth(1)
      const thirdBlogListed = page.locator('[name="blog"]').nth(2)

      // Check that the third blog added is the first listed
      await expect(firstBlogListed).toContainText('test title 3 test author 3')
      // Check for the right number of likes
      await expect(firstBlogListed.getByText('likes 3')).toBeVisible()

      // Check that the second blog added is the second listed
      await expect(secondBlogListed).toContainText('test title 2 test author 2')
      // Check for the right number of likes
      await expect(secondBlogListed.getByText('likes 2')).toBeVisible()

      // Check that the first blog added is the third listed
      await expect(thirdBlogListed).toContainText('test title 1 test author 1')
      // Check for the right number of likes
      await expect(thirdBlogListed.getByText('likes 1')).toBeVisible()
    })
  })
})
