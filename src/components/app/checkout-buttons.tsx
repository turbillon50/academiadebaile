"use client";

import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Provider = "stripe" | "mercadopago";

export function CheckoutButtons({ planId }: { planId: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);

  async function checkout(provider: Provider) {
    setLoading(provider);
    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo iniciar el pago.");
      }
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al pagar.";
      toast.error(message);
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => checkout("stripe")}
        loading={loading === "stripe"}
        disabled={loading !== null}
        className="w-full"
      >
        {loading !== "stripe" ? <CreditCard className="size-4" /> : null}
        Pagar con tarjeta
      </Button>
      <Button
        onClick={() => checkout("mercadopago")}
        loading={loading === "mercadopago"}
        disabled={loading !== null}
        variant="outline"
        className="w-full"
      >
        {loading !== "mercadopago" ? <Wallet className="size-4" /> : null}
        Pagar con Mercado Pago
      </Button>
    </div>
  );
}
