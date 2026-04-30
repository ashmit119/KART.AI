import { createFileRoute, Link } from "@tanstack/react-router";
import { useApi } from "@/lib/use-api";
import { products as productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} — KART.AI` },
      { name: "description", content: `Shop ${params.slug} at KART.AI.` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useApi(() => productsApi.listCategories(), []);
  const { data: products, loading } = useApi(
    () => productsApi.listProducts({ categorySlug: slug, limit: 60 }),
    [slug],
  );

  const current = (categories ?? []).find((c) => c.slug === slug);

  if (categories && !current) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link to="/categories" className="mt-4 inline-block text-sage underline">Browse all categories</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[3/1] bg-muted overflow-hidden">
        {current?.image_url && (
          <img src={current.image_url} alt={current.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <p className="text-sm text-muted-foreground">Category</p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-1">{current?.name ?? slug}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          <Link to="/categories" className="px-4 py-2 rounded-full text-sm border border-border hover:bg-mint">All</Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${c.slug === slug ? "bg-foreground text-background border-foreground" : "border-border hover:bg-mint"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {loading && !products ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl" />
            ))}
          </div>
        ) : (products ?? []).length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(products ?? []).map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
