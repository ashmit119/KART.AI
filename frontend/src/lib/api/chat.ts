import { visualSearch as visualSearchFn, chat as chatFn, getChatHistory as getChatHistoryFn } from "@/server/ai.functions";
import { mapBackendProduct, type BackendProduct, type Product } from "./products";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  product_refs?: string[];
};

export type ChatReply = {
  reply: string;
  products: Product[];
};

export type ChatHistory = {
  messages: ChatMessage[];
};

export type VisualSearchResult = {
  keywords: string[];
  matches: Product[];
};

export async function sendChat(sessionId: string, message: string): Promise<ChatReply> {
  const data = await chatFn({ data: { sessionId, message } });
  return { reply: data.reply, products: [] };
}

export async function getChatHistory(sessionId: string): Promise<ChatHistory> {
  return await getChatHistoryFn({ data: { sessionId } });
}

export async function visualSearch(imageDataUrl: string): Promise<VisualSearchResult> {
  const res = await visualSearchFn({ data: { imageDataUrl } });
  return {
    keywords: res.keywords,
    matches: (res.matches as BackendProduct[]).map(mapBackendProduct),
  };
}
