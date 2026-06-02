"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  classes,
  events,
  instructors,
  instructorStyles,
  styles,
} from "@/db/schema";
import { hasRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  classInputSchema,
  eventInputSchema,
  instructorInputSchema,
  styleInputSchema,
} from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/bookings";

const DEMO_NO_DB = process.env.DEMO_MODE === "1" && !process.env.DATABASE_URL;

async function ensureAdmin(): Promise<ActionResult | null> {
  if (!(await hasRole("admin"))) {
    return { ok: false, message: "Necesitas permisos de administrador." };
  }
  return null;
}

/** Convierte FormData a objeto plano (las casillas vienen como "on"/null). */
function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value;
  }
  return obj;
}

// --------------------------- Estilos ---------------------------
export async function upsertStyle(
  formData: FormData,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Estilo guardado (demo)." };

  const raw = formToObject(formData);
  const parsed = styleInputSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const data = parsed.data;
  const values = {
    name: data.name,
    slug: slugify(data.name),
    description: data.description ?? null,
    accentColor: data.accentColor ?? "#e11d48",
    imageUrl: data.imageUrl || null,
    isActive: data.isActive,
  };

  if (id) {
    await db.update(styles).set(values).where(eq(styles.id, id));
  } else {
    await db.insert(styles).values(values);
  }
  revalidatePath("/admin/estilos");
  return { ok: true, message: "Estilo guardado." };
}

export async function deleteStyle(id: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Estilo eliminado (demo)." };
  await db.delete(styles).where(eq(styles.id, id));
  revalidatePath("/admin/estilos");
  return { ok: true, message: "Estilo eliminado." };
}

// --------------------------- Instructores ---------------------------
export async function upsertInstructor(
  formData: FormData,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Instructor guardado (demo)." };

  const raw = formToObject(formData);
  const styleIds = formData.getAll("styleIds").map(String);
  const parsed = instructorInputSchema.safeParse({
    ...raw,
    styleIds,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const data = parsed.data;
  const values = {
    fullName: data.fullName,
    slug: slugify(data.fullName),
    bio: data.bio ?? null,
    photoUrl: data.photoUrl || null,
    instagram: data.instagram ?? null,
    isActive: data.isActive,
  };

  let instructorId = id;
  if (id) {
    await db.update(instructors).set(values).where(eq(instructors.id, id));
  } else {
    const [row] = await db.insert(instructors).values(values).returning();
    instructorId = row?.id ?? null;
  }

  if (instructorId) {
    await db
      .delete(instructorStyles)
      .where(eq(instructorStyles.instructorId, instructorId));
    if (data.styleIds.length > 0) {
      await db.insert(instructorStyles).values(
        data.styleIds.map((styleId) => ({
          instructorId: instructorId as string,
          styleId,
        })),
      );
    }
  }

  revalidatePath("/admin/instructores");
  return { ok: true, message: "Instructor guardado." };
}

export async function deleteInstructor(id: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Instructor eliminado (demo)." };
  await db.delete(instructors).where(eq(instructors.id, id));
  revalidatePath("/admin/instructores");
  return { ok: true, message: "Instructor eliminado." };
}

// --------------------------- Clases ---------------------------
export async function upsertClass(formData: FormData): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Clase guardada (demo)." };

  const raw = formToObject(formData);
  const parsed = classInputSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const data = parsed.data;
  const values = {
    name: data.name,
    slug: slugify(data.name),
    styleId: data.styleId,
    level: data.level,
    instructorId: data.instructorId,
    roomId: data.roomId || null,
    capacity: data.capacity,
    durationMin: data.durationMin,
    description: data.description ?? null,
    dropInPriceCents: data.dropInPriceCents,
    isActive: data.isActive,
  };

  if (id) {
    await db.update(classes).set(values).where(eq(classes.id, id));
  } else {
    await db.insert(classes).values(values);
  }
  revalidatePath("/admin/clases");
  return { ok: true, message: "Clase guardada." };
}

export async function deleteClass(id: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Clase eliminada (demo)." };
  await db.delete(classes).where(eq(classes.id, id));
  revalidatePath("/admin/clases");
  return { ok: true, message: "Clase eliminada." };
}

// --------------------------- Eventos ---------------------------
export async function upsertEvent(formData: FormData): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Evento guardado (demo)." };

  const raw = formToObject(formData);
  const parsed = eventInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const data = parsed.data;
  const values = {
    title: data.title,
    slug: slugify(data.title),
    description: data.description ?? null,
    coverUrl: data.coverUrl || null,
    location: data.location ?? null,
    startsAt: data.startsAt,
    endsAt: data.endsAt ?? null,
    priceCents: data.priceCents,
    capacity: data.capacity,
    status: data.status,
  };

  if (id) {
    await db.update(events).set(values).where(eq(events.id, id));
  } else {
    await db.insert(events).values(values);
  }
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { ok: true, message: "Evento guardado." };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (guard) return guard;
  if (DEMO_NO_DB) return { ok: true, message: "Evento eliminado (demo)." };
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/eventos");
  return { ok: true, message: "Evento eliminado." };
}
