import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SessionInput = z.object({ sessionId: z.string().min(8).max(128) });

async function ensureCart(sessionId: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data: created, error } = await supabaseAdmin
    .from("carts")
    .insert({ session_id: sessionId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id;
}

export const getCart = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SessionInput.parse(d))
  .handler(async ({ data }) => {
    const cartId = await ensureCart(data.sessionId);
    const { data: items, error } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity, products(*)")
      .eq("cart_id", cartId);
    if (error) throw new Error(error.message);
    return { cartId, items: items ?? [] };
  });

export const addToCart = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      sessionId: z.string().min(8),
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99).default(1),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const cartId = await ensureCart(data.sessionId);
    const { data: existing } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", data.productId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: existing.quantity + data.quantity })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: data.productId, quantity: data.quantity });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(0).max(99) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.quantity === 0) {
      await supabaseAdmin.from("cart_items").delete().eq("id", data.itemId);
    } else {
      await supabaseAdmin.from("cart_items").update({ quantity: data.quantity }).eq("id", data.itemId);
    }
    return { ok: true };
  });

export const removeCartItem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ itemId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("cart_items").delete().eq("id", data.itemId);
    return { ok: true };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      sessionId: z.string().min(8),
      email: z.string().email(),
      fullName: z.string().min(1).max(120),
      address: z.string().min(1).max(240),
      city: z.string().min(1).max(120),
      postalCode: z.string().min(1).max(40),
      country: z.string().min(1).max(80).default("US"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const cartId = await ensureCart(data.sessionId);
    const { data: items } = await supabaseAdmin
      .from("cart_items")
      .select("quantity, products(id, title, price, image_url)")
      .eq("cart_id", cartId);
    if (!items || items.length === 0) throw new Error("Cart is empty");

    const subtotal = items.reduce((sum, it: any) => sum + Number(it.products.price) * it.quantity, 0);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        session_id: data.sessionId,
        email: data.email,
        full_name: data.fullName,
        address: data.address,
        city: data.city,
        postal_code: data.postalCode,
        country: data.country,
        subtotal,
        status: "pending",
        stripe_session_id: `mock_${crypto.randomUUID()}`,
      })
      .select("id, stripe_session_id")
      .single();
    if (error) throw new Error(error.message);

    const orderItems = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.products.id,
      title: it.products.title,
      price: it.products.price,
      quantity: it.quantity,
      image_url: it.products.image_url,
    }));
    await supabaseAdmin.from("order_items").insert(orderItems);
    await supabaseAdmin.from("cart_items").delete().eq("cart_id", cartId);

    return { orderId: order.id, sessionId: order.stripe_session_id };
  });
