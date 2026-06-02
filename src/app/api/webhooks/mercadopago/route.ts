import { NextResponse } from "next/server";
import { Payment } from "mercadopago";

import { getMercadoPagoClient } from "@/lib/mercadopago";
import { grantMembershipFromPayment } from "@/lib/membership";
import { DEMO_NO_DB } from "@/lib/mode";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago (notificaciones de pago).
 * MP envía `type=payment` con el id; consultamos el pago para confirmar estado.
 *
 * TODO(seguridad): validar la firma `x-signature` con MERCADOPAGO_WEBHOOK_SECRET
 * según la documentación de MP antes de procesar en producción de alto volumen.
 */
export async function POST(req: Request): Promise<Response> {
  if (DEMO_NO_DB) return NextResponse.json({ received: true });
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const data = body as { type?: string; data?: { id?: string } };

    if (data.type !== "payment" || !data.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentClient = new Payment(getMercadoPagoClient());
    const payment = await paymentClient.get({ id: data.data.id });

    if (payment.status === "approved" && payment.external_reference) {
      const [userId, planId] = payment.external_reference.split("|");
      if (userId && planId) {
        await grantMembershipFromPayment({
          userId,
          planId,
          provider: "mercadopago",
          providerRef: String(payment.id),
          amountCents: Math.round((payment.transaction_amount ?? 0) * 100),
          metadata: { mpPaymentId: payment.id },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
