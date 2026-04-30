import { useState, useRef, ReactNode } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { chat as chatApi } from "@/lib/api";
import { ProductCard } from "./product-card";

export function ScanModal({ trigger, openImageUrl, onOpenChange }: { trigger?: ReactNode; openImageUrl?: string | null; onOpenChange?: (o: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  if (openImageUrl !== undefined) {
    // controlled-ish: react to changes
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    onOpenChange?.(o);
    if (!o) {
      setPreview(null);
      setResults([]);
      setKeywords([]);
    }
  }

  async function runSearchWithDataUrl(dataUrl: string) {
    setLoading(true);
    setResults([]);
    setKeywords([]);
    try {
      const res = await chatApi.visualSearch(dataUrl);
      setKeywords(res.keywords ?? []);
      setResults(res.matches ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      await runSearchWithDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Visual search</DialogTitle>
          <p className="text-sm text-muted-foreground">Upload a photo to find matching products in our catalog.</p>
        </DialogHeader>

        {!preview && (
          <div
            onClick={() => inputRef.current?.click()}
            className="mt-2 border-2 border-dashed border-border hover:border-sage rounded-2xl p-12 cursor-pointer text-center transition-colors"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-mint flex items-center justify-center mb-4">
              <Upload className="h-5 w-5 text-mint-foreground" />
            </div>
            <p className="font-medium text-foreground">Drop a photo here, or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">JPG or PNG, up to 5MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {preview && (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPreview(null);
                    setResults([]);
                    setKeywords([]);
                  }}
                  className="absolute top-1.5 right-1.5 bg-background/90 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing image…
                  </div>
                ) : keywords.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">We detected:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((k) => (
                        <span key={k} className="text-xs bg-mint text-mint-foreground px-2.5 py-1 rounded-full">
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto -mx-2 px-2">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {results.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              ) : !loading ? (
                <p className="text-sm text-muted-foreground text-center py-8">No matches found. Try another image.</p>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ScanButton({ className }: { className?: string }) {
  return (
    <ScanModal
      trigger={
        <button
          type="button"
          aria-label="Visual search"
          className={className ?? "p-2 rounded-full hover:bg-mint transition-colors"}
        >
          <Camera className="h-4 w-4 text-foreground" />
        </button>
      }
    />
  );
}
