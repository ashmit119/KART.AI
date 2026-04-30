import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem } from "@/lib/api/cart";
import { getProduct } from "@/lib/api/products";

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kartai_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("kartai_cart", JSON.stringify(items));
    }
  }, [items, loading]);

  const refresh = useCallback(async () => {
    // No-op for local storage
  }, []);

  const add = useCallback(async (productId: string, quantity = 1) => {
    try {
      setItems((prev) => {
        const existing = prev.find(item => item.id === productId);
        if (existing) {
          return prev.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return prev;
      });

      // If new item, fetch product details
      const existing = items.find(item => item.id === productId);
      if (!existing) {
        const product = await getProduct(productId);
        setItems((prev) => [...prev, { id: productId, quantity, products: product }]);
      }
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  }, [items]);

  const update = useCallback(async (itemId: string, quantity: number) => {
    setItems((prev) => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  const remove = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter(item => item.id !== itemId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.reduce((s, it) => s + it.quantity, 0);
  const subtotal = items.reduce(
    (s, it) => s + Number(it.products?.price ?? 0) * it.quantity,
    0,
  );

  return (
    <Ctx.Provider value={{ items, count, subtotal, loading, add, update, remove, clear, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
