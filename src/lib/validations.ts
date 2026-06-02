/** Esquemas Zod compartidos por formularios y route handlers. */
import { z } from "zod";

export const danceLevelSchema = z.enum([
  "principiante",
  "intermedio",
  "avanzado",
]);

export const weekdaySchema = z.enum([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);

export const styleInputSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120),
  description: z.string().max(2000).optional(),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Color hex inválido")
    .optional(),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const instructorInputSchema = z.object({
  fullName: z.string().min(3, "Nombre completo requerido").max(160),
  bio: z.string().max(3000).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(120).optional(),
  styleIds: z.array(z.string().uuid()).default([]),
  isActive: z.boolean().default(true),
});

export const classInputSchema = z.object({
  name: z.string().min(3).max(160),
  styleId: z.string().uuid("Selecciona un estilo"),
  level: danceLevelSchema,
  instructorId: z.string().uuid("Selecciona un instructor"),
  roomId: z.string().uuid().optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(1).max(200),
  durationMin: z.coerce.number().int().min(15).max(240),
  description: z.string().max(2000).optional(),
  dropInPriceCents: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const scheduleInputSchema = z.object({
  classId: z.string().uuid(),
  weekday: weekdaySchema,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm requerido"),
});

export const bookingInputSchema = z.object({
  sessionId: z.string().uuid("Sesión inválida"),
});

export const checkoutInputSchema = z.object({
  planId: z.string().uuid("Plan inválido"),
});

export const eventInputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(4000).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  // Acepta el formato de <input type="datetime-local"> (sin zona horaria).
  startsAt: z.coerce.date({ message: "Fecha/hora inválida" }),
  endsAt: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.date().optional(),
  ),
  priceCents: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1).max(5000),
  status: z.enum([
    "borrador",
    "publicado",
    "agotado",
    "finalizado",
    "cancelado",
  ]),
});

export const profileInputSchema = z.object({
  firstName: z.string().min(1).max(120).optional(),
  lastName: z.string().min(1).max(120).optional(),
  phone: z
    .string()
    .regex(/^[\d\s()+-]{8,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
});

export const checkInInputSchema = z.object({
  bookingId: z.string().uuid(),
});

export type ClassInput = z.infer<typeof classInputSchema>;
export type InstructorInput = z.infer<typeof instructorInputSchema>;
export type StyleInput = z.infer<typeof styleInputSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
