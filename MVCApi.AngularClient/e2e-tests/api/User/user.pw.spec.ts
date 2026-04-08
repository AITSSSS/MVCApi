import { test, expect  } from '@playwright/test';

test("TC_USER_001 - Poprawne zapytanie /api/User/SignIn", async ({ request }) => {
  const response = await request.post('http://localhost:5000/api/User/SignIn', {
    data: {
      email: 'admin@gmail.com',
      password: 'Admin2137@',
      rememberMe: true
    }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.isAuthSuccessful).toBe(true);
  expect(body.errorMessage).toBeNull();
  expect(body.token).toBeTruthy();
});

test("TC_USER_002 - Zapytanie z niepoprawnym hasłem /api/User/SignIn", async ({ request }) => {
  const response = await request.post('http://localhost:5000/api/User/SignIn', {
    data: {
      email: 'admin@gmail.com',
      password: 'zaq1@WSX',
      rememberMe: true
    }
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.isAuthSuccessful).toBe(false);
  expect(body.errorMessage).toBe('Invalid authentication');
  expect(body.token).toBeNull();
});

test("TC_USER_004 - Zapytanie z pustym polem email /api/User/SignIn", async ({ request }) => {
  const response = await request.post('http://localhost:5000/api/User/SignIn', {
    data: {
      email: '',
      password: 'Admin2137@',
      rememberMe: true
    }
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.isAuthSuccessful).toBe(false);
  expect(body.errorMessage).toBe('Invalid email');
  expect(body.token).toBeNull();
});