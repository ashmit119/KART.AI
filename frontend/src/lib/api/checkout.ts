import { apiFetch } from "./client";

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
};

export type CheckoutResponse = {
  url: string;
};

export function createCheckoutSession(input: CheckoutInput): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/checkout/create-session", {
    method: "POST",
    body: input,
    auth: false,
  });
}
