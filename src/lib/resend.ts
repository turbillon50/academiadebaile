import { Resend } from "resend";

import { env } from "./env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env.resendApiKey);
  }
  return _resend;
}

/** Envía un correo transaccional simple. No revienta el flujo si falla. */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: env.resendFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    // TODO(observabilidad): enviar a Sentry/log estructurado.
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: message };
  }
}
