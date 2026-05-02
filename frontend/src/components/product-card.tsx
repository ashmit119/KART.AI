import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Search, ShoppingBag, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

type Props = {
  product: {
    id: string;
    title: string;
    price: number | string;
    image_url: string;
    rating?: number | string;
    is_new?: boolean;
    is_deal?: boolean;
  };
  onSearchSimilar?: (imageUrl: string) => void;
  index?: number;
};

export function ProductCard({ product, onSearchSimilar, index = 0 }: Props) {
  const { add, update, remove, items, count } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative"
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block overflow-hidden rounded-2xl bg-muted aspect-square relative"
      >
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.is_new && (
          <span className="absolute top-3 left-3 bg-mint text-mint-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            New
          </span>
        )}
        {product.is_deal && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-xs font-medium px-2.5 py-1 rounded-full">
            Deal
          </span>
        )}
        {onSearchSimilar && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSearchSimilar(product.image_url);
            }}
            className="absolute bottom-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm text-foreground text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-background active:scale-95"
          >
            <Search className="h-3 w-3" />
            <span className="sm:inline">Search Similar</span>
          </button>
        )}
      </Link>
      <div className="mt-3 px-1">
        <Link to="/product/$id" params={{ id: product.id }} className="block">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
          {product.rating != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-sage text-sage" />
              {Number(product.rating).toFixed(1)}
            </div>
          )}
        </div>
        {items.find(it => it.id === product.id) ? (
          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/cart"
              className="flex-1 border border-border bg-background py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-muted transition-all relative"
            >
              <div className="relative">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#f43f5e] text-white text-[8px] font-bold rounded-full h-3 min-w-3 px-0.5 flex items-center justify-center">
                  {count}
                </span>
              </div>
              Cart
            </Link>
            <div className="flex items-center bg-[#f43f5e] text-white rounded-xl p-0.5 shrink-0">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const item = items.find(it => it.id === product.id);
                  if (item && item.quantity > 1) update(item.id, item.quantity - 1);
                  else if (item) remove(item.id);
                }} 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-[10px] font-bold">
                {items.find(it => it.id === product.id)?.quantity || 1}
              </span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const item = items.find(it => it.id === product.id);
                  if (item) update(item.id, item.quantity + 1);
                }} 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => add(product.id, 1)}
            className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl border border-border hover:bg-foreground hover:text-background transition-all"
          >
            Add to cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
