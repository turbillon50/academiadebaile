import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { grantMembershipFromPayment } from "@/lib/membership";
import { DEMO_NO_DB } from "@/lib/mode";

// Stripe requiere el cuerpo crudo para verificar la firma.
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  if (DEMO_NO_DB) return NextResponse.json({ received: true });
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Falta firma." }, { status: 400 });
  }

  const payload = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      env.stripeWebhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firma inválida";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (userId && planId && session.payment_status === "paid") {
      try {
        await grantMembershipFromPayment({
          userId,
          planId,
          provider: "stripe",
          providerRef: session.id,
          amountCents: session.amount_total ?? 0,
          metadata: { stripeSessionId: session.id },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
