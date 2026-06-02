"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { hasRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/bookings";

import { DEMO_NO_DB } from "@/lib/mode";

/** Marca asistencia (check-in) de una reserva. Sólo admin/instructor. */
export async function checkInBooking(
  bookingId: string,
): Promise<ActionResult> {
  if (!(await hasRole("admin", "instructor"))) {
    return { ok: false, message: "No tienes permisos." };
  }
  if (DEMO_NO_DB) return { ok: true, message: "Asistencia registrada (demo)." };

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });
  if (!booking) return { ok: false, message: "Reserva no encontrada." };

  const next = booking.status === "asistio" ? "reservada" : "asistio";
  await db
    .update(bookings)
    .set({
      status: next,
      checkedInAt: next === "asistio" ? new Date() : null,
    })
    .where(eq(bookings.id, bookingId));

  revalidatePath("/admin/check-in");
  return {
    ok: true,
    message: next === "asistio" ? "Asistencia registrada." : "Check-in deshecho.",
  };
}

/** Marca un no-show. Sólo admin/instructor. */
export async function markNoShow(bookingId: string): Promise<ActionResult> {
  if (!(await hasRole("admin", "instructor"))) {
    return { ok: false, message: "No tienes permisos." };
  }
  if (DEMO_NO_DB) return { ok: true, message: "Marcado como no asistió (demo)." };
  await db
    .update(bookings)
    .set({ status: "no_show" })
    .where(eq(bookings.id, bookingId));
  revalidatePath("/admin/check-in");
  return { ok: true, message: "Marcado como no asistió." };
}
