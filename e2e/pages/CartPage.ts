import { Page, Locator, expect } from '@playwright/test';
import { time } from 'console';

export interface CartItem {
  name: string;
  price: number;
  linePrice: number;
  quantity: number;
}


export class CartPage {
  private readonly page: Page;
  private readonly cartRows: Locator;
  private readonly cartTotal: Locator;
  private readonly icon: Locator;
  private readonly productPrice = '[data-test="product-price"]';
  private readonly productTitle = '[data-test="product-title"]';
  private readonly linePrice = '[data-test="line-price"]';
  private readonly productQuantity = '[data-test="product-quantity"]';


  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator('table tbody tr');
    this.cartTotal = page.locator('[data-test="cart-total"]');
    this.icon = page.getByTestId('nav-cart');
  }

  async goToCart() {
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.icon).toBeVisible({ timeout: 15000 });
    await this.icon.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
  }

  async getCartItems(): Promise<CartItem[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
    const rowsCount = await this.cartRows.count();
    const items: CartItem[] = [];

    for (let i = 0; i < rowsCount; i++) {
      const row = this.cartRows.nth(i);

      const name = (await row.locator(this.productTitle).textContent())?.trim();
      const priceText = await row.locator(this.productPrice).textContent();
      const linePriceText = await row.locator(this.linePrice).textContent();
      const quantity = parseInt(await row.locator(this.productQuantity).inputValue());
      items.push({
        name: name || 'Unknown',
        price: parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0'),
        linePrice: parseFloat(linePriceText?.replace(/[^0-9.]/g, '') || '0'),
        quantity: quantity || 1,
      });
    }
    return items;
  }

  async getCartTotal(): Promise<number> {
    const totalText = await this.cartTotal.textContent();
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