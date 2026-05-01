import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  return await apiFetch("/categories");
});

const ListProductsInput = z.object({
  categorySlug: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isDeal: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  excludeId: z.string().optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListProductsInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    return await apiFetch("/products", {
      query: {
        category: data.categorySlug,
        featured: data.featured,
        isNew: data.isNew,
        isDeal: data.isDeal,
        search: data.search,
        limit: data.limit,
        exclude: data.excludeId
      }
    });
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    return await apiFetch(`/products/${data.id}`);
  });
