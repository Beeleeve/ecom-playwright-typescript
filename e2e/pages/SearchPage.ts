import { Page, Locator, Response } from '@playwright/test';

export interface ProductData {
  name: string;
  price: number;
}

export interface ApiResponseData {
  data: { name: string; price: number }[];
  total: number;
}

export class SearchPage {
  private page: Page;
  searchInput: Locator;
  private searchButton: Locator;
  private resultsHeading: Locator;
  private productTitles: Locator;
  private searchedProductNames: Locator;
  private searchedProductPrices: Locator;
  private noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.resultsHeading = page.locator('h3 span[data-test="search-term"]');
    this.productTitles = page.getByTestId('product-name');
    this.searchedProductNames = page.locator('a h5[data-test="product-name"]');
    this.searchedProductPrices = page.locator('a span[data-test="product-price"]');
    this.noResultsMessage = page.locator('div[data-test="no-results"]');
  }

  async searchProduct(query: string): Promise<Response> {
    await this.searchInput.evaluate((el) =>
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );
    await this.searchInput.fill(query);

    const responsePromise = this.page.waitForResponse('**/products/search?**');
    await this.searchButton.click();
    await this.waitForSearchResults();

    const response = await responsePromise;
    return response;
  }

  async waitForSearchResults(): Promise<void> {
    await this.resultsHeading.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
  }

  async getProductNames(): Promise<string[]> {
    await this.waitForSearchResults();
    return this.searchedProductNames.allInnerTexts();
  }

  async getProductPrices(): Promise<string[]> {
    await this.waitForSearchResults();
    return this.searchedProductPrices.allInnerTexts();
  }

  async getSearchResultCount(): Promise<number> {
    await this.waitForSearchResults();
    return this.productTitles.filter({ hasText: /.*/ }).count();
  }

  async hasProducts(): Promise<boolean> {
    await this.waitForSearchResults();
    return this.productTitles.first().isVisible().catch(() => false);
  }

  async getResults(): Promise<string[]> {
    await this.waitForSearchResults();
    const visibleTitles = this.productTitles.filter({ hasText: /.*/ });
    return visibleTitles.allTextContents();
  }

  async getNoResultsMessage(): Promise<string> {
    return this.noResultsMessage.innerText();
  }

  /**
   * Extract product data from API JSON
   */
  extractProductDataFromApi(data: ApiResponseData): ProductData[] {
    return data.data.map((p) => ({
      name: p.name,
      price: p.price,
    }));
  }

  /**
   * Get product details (name + numeric price) from the UI
   */
  async getUiProductDetails(): Promise<ProductData[]> {
    const names = await this.getProductNames();
    const prices = await this.getProductPrices();

    return names.map((name, i) => ({
      name,
      price: parseFloat(prices[i].replace(/[^0-9.]/g, '')),
    }));
  }
}

export default SearchPage;