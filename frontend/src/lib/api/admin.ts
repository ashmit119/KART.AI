import { apiFetch } from "./client";
import { mapBackendProduct, type BackendProduct, type Category, type Product } from "./products";

export type ProductInput = {
  title: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string | null;
  rating: number;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_deal: boolean;
  tags: string[];
};

/** All admin endpoints require a Bearer JWT for an admin user. */

export async function adminListProducts(): Promise<Product[]> {
  const data = await apiFetch<{ success: boolean; products: BackendProduct[] }>("/admin/products");
  return (data.products ?? []).map(mapBackendProduct);
}

export function adminListCategories(): Promise<Category[]> {
  // Backend has no /admin/categories route; return mocked categories.
  return Promise.resolve([
    { id: "fashion",     slug: "fashion",     name: "Fashion",     image_url: null, sort_order: 1 },
    { id: "home",        slug: "home",        name: "Home",        image_url: null, sort_order: 2 },
    { id: "beauty",      slug: "beauty",      name: "Beauty",      image_url: null, sort_order: 3 },
    { id: "electronics", slug: "electronics", name: "Electronics", image_url: null, sort_order: 4 },
  ]);
}

/** Creates a product by uploading an image + fields as multipart FormData. */
export async function adminCreateProduct(formData: FormData): Promise<Product> {
  const data = await apiFetch<{ product: BackendProduct }>("/admin/products", {
    method: "POST",
    body: formData,
  });
  return mapBackendProduct(data.product);
}

export function adminUpdateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export function adminDeleteProduct(id: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
