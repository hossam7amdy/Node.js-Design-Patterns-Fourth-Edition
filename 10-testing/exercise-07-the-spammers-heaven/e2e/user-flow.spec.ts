import { expect, test } from '@playwright/test'

test('a user can signup and subscribe for the newsletter', async ({
  page,
  baseURL,
}) => {
  await page.goto(`${baseURL}/`)

  await expect(page).toHaveTitle(/The Weekly Digest/)
  await page.getByRole('link', { name: 'Sign Up for Free' }).click()

  await expect(page).toHaveURL(`${baseURL}/subscribe`)
  await expect(page).toHaveTitle(/Subscribe — The Weekly Digest/)

  const testEmail = 'test@example.com'
  await page.getByRole('textbox', { name: 'email' }).fill(testEmail)
  await page.getByRole('button', { name: 'Subscribe' }).click()

  expect(await page.getByTestId('confirmation-message').innerText()).toBe(
    `Thanks for subscribing, ${testEmail} !`
  )
})
