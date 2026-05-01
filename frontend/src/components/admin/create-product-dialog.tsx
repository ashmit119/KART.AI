import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { admin as adminApi } from "@/lib/api";

export function CreateProductDialog({
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
      fd.append("image", imageFile);
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
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Product Name *</span>
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage" placeholder="e.g. Linen Throw Pillow" />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage resize-none" placeholder="Brief product description..." />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Price (₹) *</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage" placeholder="999" />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sage">
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
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
