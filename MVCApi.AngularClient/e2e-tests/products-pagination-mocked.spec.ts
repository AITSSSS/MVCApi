import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

type ProductFixture = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: {
    currency: {
      code: string;
      decimalPlaces: number;
    };
    value: number;
  };
};

const allProducts: ProductFixture[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
  name: `Mock product ${idx + 1}`,
  description: `Description ${idx + 1}`,
  image: 'https://example.com/product.png',
  price: {
    currency: { code: 'PLN', decimalPlaces: 2 },
    value: (idx + 1) * 10,
  },
}));

test.describe('Products/Pagination - Testy Mockowane', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (d) => {
      await d.accept();
    });

    await page.route('**/api/Category/GetRootCategories**', async (route) => {
      await route.fulfill({ json: [] });
    });
  });

  test('TC_MOCK_PRODUCTS_PAGINATION_001 - Domyślne ustawienia paginacji', async ({ page }) => {
    let firstRequestUrl = '';

    await page.route('**/api/Product/GetPaginatedProducts**', async (route) => {
      const requestUrl = new URL(route.request().url());
      firstRequestUrl = requestUrl.toString();

      const pageNumber = Number(requestUrl.searchParams.get('pageNumber') ?? '1');
      const pageSize = Number(requestUrl.searchParams.get('pageSize') ?? '5');
      const start = (pageNumber - 1) * pageSize;
      const items = allProducts.slice(start, start + pageSize);
      const totalPages = Math.ceil(allProducts.length / pageSize);

      await route.fulfill({
        json: {
          pageIndex: pageNumber,
          pageSize,
          totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages,
          items,
        },
      });
    });

    await page.goto(`${BASE_URL}/products`);

    expect(firstRequestUrl).toContain('pageNumber=1');
    expect(firstRequestUrl).toContain('pageSize=5');
    await expect(page.locator('app-product')).toHaveCount(5);
    await expect(page.getByRole('heading', { name: 'Mock product 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: '»' })).toBeVisible();
    await expect(page.getByRole('button', { name: '«' })).toHaveCount(0);
  });

  test('TC_MOCK_PRODUCTS_PAGINATION_002 - Wybór rozmiaru paginacji tworzy request', async ({ page }) => {
    const requestUrls: string[] = [];

    await page.route('**/api/Product/GetPaginatedProducts**', async (route) => {
      const requestUrl = new URL(route.request().url());
      requestUrls.push(requestUrl.toString());

      const pageNumber = Number(requestUrl.searchParams.get('pageNumber') ?? '1');
      const pageSize = Number(requestUrl.searchParams.get('pageSize') ?? '5');
      const start = (pageNumber - 1) * pageSize;
      const items = allProducts.slice(start, start + pageSize);
      const totalPages = Math.ceil(allProducts.length / pageSize);

      await route.fulfill({
        json: {
          pageIndex: pageNumber,
          pageSize,
          totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages,
          items,
        },
      });
    });

    await page.goto(`${BASE_URL}/products`);
    await page.selectOption('#pageSizeSelect', '10');

    await expect.poll(() => requestUrls.length).toBeGreaterThan(1);
    const latestUrl = requestUrls[requestUrls.length - 1];

    expect(latestUrl).toContain('pageNumber=1');
    expect(latestUrl).toContain('pageSize=10');
    await expect(page.locator('app-product')).toHaveCount(10);
    await expect(page.getByRole('heading', { name: 'Mock product 10' })).toBeVisible();
  });

  test('TC_MOCK_PRODUCTS_PAGINATION_003 - Przyciski zmieniają stronę paginacji', async ({ page }) => {
    const pageNumbers: number[] = [];

    await page.route('**/api/Product/GetPaginatedProducts**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const pageNumber = Number(requestUrl.searchParams.get('pageNumber') ?? '1');
      const pageSize = Number(requestUrl.searchParams.get('pageSize') ?? '5');
      pageNumbers.push(pageNumber);

      const start = (pageNumber - 1) * pageSize;
      const items = allProducts.slice(start, start + pageSize);
      const totalPages = Math.ceil(allProducts.length / pageSize);

      await route.fulfill({
        json: {
          pageIndex: pageNumber,
          pageSize,
          totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages,
          items,
        },
      });
    });

    await page.goto(`${BASE_URL}/products`);

    await page.getByRole('button', { name: '»' }).click();
    await expect(page.getByRole('heading', { name: 'Mock product 6' })).toBeVisible();
    await expect(page.getByRole('button', { name: '«' })).toBeVisible();

    await page.getByRole('button', { name: '«' }).click();
    await expect(page.getByRole('heading', { name: 'Mock product 1' })).toBeVisible();

    expect(pageNumbers).toContain(1);
    expect(pageNumbers).toContain(2);
  });
});
