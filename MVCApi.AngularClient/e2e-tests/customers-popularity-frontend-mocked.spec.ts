import { test, expect, Page, Request } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';
const API_BASE_URL = 'http://localhost:5000';

type CustomerFixture = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  city: string;
  email: string;
};

type OrderFixture = {
  id: string;
  dateCreated: string;
  shoppingCart: {
    products: Array<{
      count: number;
      product: {
        id: string;
        name: string;
      };
    }>;
  };
};

const mockedCustomers: CustomerFixture[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    firstName: 'Anna',
    lastName: 'Nowak',
    dateOfBirth: '1991-04-11T00:00:00',
    country: 'Poland',
    city: 'Warsaw',
    email: 'anna.nowak@example.com',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    firstName: 'Piotr',
    lastName: 'Kowalski',
    dateOfBirth: '1988-09-02T00:00:00',
    country: 'Poland',
    city: 'Gdansk',
    email: 'piotr.kowalski@example.com',
  },
];

const mockedOrders: OrderFixture[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    dateCreated: '2024-06-12T10:30:00',
    shoppingCart: {
      products: [
        {
          count: 2,
          product: {
            id: '44444444-4444-4444-4444-444444444444',
            name: 'Keyboard',
          },
        },
      ],
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    dateCreated: '2024-06-13T15:00:00',
    shoppingCart: {
      products: [
        {
          count: 1,
          product: {
            id: '66666666-6666-6666-6666-666666666666',
            name: 'Mouse',
          },
        },
      ],
    },
  },
];

async function clearAuthStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function mockCustomers(page: Page, customers: CustomerFixture[]): Promise<void> {
  await page.route(`${API_BASE_URL}/api/Customer/GetAllCustomers`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(customers),
    });
  });
}

async function mockPopularity(page: Page, orders: OrderFixture[], interceptedUrls: string[]): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/api/Order/GetOrdersInDateRange\\?.*`), async (route, request: Request) => {
    interceptedUrls.push(request.url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(orders),
    });
  });
}

test.describe('Frontend isolated with mocked backend - customers and popularity', () => {
  test('TC_MOCK_CUSTOMERS_001 - customers list renders mocked cards', async ({ page }) => {
    await clearAuthStorage(page);
    await mockCustomers(page, mockedCustomers);

    await page.goto(`${BASE_URL}/customers`);

    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.locator('.card')).toHaveCount(2);
    await expect(page.locator('.card').first()).toContainText('Anna');
    await expect(page.locator('.card').nth(1)).toContainText('Kowalski');
    await expect(page.getByRole('link', { name: 'Edit' }).first()).toHaveAttribute(
      'href',
      '/customers/edit/11111111-1111-1111-1111-111111111111'
    );
  });

  test('TC_MOCK_CUSTOMERS_002 - customers page handles empty API response', async ({ page }) => {
    await clearAuthStorage(page);
    await mockCustomers(page, []);

    await page.goto(`${BASE_URL}/customers`);

    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add customer' })).toBeVisible();
    await expect(page.locator('.card')).toHaveCount(0);
  });

  test('TC_MOCK_POPULARITY_001 - popularity table renders mocked orders and sends date range params', async ({ page }) => {
    const interceptedUrls: string[] = [];
    await clearAuthStorage(page);
    await mockPopularity(page, mockedOrders, interceptedUrls);

    await page.goto(`${BASE_URL}/popularity`);

    await expect(page.getByRole('heading', { name: 'Orders in date range' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.getByRole('link', { name: mockedOrders[0].id })).toHaveAttribute(
      'href',
      `/order/${mockedOrders[0].id}`
    );

    await page.fill('#startDate', '2024-06-12');
    await page.fill('#endDate', '2024-06-14');

    await expect.poll(() => interceptedUrls.length).toBeGreaterThan(1);
    const latestRequest = interceptedUrls[interceptedUrls.length - 1];
    expect(latestRequest).toContain('startDate=2024-06-12');
    expect(latestRequest).toContain('endDate=2024-06-14');
  });
});

