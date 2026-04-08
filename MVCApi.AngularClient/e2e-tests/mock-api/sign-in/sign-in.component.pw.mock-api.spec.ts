import { test, expect  } from '@playwright/test';

test('TC_LOGIN_MOCK_API_001 - Sprawdzenie, czy użytkownik może zalogować się poprawnymi danymi', async ({ page }) => {
  await page.route('**/api/User/SignIn', async route => {
    const json = { 
      isAuthSuccessful: true,
      errorMessage: null,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIyZDBhZmEwYi1iMzMxLTRiMzItMTQ2My0wOGRlN2FmMTYzYmEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImV4cCI6MTc3NDk4ODk3OSwiaXNzIjoiRVNob3AiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAifQ.JEwusX-wC9mEnIJpNEtEbkhbAqmIqUsr3stkcZgDdFA"
    };
    await route.fulfill({ json });
  });

  await page.goto('http://localhost:4200/login');

  await page.fill('#loginEmail', 'admin@gmail.com');
  await page.fill('#loginPassword', 'Admin2137@');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/');
});

test('TC_LOGIN_MOCK_API_002 - Sprawdzenie logowania z niepoprawnym hasłem do konta', async ({ page }) => {
  await page.route('**/api/User/SignIn', async route => {
    const json = { 
      isAuthSuccessful: false,
      errorMessage: 'Invalid authentication',
      token: null
    };
    await route.fulfill({ json });
  });

  await page.goto('http://localhost:4200/login');

  await page.fill('#loginEmail', 'admin@gmail.com');
  await page.fill('#loginPassword', 'aaaaaaa');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.status-error')).toHaveText('Cannot authenticate user.');
});

test('TC_LOGIN_MOCK_API_003 - Sprawdzenie logowania z nieistniejącym emailem', async ({ page }) => {
  await page.route('**/api/User/SignIn', async route => {
    const json = { 
      isAuthSuccessful: false,
      errorMessage: 'No user with such email in database',
      token: null
    };
    await route.fulfill({ json });
  });

  await page.goto('http://localhost:4200/login');

  await page.fill('#loginEmail', 'fakeuser@gmail.com');
  await page.fill('#loginPassword', 'aaaaaaa');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:4200/login');
  await expect(page.locator('.status-error')).toHaveText('No user with such email in database.');
});