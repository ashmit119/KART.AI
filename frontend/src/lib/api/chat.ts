import { apiFetch, API_BASE_URL, getAuthToken } from "./client";
import type { Product } from "./products";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  product_refs?: string[];
};

export type ChatReply = {
  reply: string;
  /** Products the assistant recommended (already hydrated from the catalog). */
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
  const data = await apiFetch<{ success: boolean; reply: string }>("/chat", {
    method: "POST",
    body: { message },
    auth: false,
  });
  return { reply: data.reply, products: [] };
}

export async function getChatHistory(sessionId: string): Promise<ChatHistory> {
  // Backend currently doesn't store chat history, so return empty.
  return { messages: [] };
}

import { mapBackendProduct, type BackendProduct } from "./products";

export async function visualSearch(imageDataUrl: string): Promise<VisualSearchResult> {
  // Convert base64 data URL to a File
  const res = await fetch(imageDataUrl);
  const blob = await res.blob();
  const file = new File([blob], "search.jpg", { type: blob.type });

  const formData = new FormData();
  formData.append("image", file);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/search/visual`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Visual search failed");
  }

  const data: { success: boolean; data: BackendProduct[] } = await response.json();

  return {
    keywords: ["visual search results"],
    matches: data.data.map(mapBackendProduct),
  };
}
