import { test, expect } from '@playwright/test';

function generateRandomString() {
    return (Math.random() + 1).toString(36).substring(2, 5);
}

test('TC_REGISTER_001 - Sprawdzenie poprawnej rejestracji nowego użytkownika', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#userName', `Nowyuser${generateRandomString()}`);
  await page.fill('#email', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#password', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.alert-success')).toHaveText('Successfully created user account.');
});

test('TC_REGISTER_002 - Sprawdzenie rejestracji z username, który już istnieje w systemie', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#userName', `admin`);
  await page.fill('#email', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#password', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.alert-danger')).toHaveText('Failed to create user account.');
});

test('TC_REGISTER_003 - Sprawdzenie rejestracji z email, który już istnieje w systemie', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#userName', `Nowyuser${generateRandomString()}`);
  await page.fill('#email', `admin@gmail.com`);
  await page.fill('#password', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.alert-danger')).toHaveText('Failed to create user account.');
});

test('TC_REGISTER_004 - Sprawdzenie rejestracji, gdy pole username jest puste', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#userName', ``);
  await page.fill('#email', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#password', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.alert-danger')).toHaveText('No username.');
});

test('TC_REGISTER_005 - Sprawdzenie rejestracji, gdy pole email jest puste lub niepoprawne', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#userName', `Nowyuser${generateRandomString()}`);
  await page.fill('#email', ``);
  await page.fill('#password', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.alert-danger')).toHaveText('Bad email.');
});