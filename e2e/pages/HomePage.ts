import { Page, Locator } from '@playwright/test';
import config from '@config/environment';

export class HomePage {
  private readonly page: Page;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly searchResultsHeading: Locator;
  private readonly productTitles: Locator;
  private readonly homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchResultsHeading = page.locator('h3:has-text("Searched for:")');
    this.productTitles = page.getByTestId('product-name');
    this.homeLink = page.getByTestId('nav-home');
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    if (!config.baseUrl) {
      throw new Error('BASE_URL is not configured in environment variables');
    }
    await this.page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
   }
    
    async gotoHome() {
        await this.homeLink.click();
    }

  /**
   * Search for products
   * @param query - The search query
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();

    // Wait for search results or product grid to update
    if (query.trim()) {
      await this.searchResultsHeading.waitFor({
        state: 'visible',
        timeout: 5000,
      });
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get all product titles
   */
  async getProductTitles(): Promise<string[]> {
    try {
      await this.productTitles
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });
      return await this.productTitles.allTextContents();
    } catch {
      return []; // Return empty array if no products found
    }
  }

  /**
   * Get products filtered by name
   * @param name - The product name to filter by
   */
  async getProductsByName(name: string): Promise<string[]> {
    const titles = await this.getProductTitles();
    const searchTerm = name.toLowerCase();
    return titles.filter((title) => title.toLowerCase().includes(searchTerm));
  }
}

export default HomePage;