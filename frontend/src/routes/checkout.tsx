import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { checkout as checkoutApi } from "@/lib/api";
import { getSessionId } from "@/lib/session";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — KART.AI" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });

  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shipping;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const checkoutItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      const res = await checkoutApi.createCheckoutSession({
        items: checkoutItems,
      });
      // Redirect to Stripe-hosted checkout page.
      window.location.href = res.url;
    } catch (e: any) {
      setError(e.message ?? "Checkout failed");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/categories" className="mt-6 inline-block text-sage underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Checkout</h1>
      <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="font-bold text-lg mb-2">Contact</legend>
            <Field label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" required />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-bold text-lg mb-2">Shipping address</legend>
            <Field label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} required />
            <Field label="Address" value={form.address} onChange={(v) => set("address", v)} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
              <Field label="Postal code" value={form.postalCode} onChange={(v) => set("postalCode", v)} required />
            </div>
            <Field label="Country" value={form.country} onChange={(v) => set("country", v)} required />
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <aside className="border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Order summary</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={it.products.image_url} alt={it.products.title} className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {it.quantity}
                  </span>
                </div>
                <p className="flex-1 text-xs line-clamp-1">{it.products.title}</p>
                <p className="text-xs font-semibold">{formatPrice(Number(it.products.price) * it.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-foreground text-background py-3.5 rounded-full font-semibold text-sm hover:bg-foreground/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to payment
          </button>
          <p className="mt-3 text-xs text-muted-foreground text-center">You'll be redirected to Stripe to complete payment.</p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage"
      />
    </label>
  );
}
