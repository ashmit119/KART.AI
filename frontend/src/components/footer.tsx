import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-bold">KART.AI<span className="text-sage">.</span></p>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">An AI powered marketplace for your needs.</p>
        </div>
        <div>
          <p className="font-semibold mb-3">Shop</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/categories">All Categories</Link></li>
            <li><Link to="/categories" search={{ filter: "new" } as any}>New Arrivals</Link></li>
            <li><Link to="/categories" search={{ filter: "deals" } as any}>Deals</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Help</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>Shipping</li>
            <li>Returns</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Company</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>About</li>
            <li>Sustainability</li>
            <li>Press</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} KART.AI. Crafted with ❤️ in India
      </div>
    </footer>
  );
}
