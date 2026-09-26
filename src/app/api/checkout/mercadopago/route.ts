import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { membershipPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { checkoutInputSchema } from "@/lib/validations";
import { createMercadoPagoCheckoutUrl } from "@/services/payments";

/** Crea una preferencia de Mercado Pago (Checkout Pro) para un plan. */
export async function POST(req: Request): Promise<Response> {
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

    const url = await createMercadoPagoCheckoutUrl({
      userId: user.id,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.name,
      amountCents: plan.priceCents,
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
