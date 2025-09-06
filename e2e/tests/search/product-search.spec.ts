import { test, expect, Response } from '@playwright/test';
import { SearchPage, ProductData, ApiResponseData } from '@pages/SearchPage';

interface ProductsData {
  name: string;
  expectResults: boolean;
}

test.describe('Product Search', () => {
  let searchPage: SearchPage;

  const products: ProductsData[] = [
    { name: 'HAMMER', expectResults: true },
    { name: 'saw', expectResults: true },
    { name: 'Drill', expectResults: true },
    { name: 'Pliers', expectResults: true },
    { name: 'InvalidProductXYZ', expectResults: false },
  ];

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await page.goto('/');
    await searchPage.searchInput.waitFor({ state: 'visible', timeout: 20000 });
  });

  products.forEach((product) => {
    test(`search for ${product.name}`, async () => {
      const response: Response = await searchPage.searchProduct(product.name);
      const data: ApiResponseData = await response.json();

      console.log(`API response for ${product.name}:`, data);
      console.log('Number of products from API:', data.total);

      const apiProducts: ProductData[] = searchPage.extractProductDataFromApi(data);
      const uiProducts: ProductData[] = await searchPage.getUiProductDetails();

      if (product.expectResults) {
        for (let i = 0; i < apiProducts.length; i++) {
          expect(uiProducts[i].name).toBe(apiProducts[i].name);
          expect(uiProducts[i].price).toBeCloseTo(apiProducts[i].price, 2);
        }
      } else {
        expect(apiProducts.length).toBe(0);
        expect(uiProducts.length).toBe(0);
        expect(await searchPage.getNoResultsMessage()).toEqual(
          'There are no products found.'
        );
      }
    });
  });
});