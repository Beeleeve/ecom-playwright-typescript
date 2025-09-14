import { Page, Locator, expect, Response } from '@playwright/test';

export class ProductResultsPage {
  private readonly page: Page;
  private readonly productNames: Locator;
  private readonly cartQuantity: Locator;
  private readonly productCards: Locator;
  private readonly allCheckboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productNames = page.getByTestId('product-name'); // all products on page
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.productCards = page.locator('a[data-test^="product-"]');
    this.allCheckboxes = page.getByRole("checkbox");
  }

    // 
    async waitForProducts(): Promise<void> {
    // Wait until at least one card is visible
    await expect(this.productCards.first()).toBeVisible({ timeout: 25_000 });

    // Wait until the count stops changing (optional, but helps with animations)
    let previousCount = 0;
    await expect(async () => {
      const currentCount = await this.productCards.count();
      expect(currentCount).toBeGreaterThan(0);
      expect(currentCount).toBe(previousCount || currentCount);
      previousCount = currentCount;
    }).toPass({ timeout: 5_000 });

    // Now scroll
    await this.productCards.first().scrollIntoViewIfNeeded();
    await this.productCards.last().scrollIntoViewIfNeeded();
  }

  /**
   * Get the price of a product by name
   * @param productName - The name of the product
   * @returns The product price as a string
   */
  async getProductPrice(productName: string): Promise<number> {
    await this.waitForProducts();
    const foundCard = this.productCards.filter({ hasText: productName }); 
    await foundCard.scrollIntoViewIfNeeded();
    await foundCard.evaluate(e => e.scrollIntoView());
    await expect(foundCard).toBeVisible({ timeout: 30000 });

    const price = await foundCard
      .getByTestId("product-price")
      .textContent().then((text) => (text ? parseFloat(text.replace(/[^0-9.]/g, '')) : 0));

    if (!price) {
      throw new Error(`Price not found for product: ${productName}`);
    }

    return price;
  }

  async getProductNameAndPrice(): Promise<{ name: string; price: number }[]> {
    const products = [];
    await this.waitForProducts();
    const count = await this.productCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = ((await card.getByTestId("product-name").textContent()) || '').trim();
      const priceText = ((await card.getByTestId("product-price").textContent()) || '').trim();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '') || '0') || 0;
      products.push({ name, price });
    }
    return products;
  }


  async openFirstProduct(): Promise<void> {
    await this.waitForProducts();
    await this.productCards.first().isVisible({ timeout: 15000 });
    await this.productCards.first().click();
  }

  /**
  * Find the first product whose name contains the given text (case-insensitive)
  */
  async findProductWithDetails(productName: string): Promise<{ card: Locator; name: string; price: number }> {
    await this.waitForProducts();
    const trimmedName = productName.trim();

    const productCard = this.productCards.filter({
      has: this.page.locator('[data-test="product-name"]', {
        hasText: new RegExp(`^\\s*${trimmedName}\\s*$`, 'i'),
      }),
    });

    // Wait for at least one matching product
    await expect(productCard, `Product "${productName.trim()}" not found`).toHaveCount(1, { timeout: 5000 });

    const card = productCard.first();

    // Extract name
    const name =
      (await card.locator('[data-test="product-name"]').textContent())?.trim() || 'Unknown Product';

    // Extract price
    const priceText =
      (await card.locator('[data-test="product-price"]').textContent())?.trim() || '0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      return { card, name, price };
    }

  async getProductNames(): Promise<string[]> {
      await this.waitForProducts();
      await expect(this.productNames).toBeVisible({ timeout: 20000 });
      return this.productNames.allTextContents();
    }
  
    
    async beforeFilterCount(): Promise<number> {
      await this.waitForProducts(); 
      return await this.productCards.count();
    }
  
    // Apply one or more categories
  async applyFilters(categories: string | string[]):Promise<Response|null>{
    await this.waitForProducts();
    const categoryList = Array.isArray(categories) ? categories : [categories];

    let lastResponse: Response | null = null;

    for (const category of categoryList) {
      const checkbox = this.categoryCheckbox(category);
      await expect(checkbox).toBeVisible({ timeout: 10000 });

      const resPromise = this.page.waitForResponse(res =>
        res.url().includes('/products?') && res.status() === 200
      );
      await checkbox.click({ force: true });
      const response = await resPromise;
      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
      // Parse and overwrite with the latest payload
      lastResponse = response;
      await this.waitForProducts();
    }

    return lastResponse;
  }
  
  async clearFilters(): Promise<void> {
      
      const checked = this.allCheckboxes.filter({ has: this.page.locator(':checked') });
      const count = await checked.count();
  
      for (let i = 0; i < count; i++) {
        await checked.nth(i).uncheck();
      }
  
      // Wait until products actually appear
      await expect(async () => {
      const count = await this.productCards.count();
      expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 5000 });
  
  }
  
  async selectProduct(name: string): Promise<Locator> {
    // const regexName = new RegExp(`^\\s*${name}\\s*$`);

    // const matchingCard = this.productCards.filter({
    //   has: this.page.locator('h5', { hasText: regexName })
    // });

    const matchingCard = this.page.locator("div.container[data-test='filter_completed']")
      .getByRole("link").getByRole("heading", { level: 5 }).filter({hasText:name})
    await expect(matchingCard).toBeVisible({ timeout: 15000 });
    await matchingCard.click();
    return matchingCard;
  }

  async getNameFromCard(card: Locator): Promise<string> {
    await this.waitForProducts();
    return (await card.getByRole("heading", {level:5}).textContent())?.trim() || '';
  }

      
  private categoryCheckbox(categoryName: string): Locator {
      return this.page.getByLabel(categoryName, { exact: true });
  }

  
}
// export async function clickProductByName(page: Page, name: string) {
//   const nameLocator = page.locator('[data-test="product-name"]', { hasText: name });
//   const cardAnchor = nameLocator.locator('xpath=ancestor::a');
//   await cardAnchor.scrollIntoViewIfNeeded();
//   await page.waitForFunction((el) => {
//     const img = el.querySelector('img');
//     return img && img.complete && img.naturalHeight > 0;
//   }, cardAnchor);
//   await cardAnchor.click();
//   }

export default ProductResultsPage;