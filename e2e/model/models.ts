// models.ts
export interface Product {
  category?: string;
  name: string;
  price: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    linePrice: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}