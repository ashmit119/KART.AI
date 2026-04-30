import { createFileRoute, Outlet, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — KART.AI" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.navigate({ to: "/auth", search: { redirect: "/admin" } as any });
      return;
    }
    setChecked(true);
  }, [user, loading, router]);

  if (loading || !checked) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have admin permissions.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-6 text-sm text-sage hover:underline"
        >
          Sign out
        </button>
        <div className="mt-2">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link to="/admin/products" className="px-4 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-4 py-2 rounded-full bg-foreground text-background" }}>
            Products
          </Link>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
