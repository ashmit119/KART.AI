import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { admin as adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/api/products";
import { CreateProductDialog } from "@/components/admin/create-product-dialog";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Admin Products — KART.AI" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([
        adminApi.adminListProducts(),
        adminApi.adminListCategories(),
      ]);
      setProducts(p);
      setCategories(c as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await adminApi.adminDeleteProduct(id);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-muted-foreground">
          <Loader2 className="inline h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground italic">
                      No products found. Start by adding a new one.
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={p.image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-muted border border-border" />
                        <span className="font-medium text-foreground">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDelete(p.id)} 
                        className="p-2.5 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateProductDialog
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); refresh(); }}
        />
      )}
    </div>
  );
}
