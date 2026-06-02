import Stripe from "stripe";

import { env } from "./env";

/**
 * Cliente de Stripe (servidor). Se instancia perezosamente para no romper
 * el build cuando la clave aún no está configurada (p. ej. en CI sin secretos).
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey, {
      // Fijamos versión de API para builds reproducibles.
      apiVersion: "2026-05-27.dahlia",
      appInfo: { name: "Academia de Baile", version: "1.0.0" },
    });
  }
  return _stripe;
}
