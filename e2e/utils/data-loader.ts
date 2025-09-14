// cart-data-loader.ts
// import rawData from './cart-test-data.json';
// import { Cart } from './models';

// const carts: Cart[] = rawData;

// interface FilterOptions {
//   category?: string | string[]; // can be single or multiple
//   name?: string | string[];
// }

// export function getCartData({ category, name }: FilterOptions = {}): Cart[] {
//   return carts.filter(cart =>
//     cart.items.some(item => {
//       const matchesCategory = category
//         ? Array.isArray(category)
//           ? category.includes(item.product.category)
//           : item.product.category === category
//         : true;

//       const matchesName = name
//         ? Array.isArray(name)
//           ? name.some(n => item.product.name.includes(n))
//           : item.product.name.includes(name)
//         : true;

//       return matchesCategory && matchesName;
//     })
//   );
// }


// // example.spec.ts
// import { test, expect } from '@playwright/test';
// import { getCartData } from './cart-data-loader';

// test('Add Hammer and Drill products to cart', async ({ page }) => {
//   const carts = getCartData({ category: ['Hammer', 'Drill'] });

//   for (const cart of carts) {
//     for (const { product, quantity } of cart.items) {
//       await page.click(`text=${product.name}`);
//       await page.fill('#quantity', quantity.toString());
//       await page.click('#add-to-cart');
//     }

//     const totalText = await page.textContent('#cart-total');
//     expect(Number(totalText)).toBe(cart.totalPrice);
//   }
// });
