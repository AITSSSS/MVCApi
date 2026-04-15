import { expect, test as setup } from '@playwright/test';

export const authStatePath = 'playwright/.auth/admin.json';

setup('login once and save browser storage state', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#loginEmail', 'admin@gmail.com');
  await page.fill('#loginPassword', 'Admin2137@');
  await page.check('#rememberMe');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/');
  await expect.poll(async () =>
    page.evaluate(() => localStorage.getItem('jwt_token'))
  ).not.toBeNull();

  await page.context().storageState({ path: authStatePath });
});

