import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useApi } from "@/lib/use-api";
import { products as productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

const Search = z.object({
  q: z.string().optional(),
  filter: z.enum(["new", "deals", "featured"]).optional(),
});

export const Route = createFileRoute("/categories")({
  validateSearch: Search,
  head: () => ({
    meta: [
      { title: "Shop all categories — KART.AI" },
      { name: "description", content: "Browse all products and categories at KART.AI." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const search = Route.useSearch();
  const { data: categories } = useApi(() => productsApi.listCategories(), []);
  const { data: products, loading } = useApi(
    () =>
      productsApi.listProducts({
        search: search.q,
        isNew: search.filter === "new" || undefined,
        isDeal: search.filter === "deals" || undefined,
        featured: search.filter === "featured" || undefined,
        limit: 60,
      }),
    [search.q, search.filter],
  );

  const heading =
    search.q ? `Results for "${search.q}"` :
    search.filter === "new" ? "New Arrivals" :
    search.filter === "deals" ? "Deals" :
    search.filter === "featured" ? "Featured" :
    "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Browse</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-1">{heading}</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/categories" className="px-4 py-2 rounded-full text-sm border border-border hover:bg-mint">All</Link>
        {(categories ?? []).map((c) => (
          <Link
            key={c.id}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="px-4 py-2 rounded-full text-sm border border-border hover:bg-mint"
          >
            {c.name}
          </Link>
        ))}
        <Link to="/categories" search={{ filter: "new" }} className="px-4 py-2 rounded-full text-sm border border-border hover:bg-mint">New</Link>
        <Link to="/categories" search={{ filter: "deals" }} className="px-4 py-2 rounded-full text-sm border border-border hover:bg-mint">Deals</Link>
      </div>

      {loading && !products ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-2xl" />
          ))}
        </div>
      ) : (products ?? []).length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(products ?? []).map((p, i) => (
            <ProductCard key={p.id} product={p as any} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
