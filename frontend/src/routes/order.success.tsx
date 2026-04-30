import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/order/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({ meta: [{ title: "Thanks for your order — KART.AI" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-mint flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8 text-sage" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold">Thank you for your order.</h1>
      <p className="mt-3 text-muted-foreground">A confirmation email is on its way.</p>
      {id && <p className="mt-2 text-xs text-muted-foreground">Order ID: <span className="font-mono">{id.slice(0, 8)}</span></p>}
      <Link to="/" className="mt-8 inline-block bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90">
        Continue shopping
      </Link>
    </div>
  );
}
