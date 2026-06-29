import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/UniSphere/i)
})

test('Sign In navigates to the login page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign In' }).first().click()
  await expect(page).toHaveURL(/\/login$/)
})
