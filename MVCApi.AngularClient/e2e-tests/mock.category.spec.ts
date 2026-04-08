import { test, expect } from '@playwright/test';

test.describe('Category mock with auth added 2 categories', () => {

  test.beforeEach(async ({ page }) => {

    await page.addInitScript(() => {
      localStorage.setItem('token', 'token-mock');
    });

    page.on('request', request => console.log('REQ:', request.method(), request.url()));
    page.on('response', response => console.log('RESP:', response.status(), response.url()));


    await page.route('**/api/Category/GetRootCategories**', async route => {
      const url = route.request().url();
      console.log('MOCK TRIGGERED for URL:', url);

      if (url.includes('empty=true')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (url.includes('error=true')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Elektronika' },
            { id: 2, name: 'Książki' }
          ])
        });
      }
    });
  });

  test('Mock categories list', async ({ page }) => {
    await page.goto('http://localhost:4200/categories');
    await page.waitForSelector('text=Elektronika', { timeout: 20000 });

    await expect(page.locator('text=Elektronika')).toBeVisible();
    await expect(page.locator('text=Książki')).toBeVisible();
    await expect(page.locator('text=Add new category')).toBeVisible();
  });

test('Mock empty categories list - sanity check', async ({ page }) => {
  await page.goto('http://localhost:4200/categories?empty=true');

  const req = page.request;
  console.log('Visited:', page.url());

  const categories = await page.evaluate(async () => {
    const resp = await fetch('/api/Category/GetRootCategories?empty=true');
    return await resp.json();
  });
  expect(categories.length).toBe(0);
});
test('Mock test: Header is visible', async ({ page }) => {
  await page.route('**/api/Category/GetRootCategories', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Elektronika' },
        { id: 2, name: 'Książki' }
      ])
    });
  });

  await page.goto('http://localhost:4200/categories');

  await expect(page.locator('h2')).toHaveText('Categories');


  await expect(page.locator('text=Elektronika')).toBeVisible();
  await expect(page.locator('text=Książki')).toBeVisible();
});

});