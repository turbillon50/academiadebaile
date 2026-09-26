import { getMercadoPagoPreference } from "@/lib/mercadopago";
import { env } from "@/lib/env";

export type CheckoutProvider = "mercadopago" | "stripe" | "efectivo";

export interface MercadoPagoCheckoutInput {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amountCents: number;
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export async function createMercadoPagoCheckoutUrl(
  input: MercadoPagoCheckoutInput,
): Promise<string | null> {
  const preference = getMercadoPagoPreference();
  const result = await preference.create({
    body: {
      items: [
        {
          id: input.planId,
          title: input.planName,
          quantity: 1,
          unit_price: input.amountCents / 100,
          currency_id: "MXN",
        },
      ],
      payer: { email: input.userEmail },
      external_reference: `${input.userId}|${input.planId}`,
      back_urls: {
        success: `${env.appUrl}/app/pagos?pago=exito`,
        failure: `${env.appUrl}/app/pagos?pago=cancelado`,
        pending: `${env.appUrl}/app/pagos?pago=pendiente`,
      },
      auto_return: "approved",
      notification_url: `${env.appUrl}/api/webhooks/mercadopago`,
    },
  });

  return result.init_point ?? null;
}

export function createDemoReceiptNumber(prefix = "FDS"): string {
  return `${prefix}-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
