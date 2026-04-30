import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const ListProductsInput = z.object({
  categorySlug: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isDeal: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  excludeId: z.string().uuid().optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListProductsInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("products").select("*, categories(slug, name)").order("created_at", { ascending: false });
    if (data.categorySlug) {
      const { data: cat } = await supabaseAdmin.from("categories").select("id").eq("slug", data.categorySlug).maybeSingle();
      if (cat?.id) q = q.eq("category_id", cat.id);
    }
    if (data.featured) q = q.eq("is_featured", true);
    if (data.isNew) q = q.eq("is_new", true);
    if (data.isDeal) q = q.eq("is_deal", true);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.excludeId) q = q.neq("id", data.excludeId);
    if (data.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(slug, name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found");
    return row;
  });
