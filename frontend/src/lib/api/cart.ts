import { apiFetch } from "./client";
import type { Product } from "./products";

export type CartItem = {
  id: string;
  quantity: number;
  products: Product;
};

export type CartResponse = {
  cartId: string;
  items: CartItem[];
};

export function getCart(sessionId: string): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart", { method: "POST", body: { sessionId }, auth: false });
}

export function addToCart(sessionId: string, productId: string, quantity = 1) {
  return apiFetch<{ ok: true }>("/cart/items", {
    method: "POST",
    body: { sessionId, productId, quantity },
    auth: false,
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<{ ok: true }>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: { quantity },
    auth: false,
  });
}

export function removeCartItem(itemId: string) {
  return apiFetch<{ ok: true }>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
    auth: false,
  });
}
