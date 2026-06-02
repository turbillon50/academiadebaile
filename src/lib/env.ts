/**
 * Acceso tipado a variables de entorno del servidor.
 * Lanza error temprano y claro si falta algo crítico en runtime.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get mercadoPagoAccessToken() {
    return required("MERCADOPAGO_ACCESS_TOKEN");
  },
  mercadoPagoWebhookSecret: optional("MERCADOPAGO_WEBHOOK_SECRET"),
  get resendApiKey() {
    return required("RESEND_API_KEY");
  },
  resendFrom:
    process.env.RESEND_FROM_EMAIL ?? "Academia de Baile <onboarding@resend.dev>",
  clerkWebhookSecret: optional("CLERK_WEBHOOK_SECRET"),
  n8nReminderWebhookUrl: optional("N8N_REMINDER_WEBHOOK_URL"),
  n8nWebhookSecret: optional("N8N_WEBHOOK_SECRET"),
} as const;
