import {expect, Page, test} from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('Products/Pagination - Testy Sesji', () => {
  //
  const waitForPaginatedRequest = async (
    page: Page,
    endpointPattern: string = 'GetPaginatedProducts',
  ): Promise<string> => {
    const requestPromise = page.waitForRequest(
      (req) =>
        req.url().includes(`/api/Product/${endpointPattern}`) &&
        req.method() === 'GET',
    );
    return (await requestPromise).url();
  };

  //Helper to get current session storage pagination settings
  const getSessionPagination = async (page: Page) => {
    return page.evaluate(() => {
      const stored = sessionStorage.getItem('productsPaginationSettings');
      return stored ? JSON.parse(stored) : null;
    });
  };

  test.beforeEach(async ({page}) => {
    //Clear session storage once per test on app origin.
    //Using addInitScript here clears storage on every reload/navigation,
    //which breaks persistence assertions in TC 003.
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      sessionStorage.clear();
    });
  });

  test('TC_AUTH_PRODUCTS_PAGINATION_001 - Domyślne parametry paginacji przy pierwszym wejściu', async ({page,}) => {
    const requestPromise = waitForPaginatedRequest(page);
    await page.goto(`${BASE_URL}/products`);

    const url = await requestPromise;
    expect(url).toContain('pageNumber=1');
    expect(url).toContain('pageSize=5');

    await expect(page.getByRole('heading', {name: 'Products'})).toBeVisible();
    await expect(page.locator('#pageSizeSelect')).toBeVisible();

    //Session storage should be empty or have defaults
    const session = await getSessionPagination(page);
    //Parameters match
    expect(session === null || session.pageSize === 5).toBeTruthy();
  });

  test('TC_AUTH_PRODUCTS_PAGINATION_002 - Zmiana rozmiaru strony jest zachowywana po nawigacji', async ({page,}) => {
    //Go to products
    await page.goto(`${BASE_URL}/products`);
    await expect(page.locator('#pageSizeSelect')).toBeVisible();

    //Set pagination to 10
    const requestPromise10 = waitForPaginatedRequest(page);
    await page.selectOption('#pageSizeSelect', '10');
    const url10 = await requestPromise10;
    expect(url10).toContain('pageSize=10');
    expect(url10).toContain('pageNumber=1');

    //Check if pagination is set in session storage
    let session = await getSessionPagination(page);
    expect(session).not.toBeNull();
    expect(session.pageSize).toBe(10);

    //Go to home page
    await page.click('a[href="/"]');
    await expect(page).toHaveURL(`${BASE_URL}/`);

    //Go back to products
    const requestPromiseAfterReturn = waitForPaginatedRequest(page);
    await page.click('a[href="/products"]');
    await expect(page).toHaveURL(`${BASE_URL}/products`);

    const urlAfterReturn = await requestPromiseAfterReturn;
    expect(urlAfterReturn).toContain('pageSize=10');
    expect(urlAfterReturn).toContain('pageNumber=1');

    //Check session storage value
    session = await getSessionPagination(page);
    expect(session?.pageSize).toBe(10);
  });


  test('TC_AUTH_PRODUCTS_PAGINATION_003 - Numer strony jest zachowywany po odświeżeniu', async ({page,}) => {
    await page.goto(`${BASE_URL}/products`);

    //Go to page 2
    const page2Button = page.getByRole('button', {name: '2'});
    await expect(page2Button).toBeVisible();
    const requestPromise2 = waitForPaginatedRequest(page);
    await page2Button.click();
    const urlPage2 = await requestPromise2;
    expect(urlPage2).toContain('pageNumber=2');
    expect(urlPage2).toContain('pageSize=5');

    //Verify session storage has pageNumber=2
    let session = await getSessionPagination(page);
    expect(session?.pageNumber).toBe(2);

    //Reload the page and intercept the request
    const requestAfterReload = waitForPaginatedRequest(page);
    await page.reload();
    const reloadUrl = await requestAfterReload;
    expect(reloadUrl).toContain('pageNumber=2');

    session = await getSessionPagination(page);
    expect(session?.pageNumber).toBe(2);
  });
});
