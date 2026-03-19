import { test, expect } from '@playwright/test';

test('TC_LOGIN_001 - Sprawdzenie, czy użytkownik może zalogować się poprawnymi danymi', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('#email', 'admin@gmail.com');
  await page.fill('#password', 'Admin2137@');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/');
});

test('TC_LOGIN_002 - Sprawdzenie logowania z niepoprawnym hasłem do konta', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('#email', 'admin@gmail.com');
  await page.fill('#password', 'aaaaaaa');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.alert-danger')).toHaveText('Cannot authenticate user.');
});

test('TC_LOGIN_003 - Sprawdzenie logowania z nieistniejącym emailem', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('#email', 'fakeuser@gmail.com');
  await page.fill('#password', 'aaaaaaa');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.alert-danger')).toHaveText('No user with such email in database.');
});

test('TC_LOGIN_004 - Sprawdzenie logowania przy pustym lub niepoprawnym polu email', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('#email', '');
  await page.fill('#password', 'aaaaaaa');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.alert-danger')).toHaveText('Bad email.');
});

test('TC_LOGIN_005 - Sprawdzenie logowania przy pustym polu hasła', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('#email', 'fakeuser@gmail.com');
  await page.fill('#password', '');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.alert-danger')).toHaveText('No password.');
});