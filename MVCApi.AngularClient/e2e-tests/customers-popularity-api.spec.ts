import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5000';

type AuthResponse = {
  isAuthSuccessful?: boolean;
  errorMessage?: string;
  token?: string;
};

async function signInAsAdmin(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/api/User/SignIn`, {
    data: {
      email: 'admin@gmail.com',
      password: 'Admin2137@',
      rememberMe: false,
    },
  });

  expect(response.status()).toBe(200);
  const payload = (await response.json()) as AuthResponse;
  expect(payload.isAuthSuccessful).toBeTruthy();
  expect(payload.token).toBeTruthy();

  return payload.token as string;
}

async function expectArrayResponse(response: APIResponse): Promise<unknown[]> {
  expect(response.status()).toBe(200);
  const payload = (await response.json()) as unknown;
  expect(Array.isArray(payload)).toBeTruthy();
  return payload as unknown[];
}

test.describe('API - customers and popularity', () => {
  test('TC_API_CUSTOMERS_001 - GetAllCustomers returns 401 without token', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/Customer/GetAllCustomers`);
    expect(response.status()).toBe(401);
  });

  test('TC_API_CUSTOMERS_002 - GetAllCustomers returns customer list for admin', async ({ request }) => {
    const token = await signInAsAdmin(request);

    const response = await request.get(`${API_BASE_URL}/api/Customer/GetAllCustomers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const customers = await expectArrayResponse(response);
    if (customers.length > 0) {
      const firstCustomer = customers[0] as Record<string, unknown>;
      expect(typeof firstCustomer.id).toBe('string');
      expect(typeof firstCustomer.firstName).toBe('string');
      expect(typeof firstCustomer.lastName).toBe('string');
      expect(firstCustomer.contactInfos === null || Array.isArray(firstCustomer.contactInfos)).toBeTruthy();
    }
  });

  test('TC_API_POPULARITY_001 - GetOrdersInDateRange returns order list', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/Order/GetOrdersInDateRange`, {
      params: {
        startDate: '2020-01-01',
        endDate: '2030-12-31',
        currencyCode: 'PLN',
      },
    });

    const orders = await expectArrayResponse(response);
    if (orders.length > 0) {
      const firstOrder = orders[0] as Record<string, unknown>;
      expect(typeof firstOrder.id).toBe('string');
      expect(firstOrder.dateCreated).toBeTruthy();
    }
  });
});

