import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const ProductInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).default(""),
  price: z.number().min(0).max(1_000_000),
  image_url: z.string().url().max(2048),
  category_id: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).default(4.5),
  stock: z.number().int().min(0).max(100000).default(100),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_deal: z.boolean().default(false),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    return await apiFetch("/admin/products");
  });

export const adminCreateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    return await apiFetch("/admin/products", {
      method: "POST",
      body: formData
    });
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string(), patch: ProductInput.partial() }).parse(d),
  )
  .handler(async ({ data }) => {
    return await apiFetch(`/admin/products/${data.id}`, {
      method: "PATCH",
      body: data.patch
    });
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    return await apiFetch(`/admin/products/${data.id}`, {
      method: "DELETE"
    });
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    return await apiFetch("/categories");
  });
