import { Page, Locator, Response } from '@playwright/test';
import { Product } from 'e2e/model/models';
import { ProductsApiResponse } from 'e2e/model/productsAPI';


export class SearchPage {
  private readonly page: Page;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly resultsHeading: Locator;
  private readonly cardTitles: Locator;
  private readonly productPrices: Locator;
  private readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder("Search");
    this.searchButton = page.getByRole("button", {name:"Search"});
    this.resultsHeading = page.getByTestId("search-caption");
    this.cardTitles = page.getByTestId('product-name');
    this.productPrices = page.getByTestId("product-price");
    this.noResultsMessage = page.getByTestId("no-results");
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
    return this.cardTitles.allInnerTexts();
  }

  async getProductPrices(): Promise<string[]> {
    await this.waitForSearchResults();
    return this.productPrices.allInnerTexts();
  }

  async getSearchResultCount(partialText:string): Promise<number> {
    await this.waitForSearchResults();
    return this.cardTitles.filter({ hasText: partialText }).count();
  }

  async hasProducts(): Promise<boolean> {
    await this.waitForSearchResults();
    return this.cardTitles.first().isVisible().catch(() => false);
  }

  async getResults(): Promise<string[]> {
    await this.waitForSearchResults();
    const visibleTitles = this.cardTitles.filter({ hasText: /.*/ });
    return visibleTitles.allTextContents();
  }

  async getNoResultsMessage(): Promise<string> {
    const text = await this.page.getByTestId('no-results').textContent();
    return text?.trim() || '';
  }

  extractProductDataFromApi(data: ProductsApiResponse): Product[] {
    return data.data.map((p) => ({
      name: p.name,
      price: p.price,
    }));
  }

  async getUiProductDetails(): Promise<Product[]> {
    const names = await this.getProductNames();
    const prices = await this.getProductPrices();

    return names.map((name, i) => ({
      name,
      price: parseFloat(prices[i].replace(/[^0-9.]/g, '')),
    }));
  }
}

export default SearchPage;