/**
 * Esquema de base de datos — Academia de Baile
 * --------------------------------------------------------------------------
 * Modela el dominio completo: estilos, niveles, clases, horarios recurrentes,
 * sesiones, instructores, alumnos, reservas, asistencia, membresías/paquetes,
 * pagos y eventos con boletaje.
 *
 * Convenciones:
 * - PKs: uuid generado por la DB (gen_random_uuid()).
 * - Timestamps en UTC con `withTimezone`.
 * - Dinero en centavos (integer) para evitar errores de punto flotante.
 * - Enums de Postgres para estados acotados.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const userRole = pgEnum("user_role", ["alumno", "instructor", "admin"]);
export const danceLevel = pgEnum("dance_level", [
  "principiante",
  "intermedio",
  "avanzado",
]);
export const weekday = pgEnum("weekday", [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);
export const sessionStatus = pgEnum("session_status", [
  "programada",
  "en_curso",
  "completada",
  "cancelada",
]);
export const bookingStatus = pgEnum("booking_status", [
  "reservada",
  "asistio",
  "cancelada",
  "no_show",
]);
export const membershipKind = pgEnum("membership_kind", [
  "mensualidad",
  "paquete",
  "drop_in",
]);
export const membershipStatus = pgEnum("membership_status", [
  "activa",
  "vencida",
  "cancelada",
  "pendiente",
]);
export const paymentProvider = pgEnum("payment_provider", [
  "stripe",
  "mercadopago",
  "efectivo",
]);
export const paymentStatus = pgEnum("payment_status", [
  "pendiente",
  "pagado",
  "fallido",
  "reembolsado",
]);
export const eventStatus = pgEnum("event_status", [
  "borrador",
  "publicado",
  "agotado",
  "finalizado",
  "cancelado",
]);
export const ticketStatus = pgEnum("ticket_status", [
  "pendiente",
  "pagado",
  "usado",
  "cancelado",
]);

// ---------------------------------------------------------------------------
// Usuarios — espejo local de Clerk (sincronizado vía webhook)
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 191 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  phone: varchar("phone", { length: 40 }),
  imageUrl: text("image_url"),
  role: userRole("role").notNull().default("alumno"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Estilos de baile
// ---------------------------------------------------------------------------
export const styles = pgTable("styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  // Color de acento para la UI (hex). Da personalidad por estilo.
  accentColor: varchar("accent_color", { length: 9 }).default("#e11d48"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Instructores
// ---------------------------------------------------------------------------
export const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Opcional: vínculo a una cuenta de usuario (Clerk) con rol instructor.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  instagram: varchar("instagram", { length: 120 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relación N:M instructor ↔ estilo (especialidades).
export const instructorStyles = pgTable(
  "instructor_styles",
  {
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    styleId: uuid("style_id")
      .notNull()
      .references(() => styles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.instructorId, t.styleId] })],
);

// ---------------------------------------------------------------------------
// Salas
// ---------------------------------------------------------------------------
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  capacity: integer("capacity").notNull().default(20),
  notes: text("notes"),
});

// ---------------------------------------------------------------------------
// Clases (plantilla): estilo + nivel + instructor + cupo + duración + sala
// ---------------------------------------------------------------------------
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  styleId: uuid("style_id")
    .notNull()
    .references(() => styles.id, { onDelete: "restrict" }),
  level: danceLevel("level").notNull(),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "restrict" }),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
  capacity: integer("capacity").notNull().default(20),
  durationMin: integer("duration_min").notNull().default(60),
  description: text("description"),
  // Precio de drop-in (clase suelta) en centavos MXN.
  dropInPriceCents: integer("drop_in_price_cents").notNull().default(15000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Horarios recurrentes (regla semanal por clase)
// ---------------------------------------------------------------------------
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  weekday: weekday("weekday").notNull(),
  startTime: time("start_time").notNull(),
  // Fecha de vigencia de la regla (para generar sesiones a futuro).
  effectiveFrom: timestamp("effective_from", { withTimezone: true })
    .notNull()
    .defaultNow(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});

// ---------------------------------------------------------------------------
// Sesiones (instancia concreta de una clase en una fecha/hora)
// ---------------------------------------------------------------------------
export const classSessions = pgTable(
  "class_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    // Origen opcional: la regla recurrente que generó esta sesión.
    scheduleId: uuid("schedule_id").references(() => schedules.id, {
      onDelete: "set null",
    }),
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "restrict" }),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    capacity: integer("capacity").notNull().default(20),
    status: sessionStatus("status").notNull().default("programada"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Una clase no puede tener dos sesiones a la misma hora exacta.
  (t) => [unique("uq_session_class_start").on(t.classId, t.startsAt)],
);

// ---------------------------------------------------------------------------
// Reservas (alumno ↔ sesión)
// ---------------------------------------------------------------------------
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => classSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: bookingStatus("status").notNull().default("reservada"),
    // Membresía/paquete usado para cubrir esta reserva (si aplica).
    membershipId: uuid("membership_id").references(() => memberships.id, {
      onDelete: "set null",
    }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Un alumno solo puede reservar una vez la misma sesión.
  (t) => [unique("uq_booking_session_user").on(t.sessionId, t.userId)],
);

// ---------------------------------------------------------------------------
// Membresías y paquetes
// ---------------------------------------------------------------------------
export const membershipPlans = pgTable("membership_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  kind: membershipKind("kind").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  // Para "paquete": número de clases incluidas. Null = ilimitado (mensualidad).
  classCredits: integer("class_credits"),
  // Para "mensualidad": días de vigencia. Default 30.
  durationDays: integer("duration_days").default(30),
  // Id de precio en Stripe (modo suscripción/pago único), si se usa.
  stripePriceId: varchar("stripe_price_id", { length: 191 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => membershipPlans.id, { onDelete: "restrict" }),
  status: membershipStatus("status").notNull().default("pendiente"),
  // Créditos restantes para paquetes (null = ilimitado mientras esté activa).
  creditsRemaining: integer("credits_remaining"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Pagos (cubre membresías, drop-in y boletos de evento)
// ---------------------------------------------------------------------------
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  membershipId: uuid("membership_id").references(() => memberships.id, {
    onDelete: "set null",
  }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("MXN"),
  provider: paymentProvider("provider").notNull(),
  status: paymentStatus("status").notNull().default("pendiente"),
  // Referencia externa: PaymentIntent (Stripe) o payment id (Mercado Pago).
  providerRef: varchar("provider_ref", { length: 191 }),
  description: varchar("description", { length: 255 }),
  // Snapshot del payload del proveedor para auditoría/conciliación.
  metadata: jsonb("metadata"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Eventos / Talleres con boletaje
// ---------------------------------------------------------------------------
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  location: varchar("location", { length: 200 }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  priceCents: integer("price_cents").notNull().default(0),
  capacity: integer("capacity").notNull().default(100),
  status: eventStatus("status").notNull().default("borrador"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventTickets = pgTable("event_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id, {
    onDelete: "set null",
  }),
  status: ticketStatus("status").notNull().default("pendiente"),
  // Código único para el check-in en puerta (QR).
  code: varchar("code", { length: 40 }).notNull().unique(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Relaciones (para queries con `with`)
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  memberships: many(memberships),
  payments: many(payments),
  tickets: many(eventTickets),
}));

export const stylesRelations = relations(styles, ({ many }) => ({
  classes: many(classes),
  instructorStyles: many(instructorStyles),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  classes: many(classes),
  instructorStyles: many(instructorStyles),
}));

export const instructorStylesRelations = relations(
  instructorStyles,
  ({ one }) => ({
    instructor: one(instructors, {
      fields: [instructorStyles.instructorId],
      references: [instructors.id],
    }),
    style: one(styles, {
      fields: [instructorStyles.styleId],
      references: [styles.id],
    }),
  }),
);

export const classesRelations = relations(classes, ({ one, many }) => ({
  style: one(styles, { fields: [classes.styleId], references: [styles.id] }),
  instructor: one(instructors, {
    fields: [classes.instructorId],
    references: [instructors.id],
  }),
  room: one(rooms, { fields: [classes.roomId], references: [rooms.id] }),
  schedules: many(schedules),
  sessions: many(classSessions),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  class: one(classes, {
    fields: [schedules.classId],
    references: [classes.id],
  }),
}));

export const classSessionsRelations = relations(
  classSessions,
  ({ one, many }) => ({
    class: one(classes, {
      fields: [classSessions.classId],
      references: [classes.id],
    }),
    instructor: one(instructors, {
      fields: [classSessions.instructorId],
      references: [instructors.id],
    }),
    room: one(rooms, {
      fields: [classSessions.roomId],
      references: [rooms.id],
    }),
    bookings: many(bookings),
  }),
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  session: one(classSessions, {
    fields: [bookings.sessionId],
    references: [classSessions.id],
  }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  membership: one(memberships, {
    fields: [bookings.membershipId],
    references: [memberships.id],
  }),
}));

export const membershipPlansRelations = relations(
  membershipPlans,
  ({ many }) => ({
    memberships: many(memberships),
  }),
);

export const membershipsRelations = relations(
  memberships,
  ({ one, many }) => ({
    user: one(users, {
      fields: [memberships.userId],
      references: [users.id],
    }),
    plan: one(membershipPlans, {
      fields: [memberships.planId],
      references: [membershipPlans.id],
    }),
    payments: many(payments),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  membership: one(memberships, {
    fields: [payments.membershipId],
    references: [memberships.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  tickets: many(eventTickets),
}));

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  event: one(events, {
    fields: [eventTickets.eventId],
    references: [events.id],
  }),
  user: one(users, { fields: [eventTickets.userId], references: [users.id] }),
  payment: one(payments, {
    fields: [eventTickets.paymentId],
    references: [payments.id],
  }),
}));

// ---------------------------------------------------------------------------
// Tipos inferidos (para usar en toda la app sin `any`)
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Style = typeof styles.$inferSelect;
export type Instructor = typeof instructors.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type ClassSession = typeof classSessions.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type DanceEvent = typeof events.$inferSelect;
export type EventTicket = typeof eventTickets.$inferSelect;

export type UserRole = (typeof userRole.enumValues)[number];
export type DanceLevelValue = (typeof danceLevel.enumValues)[number];
export type BookingStatusValue = (typeof bookingStatus.enumValues)[number];
