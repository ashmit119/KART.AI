import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — KART.AI" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, update, remove, loading } = useCart();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-8" />
        <div className="space-y-3">{[0,1,2].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-mint flex items-center justify-center mb-6">
          <ShoppingBag className="h-7 w-7 text-mint-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Time to discover something you'll love.</p>
        <Link to="/categories" className="mt-8 inline-block bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Your cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-border rounded-2xl">
              <Link to="/product/$id" params={{ id: item.products.id }} className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                  <Link to="/product/$id" params={{ id: item.products.id }} className="font-semibold hover:underline">
                    {item.products.title}
                  </Link>
                  <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{formatPrice(item.products.price)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center bg-muted rounded-full">
                    <button onClick={() => update(item.id, item.quantity - 1)} className="p-2 hover:bg-mint rounded-full"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => update(item.id, item.quantity + 1)} className="p-2 hover:bg-mint rounded-full"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="font-bold">{formatPrice(Number(item.products.price) * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{subtotal >= 100 ? "Free" : formatPrice(10)}</span>
            </div>
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(subtotal + (subtotal >= 100 ? 0 : 10))}</span>
          </div>
          <Link to="/checkout" className="mt-6 block text-center bg-foreground text-background py-3.5 rounded-full font-semibold text-sm hover:bg-foreground/90 transition-colors">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
