import { NextResponse } from "next/server";
import { and, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { env } from "@/lib/env";
import { DEMO_NO_DB } from "@/lib/mode";

export const runtime = "nodejs";

/**
 * Cron diario (configurar en vercel.json) que dispara recordatorios de las
 * clases de mañana hacia un webhook de n8n, el cual envía WhatsApp/SMS.
 *
 * Seguridad: protegido por `Authorization: Bearer <N8N_WEBHOOK_SECRET>` o por
 * el header `x-vercel-cron` que añade Vercel a sus crons.
 */
export async function GET(req: Request): Promise<Response> {
  const isVercelCron = req.headers.get("x-vercel-cron") !== null;
  const auth = req.headers.get("authorization");
  const authorized =
    isVercelCron ||
    (env.n8nWebhookSecret && auth === `Bearer ${env.n8nWebhookSecret}`);

  if (!authorized) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (DEMO_NO_DB) {
    return NextResponse.json({ count: 0 });
  }

  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const sessions = await db.query.classSessions.findMany({
    where: and(
      gte(classSessions.startsAt, start),
      lt(classSessions.startsAt, end),
    ),
    with: {
      class: true,
      bookings: { with: { user: true } },
    },
  });

  const reminders = sessions.flatMap((s) =>
    s.bookings
      .filter((b) => b.status === "reservada" && b.user.phone)
      .map((b) => ({
        phone: b.user.phone,
        name: b.user.firstName ?? "alumno/a",
        className: s.class.name,
        startsAt: s.startsAt.toISOString(),
      })),
  );

  // Si hay webhook de n8n configurado, lo disparamos; si no, sólo reportamos.
  if (env.n8nReminderWebhookUrl && reminders.length > 0) {
    await fetch(env.n8nReminderWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.n8nWebhookSecret
          ? { "x-webhook-secret": env.n8nWebhookSecret }
          : {}),
      },
      body: JSON.stringify({ reminders }),
    }).catch(() => {
      // TODO(observabilidad): registrar fallo de entrega a n8n.
    });
  }

  return NextResponse.json({ count: reminders.length });
}
