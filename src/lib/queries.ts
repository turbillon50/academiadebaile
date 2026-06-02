/**
 * Capa de acceso a datos (lectura). Server-only.
 * Centraliza las consultas que usan las páginas para mantenerlas delgadas.
 */
import "server-only";
import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  bookings,
  classes,
  classSessions,
  events,
  instructors,
  instructorStyles,
  membershipPlans,
  memberships,
  payments,
  styles,
  users,
  type DanceLevelValue,
} from "@/db/schema";

export async function getActiveStyles() {
  return db.query.styles.findMany({
    where: eq(styles.isActive, true),
    orderBy: asc(styles.name),
  });
}

export async function getActiveInstructors() {
  const rows = await db.query.instructors.findMany({
    where: eq(instructors.isActive, true),
    orderBy: asc(instructors.fullName),
    with: {
      instructorStyles: { with: { style: true } },
    },
  });
  return rows.map((i) => ({
    ...i,
    styles: i.instructorStyles.map((is) => is.style),
  }));
}

export async function getInstructorBySlug(slug: string) {
  const row = await db.query.instructors.findFirst({
    where: eq(instructors.slug, slug),
    with: { instructorStyles: { with: { style: true } } },
  });
  if (!row) return null;
  return { ...row, styles: row.instructorStyles.map((is) => is.style) };
}

export interface ClassFilter {
  styleId?: string;
  level?: DanceLevelValue;
}

export async function getClasses(filter: ClassFilter = {}) {
  const conditions = [eq(classes.isActive, true)];
  if (filter.styleId) conditions.push(eq(classes.styleId, filter.styleId));
  if (filter.level) conditions.push(eq(classes.level, filter.level));

  return db.query.classes.findMany({
    where: and(...conditions),
    orderBy: asc(classes.name),
    with: {
      style: true,
      instructor: true,
      room: true,
      schedules: true,
    },
  });
}

/**
 * Próximas sesiones con cupo calculado (capacidad - reservas activas).
 */
export async function getUpcomingSessions(opts: {
  styleId?: string;
  level?: DanceLevelValue;
  limit?: number;
} = {}) {
  const sessions = await db.query.classSessions.findMany({
    where: and(
      gte(classSessions.startsAt, new Date()),
      eq(classSessions.status, "programada"),
    ),
    orderBy: asc(classSessions.startsAt),
    limit: opts.limit ?? 60,
    with: {
      class: { with: { style: true } },
      instructor: true,
      room: true,
    },
  });

  const filtered = sessions.filter((s) => {
    if (opts.styleId && s.class.styleId !== opts.styleId) return false;
    if (opts.level && s.class.level !== opts.level) return false;
    return true;
  });

  if (filtered.length === 0) return [];

  const counts = await db
    .select({
      sessionId: bookings.sessionId,
      total: count(),
    })
    .from(bookings)
    .where(
      and(
        inArray(
          bookings.sessionId,
          filtered.map((s) => s.id),
        ),
        inArray(bookings.status, ["reservada", "asistio"]),
      ),
    )
    .groupBy(bookings.sessionId);

  const countMap = new Map(counts.map((c) => [c.sessionId, Number(c.total)]));

  return filtered.map((s) => {
    const booked = countMap.get(s.id) ?? 0;
    return { ...s, booked, available: Math.max(s.capacity - booked, 0) };
  });
}

export async function getMembershipPlans() {
  return db.query.membershipPlans.findMany({
    where: eq(membershipPlans.isActive, true),
    orderBy: asc(membershipPlans.priceCents),
  });
}

export async function getPublishedEvents() {
  return db.query.events.findMany({
    where: inArray(events.status, ["publicado", "agotado"]),
    orderBy: asc(events.startsAt),
  });
}

// ---------------------------------------------------------------------------
// Alumno
// ---------------------------------------------------------------------------
export async function getUserBookings(userId: string) {
  return db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    orderBy: desc(bookings.createdAt),
    with: {
      session: {
        with: { class: { with: { style: true } }, instructor: true, room: true },
      },
    },
  });
}

export async function getActiveMembership(userId: string) {
  return db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.status, "activa"),
    ),
    orderBy: desc(memberships.createdAt),
    with: { plan: true },
  });
}

export async function getUserPayments(userId: string) {
  return db.query.payments.findMany({
    where: eq(payments.userId, userId),
    orderBy: desc(payments.createdAt),
  });
}

// ---------------------------------------------------------------------------
// Admin — KPIs
// ---------------------------------------------------------------------------
export async function getAdminKpis() {
  const [
    activeStudents,
    upcomingSessionsCount,
    revenueRow,
    attendanceRows,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(memberships)
      .where(eq(memberships.status, "activa")),
    db
      .select({ value: count() })
      .from(classSessions)
      .where(gte(classSessions.startsAt, new Date())),
    db
      .select({ value: sql<number>`coalesce(sum(${payments.amountCents}), 0)` })
      .from(payments)
      .where(eq(payments.status, "pagado")),
    db
      .select({ status: bookings.status, value: count() })
      .from(bookings)
      .groupBy(bookings.status),
  ]);

  const totalBookings = attendanceRows.reduce(
    (acc, r) => acc + Number(r.value),
    0,
  );
  const attended =
    attendanceRows.find((r) => r.status === "asistio")?.value ?? 0;
  const attendanceRate =
    totalBookings > 0 ? Math.round((Number(attended) / totalBookings) * 100) : 0;

  return {
    activeStudents: Number(activeStudents[0]?.value ?? 0),
    upcomingSessions: Number(upcomingSessionsCount[0]?.value ?? 0),
    revenueCents: Number(revenueRow[0]?.value ?? 0),
    attendanceRate,
  };
}

export async function getRecentPayments(limit = 20) {
  return db.query.payments.findMany({
    orderBy: desc(payments.createdAt),
    limit,
    with: { user: true },
  });
}

export async function getAllStylesAdmin() {
  return db.query.styles.findMany({ orderBy: asc(styles.name) });
}

export async function getAllInstructorsAdmin() {
  return db.query.instructors.findMany({ orderBy: asc(instructors.fullName) });
}

export async function getAllClassesAdmin() {
  return db.query.classes.findMany({
    orderBy: asc(classes.name),
    with: { style: true, instructor: true, room: true },
  });
}

export async function getAllEventsAdmin() {
  return db.query.events.findMany({ orderBy: desc(events.startsAt) });
}

export async function getRoomsAdmin() {
  return db.query.rooms.findMany();
}

export async function getInstructorStyleIds(instructorId: string) {
  const rows = await db.query.instructorStyles.findMany({
    where: eq(instructorStyles.instructorId, instructorId),
  });
  return rows.map((r) => r.styleId);
}

export async function getAllUsersAdmin() {
  return db.query.users.findMany({
    orderBy: desc(users.createdAt),
    with: { memberships: { with: { plan: true } } },
  });
}

/** Sesiones de hoy con sus reservas, para el módulo de check-in. */
export async function getTodaySessionsForCheckIn() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db.query.classSessions.findMany({
    where: and(
      gte(classSessions.startsAt, start),
      sql`${classSessions.startsAt} < ${end.toISOString()}`,
    ),
    orderBy: asc(classSessions.startsAt),
    with: {
      class: { with: { style: true } },
      instructor: true,
      bookings: { with: { user: true } },
    },
  });
}
