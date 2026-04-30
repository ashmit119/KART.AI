import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Minus, Plus, Loader2 } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { products as productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [{ title: "Product — KART.AI" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, loading, error } = useApi(() => productsApi.getProduct(id), [id]);
  const { data: related } = useApi(
    async () => {
      if (!product) return [];
      return productsApi.listProducts({
        categorySlug: product.categories?.slug,
        limit: 8,
        excludeId: product.id,
      });
    },
    [product?.id],
  );

  const { add, update, remove, items, count } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!product) return;
    setAdding(true);
    try {
      await add(product.id, qty);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not available</h1>
        <p className="mt-2 text-muted-foreground">{error?.message ?? "Not found"}</p>
        <Link to="/categories" className="mt-6 inline-block text-sage underline">Browse all products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        {product.categories?.slug && (
          <>
            <Link to="/category/$slug" params={{ slug: product.categories.slug }} className="hover:underline">
              {product.categories.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="aspect-square rounded-3xl bg-muted overflow-hidden"
        >
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        </motion.div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            {product.is_new && <span className="bg-mint text-mint-foreground text-xs font-medium px-2.5 py-1 rounded-full">New</span>}
            {product.is_deal && <span className="bg-foreground text-background text-xs font-medium px-2.5 py-1 rounded-full">Deal</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-sage text-sage" />
            {Number(product.rating).toFixed(1)} · In stock
          </div>
          <p className="mt-6 text-3xl font-bold">{formatPrice(product.price)}</p>
          <p className="mt-6 text-base text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-3">
            {items.find(it => it.id === product.id) ? (
              <>
                <Link
                  to="/cart"
                  className="flex-1 border border-border bg-background py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-muted transition-all relative"
                >
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 bg-[#f43f5e] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                      {count}
                    </span>
                  </div>
                  View Cart
                </Link>
                <div className="flex items-center bg-[#f43f5e] text-white rounded-2xl p-1 shrink-0">
                  <button 
                    onClick={() => {
                      const item = items.find(it => it.id === product.id);
                      if (item && item.quantity > 1) update(item.id, item.quantity - 1);
                      else if (item) remove(item.id);
                    }} 
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">
                    {items.find(it => it.id === product.id)?.quantity || 1}
                  </span>
                  <button 
                    onClick={() => {
                      const item = items.find(it => it.id === product.id);
                      if (item) update(item.id, item.quantity + 1);
                    }} 
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleAdd}
                disabled={adding}
                className="w-full bg-foreground text-background py-4 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-all shadow-lg shadow-foreground/10"
              >
                {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                {adding ? "Adding…" : "Add to cart"}
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="border border-border rounded-xl p-3 text-center">
              <p className="font-semibold text-foreground">Free shipping</p>
              <p>Over $100</p>
            </div>
            <div className="border border-border rounded-xl p-3 text-center">
              <p className="font-semibold text-foreground">30-day</p>
              <p>Returns</p>
            </div>
            <div className="border border-border rounded-xl p-3 text-center">
              <p className="font-semibold text-foreground">Secure</p>
              <p>Checkout</p>
            </div>
          </div>
        </div>
      </div>

      {(related ?? []).length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(related ?? []).map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
