import { test, expect } from '@playwright/test';
import ProductResultsPage from '@pages/ProductResultsPage';
import { ProductsApiResponse } from 'e2e/model/productsAPI';

test.describe('Product Category Filtering', () => {
  let resultsPage: ProductResultsPage;

  test.beforeEach(async ({ page}) => {
    resultsPage = new ProductResultsPage(page);
    await page.goto('/', {waitUntil:'domcontentloaded'});
  });

  // Categories to test
  const categories: { name: string; minCount: number }[] = [
    { name: 'Hammer', minCount: 1 },
    { name: 'Pliers', minCount: 1 },
    { name: 'Chisels', minCount: 3 },
    { name: 'Saw', minCount: 1 },
    { name: 'Drill', minCount: 1 },
  ];

  for (const {name, minCount} of categories) {
    test(`filter by category: ${name}`, async () => {
      const initialCount = await resultsPage.beforeFilterCount();
      const filteredResponse = await resultsPage.applyFilters(name);
      expect(filteredResponse).not.toBeNull();
      const jsonResponse = await filteredResponse?.json() as ProductsApiResponse;
      const count = Array.isArray(jsonResponse.data) ? jsonResponse.data.length : 0;
      console.log(`Category "${name}" filtered count: ${count}`);
      expect(count).toBeGreaterThanOrEqual(minCount);
      expect(count).toBeLessThanOrEqual(initialCount);
    });
  }

 test('filter by multiple categories', async () => {
  const initialCount = await resultsPage.beforeFilterCount();

  const response = await resultsPage.applyFilters([
    'Safety Gear',
    'Sander',
  ]);

  // Fail early if no response
  expect(response, 'No response returned from applyFilters').toBeTruthy();

  // Strongly type the parsed JSON
  const { data }: ProductsApiResponse = await response!.json() as ProductsApiResponse;

  // Ensure data is an array
  expect(Array.isArray(data)).toBe(true);

  const filteredCount = data.length;

  expect(filteredCount).toBeGreaterThan(0);
  expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });
});