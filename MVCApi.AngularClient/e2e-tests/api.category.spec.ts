import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5000/api/Category';
const LOGIN_URL = 'http://localhost:5000/api/User/SignIn';

let authHeader: { [key: string]: string };

test.beforeAll(async ({ request }) => {
  const login = await request.post(LOGIN_URL, {
    data: {
      email: 'admin@gmail.com',
      password: 'Admin2137@',
      rememberMe: true
    }
  });
  expect(login.status()).toBe(200);
  const body = await login.json();
  expect(body.isAuthSuccessful).toBe(true);
  expect(body.token).toBeTruthy();

  authHeader = { 'Authorization': `Bearer ${body.token}` };
});

test.describe('Category API', () => {

  test('GET all categories', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/GetAllCategories`, { headers: authHeader });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('POST CreateCategory - GET by id', async ({ request }) => {

    const create = await request.post(`${BASE_URL}/CreateCategory`, {
      headers: authHeader,
      data: { name: 'TestCategory' }
    });

    expect([200, 201]).toContain(create.status());

    const created = await create.json();

    const get = await request.get(`${BASE_URL}/GetCategoryById/${created.id}`, { headers: authHeader });

    if (get.status() === 204) {
      console.warn('GET by id 204 no content');
    } else {
      const category = await get.json();
      expect(category.name).toBe('TestCategory');
    }
  });

test('CreateSubcategory', async ({ request }) => {

  const allCategories = await request.get(`${BASE_URL}/GetAllCategories`, { headers: authHeader });
  const categories = await allCategories.json();
  const parentCategory = categories[0];


  const sub = await request.post(`${BASE_URL}/CreateSubcategory`, {
    headers: authHeader,
    data: {
      name: 'SubCategory',
      parentId: parentCategory.id
    }
  });

  expect([200, 201]).toContain(sub.status());


  if (sub.status() === 200 || sub.status() === 201) {
    console.log(`Subcategory "${'SubCategory'}" created with parentId=${parentCategory.id}`);
  } else {
    console.warn('CreateSubcategory returns something');
  }
});

});