import {expect, test} from '@playwright/test';

const BASE_URL = 'http://localhost:5000';
const LOGIN_URL = `${BASE_URL}/api/User/SignIn`;
const PRODUCTS_PAGINATED_URL = `${BASE_URL}/api/Product/GetPaginatedProducts`;

let authHeader: { [key: string]: string };

test.beforeAll(async ({request}) => {
  const login = await request.post(LOGIN_URL, {
    data: {
      email: 'admin@gmail.com',
      password: 'Admin2137@',
      rememberMe: true,
    },
  });
  expect(login.status()).toBe(200);
  const body = await login.json();
  expect(body.isAuthSuccessful).toBe(true);
  expect(body.token).toBeTruthy();

  authHeader = {Authorization: `Bearer ${body.token}`};
});

test.describe('Products/Pagination - Testy API', () => {

  test('TC_API_PRODUCTS_PAGINATION_001 - Poprawne działanie parametrów pageNumber i pageSize', async ({request,}) => {
    const pageNumber = 2;
    const pageSize = 5;

    const response = await request.get(PRODUCTS_PAGINATED_URL, {
      headers: authHeader,
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.pageIndex).toBe(pageNumber);
    expect(body.pageSize).toBe(pageSize);
    expect(body.items.length).toBeLessThanOrEqual(pageSize);

    //Check hasPreviousPage and hasNextPage
    if (body.pageIndex > 1) {
      expect(body.hasPreviousPage).toBeTruthy();
    } else {
      expect(body.hasPreviousPage).toBeFalsy();
    }

    if (body.pageIndex < body.totalPages) {
      expect(body.hasNextPage).toBeTruthy();
    } else {
      expect(body.hasNextPage).toBeFalsy();
    }
  });

  test('TC_API_PRODUCTS_PAGINATION_002 - Żądanie strony poza zakresem zwraca pustą listę', async ({request,}) => {
    //Get total pages count
    const firstPage = await request.get(PRODUCTS_PAGINATED_URL, {
      headers: authHeader,
      params: {
        pageNumber: 1,
        pageSize: 10
      },
    });
    expect(firstPage.status()).toBe(200);
    const firstBody = await firstPage.json();
    const totalPages = firstBody.totalPages;

    //Load page with id greater than totalPages
    const outOfRangePage = totalPages + 10;
    const response = await request.get(PRODUCTS_PAGINATED_URL, {
      headers: authHeader,
      params: {
        pageNumber: outOfRangePage,
        pageSize: 10,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.pageIndex).toBe(outOfRangePage);
    expect(body.pageSize).toBe(10);
    expect(body.totalPages).toBe(totalPages);
    expect(body.items).toHaveLength(0);
    expect(body.hasPreviousPage).toBeTruthy(); // bo strona > 1
    expect(body.hasNextPage).toBeFalsy();
  });

  test('TC_API_PRODUCTS_PAGINATION_003 - Działanie parametru Currency', async ({request,}) => {
    const currencies = ['USD', 'PLN', 'EUR']
    for (let currencyCode of currencies) {
      const response = await request.get(PRODUCTS_PAGINATED_URL, {
        headers: authHeader,
        params: {
          pageNumber: 1,
          pageSize: 5,
          currencyCode: currencyCode,
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.items).toBeDefined();
      expect(Array.isArray(body.items)).toBeTruthy();

      if (body.items.length > 0) {
        for (const product of body.items) {
          expect(product.price).toBeDefined();
          expect(product.price.currency).toBeDefined();
          expect(product.price.currency.code).toBe(currencyCode);
          expect(typeof product.price.value).toBe('number');
        }
      }
    }
  });

});
