import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4200'

const extractPrice = (priceString: string | null): number => {
    if (priceString === null) return 0

    const clean = priceString.replace(/[^0-9.]/g, "")

    return parseFloat(clean)
}

test.describe("Products E2E", () => {
    const PRODUCT_PAGE = 'products'
    const CART_PAGE = 'cart'

    test("Product should be added to cart.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const product = page.locator('app-product').first()

        const expectedPrice = await product.locator('article > div:nth-child(3)').textContent()
        
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(actual).toBe(expectedPrice?.trim())
    })

    test("Product count should be changed in cart.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const product = page.locator('app-product').first()

        const expectedPrice = await product.locator('article > div:nth-child(3)').textContent()
        
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)
        const countInput = page.locator('.card-footer > input')
        await countInput.fill('2')
        await countInput.blur()
        await page.waitForEvent('dialog')

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(extractPrice(actual)).toBe(extractPrice(expectedPrice) * 2)
    })

    test("Product should be removed form cart.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)
        await page.locator('.card-footer > button').click()
        await page.waitForEvent('dialog')

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(extractPrice(actual)).toBe(0.0)
    })


    test("Multiple products should be added to cart.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const product = page.locator('app-product').nth(1)
        const product2 = page.locator('app-product').nth(2)

        const expectedPrice = await product.locator('article > div:nth-child(3)').textContent()
        const expectedPrice2 = await product2.locator('article > div:nth-child(3)').textContent()
        
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).nth(1)
        const addToCart2 = page.getByRole('button', { name: 'Add to cart'}).nth(2)
        await addToCart.click()
        await page.waitForEvent('dialog')
        await addToCart2.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(extractPrice(actual)).toBeCloseTo(extractPrice(expectedPrice) + extractPrice(expectedPrice2), 2)
    })

    test("Duplicate product shouldn't be added.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const product = page.locator('app-product').first()

        const expectedPrice = await product.locator('article > div:nth-child(3)').textContent()
        
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        await addToCart.click()
        await page.waitForEvent('dialog')
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(actual).toBe(expectedPrice?.trim())
    })

    test("Cart without added products should be empty.", async ({ page }) => {
        page.on('dialog', async d => {
            await d.accept()
        })
     
        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        var msg = await page.locator('#cart-empty-msg').textContent()
        expect(extractPrice(actual)).toBe(0.0)
        expect(msg).toBe("Your cart is empty")
    })


    test("Product should be added with count.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const product = page.locator('app-product').first()

        const expectedPrice = await product.locator('article > div:nth-child(3)').textContent()
        
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        const countInput = page.locator('input[type=number]').first()
        await countInput.fill('3')
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(extractPrice(actual)).toBeCloseTo(extractPrice(expectedPrice) * 3, 1)
    })


    test("Product with invalid count shouldn't be added.", async ({ page }) => {
        await page.goto(`${BASE_URL}/${PRODUCT_PAGE}`)

        page.on('dialog', async d => {
            await d.accept()
        })
     
        const addToCart = page.getByRole('button', { name: 'Add to cart'}).first()
        const countInput = page.locator('input[type=number]').first()
        await countInput.fill('-1')
        await addToCart.click()
        await page.waitForEvent('dialog')

        await page.goto(`${BASE_URL}/${CART_PAGE}`)

        var actual = await page.locator('p.fw-semibold').textContent()
        expect(extractPrice(actual)).toBeCloseTo(0.0, 1)
    })
})