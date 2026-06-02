import { MercadoPagoConfig, Preference } from "mercadopago";

import { env } from "./env";

/**
 * Cliente de Mercado Pago (servidor). Instanciación perezosa para no romper
 * el build cuando el token aún no está configurado.
 */
let _client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!_client) {
    _client = new MercadoPagoConfig({
      accessToken: env.mercadoPagoAccessToken,
      options: { timeout: 8000 },
    });
  }
  return _client;
}

export function getMercadoPagoPreference(): Preference {
  return new Preference(getMercadoPagoClient());
}
