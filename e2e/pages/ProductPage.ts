import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
    
    private addToCartButton: Locator;
    cartTotal: Locator;
    totalCartItems: Locator;
    productPrice: Locator;
    productName: Locator;
    
    private readonly quantity: Locator;
    private readonly page: Page;

    constructor(page: Page) {   
        this.page = page;
        this.addToCartButton = page.getByTestId('add-to-cart');
        this.totalCartItems = page.locator('table tbody tr');
        this.cartTotal = page.getByTestId('cart-total');
        this.productPrice = page.getByTestId('product-price');
        this.productName = page.getByTestId('product-name');
        this.quantity = page.getByTestId('quantity');
    }

    async enterQuantity(quantity: number) {
        await this.quantity.fill(''); // Clear existing value
        await this.quantity.fill(String(quantity));
    }

    async addToCart(): Promise<void> {
        // Click the Add to Cart button
        await this.addToCartButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000); // wait for any animations to complete
    }
    
    async getProductPrice(): Promise<string | null> {
        return await this.productPrice.textContent().then((text) => text?.replace(/[^0-9.]/g, '') || '0');
    }
    async getProductName(): Promise<string | null> {
        return await this.productName.textContent();
    }

}