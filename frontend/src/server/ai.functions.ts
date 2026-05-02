import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const visualSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ imageDataUrl: z.string().min(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const base64Data = data.imageDataUrl.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", blob, "search.jpg");

    const result = await apiFetch("/search/visual", {
      method: "POST",
      body: formData
    });

    return { 
      keywords: [], 
      matches: result.data || [] 
    };
  });

export const chat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      sessionId: z.string().min(8),
      message: z.string().min(1),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const result = await apiFetch("/chat", {
      method: "POST",
      body: { message: data.message }
    });

    return { 
      reply: result.reply, 
      products: []
    };
  });

export const getChatHistory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().min(8) }).parse(d))
  .handler(async () => {
    return { messages: [] };
  });
