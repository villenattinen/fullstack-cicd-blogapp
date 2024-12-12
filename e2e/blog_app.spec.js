const { test, expect, beforeEach, describe } = require('@playwright/test')
const { resetDatabase, login, createBlog, likeTimes } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await resetDatabase(request)
    await page.goto('')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('newuser')
      await page.getByTestId('password').fill('password')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('New User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('newuser')
      await page.getByTestId('password').fill('wrong')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('New User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await login(page, 'newuser', 'password')
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()

      await page.getByTestId('title').fill('Testing with Playwright')
      await page.getByTestId('author').fill('Ted Tester')
      await page.getByTestId('url').fill('http//:example.com')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(
        page.getByText('Testing with Playwright by Ted Tester')
      ).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(
          page,
          'Testing with Playwright',
          'Ted Tester',
          'http//:example.com'
        )
      })

      test('it can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
      })

      test('it can be deleted by the creator', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()
        page.on('dialog', async (dialog) => {
          await dialog.accept()
        })
        await page.getByRole('button', { name: 'remove' }).click()

        await expect(
          page.getByText('Testing with Playwright by Ted Tester')
        ).not.toBeVisible()
      })

      test('it can not be deleted by other users', async ({ page }) => {
        await page.getByRole('button', { name: 'logout' }).click()
        await login(page, 'ted', 'tedsecret')

        await page.getByRole('button', { name: 'view' }).click()
        await expect(
          page.getByRole('button', { name: 'remove' })
        ).not.toBeVisible()
      })
    })

    describe('and multiple blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'blog1', 'Ted Tester', 'http//:example.com/1')
        await createBlog(page, 'blog2', 'Ted Tester', 'http//:example.com/2')
        await createBlog(page, 'blog3', 'Ted Tester', 'http//:example.com/3')
      })

      test('blogs are ordered by likes', async ({ page }) => {
        await page
          .getByText('blog1')
          .getByRole('button', { name: 'view' })
          .click()
        await page
          .getByText('blog2')
          .getByRole('button', { name: 'view' })
          .click()
        await page
          .getByText('blog3')
          .getByRole('button', { name: 'view' })
          .click()

        await page.pause()
        const button1 = page
          .getByText('blog1')
          .getByRole('button', { name: 'like' })
        await likeTimes(page, button1, 1)
        await page
          .getByText('blog1')
          .getByRole('button', { name: 'hide' })
          .click()

        const button2 = page
          .getByText('blog2')
          .getByRole('button', { name: 'like' })
        await likeTimes(page, button2, 3)
        await page
          .getByText('blog2')
          .getByRole('button', { name: 'hide' })
          .click()

        const button3 = page
          .getByText('blog3')
          .getByRole('button', { name: 'like' })
        await likeTimes(page, button3, 2)
        await page
          .getByText('blog3')
          .getByRole('button', { name: 'hide' })
          .click()

        const blogDivs = await page.locator('div.blog').all()

        await expect(blogDivs[0]).toHaveText('blog2 Ted Testerview')
        await expect(blogDivs[1]).toHaveText('blog3 Ted Testerview')
        await expect(blogDivs[2]).toHaveText('blog1 Ted Testerview')
      })
    })
  })
})
