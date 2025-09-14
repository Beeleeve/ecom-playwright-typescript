import { Locator, Page, expect } from '@playwright/test';


export class ProductPage {
    
  private readonly page: Page;
  private readonly quantityInput: Locator;
  private readonly unitPrice: Locator;
  private readonly productName: Locator;
  private readonly cartLink: Locator;
  private readonly increaseButton: Locator;
  private readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quantityInput = page.getByTestId("quantity");
    this.unitPrice = page.getByTestId("unit-price");
    this.productName = page.getByTestId("product-name");
    this.cartLink = page.getByTestId("nav-cart");
    this.increaseButton = page.getByTestId("increase-quantity");
    this.cartQuantity = page.getByTestId("cart-quantity");
  }


    async enterQuantity(quantity: number) {
        const input = this.quantityInput;
        const increaseBtn = this.increaseButton;
        await expect(increaseBtn).toBeVisible({ timeout: 15000 });
        await expect(input).toBeVisible({ timeout: 15000 });
        await expect(input).toBeEnabled();
        await input.clear();
        await input.fill(String(quantity));
        await expect(input).toHaveValue(String(quantity));
        // const currentValue = parseInt(await input.inputValue(), 10) || 0;
        // if (quantity > currentValue) {
        //     const clicksNeeded = quantity - currentValue;
        //     for (let i = 0; i < clicksNeeded; i++) {
        //     await increaseBtn.click();
        //     // Optional: wait for the input to update after each click
        //     await expect(input).toHaveValue(String(currentValue + i + 1), { timeout: 3000 });
        //     }
        // }            
    }

    async addToCartAndWaitForQuantity(expectedQuantity: number) {

        // await expect(async () => {
        //     const addToCartButton = this.page.getByRole('button', { name: /add to cart/i });
        //     const cartIcon = this.page.getByTestId(this.cartLink);
        //     if (!(await cartIcon.isVisible())) {
        //         console.log('Cart icon not visible');
        //     }
        //     await addToCartButton.click();
        //     await expect(cartIcon).toBeVisible({ timeout: 5000 });
        //     await expect(this.page.getByTestId('cart-quantity'))
        //     .toHaveText(String(expectedQuantity), { timeout: 15000 });

        // }).toPass()
        await Promise.all([
            this.page.waitForResponse(r =>
            r.url().includes('/carts') && r.status() === 200
            ),
            this.page.getByRole('button', { name: "Add to cart" }).click()
        ]);    
        await expect(this.cartQuantity)
            .toHaveText(String(expectedQuantity), { timeout: 35000 });
    }

    
    async getProductPrice(): Promise<string> {
        return await this.unitPrice.textContent().then((text) => text?.replace(/[^0-9.]/g, '') || '0');
    }

    async getProductName(): Promise<string> {
        const nameLocator = this.productName;
        await expect(nameLocator).toBeVisible({ timeout: 15000 });
        await expect(this.page).toHaveURL(/\/product\//);
        return (await nameLocator.textContent())?.trim() || '';
    }

}