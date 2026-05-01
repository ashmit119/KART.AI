import { createServerFn } from "@tanstack/react-start";

// Note: Cart is handled client-side via lib/cart-context.tsx
export const getCart = createServerFn({ method: "POST" }).handler(async () => {
  return { cartId: "local", items: [] };
});
