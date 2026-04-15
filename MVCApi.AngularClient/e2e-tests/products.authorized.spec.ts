import { test, expect } from '@playwright/test'
import { authStatePath } from './auth.setup'

const BASE_URL = 'http://localhost:4200'
const PRODUCT_PAGE = 'products'
const PRODUCT_ADD_PAGE = 'products/add'

test.use({ storageState: authStatePath })

test.describe("Authorized products tests", () => {
    test.beforeAll(async ({ page }) => {
        page.on('dialog', async d => {
            await d.accept()
        })
    })

    test("Valid product is created", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_ADD_PAGE}`)
        
        await page.locator('#productName').fill("Valid product name")
        await page.locator('#productDescription').fill("Valid and long product description")
        await page.locator('#productImage').fill('https://somehost.com/image.png')
        await page.locator('#productPrice').fill('20.00')
        await page.locator('#productCategory').selectOption('1')

        const submit = page.getByRole('button', { name: 'Submit'}).first()
        await submit.click()
    })

    test("Invalid product shows dialog", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_ADD_PAGE}`)
        
        await page.locator('#productName').fill("1")
        await page.locator('#productDescription').fill("Vn")
        await page.locator('#productImage').fill('https://somehost')
        await page.locator('#productPrice').fill('2dddd')
        await page.locator('#productCategory').selectOption('1')

        const submit = page.getByRole('button', { name: 'Submit'}).first()
        await submit.click()

        await expect(page.getByRole('dialog')).toBeVisible()
    })

    test("Product is updated with valid data", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        const product = page.locator('app-product').first()
        const edit = product.getByRole('button', { name: 'Edit' }).first()
        await edit.click()
        
        await page.locator('#editProductName').fill("Valid product name")
        await page.locator('#editProductDescription').fill("Valid and long product description")

        const submit = page.getByRole('button', { name: 'Save changes'}).first()
        await submit.click()
    })
})