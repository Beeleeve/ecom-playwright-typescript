import { Page, expect } from '@playwright/test';

export interface CartItem {
  name: string;
  price: number;
  linePrice: number;
  quantity: number;
}


export class CartPage {
  private readonly page: Page;
  private readonly productPrice = '[data-test="product-price"]';
  private readonly productTitle = '[data-test="product-title"]';
  private readonly linePrice = '[data-test="line-price"]';
  private readonly productQuantity = '[data-test="product-quantity"]';
  private readonly cartLink = 'nav-cart';
  private readonly cartTotal = 'cart-total';


  constructor(page: Page) {
    this.page = page;
  }

  async goToCart() {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.page.getByTestId(this.cartLink).click()
    ]);
  }

  async getCartItems(): Promise<CartItem[]> {    
    let rowCount = 0;
    const cartRows = this.page.locator('table > tbody > tr');
    await expect(async () => {      
      await expect(cartRows.first()).toBeVisible({ timeout: 25000 });
      rowCount = await cartRows.count();
      expect(rowCount).toBeGreaterThan(0);
    }).toPass();
        
    

    const items: CartItem[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row = cartRows.nth(i);

      const name = (await row.locator(this.productTitle).textContent())?.trim();
      const priceText = await row.getByTestId('product-price').textContent();
      const linePriceText = await row.getByTestId('line-price').textContent();

      const qtyInput = row.getByTestId('product-quantity');
      await expect(qtyInput).toHaveValue(/[0-9]+/); // wait for a number
      console.log('Name: ', name);
      console.log('itemPrice: ', priceText);
      console.log('Line price: ', linePriceText);
      console.log('Qty: ', qtyInput);
      let quantity = 1;
      try {
        const val = await qtyInput.inputValue();
        quantity = val ? parseInt(val, 10) : parseInt((await qtyInput.getAttribute('min')) || '1', 10);
      } catch {
        quantity = 1;
      }

      items.push({
        name: name || 'Unknown',
        price: parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0'),
        linePrice: parseFloat(linePriceText?.replace(/[^0-9.]/g, '') || '0'),
        quantity,
      });

      console.log('Item in cart: ', items[i]);
    }

    return items;
  }

  async getCartTotal(): Promise<number> {
    const totalText = await this.page.getByTestId(this.cartTotal).textContent();
    return parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
  }

  async verifyCartItem(expected: CartItem): Promise<void> {
    const items = await this.getCartItems();
    const match = items.find((i) => i.name === expected.name);
    expect(match).toBeTruthy();
    expect(match?.price).toBeCloseTo(expected.price, 2);
    expect(match?.linePrice).toBeCloseTo(expected.quantity * expected.price, 2);
  }

  async verifyCartTotal(expectedTotal: number): Promise<void> {
    const total = await this.getCartTotal();
    expect(total).toBeCloseTo(expectedTotal, 2);
  }
}

export default CartPage;