"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { profileInputSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/bookings";

const DEMO_NO_DB = process.env.DEMO_MODE === "1" && !process.env.DATABASE_URL;

/** Actualiza el perfil local (teléfono, nombre) del alumno autenticado. */
export async function updateProfile(
  formData: FormData,
): Promise<ActionResult> {
  if (DEMO_NO_DB) return { ok: true, message: "Perfil actualizado (demo)." };
  const user = await requireUser();
  const parsed = profileInputSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await db
    .update(users)
    .set({
      firstName: parsed.data.firstName ?? user.firstName,
      lastName: parsed.data.lastName ?? user.lastName,
      phone: parsed.data.phone || user.phone,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // TODO(Clerk): sincronizar nombre/teléfono de vuelta a Clerk con clerkClient
  // para mantener una sola fuente de verdad en el proveedor de identidad.

  revalidatePath("/app/perfil");
  return { ok: true, message: "Perfil actualizado." };
}
