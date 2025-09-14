import { expect, test } from '@playwright/test';
import { ProductResultsPage } from '@pages/ProductResultsPage';
import { ProductPage } from '@pages/ProductPage';
import { CartPage, CartItem } from '@pages/CartPage';

interface product{
    category: string;
    name: string;
    quantity: number;    
}

const productsToBuy: product[] = [
  { category: 'Drill', name: 'Cordless Drill 12V', quantity: 2 },
  { category: 'Hammer', name: 'Thor Hammer', quantity: 1 }
];

test.describe('E2E: Add products from multiple categories and verify cart', () => {
    let cartPage: CartPage;
    let productResultsPage: ProductResultsPage;
    let productPage: ProductPage;

 test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    productResultsPage = new ProductResultsPage(page);
    productPage = new ProductPage(page);    
    await page.goto('/', {waitUntil:"domcontentloaded"});
  });

 test('should add one product from each category and verify cart details', async ({ page }) => {
    const addedItems: CartItem[] = [];
    let runningCartCount  = 0;
    for (const { category, name, quantity } of productsToBuy) {
        await productResultsPage.applyFilters(category);
        await productResultsPage.selectProduct(name);
        const selectedProductName = await productPage.getProductName();
        expect(selectedProductName).toBe(name);
        const price = await productPage.getProductPrice();
        await productPage.enterQuantity(quantity);
        runningCartCount += quantity;
        await productPage.addToCartAndWaitForQuantity(runningCartCount);
        addedItems.push({
            name: selectedProductName,
            price: parseFloat(price),
            quantity,
            linePrice: parseFloat(price) * quantity,
        });
      console.log('Items added to cart: ', addedItems);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await productResultsPage.waitForProducts();
    }

   //add check the cart quantity is running cart total
   await cartPage.goToCart();
   const cartItems = await cartPage.getCartItems();
   console.log('CartItems :', cartItems);
   expect(cartItems).toHaveLength(addedItems.length);

    for (const item of addedItems) {
      await cartPage.verifyCartItem(item);
    }

    const expectedTotal = addedItems.reduce((sum, item) => sum + item.linePrice, 0);
    await cartPage.verifyCartTotal(expectedTotal);
  });

});