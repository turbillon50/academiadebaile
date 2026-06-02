import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { membershipPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getMercadoPagoPreference } from "@/lib/mercadopago";
import { checkoutInputSchema } from "@/lib/validations";

const DEMO_NO_DB = process.env.DEMO_MODE === "1" && !process.env.DATABASE_URL;

/** Crea una preferencia de Mercado Pago (Checkout Pro) para un plan. */
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

    const preference = getMercadoPagoPreference();
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: plan.name,
            quantity: 1,
            unit_price: plan.priceCents / 100,
            currency_id: "MXN",
          },
        ],
        payer: { email: user.email },
        // Referencia para reconciliar en el webhook: userId|planId.
        external_reference: `${user.id}|${plan.id}`,
        back_urls: {
          success: `${env.appUrl}/app/membresia?pago=exito`,
          failure: `${env.appUrl}/app/membresia?pago=cancelado`,
          pending: `${env.appUrl}/app/membresia?pago=pendiente`,
        },
        auto_return: "approved",
        notification_url: `${env.appUrl}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
