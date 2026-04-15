import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

const extractPrice = (priceString: string | null): number => {
  if (priceString === null) return 0;

  const clean = priceString.replace(/[^0-9.]/g, '');

  return parseFloat(clean);
};

test.describe('Products E2E Mocked', () => {
  const PRODUCT_PAGE = 'products';
  const CART_PAGE = 'cart';

  const products = [
    {
      id: '77489161-552f-48ad-803a-386f5ed89ce4',
      name: 'Test',
      description: 'Test Test Test',
      image: 'https://test.com/image.png',
      price: {
        currency: {
          code: 'PLN',
          decimalPlaces: 2,
        },
        value: 20,
      },
    },
    {
      id: '77489161-552f-48ad-803a-386f5ed89ce3',
      name: 'Test',
      description: 'Test Test Test',
      image: 'https://test.com/image.png',
      price: {
        currency: {
          code: 'PLN',
          decimalPlaces: 2,
        },
        value: 40,
      },
    },
  ];

  test.beforeEach(async ({ page }) => {
    const addedProducts: Map<string, number> = new Map();

    page.on('dialog', async (d) => {
      await d.accept();
    });

    page.route('**/api/Product/GetPaginatedProducts**', async (route) => {
      const json = {
        hasPreviousPage: false,
        hasNextPage: false,
        pageIndex: 1,
        totalPages: 1,
        pageSize: 5,
        items: products,
      };

      await route.fulfill({ json });
    });

    page.route('**/api/Cart/AddProductToCart', async (route) => {
      const request = route.request();
      const productId = request.postDataJSON().productId;
      const count = request.postDataJSON().count;
      addedProducts.set(productId, count);

      await route.fulfill({ json: request.postDataJSON().cartId });
    });

    page.route('**/api/Cart/GetCartById/**', async (route) => {
      const p = products.filter((x) =>
        Array.from(addedProducts.keys()).some((a) => a === x.id),
      );
      const json = {
        products: p.map((x) => {
          return {
            product: x,
            count: addedProducts.get(x.id),
          };
        }),
      };

      await route.fulfill({ json });
    });
  });

  test('Product should be added to cart.', async ({ page }) => {
    await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`);

    const product = page.locator('app-product').first();

    const expectedPrice = await product
      .locator('article > div:nth-child(3)')
      .textContent();

    const addToCart = page.getByRole('button', { name: 'Add to cart' }).first();
    await addToCart.click();
    await page.waitForEvent('dialog');

    await page.goto(`${BASE_URL}/${CART_PAGE}`);

    var actual = await page.locator('p.fw-semibold').textContent();
    expect(actual).toBe(expectedPrice?.trim());
  });

  test('Cart without added products should be empty.', async ({ page }) => {
    await page.goto(`${BASE_URL}/${CART_PAGE}`);

    var actual = await page.locator('p.fw-semibold').textContent();
    var msg = await page.locator('#cart-empty-msg').textContent();
    expect(extractPrice(actual)).toBe(0.0);
    expect(msg).toBe('Your cart is empty');
  });

  test("Duplicate product shouldn't be added.", async ({ page }) => {
    await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`);

    const product = page.locator('app-product').first();

    const expectedPrice = await product
      .locator('article > div:nth-child(3)')
      .textContent();

    const addToCart = page.getByRole('button', { name: 'Add to cart' }).first();
    await addToCart.click();
    await page.waitForEvent('dialog');
    await addToCart.click();
    await page.waitForEvent('dialog');

    await page.goto(`${BASE_URL}/${CART_PAGE}`);

    var actual = await page.locator('p.fw-semibold').textContent();
    expect(actual).toBe(expectedPrice?.trim());
  });
});
