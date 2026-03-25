import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

async function goToAddCategory(page) {
  await page.goto(`${BASE_URL}/categories`);
  await page.click('text=Add new category');
}

test.describe('CATEGORIES', () => {

  // TC_001
  test('TC_CATEGORIES_001 - jedno słowo', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', 'picie');
    await page.click('text=Submit');

    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('body')).toContainText('picie');
  });

  // TC_002
  test('TC_CATEGORIES_002 - trzy słowa', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', 'instrumenty dęte blaszane');
    await page.click('text=Submit');

    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('body')).toContainText('instrumenty dęte blaszane');
  });

  // TC_004 (BUG - ale test piszemy wg expected)
  test('TC_CATEGORIES_004 - znaki specjalne', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', '!@#$%^&*()');
    await page.click('text=Submit');

    await expect(page.locator('body')).toContainText('Nazwa nie powinna zawierać znaków specjalnych');
  });

  // TC_005
  test('TC_CATEGORIES_005 - subcategory', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', 'sok');

    await page.check('input[type="checkbox"]'); // Is subcategory
    await page.selectOption('select', { label: 'picie' });

    await page.click('text=Submit');

    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('body')).toContainText('sok');
  });

  // TC_006
  test('TC_CATEGORIES_006 - pusta nazwa', async ({ page }) => {
    await goToAddCategory(page);

    await page.click('text=Submit');

    await expect(page.locator('body')).toContainText('Nazwa jest pusta');
  });

  // TC_007 (BUG)
  test('TC_CATEGORIES_007 - jeden znak', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', 'a');
    await page.click('text=Submit');

    await expect(page.locator('body')).toContainText('Wpisz przynajmniej 2 znaki');
  });

  // TC_008 (BUG)
  test('TC_CATEGORIES_008 - cyfry', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', '12');
    await page.click('text=Submit');

    await expect(page.locator('body')).toContainText('Cyfry nie powinny');
  });

  // TC_009
  test('TC_CATEGORIES_009 - dwa znaki', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', 'ul');
    await page.click('text=Submit');

    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('body')).toContainText('ul');
  });

  // TC_010
  test('TC_CATEGORIES_010 - trim', async ({ page }) => {
    await goToAddCategory(page);

    await page.fill('input[name="name"]', ' test ');
    await page.click('text=Submit');

    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('body')).toContainText('test');
  });

});