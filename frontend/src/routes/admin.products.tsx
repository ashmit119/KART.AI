import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { admin as adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/api/products";

export const Route = createFileRoute("/admin/products")({
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="py-16 text-center text-muted-foreground"><Loader2 className="inline h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No products yet. Add your first one!</td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted" />
                      <span className="font-medium line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{p.category_id ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-muted rounded-full text-destructive" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

function CreateProductDialog({
  categories,
  onClose,
  onSaved,
}: {
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) { setError("Please select an image."); return; }
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!price || isNaN(Number(price))) { setError("A valid price is required."); return; }

    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("price", String(Number(price)));
      fd.append("category", category);
      fd.append("image", imageFile);      // multer field name is "image"
      await adminApi.adminCreateProduct(fd);
      onSaved();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 flex items-start justify-center overflow-y-auto p-4">
      <form onSubmit={submit} className="bg-background rounded-2xl w-full max-w-lg my-8 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New product</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Image picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative mb-5 flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/40 transition-colors overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload product image</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>

        <div className="space-y-4">
          <Field label="Product Name" required>
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage" placeholder="e.g. Linen Throw Pillow" />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage resize-none" placeholder="Brief product description..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage" placeholder="999" />
            </Field>

            <Field label="Category">
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage">
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm hover:bg-muted">Cancel</button>
          <button
            type="submit"
            disabled={busy}
            className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Uploading…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}{required && " *"}</span>
      {children}
    </label>
  );
}
