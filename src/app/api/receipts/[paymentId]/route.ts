import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ paymentId: string }> },
): Promise<Response> {
  const user = await requireUser();
  const { paymentId } = await params;
  const payment = await db.query.payments.findFirst({
    where: and(eq(payments.id, paymentId), eq(payments.userId, user.id)),
    with: { user: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Recibo no encontrado." }, { status: 404 });
  }

  const name =
    [payment.user.firstName, payment.user.lastName].filter(Boolean).join(" ") ||
    payment.user.email;
  const receipt = [
    `${APP_NAME}`,
    "Recibo de pago",
    "",
    `Alumno: ${name}`,
    `Concepto: ${payment.description ?? "Mensualidad"}`,
    `Monto: ${formatCurrency(payment.amountCents, payment.currency)}`,
    `Proveedor: ${payment.provider}`,
    `Estado: ${payment.status}`,
    `Fecha: ${formatDate(payment.createdAt, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    `Referencia: ${payment.providerRef ?? payment.id}`,
  ].join("\n");

  return new Response(receipt, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="recibo-${payment.id}.txt"`,
    },
  });
}
