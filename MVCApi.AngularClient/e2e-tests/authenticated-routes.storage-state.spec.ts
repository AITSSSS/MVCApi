import { expect, test } from '@playwright/test';

test.describe('Authenticated routes with saved storageState', () => {
  test('TC_AUTH_STATE_001 - otwarcie listy klientow bez ponownego logowania', async ({ page }) => {
    await page.goto('/customers');

    await expect(page).toHaveURL('/customers');
    await expect(page).not.toHaveURL(/\/login$/i);
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  });

  test('TC_AUTH_STATE_002 - otwarcie formularza dodawania klienta bez ponownego logowania', async ({ page }) => {
    await page.goto('/customers/add');

    await expect(page).toHaveURL('/customers/add');
    await expect(page).not.toHaveURL(/\/login$/i);
    await expect(page.locator('#customerFirstName')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('TC_AUTH_STATE_003 - przejscie do kategorii z menu jako zalogowany uzytkownik', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Categories' }).click();

    await expect(page).toHaveURL('/categories');
    await expect(page).not.toHaveURL(/\/login$/i);
    await expect(page.getByRole('link', { name: 'Add new category' })).toBeVisible();
  });
});

