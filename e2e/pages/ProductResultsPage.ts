import { Page, Locator, expect } from '@playwright/test';

interface ProductCard {
  name: string;
  price: number;
}

export class ProductResultsPage {
  private page: Page;
  private cards: Locator;
  private cartQuantity: Locator;
  private productCards: Locator;
  productTitles: Locator;
  allCheckboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cards = page.getByTestId('product-card'); // all products on page
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.productCards = page.locator('a[data-test^="product-"]');
    this.productTitles = page.getByTestId('product-name');
    this.allCheckboxes = page.locator('input[type="checkbox"]');

  }

  async waitForProducts(): Promise<void> {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Get the price of a product by name
   * @param productName - The name of the product
   * @returns The product price as a string
   */
  async getProductPrice(productName: string): Promise<number> {
    await this.waitForProducts();
    const productCard = this.cards.filter({ hasText: productName });
    await expect(productCard).toBeVisible({ timeout: 10000 });

    const price = await productCard
      .locator('[data-test="product-price"]')
      .textContent().then((text) => (text ? parseFloat(text.replace(/[^0-9.]/g, '')) : 0));

    if (!price) {
      throw new Error(`Price not found for product: ${productName}`);
    }

    return price;
  }

  async getProductCards(): Promise<ProductCard[]> {
    await this.waitForProducts();
    const count = await this.productCards.count();    
    if(count === 0) {
      throw new Error('No products found on the Product Results Page');
    }
    const products: ProductCard[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = (await card.locator('[data-test="product-name"]').textContent()) || '';      
      const priceText = (await card.locator('[data-test="product-price"]').textContent()) || '';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '') || '0');
      products.push({ name, price });
    }
    return products;
  }  

  async openFirstProduct(): Promise<void> {
    await this.waitForProducts();
    if (await this.getProductCardsCount() > 0) {
      await this.productCards.first().click();
      await this.page.waitForLoadState('domcontentloaded');
    }
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

  async getProductTitles(): Promise<string[]> {
      await this.waitForProducts();
      await expect(this.productTitles).toBeVisible({ timeout: 20000 });
      return this.productTitles.allTextContents();
    }
  
    async productCardsCount(): Promise<number> {
      await this.waitForProducts();
      return this.productCards.filter({ has: this.page.locator('h5[data-test="product-name"]') }).count();
    }
  
    async beforeFilterCount(): Promise<number> {
      await this.waitForProducts();
      return this.productCardsCount();
    }
  
    // Apply one or more categories
    async applyFilters(categories: string | string[]): Promise<number> {
      await this.waitForProducts();
      const categoryList = Array.isArray(categories) ? categories : [categories];
  
      await Promise.all(
        categoryList.map(async (category) => {
          const checkbox = this.categoryCheckbox(category);
          expect(checkbox).toBeVisible({ timeout: 10000 });
          await checkbox.click(); // safer than click() for checkboxes
        })
      );
      // Wait for network idle after clicking
      await this.page.waitForLoadState('domcontentloaded');
      await this.waitForProducts();
      // await this.page.waitForTimeout(3000); // wait for filtering to take effect
      return await this.productCards.filter({ has: this.page.locator('h5[data-test="product-name"]') }).count();
  
    }
  
  async clearFilters(): Promise<void> {
      
      const checked = this.allCheckboxes.filter({ has: this.page.locator(':checked') });
      const count = await checked.count();
  
      for (let i = 0; i < count; i++) {
        await checked.nth(i).uncheck();
      }
  
      // Wait until products actually appear
      expect(async () => {
      const count = await this.productTitles.count();
      expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 5000 });
  
      }
      
  private categoryCheckbox(categoryName: string): Locator {
      return this.page.getByLabel(categoryName, { exact: true });
  }

  private async getProductCardsCount() {
    await this.waitForProducts();
    return await this.productCards.count();
  }
}

export default ProductResultsPage;