import { Link } from "@tanstack/react-router";
import { Camera, ShoppingBag, Search, User, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ScanModal } from "./scan-modal";

export function Header() {
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [q, setQ] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/categories", search: { q: q.trim() } as any });
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-mint transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tighter text-foreground">
          KART.AI<span className="text-sage">.</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={onSearch} className="flex-1 max-w-lg hidden md:block">
          <div className="flex items-center bg-muted/50 border border-transparent focus-within:border-sage/30 rounded-full pl-4 pr-1.5 h-10 transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, styles…"
              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <ScanModal
              trigger={
                <button
                  type="button"
                  className="h-7 w-7 rounded-full bg-background hover:bg-mint flex items-center justify-center transition-colors shadow-sm"
                >
                  <Camera className="h-3.5 w-3.5 text-foreground" />
                </button>
              }
            />
          </div>
        </form>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link to="/categories" search={{ filter: "new" } as any} className="hover:text-sage transition-colors">New Arrivals</Link>
          <Link to="/categories" className="hover:text-sage transition-colors">Categories</Link>
          <Link to="/categories" search={{ filter: "deals" } as any} className="hover:text-sage transition-colors">Deals</Link>
          {isAdmin && (
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-sage">
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {user ? (
            <button
              onClick={() => signOut()}
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-mint transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-mint transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-mint transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-foreground text-background text-[10px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center" style={{ height: 16, minWidth: 16 }}>
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={onSearch}>
          <div className="flex items-center bg-muted/50 border border-transparent focus-within:border-sage/30 rounded-xl pl-3 pr-1.5 h-11 transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent px-3 text-sm outline-none"
            />
            <ScanModal
              trigger={
                <button type="button" className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Camera className="h-4 w-4" />
                </button>
              }
            />
          </div>
        </form>
      </div>

      {/* Slide-out Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-md transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative w-[280px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-xl font-bold tracking-tighter">KART.AI<span className="text-sage">.</span></span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex flex-col p-6 gap-8 text-lg font-semibold text-gray-900">
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="hover:text-sage transition-colors">All Categories</Link>
              <Link to="/categories" search={{ filter: "new" } as any} onClick={() => setMobileMenuOpen(false)} className="hover:text-sage transition-colors">New Arrivals</Link>
              <Link to="/categories" search={{ filter: "deals" } as any} onClick={() => setMobileMenuOpen(false)} className="hover:text-sage transition-colors">Deals</Link>
              
              <div className="h-px bg-gray-100 my-2" />
              
              {isAdmin && (
                <Link to="/admin/products" className="text-sage flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Shield className="h-5 w-5" /> Admin Panel
                </Link>
              )}
              
              {user ? (
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-500 text-left">
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              ) : (
                <Link to="/auth" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-5 w-5" /> Sign In
                </Link>
              )}
            </nav>

            <div className="mt-auto p-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Crafted with ❤️ in India</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
