import { test, expect } from '@playwright/test';

function generateRandomString() {
    return (Math.random() + 1).toString(36).substring(2, 5);
}

test('TC_REGISTER_001 - Sprawdzenie poprawnej rejestracji nowego użytkownika', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#registerUserName', `Nowyuser${generateRandomString()}`);
  await page.fill('#registerEmail', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#registerPassword', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.status-success')).toHaveText('Successfully created user account.');
});

test('TC_REGISTER_002 - Sprawdzenie rejestracji z username, który już istnieje w systemie', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#registerUserName', `admin`);
  await page.fill('#registerEmail', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#registerPassword', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.status-error')).toHaveText('Failed to create user account.');
});

test('TC_REGISTER_003 - Sprawdzenie rejestracji z email, który już istnieje w systemie', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#registerUserName', `Nowyuser${generateRandomString()}`);
  await page.fill('#registerEmail', `admin@gmail.com`);
  await page.fill('#registerPassword', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.status-error')).toHaveText('Failed to create user account.');
});

test('TC_REGISTER_004 - Sprawdzenie rejestracji, gdy pole username jest puste', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#registerUserName', ``);
  await page.fill('#registerEmail', `nowyuser${generateRandomString()}@gmail.com`);
  await page.fill('#registerPassword', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.status-error')).toHaveText('No username.');
});

test('TC_REGISTER_005 - Sprawdzenie rejestracji, gdy pole email jest puste lub niepoprawne', async ({ page }) => {
  await page.goto('http://localhost:4200/register');

  await page.fill('#registerUserName', `Nowyuser${generateRandomString()}`);
  await page.fill('#registerEmail', ``);
  await page.fill('#registerPassword', 'zaq1@WSX');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/register');
  await expect(page.locator('.status-error')).toHaveText('Bad email.');
});