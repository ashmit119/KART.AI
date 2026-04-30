import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const { clear: clearCart } = useCart();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Clear the cart immediately on landing
    clearCart();
    
    toast.success("Payment Successful!", {
      description: "Thank you for shopping with KART.AI.",
    });

    // Auto-redirect timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate({ to: "/", replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="h-24 w-24 rounded-full bg-mint flex items-center justify-center"
          >
            <CheckCircle2 className="h-12 w-12 text-mint-foreground" />
          </motion.div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Thank you for shopping with us!
          </h1>
          <p className="text-muted-foreground">
            Your payment was successful and your order has been placed. 
            A confirmation email will be sent to you shortly.
          </p>
        </div>

        <div className="pt-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Redirecting to home in <span className="font-bold text-foreground">{countdown}</span> seconds...
            </p>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-sage"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-all"
            >
              <Home className="h-4 w-4" />
              Go Home Now
            </button>
            <button
              onClick={() => navigate({ to: "/categories" })}
              className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-muted/80 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
