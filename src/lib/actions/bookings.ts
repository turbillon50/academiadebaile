"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { bookings, classSessions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { bookingInputSchema } from "@/lib/validations";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * Reserva una sesión para el alumno autenticado.
 * Valida cupo en tiempo real y evita reservas duplicadas.
 */
export async function reserveSession(sessionId: string): Promise<ActionResult> {
  const parsed = bookingInputSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { ok: false, message: "Sesión inválida." };
  }

  const user = await requireUser();

  const session = await db.query.classSessions.findFirst({
    where: eq(classSessions.id, parsed.data.sessionId),
  });
  if (!session) return { ok: false, message: "La sesión no existe." };
  if (session.status !== "programada") {
    return { ok: false, message: "Esta sesión ya no admite reservas." };
  }
  if (session.startsAt < new Date()) {
    return { ok: false, message: "Esta sesión ya comenzó." };
  }

  // ¿Ya tiene reserva activa?
  const existing = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.sessionId, session.id),
      eq(bookings.userId, user.id),
    ),
  });
  if (existing && existing.status !== "cancelada") {
    return { ok: false, message: "Ya tienes una reserva para esta clase." };
  }

  // Cupo en tiempo real.
  const [{ value: booked } = { value: 0 }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.sessionId, session.id),
        inArray(bookings.status, ["reservada", "asistio"]),
      ),
    );
  if (Number(booked) >= session.capacity) {
    return { ok: false, message: "Lo sentimos, ya no hay cupo." };
  }

  // TODO(membresías): descontar crédito de paquete o validar mensualidad activa
  // antes de confirmar. Por ahora la reserva es directa (drop-in se cobra aparte).
  if (existing) {
    await db
      .update(bookings)
      .set({ status: "reservada", cancelledAt: null })
      .where(eq(bookings.id, existing.id));
  } else {
    await db.insert(bookings).values({
      sessionId: session.id,
      userId: user.id,
      status: "reservada",
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/reservar");
  revalidatePath("/app/reservas");
  return { ok: true, message: "¡Reserva confirmada! Te esperamos en la pista." };
}

/** Cancela una reserva del alumno autenticado. */
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const user = await requireUser();

  const booking = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, bookingId), eq(bookings.userId, user.id)),
    with: { session: true },
  });
  if (!booking) return { ok: false, message: "Reserva no encontrada." };
  if (booking.status === "cancelada") {
    return { ok: false, message: "La reserva ya estaba cancelada." };
  }

  // Política: no se puede cancelar con menos de 2 horas de anticipación.
  const twoHours = 2 * 60 * 60 * 1000;
  if (booking.session.startsAt.getTime() - Date.now() < twoHours) {
    return {
      ok: false,
      message: "No es posible cancelar con menos de 2 horas de anticipación.",
    };
  }

  await db
    .update(bookings)
    .set({ status: "cancelada", cancelledAt: new Date() })
    .where(eq(bookings.id, booking.id));

  revalidatePath("/app/reservas");
  revalidatePath("/app");
  return { ok: true, message: "Reserva cancelada." };
}
