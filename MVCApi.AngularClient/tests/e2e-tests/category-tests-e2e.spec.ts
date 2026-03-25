import { test, expect } from '@playwright/test';

test('TC_CATEGORIES_001 - tworzenie kategorii z nazwą złożoną z jednego słowa', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'misiaczek');

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('misiaczek');
  });

test.describe('Categories E2E', () => {
  
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_002 - tworzenie kategorii z nazwą złożoną z trzech słów', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'misiaczek i kociaczek');

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('misiaczek i kociaczek');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_003 - tworzenie kategorii z nazwą złożoną z dwóch liter', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'ul');

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('ul');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_004 - tworzenie kategorii z nazwą złożoną ze spacji, jednego słowa i spacji', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', ' spacja ');

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('spacja');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_005 - tworzenie kategorii potomnej z nazwą złożoną z dwóch słów', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'kategoria potomna');
	await page.check('#categoryIsChild');

    await page.selectOption('#categoryParent', { label: 'Psy' });

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('kategoria potomna');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_006 - tworzenie kategorii potomnej z nazwą złożoną z jednego słowa', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'jamnik');
	await page.check('#categoryIsChild');

    await page.selectOption('#categoryParent', { label: 'Psy' });

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('jamnik');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_007 - tworzenie kategorii potomnej z nazwą złożoną z jednego słowa i z dwóch liter', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', 'ul');
	await page.check('#categoryIsChild');

    await page.selectOption('#categoryParent', { label: 'ul' });

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('ul');
  });
});
test.describe('Categories E2E', () => {
  test('TC_CATEGORIES_008 - tworzenie kategorii potomnej z nazwą złożoną ze spacji, jednego słowa i spacji', async ({ page }) => {

    await page.goto('http://localhost:4200/login');
    await page.fill('#loginEmail', 'admin@gmail.com');   
    await page.fill('#loginPassword', 'Admin2137@');         
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/');

    await page.click('text=Categories'); 

    await page.click('text=Add new category');  

    await page.fill('input[formControlName="name"]', ' ul ');
	await page.check('#categoryIsChild');

    await page.selectOption('#categoryParent', { label: 'ul' });

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText('ul');
  });
});