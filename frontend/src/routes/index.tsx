import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { products as productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KART.AI — An AI powered marketplace for your needs." },
      { name: "description", content: "An AI powered marketplace for your needs. Shop fashion, home, beauty, and electronics with visual search." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: categories } = useApi(() => productsApi.listCategories(), []);
  const { data: recommended } = useApi(() => productsApi.listProducts({ limit: 12 }), []);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-muted">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=80"
              alt="A sun-lit modern living room with linen sofa and ceramic vases"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative h-full flex items-center"
            >
              <div className="px-8 sm:px-12 lg:px-20 max-w-xl">
                <p className="text-sm font-medium text-sage mb-3">Spring Edit · 2026</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                  Quiet luxury for everyday rituals.
                </h1>
                <p className="mt-4 text-base text-foreground/80 leading-relaxed">
                  An AI powered marketplace for your needs.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    Shop the Look
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/categories"
                    search={{ filter: "new" } as any}
                    className="inline-flex items-center gap-2 bg-background/90 backdrop-blur text-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-background transition-colors"
                  >
                    New Arrivals
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Shop by category</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse our four worlds.</p>
          </div>
          <Link to="/categories" className="text-sm text-sage font-medium hover:underline hidden sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {(categories ?? []).map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="relative overflow-hidden rounded-3xl aspect-[21/9] sm:aspect-[3/1] bg-mint">
          <img
            src="https://images.unsplash.com/photo-1487744480471-9ca1bca6fb7d?w=1800&q=80"
            alt="Stylist arranging linen and ceramics on a wooden table"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mint/90 via-mint/50 to-transparent" />
          <div className="relative h-full flex items-center px-8 sm:px-12 lg:px-16 max-w-md">
            <div>
              <p className="text-xs uppercase tracking-widest text-mint-foreground/70 font-semibold">Editorial</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-mint-foreground">A linen-soaked spring at home.</h3>
              <Link to="/category/$slug" params={{ slug: "home" }} className="inline-block mt-4 text-sm font-semibold text-mint-foreground underline underline-offset-4">
                Discover Home →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recommended for you</h2>
            <p className="text-sm text-muted-foreground mt-1">Pieces our team is loving this week.</p>
          </div>
          <Link to="/categories" className="text-sm text-sage font-medium hover:underline hidden sm:block">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(recommended ?? []).map((p, i) => (
            <ProductCard key={p.id} product={p as any} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ category, index }: { category: any, index: number }) {
  const { data: products } = useApi(() => productsApi.listProducts({ categorySlug: category.slug, limit: 5 }), [category.slug]);
  const [imgIndex, setImgIndex] = useState(0);

  const images = (products ?? []).map(p => p.image_url).filter(Boolean);
  const displayImages = images.length > 0 ? images : [category.image_url].filter(Boolean);

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % displayImages.length);
    }, 3000 + (index * 500)); // Slightly staggered starts
    return () => clearInterval(interval);
  }, [displayImages.length, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to="/category/$slug"
        params={{ slug: category.slug }}
        className="group block relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted"
      >
        <div className="absolute inset-0">
          {displayImages.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt={category.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: i === imgIndex ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <p className="text-background font-semibold text-lg">{category.name}</p>
          <ArrowRight className="h-4 w-4 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}
