import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { membershipPlans, memberships, payments } from "@/db/schema";

/**
 * Otorga (o activa) una membresía tras un pago confirmado y registra el pago.
 * Idempotente por `providerRef`: si ya existe un pago con esa referencia, no
 * duplica nada.
 */
export async function grantMembershipFromPayment(params: {
  userId: string;
  planId: string;
  provider: "stripe" | "mercadopago";
  providerRef: string;
  amountCents: number;
  metadata?: unknown;
}): Promise<void> {
  const existing = await db.query.payments.findFirst({
    where: eq(payments.providerRef, params.providerRef),
  });
  if (existing && existing.status === "pagado") return;

  const plan = await db.query.membershipPlans.findFirst({
    where: eq(membershipPlans.id, params.planId),
  });
  if (!plan) {
    throw new Error(`Plan no encontrado: ${params.planId}`);
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + (plan.durationDays ?? 30));

  const [membership] = await db
    .insert(memberships)
    .values({
      userId: params.userId,
      planId: plan.id,
      status: "activa",
      creditsRemaining: plan.classCredits,
      startsAt: now,
      expiresAt,
    })
    .returning();

  await db.insert(payments).values({
    userId: params.userId,
    membershipId: membership?.id,
    amountCents: params.amountCents,
    currency: "MXN",
    provider: params.provider,
    status: "pagado",
    providerRef: params.providerRef,
    description: plan.name,
    metadata: params.metadata as never,
    paidAt: now,
  });
}
