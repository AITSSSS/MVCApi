import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

const randomSuffix = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#loginEmail', 'admin@gmail.com');
  await page.fill('#loginPassword', 'Admin2137@');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE_URL}/`);
}

async function fillCustomerForm(page: Page, seed: string): Promise<{ firstName: string; lastName: string; email: string }> {
  const firstName = `E2EFirst${seed}`;
  const lastName = `E2ELast${seed}`;
  const email = `e2e.${seed}@mail.com`;

  await page.fill('#customerFirstName', firstName);
  await page.fill('#customerLastName', lastName);
  await page.fill('#customerDob', '1990-05-15');
  await page.fill('#customerCountry', 'Poland');
  await page.fill('#customerCity', 'Warsaw');
  await page.fill('#customerStreet', 'Testowa');
  await page.fill('#customerStreetNumber', '10');
  await page.fill('#customerPostCode', '00-001');
  await page.fill('#customerEmail', email);
  await page.fill('#customerPhone', '123456789');

  return { firstName, lastName, email };
}

async function createCustomer(page: Page, seed: string): Promise<{ firstName: string; lastName: string; email: string }> {
  await page.goto(`${BASE_URL}/customers/add`);
  const customer = await fillCustomerForm(page, seed);

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(`${BASE_URL}/customers`);
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  return customer;
}

async function openCustomerEditFromList(
  page: Page,
  customer: { firstName: string; lastName: string; email: string }
): Promise<void> {
  await page.goto(`${BASE_URL}/customers`);

  const customerCard = page
    .locator('.card')
    .filter({ hasText: customer.firstName })
    .filter({ hasText: customer.lastName })
    .first();

  await expect(customerCard).toBeVisible();
  await customerCard.getByRole('link', { name: 'Edit' }).click();
  await expect(page).toHaveURL(/\/customers\/edit\/[^/]+$/);

  // Wait until async data loading in edit form is complete before changing values.
  await expect(page.locator('#editCustomerFirstName')).toHaveValue(customer.firstName);
  await expect(page.locator('#editCustomerLastName')).toHaveValue(customer.lastName);
  await expect(page.locator('#editCustomerEmail')).toHaveValue(customer.email);
}

test.describe('TC_CUSTOMERS_001 - customers tab opens and displays list UI', () => {
  test('opens Customers from navbar', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('link', { name: 'Customers' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/customers`);
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add customer' })).toBeVisible();
  });
});

test.describe('TC_CUSTOMERS_002 - add customer requires mandatory fields', () => {
  test('shows validation errors on empty submit', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/customers/add`);

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
    await expect(page.getByText('Date of birth is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});

test.describe('TC_CUSTOMERS_003 - add customer validates age rule', () => {
  test('blocks customer younger than 18', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/customers/add`);

    const seed = randomSuffix();
    await fillCustomerForm(page, seed);
    await page.fill('#customerDob', '2012-01-01');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Customer must be over 18')).toBeVisible();
  });
});

test.describe('TC_POPULARITY_001 - popularity tab opens and displays base UI', () => {
  test('opens Popularity from navbar', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: 'Popularity' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/popularity`);
    await expect(page.getByRole('heading', { name: 'Orders in date range' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Order id' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
  });
});

test.describe('TC_POPULARITY_002 - range auto-adjusts when start is after end', () => {
  test('moves end date to start date and shows notice', async ({ page }) => {
    await page.goto(`${BASE_URL}/popularity`);

    await page.fill('#endDate', '2024-06-10');
    await page.fill('#startDate', '2024-06-15');

    await expect(page.locator('#endDate')).toHaveValue('2024-06-15');
    await expect(page.getByText('Date range auto-adjusted to keep start date before or equal to end date.')).toBeVisible();
  });
});

test.describe('TC_POPULARITY_003 - range auto-adjusts when end is before start', () => {
  test('moves start date to end date and shows notice', async ({ page }) => {
    await page.goto(`${BASE_URL}/popularity`);

    await page.fill('#startDate', '2024-06-15');
    await page.fill('#endDate', '2024-06-10');

    await expect(page.locator('#startDate')).toHaveValue('2024-06-10');
    await expect(page.getByText('Date range auto-adjusted to keep start date before or equal to end date.')).toBeVisible();
  });
});

test.describe('TC_CUSTOMERS_004 - edit customer saves updated basic data', () => {
  test('edits first and last name and returns to customer list', async ({ page }) => {
    await loginAsAdmin(page);

    const seed = randomSuffix();
    const customer = await createCustomer(page, seed);
    await openCustomerEditFromList(page, customer);

    const updatedFirstName = `E2EEditedFirst${seed}`;
    const updatedLastName = `E2EEditedLast${seed}`;

    await page.fill('#editCustomerFirstName', updatedFirstName);
    await page.fill('#editCustomerLastName', updatedLastName);

    const successDialog = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Save changes' }).click();
    const dialog = await successDialog;
    await expect(dialog.message()).toContain('Customer updated successfully.');
    await dialog.accept();

    await expect(page).toHaveURL(`${BASE_URL}/customers`);

    const updatedCustomerCard = page
      .locator('.card')
      .filter({ hasText: updatedFirstName })
      .filter({ hasText: updatedLastName })
      .first();

    await expect(updatedCustomerCard).toBeVisible();
  });
});

test.describe('TC_CUSTOMERS_005 - edit customer validates age rule', () => {
  test('blocks saving customer younger than 18 on edit form', async ({ page }) => {
    await loginAsAdmin(page);

    const seed = randomSuffix();
    const customer = await createCustomer(page, seed);
    await openCustomerEditFromList(page, customer);

    await page.fill('#editCustomerDob', '2012-01-01');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByText('Customer must be over 18')).toBeVisible();
    await expect(page).toHaveURL(/\/customers\/edit\/[^/]+$/);
  });
});

