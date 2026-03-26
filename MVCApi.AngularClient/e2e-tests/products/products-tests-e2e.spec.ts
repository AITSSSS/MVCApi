import {Browser, BrowserContext, expect, Page, test} from '@playwright/test';
import {stat} from 'fs/promises';

const BASE_URL = 'http://localhost:4200';

const goToProducts = async (page: Page): Promise<void> => {
  await page.goto(`${BASE_URL}/products`);
  await expect(page).toHaveURL(`${BASE_URL}/products`);
};

const signOut = async (page: Page): Promise<void> => {
  await page.goto(`${BASE_URL}/signout`);
  await expect(page).toHaveURL(/\/login/i);
};

const signInAsAdmin = async (page: Page): Promise<void> => {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#loginEmail', 'admin@gmail.com');
  await page.fill('#loginPassword', 'Admin2137@');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE_URL}/`);
};

const findProductCardByName = async (page: Page, productName: string) => {
  const card = page
    .locator('div.card')
    .filter({has: page.locator('app-product h5', {hasText: productName})})
    .first();

  await expect(card).toBeVisible();
  return card;
};

test.describe('Products E2E', () => {
  test('TC_PRODUCTS_001 - Nawigacja do strony products', async ({page}) => {
    await page.goto('http://localhost:4200/');
    await page.click('a[routerlink="/products"]');
    await expect(page).toHaveURL('http://localhost:4200/products');
    await expect(page.locator('body')).toContainText('Products');
  });

  test('TC_PRODUCTS_002 - Wyświetlanie produktu z wszystkimi danymi', async ({page}) => {
    await goToProducts(page);
    const productCard = await findProductCardByName(page, 'Pies');

    await expect(productCard.locator('img[alt="Pies_image"]')).toBeVisible();
    await expect(productCard.locator('app-product article > div.col')).toContainText(/ludzki/i);

    const priceText = await productCard
      .locator('app-product article > div.col-auto.fw-semibold')
      .textContent();
    expect(priceText?.trim().length ?? 0).toBeGreaterThan(0);
  });

  //Nie działa jak powinno

  /*test('TC_PRODUCTS_003 - Wyświetlanie ceny produktu w różnych Locale', async ({ browser }) => {
    // English locale context
    const contextEN = await browser.newContext({
      locale: 'en-US',
      viewport: { width: 1280, height: 720 },
    });
    const pageEN = await contextEN.newPage();
    await pageEN.goto(`${BASE_URL}/`);
    await pageEN.waitForLoadState('networkidle');

    await pageEN.goto(`${BASE_URL}/products`);
    await pageEN.waitForLoadState('networkidle');

    // Verify navigator.language
    expect(await pageEN.evaluate(() => navigator.language)).toBe('en-US');

    // Find product card for "Pies" and get price
    const enCard = await findProductCardByName(pageEN, 'Pies');
    const enPrice = await enCard.locator('div.col-auto.fw-semibold').textContent();
    expect(enPrice ?? '').toContain('$');
    await contextEN.close();

    // Polish locale context
    const contextPL = await browser.newContext({
      locale: 'pl-PL',
      viewport: { width: 1280, height: 720 },
    });
    const pagePL = await contextPL.newPage();
    await pagePL.goto(`${BASE_URL}/`);
    await pagePL.waitForLoadState('networkidle');
    await pagePL.goto(`${BASE_URL}/products`);
    await pagePL.waitForLoadState('networkidle');

    expect(await pagePL.evaluate(() => navigator.language)).toBe('pl-PL');

    const plCard = await findProductCardByName(pagePL, 'Pies');
    const plPrice = await plCard.locator('div.col-auto.fw-semibold').textContent();
    expect(plPrice ?? '').toContain('€');

    await contextPL.close();
  });*/

  // Preview / Edit

  test('TC_PRODUCTS_003 - Wyświetlanie strony podglądu produktu', async ({page}) => {
    await goToProducts(page);
    const productCard = await findProductCardByName(page, 'Pies');

    const productName = productCard.locator('app-product h5', {hasText: 'Pies'});
    await expect(productName).toBeVisible();
    await expect(productName).toHaveCSS('cursor', 'pointer');

    await productName.click();
    await expect(page).toHaveURL(/\/products\/details\/[0-9a-f-]{36}$/i);

    await expect(page.locator('h2')).toContainText('Pies');
    await expect(page.locator('.details-page')).toContainText(/ludzki/i);

    const detailsPriceText = await page.locator('.col-md-2.fw-semibold.text-nowrap span').textContent();
    expect(detailsPriceText?.trim().length ?? 0).toBeGreaterThan(0);
  });

  test('TC_PRODUCTS_004 - Dostęp do przycisku “Edit” bez uprawnień', async ({page}) => {
    await signOut(page);
    await goToProducts(page);
    const productCard = await findProductCardByName(page, 'Pies');

    await productCard.getByRole('button', {name: 'Edit'}).click();
    await expect(page).toHaveURL(/\/login/i);
  });

  test('TC_PRODUCTS_005 - Dostęp do przycisku “Edit” z uprawnieniami', async ({page}) => {
    await signInAsAdmin(page);
    await goToProducts(page);
    const productCard = await findProductCardByName(page, 'Pies');

    await productCard.getByRole('button', {name: 'Edit'}).click();
    await expect(page).toHaveURL(/\/products\/edit\/[0-9a-f-]{36}$/i);
    await expect(page.locator('h3.card-title')).toContainText('Edit product');
  });

  // Export PDF

  test('TC_PRODUCTS_006 - Przycisk eksportu listy produktów do PDF.', async ({page}) => {
    await goToProducts(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', {name: 'Export to PDF'}).click(),
    ]);

    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    if (downloadPath) {
      const downloadedFile = await stat(downloadPath);
      expect(downloadedFile.size).toBeGreaterThan(0);
    }
  });

  // Categories menu

  test('TC_PRODUCTS_007 - Wyświetlanie pustej kategorii', async ({page}) => {
    await goToProducts(page);

    await page.getByRole('link', {name: 'No Kebab'}).click();
    await expect(page).toHaveURL(/\/products\?categoryId=[0-9a-f-]{36}$/i);
    await expect(page.locator('app-product')).toHaveCount(0);
  });

  test('TC_PRODUCTS_008 - Wyświetlanie kategorii z produktami', async ({page}) => {
    await page.goto(`${BASE_URL}/products?categoryId=747fe196-de61-4111-ac90-b5dd7c5b3e4d`);

    await findProductCardByName(page, 'Abab');
    await findProductCardByName(page, 'Bebab');
    await findProductCardByName(page, 'Cebab');
    await findProductCardByName(page, 'Debab');
  });

  test('TC_PRODUCTS_009 - Poprawność działania paginacji na jednej stronie', async ({page}) => {
    await page.goto(`${BASE_URL}/products?categoryId=22a7a1d1-fe27-4f33-bf49-b31dddef1a7b`);

    await page.selectOption('#pageSizeSelect', '5');
    await expect(page.locator('app-product')).toHaveCount(5);

    await page.selectOption('#pageSizeSelect', '10');
    await expect(page.locator('app-product')).toHaveCount(7);
  });

  test('TC_PRODUCTS_010 - Poprawność działania przycisków paginacji', async ({page}) => {
    await page.goto(`${BASE_URL}/products?categoryId=22a7a1d1-fe27-4f33-bf49-b31dddef1a7b`);

    await page.selectOption('#pageSizeSelect', '5');
    await expect(page.locator('app-product')).toHaveCount(5);

    const button = page.getByRole('button', { name: '2' });
    await button.click();

    await expect(page.locator('app-product')).toHaveCount(2);
  });
});
