import { test, expect, Page } from '@playwright/test';
import ProductResultsPage from '@pages/ProductResultsPage';

test.describe('Product Category Filtering', () => {
  let resultsPage: ProductResultsPage;

  test.beforeEach(async ({ page}) => {
    resultsPage = new ProductResultsPage(page);
    await page.goto('/');
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
      const filteredCount = await resultsPage.applyFilters(name);
      console.log(`Category "${name}" filtered count: ${filteredCount}`);
      expect(filteredCount).toBeGreaterThanOrEqual(minCount);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });
  }

  test('filter by multiple categories', async () => {
    const initialCount = await resultsPage.beforeFilterCount();
    const combinedCount = await resultsPage.applyFilters([
      'Hand Tools',
      'Power Tools',
    ]);

    expect(combinedCount).toBeGreaterThan(0);
    expect(combinedCount).toBeLessThanOrEqual(initialCount);
  });
});