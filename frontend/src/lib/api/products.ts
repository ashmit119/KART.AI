import { apiFetch } from "./client";

// Backend representation of a product
export type BackendProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl: string;
};

// Map backend product to frontend product format
export function mapBackendProduct(bp: BackendProduct): Product {
  return {
    id: bp._id,
    title: bp.name,
    description: bp.description || "",
    price: bp.price,
    image_url: bp.imageUrl,
    category_id: bp.category || null,
    rating: 5,
    stock: 100,
    is_featured: false,
    is_new: false,
    is_deal: false,
    tags: [],
  };
}

export type Category = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
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
  // Optional joined category info — backend may include this
  categories?: { slug: string; name: string } | null;
};

export type ListProductsParams = {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  isDeal?: boolean;
  search?: string;
  limit?: number;
  excludeId?: string;
};

export function listCategories(): Promise<Category[]> {
  // Return mocked categories since the backend doesn't have a /categories route yet.
  return Promise.resolve([
    { id: "1", slug: "fashion", name: "Fashion", image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", sort_order: 1 },
    { id: "2", slug: "home", name: "Home", image_url: "https://images.unsplash.com/photo-1556020685-e631950d4d80?w=800&q=80", sort_order: 2 },
    { id: "3", slug: "beauty", name: "Beauty", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", sort_order: 3 },
    { id: "4", slug: "electronics", name: "Electronics", image_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80", sort_order: 4 },
  ]);
}

export async function listProducts(params: ListProductsParams = {}): Promise<Product[]> {
  const data = await apiFetch<{ success: boolean; products: BackendProduct[] }>("/admin/products", { auth: false, query: params });
  return data.products.map(mapBackendProduct);
}

export async function getProduct(id: string): Promise<Product> {
  // Backend doesn't have a single product endpoint, so fetch all and filter for now.
  const data = await apiFetch<{ success: boolean; products: BackendProduct[] }>("/admin/products", { auth: false });
  const product = data.products.find(p => p._id === id);
  if (!product) throw new Error("Product not found");
  return mapBackendProduct(product);
}
