import { test, expect, Response } from '@playwright/test';
import { SearchPage} from '@pages/SearchPage';
import { ProductsApiResponse } from 'e2e/model/productsAPI';
import { Product } from 'e2e/model/models';

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
    await page.goto('/', {waitUntil:'domcontentloaded'});
  });

  products.forEach((product) => {
    test(`search for ${product.name}`, async () => {
      const response: Response = await searchPage.searchProduct(product.name);
      const data: ProductsApiResponse = await response.json() as ProductsApiResponse;


      console.log(`API response for ${product.name}:`, data);
      console.log('Number of products from API:', data.total);

      const apiProducts: Product[] = searchPage.extractProductDataFromApi(data);
      const uiProducts: Product[] = await searchPage.getUiProductDetails();

      if (product.expectResults) {
        for (let i = 0; i < apiProducts.length; i++) {
          expect(uiProducts[i].name).toBe(apiProducts[i].name);
          expect(uiProducts[i].price).toBeCloseTo(apiProducts[i].price, 2);
        }
      } else {
        expect(apiProducts.length).toBe(0);
        expect(uiProducts.length).toBe(0);
        const noResultsMsg = await searchPage.getNoResultsMessage();
        expect(noResultsMsg).toBe('There are no products found.');

      }
    });
  });

});