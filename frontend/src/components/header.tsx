import { Link } from "@tanstack/react-router";
import { Camera, ShoppingBag, Search, User, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ScanModal } from "./scan-modal";

export function Header() {
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/categories", search: { q: q.trim() } as any });
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-8">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground shrink-0">
          KART.AI<span className="text-sage">.</span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="flex items-center bg-muted rounded-full pl-4 pr-1.5 h-10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands, or styles…"
              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <ScanModal
              trigger={
                <button
                  type="button"
                  aria-label="Visual search"
                  className="h-7 w-7 rounded-full bg-background hover:bg-mint flex items-center justify-center transition-colors shrink-0"
                  title="Search by image"
                >
                  <Camera className="h-3.5 w-3.5 text-foreground" />
                </button>
              }
            />
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-foreground shrink-0">
          <Link to="/categories" search={{ filter: "new" } as any} className="hover:text-sage transition-colors">New Arrivals</Link>
          <Link to="/categories" className="hover:text-sage transition-colors">Categories</Link>
          <Link to="/categories" search={{ filter: "deals" } as any} className="hover:text-sage transition-colors">Deals</Link>
          {isAdmin && (
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-sage hover:underline">
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        {user ? (
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            title={user.email ?? "Sign out"}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm p-2 rounded-full hover:bg-mint transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <Link
            to="/auth"
            aria-label="Sign in"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm p-2 rounded-full hover:bg-mint transition-colors shrink-0"
          >
            <User className="h-4 w-4" />
          </Link>
        )}

        <Link
          to="/cart"
          aria-label="Cart"
          className="relative p-2 rounded-full hover:bg-mint transition-colors shrink-0"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[10px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center" style={{ height: 18, minWidth: 18 }}>
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={onSearch}>
          <div className="flex items-center bg-muted rounded-full pl-4 pr-1.5 h-10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent px-3 text-sm outline-none"
            />
            <ScanModal
              trigger={
                <button type="button" className="h-7 w-7 rounded-full bg-background flex items-center justify-center">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              }
            />
          </div>
        </form>
      </div>
    </header>
  );
}
