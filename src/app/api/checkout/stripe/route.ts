import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { membershipPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { checkoutInputSchema } from "@/lib/validations";

import { DEMO_NO_DB } from "@/lib/mode";

/** Crea una sesión de Stripe Checkout para comprar un plan de membresía. */
export async function POST(req: Request): Promise<Response> {
  if (DEMO_NO_DB) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return NextResponse.json({ url: `${appUrl}/app/membresia?pago=exito` });
  }
  try {
    const user = await requireUser();
    const body: unknown = await req.json();
    const parsed = checkoutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
    }

    const plan = await db.query.membershipPlans.findFirst({
      where: eq(membershipPlans.id, parsed.data.planId),
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado." }, { status: 404 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: plan.priceCents,
            product_data: { name: plan.name, description: plan.description ?? undefined },
          },
        },
      ],
      // Referencias para reconciliar en el webhook.
      client_reference_id: user.id,
      metadata: { userId: user.id, planId: plan.id },
      success_url: `${env.appUrl}/app/membresia?pago=exito`,
      cancel_url: `${env.appUrl}/app/membresia?pago=cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    // TODO(observabilidad): registrar en logger estructurado / Sentry.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
