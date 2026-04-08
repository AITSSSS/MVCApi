import { APIRequestContext, expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:5000';

test.describe('Cart API', () => {
  const createCart = async (request: APIRequestContext) => {
    const response = await request.post(`${BASE_URL}/api/Cart/CreateCart`, {
      data: {},
    });

    return response.json();
  };

  const getCart = async (request: APIRequestContext, cartId: string) => {
    const response = await request.get(
      `${BASE_URL}/api/Cart/GetCartById/${cartId}`,
    );

    return response.json();
  };

  const getFirstProduct = async (request: APIRequestContext) => {
    const response = await request.get(
      `${BASE_URL}/api/Product/GetPaginatedProducts?pageNumber=1&pageSize=5&currencyCode=PLN`,
    );

    return (await response.json()).items[0];
  };

  test('api/Cart/CreateCart returns cart', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/Cart/CreateCart`, {
      data: {},
    });

    expect(response.ok()).toBe(true);
  });

  test("api/Cart/AddProductToCart doesn't add invalid product", async ({
    request,
  }) => {
    const cartId = await createCart(request);
    const response = await request.put(
      `${BASE_URL}/api/Cart/AddProductToCart`,
      {
        data: {
          cartId: cartId,
          productId: null,
          count: 1,
        },
      },
    );

    const cart = await getCart(request, cartId);

    expect(cart.products.length).toBe(0);
  });

  test('api/Cart/AddProductToCart adds valid product', async ({ request }) => {
    const productId = (await getFirstProduct(request)).id;
    const cartId = await createCart(request);
    const response = await request.put(
      `${BASE_URL}/api/Cart/AddProductToCart`,
      {
        data: {
          cartId: cartId,
          productId: productId,
          count: 1,
        },
      },
    );

    const cart = await getCart(request, cartId);

    expect(response.ok()).toBe(true);
    expect(cart.products.length).toBe(1);
  });
});
