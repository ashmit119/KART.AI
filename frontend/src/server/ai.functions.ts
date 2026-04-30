import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: any[], model = "google/gemini-2.5-flash") {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt}`);
  }
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}

export const visualSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ imageDataUrl: z.string().min(20).max(8_000_000) }).parse(d),
  )
  .handler(async ({ data }) => {
    // Ask vision model to describe what to search for
    const description = await callAI(
      [
        {
          role: "system",
          content:
            "You are a product visual search assistant. Look at the image and respond with 3-6 short search keywords (comma separated) describing the main product type, style, material, and color. No sentences, just keywords.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this product for shopping search:" },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      "google/gemini-2.5-flash",
    );

    const keywords = description
      .split(/[,\n]/)
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s.length > 1 && s.length < 40)
      .slice(0, 8);

    // Score products by keyword overlap on title/description/tags
    const { data: products } = await supabaseAdmin.from("products").select("*");
    if (!products) return { keywords, matches: [] };

    const scored = products
      .map((p) => {
        const hay = `${p.title} ${p.description} ${(p.tags ?? []).join(" ")}`.toLowerCase();
        const score = keywords.reduce((s: number, k: string) => (hay.includes(k) ? s + 1 : s), 0);
        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.product);

    return { keywords, matches: scored };
  });

export const chat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      sessionId: z.string().min(8).max(128),
      message: z.string().min(1).max(2000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    // Find or create conversation
    let { data: conv } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("session_id", data.sessionId)
      .maybeSingle();
    if (!conv) {
      const { data: created } = await supabaseAdmin
        .from("chat_conversations")
        .insert({ session_id: data.sessionId })
        .select("id")
        .single();
      conv = created!;
    }

    // Save user message
    await supabaseAdmin.from("chat_messages").insert({
      conversation_id: conv.id,
      role: "user",
      content: data.message,
    });

    // Load history (last 20)
    const { data: history } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Catalog snapshot for grounding
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, title, price, description, tags")
      .limit(60);

    const catalogText = (products ?? [])
      .map((p) => `- [${p.id}] ${p.title} ($${p.price}) — ${(p.tags ?? []).join(", ")}`)
      .join("\n");

    const systemPrompt = `You are a friendly, concise shopping assistant for a premium lifestyle marketplace.
You help shoppers discover products and answer questions about them.
You have access to this catalog (each line: [product_id] title (price) — tags):

${catalogText}

When recommending products, mention them naturally by title. At the very end of your message, if you recommended specific products, append a single line in this exact format (no other text after it):
PRODUCTS: id1, id2, id3
Use only product IDs from the catalog above. Recommend 1–4 products max. If you didn't recommend any, omit the PRODUCTS line.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await callAI(messages, "google/gemini-2.5-flash");

    // Extract product refs
    const productRefs: string[] = [];
    let cleanReply = reply;
    const m = reply.match(/PRODUCTS:\s*([0-9a-f-,\s]+)\s*$/i);
    if (m) {
      productRefs.push(
        ...m[1]
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => /^[0-9a-f-]{36}$/i.test(s)),
      );
      cleanReply = reply.replace(/PRODUCTS:\s*[0-9a-f-,\s]+\s*$/i, "").trim();
    }

    await supabaseAdmin.from("chat_messages").insert({
      conversation_id: conv.id,
      role: "assistant",
      content: cleanReply,
      product_refs: productRefs,
    });

    let refProducts: any[] = [];
    if (productRefs.length > 0) {
      const { data: rp } = await supabaseAdmin
        .from("products")
        .select("*")
        .in("id", productRefs);
      refProducts = rp ?? [];
    }

    return { reply: cleanReply, products: refProducts };
  });

export const getChatHistory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().min(8) }).parse(d))
  .handler(async ({ data }) => {
    const { data: conv } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("session_id", data.sessionId)
      .maybeSingle();
    if (!conv) return { messages: [] };
    const { data: msgs } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content, product_refs, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    return { messages: msgs ?? [] };
  });
