
import { test, expect } from '@playwright/test'

test('should display the main menu', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('button', { name: /play game/i })
  ).toBeVisible()

  await expect(
    page.getByRole('button', { name: /options/i })
  ).toBeVisible()

  await expect(
    page.getByRole('button', { name: /ranking/i })
  ).toBeVisible()

  await expect(
    page.getByRole('button', { name: /match history/i })
  ).toBeVisible()
})

test('should open game options', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: /options/i }).click()

  await expect(
    page.getByText(/match duration/i)
  ).toBeVisible()

  await expect(
    page.getByText(/enemy spawn interval/i)
  ).toBeVisible()
})

test('should navigate to ranking', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: /ranking/i }).click()

  await expect(
    page.getByRole('heading', { name: /ranking/i })
  ).toBeVisible()
})
