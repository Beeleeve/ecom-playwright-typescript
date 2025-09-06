import { expect, test } from '@playwright/test';
import { ProductResultsPage } from '@pages/ProductResultsPage';
import { ProductPage } from '@pages/ProductPage';
import { CartPage, CartItem } from '@pages/CartPage';
import { HomePage } from '@pages/HomePage';

interface product{
    category: string;
    name: string;
    quantity: number;    
}

const productsToBuy: product[] = [
    { category: 'Hammer', name: 'Claw Hammer', quantity: 1 },
    { category: 'Drill', name: ' Cordless Drill 12V ', quantity: 2 },
];

test.describe('E2E: Add products from multiple categories and verify cart', () => {
    let cartPage: CartPage;
    let productResultsPage: ProductResultsPage;
    let productPage: ProductPage;
    let homePage: HomePage;

 test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    productResultsPage = new ProductResultsPage(page);
    productPage = new ProductPage(page);

    await page.goto('/');
  });

 test('should add one product from each category and verify cart details', async ({ page }) => {
    const addedItems: CartItem[] = [];

    for (const { category, name, quantity } of productsToBuy) {
      await productResultsPage.applyFilters(category);

        const foundProduct = await productResultsPage.findProductWithDetails(name);
        expect(foundProduct, `Product "${name}" not found in category "${category}"`).toBeDefined();
        if (!foundProduct) {
            throw new Error(`Product "${name}" not found in category "${category}"`);
        }
     

        // Click the product link
        await foundProduct.card.click();

        await productPage.enterQuantity(quantity);
        await productPage.addToCart();

        addedItems.push({
            name: foundProduct.name,
            price: foundProduct.price,
            quantity,
            linePrice: foundProduct.price * quantity,
        });


      await homePage.goto(); // reset for next category
    }
    // await page.goto('/checkout');

    await cartPage.goToCart();

    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(addedItems.length);

    for (const item of addedItems) {
      await cartPage.verifyCartItem(item);
    }

    const expectedTotal = addedItems.reduce((sum, item) => sum + item.linePrice, 0);
    await cartPage.verifyCartTotal(expectedTotal);
  });

});