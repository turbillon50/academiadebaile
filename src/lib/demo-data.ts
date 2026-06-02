/**
 * Datos mock para DEMO_MODE=1 sin base de datos (despliegue en Vercel sin credenciales).
 * Se activan cuando DEMO_MODE=1 y DATABASE_URL no está configurado.
 */
import type {
  User, Style, Instructor, Room, Class, ClassSession,
  MembershipPlan, Membership, Payment, DanceEvent,
} from "@/db/schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

function future(offsetDays: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function past(offsetDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d;
}

function endOf(start: Date, durationMin = 90): Date {
  return new Date(start.getTime() + durationMin * 60 * 1000);
}

// ── Usuarios ─────────────────────────────────────────────────────────────────

export const DEMO_USER_ALUMNO: User = {
  id: "demo-alumno-id",
  clerkId: "demo-user",
  email: "valeria@fdacademy.mx",
  firstName: "Valeria",
  lastName: "Martínez",
  phone: "55 1234 5678",
  imageUrl: null,
  role: "alumno",
  createdAt: past(120),
  updatedAt: new Date(),
};

export const DEMO_USER_ADMIN: User = {
  id: "demo-admin-id",
  clerkId: "demo-user",
  email: "admin@fdacademy.mx",
  firstName: "Admin",
  lastName: "Demo",
  phone: null,
  imageUrl: null,
  role: "admin",
  createdAt: past(365),
  updatedAt: new Date(),
};

// ── Estilos ───────────────────────────────────────────────────────────────────

export const DEMO_STYLES: Style[] = [
  { id: "s1", slug: "ballet", name: "Ballet", description: "Técnica clásica y elegancia.", imageUrl: null, accentColor: "#c2c1ff", isActive: true, createdAt: past(300) },
  { id: "s2", slug: "jazz", name: "Jazz Funk", description: "Energía urbana y ritmo moderno.", imageUrl: null, accentColor: "#3e90ff", isActive: true, createdAt: past(300) },
  { id: "s3", slug: "hiphop", name: "Hip Hop", description: "Freestyle y expresión urbana.", imageUrl: null, accentColor: "#47e266", isActive: true, createdAt: past(300) },
  { id: "s4", slug: "salsa", name: "Salsa", description: "Sabor latino y movimiento.", imageUrl: null, accentColor: "#ffb4ab", isActive: true, createdAt: past(300) },
  { id: "s5", slug: "contemporaneo", name: "Contemporáneo", description: "Expresión artística sin límites.", imageUrl: null, accentColor: "#aac7ff", isActive: true, createdAt: past(300) },
  { id: "s6", slug: "urbano", name: "Urbano", description: "Street dance y cultura de calle.", imageUrl: null, accentColor: "#ffd54f", isActive: true, createdAt: past(300) },
];

// ── Instructores ──────────────────────────────────────────────────────────────

export const DEMO_INSTRUCTORS_RAW: Instructor[] = [
  { id: "i1", userId: null, fullName: "Ana Rodríguez", slug: "ana-rodriguez", bio: "16 años de experiencia en ballet clásico y contemporáneo.", photoUrl: null, instagram: "@ana.baila", isActive: true, createdAt: past(200) },
  { id: "i2", userId: null, fullName: "Carlos Méndez", slug: "carlos-mendez", bio: "Especialista en Jazz Funk y Hip Hop urbano.", photoUrl: null, instagram: "@carlos_mendez", isActive: true, createdAt: past(180) },
  { id: "i3", userId: null, fullName: "Silvana Torres", slug: "silvana-torres", bio: "Coreógrafa contemporánea y maestra de técnica urbana.", photoUrl: null, instagram: "@silvana.torres", isActive: true, createdAt: past(150) },
];

export const DEMO_INSTRUCTORS = DEMO_INSTRUCTORS_RAW.map((i, idx) => ({
  ...i,
  styles: idx === 0
    ? [DEMO_STYLES[0]!, DEMO_STYLES[4]!]
    : idx === 1
      ? [DEMO_STYLES[1]!, DEMO_STYLES[2]!]
      : [DEMO_STYLES[4]!, DEMO_STYLES[5]!],
}));

// ── Salas ─────────────────────────────────────────────────────────────────────

export const DEMO_ROOMS: Room[] = [
  { id: "r1", name: "Salón 1", capacity: 20, notes: null },
  { id: "r2", name: "Salón 2", capacity: 18, notes: null },
  { id: "r3", name: "Salón 3", capacity: 15, notes: null },
];

// ── Clases ────────────────────────────────────────────────────────────────────

export const DEMO_CLASSES_RAW: Class[] = [
  { id: "c1", name: "Ballet Clásico", slug: "ballet-clasico", styleId: "s1", level: "principiante", instructorId: "i1", roomId: "r1", capacity: 20, durationMin: 90, description: "Ballet clásico para principiantes e intermedios.", dropInPriceCents: 15000, isActive: true, createdAt: past(100) },
  { id: "c2", name: "Jazz Funk", slug: "jazz-funk", styleId: "s2", level: "intermedio", instructorId: "i2", roomId: "r2", capacity: 18, durationMin: 90, description: "Jazz Funk con energía urbana.", dropInPriceCents: 15000, isActive: true, createdAt: past(100) },
  { id: "c3", name: "Hip Hop Urbano", slug: "hip-hop-urbano", styleId: "s3", level: "principiante", instructorId: "i2", roomId: "r3", capacity: 15, durationMin: 60, description: "Hip Hop freestyle para todos los niveles.", dropInPriceCents: 12000, isActive: true, createdAt: past(90) },
  { id: "c4", name: "Salsa Social", slug: "salsa-social", styleId: "s4", level: "principiante", instructorId: "i1", roomId: "r1", capacity: 20, durationMin: 60, description: "Aprende a bailar salsa en pareja.", dropInPriceCents: 12000, isActive: true, createdAt: past(80) },
];

// ── Sesiones próximas ─────────────────────────────────────────────────────────

function makeSession(
  id: string, cls: Class, instructor: Instructor, room: Room,
  start: Date, booked = 8,
): ClassSession & { booked: number; available: number; class: Class & { style: Style }; instructor: Instructor; room: Room } {
  const style = DEMO_STYLES.find((s) => s.id === cls.styleId)!;
  return {
    id, classId: cls.id, scheduleId: null, instructorId: instructor.id,
    roomId: room.id, startsAt: start, endsAt: endOf(start, cls.durationMin),
    capacity: cls.capacity, status: "programada", notes: null, createdAt: past(30),
    booked, available: cls.capacity - booked,
    class: { ...cls, style },
    instructor,
    room,
  };
}

const c1 = DEMO_CLASSES_RAW[0]!;
const c2 = DEMO_CLASSES_RAW[1]!;
const c3 = DEMO_CLASSES_RAW[2]!;
const c4 = DEMO_CLASSES_RAW[3]!;
const i1 = DEMO_INSTRUCTORS_RAW[0]!;
const i2 = DEMO_INSTRUCTORS_RAW[1]!;
const r1 = DEMO_ROOMS[0]!;
const r2 = DEMO_ROOMS[1]!;
const r3 = DEMO_ROOMS[2]!;

export const DEMO_SESSIONS = [
  makeSession("ses1", c1, i1, r1, future(1, 16, 0), 12),
  makeSession("ses2", c2, i2, r2, future(1, 18, 0), 8),
  makeSession("ses3", c3, i2, r3, future(2, 10, 0), 5),
  makeSession("ses4", c4, i1, r1, future(2, 12, 0), 15),
  makeSession("ses5", c1, i1, r1, future(3, 16, 0), 10),
  makeSession("ses6", c2, i2, r2, future(3, 18, 0), 14),
  makeSession("ses7", c3, i2, r3, future(5, 10, 0), 3),
  makeSession("ses8", c4, i1, r1, future(5, 12, 0), 18),
  makeSession("ses9", c1, i1, r1, future(7, 16, 0), 6),
  makeSession("ses10", c2, i2, r2, future(7, 18, 0), 9),
  makeSession("ses11", c3, i2, r3, future(8, 10, 0), 2),
  makeSession("ses12", c4, i1, r1, future(9, 12, 0), 11),
];

// ── Membresías / Planes ───────────────────────────────────────────────────────

export const DEMO_PLANS: MembershipPlan[] = [
  { id: "p1", slug: "mensualidad", name: "Mensualidad Ilimitada", kind: "mensualidad", description: "Clases ilimitadas durante 30 días.", priceCents: 85000, classCredits: null, durationDays: 30, stripePriceId: null, isActive: true, createdAt: past(200) },
  { id: "p2", slug: "paquete-8", name: "Paquete 8 Clases", kind: "paquete", description: "Ocho clases para usar en 45 días.", priceCents: 65000, classCredits: 8, durationDays: 45, stripePriceId: null, isActive: true, createdAt: past(200) },
  { id: "p3", slug: "paquete-4", name: "Paquete 4 Clases", kind: "paquete", description: "Cuatro clases para usar en 30 días.", priceCents: 35000, classCredits: 4, durationDays: 30, stripePriceId: null, isActive: true, createdAt: past(200) },
  { id: "p4", slug: "drop-in", name: "Clase Suelta", kind: "drop_in", description: "Acceso a una sola clase.", priceCents: 15000, classCredits: 1, durationDays: 1, stripePriceId: null, isActive: true, createdAt: past(200) },
];

export const DEMO_MEMBERSHIP: Membership & { plan: MembershipPlan } = {
  id: "mem1",
  userId: "demo-alumno-id",
  planId: "p1",
  status: "activa",
  creditsRemaining: null,
  startsAt: past(5),
  expiresAt: future(25),
  createdAt: past(5),
  plan: DEMO_PLANS[0]!,
};

// ── Reservas del alumno demo ──────────────────────────────────────────────────

export const DEMO_BOOKINGS = [
  {
    id: "b1", sessionId: "ses1", userId: "demo-alumno-id", status: "reservada" as const,
    membershipId: "mem1", checkedInAt: null, cancelledAt: null, createdAt: past(2),
    session: DEMO_SESSIONS[0]!,
  },
  {
    id: "b2", sessionId: "ses2", userId: "demo-alumno-id", status: "reservada" as const,
    membershipId: "mem1", checkedInAt: null, cancelledAt: null, createdAt: past(2),
    session: DEMO_SESSIONS[1]!,
  },
  {
    id: "b3", sessionId: "ses-past1", userId: "demo-alumno-id", status: "asistio" as const,
    membershipId: "mem1", checkedInAt: past(7), cancelledAt: null, createdAt: past(10),
    session: { ...DEMO_SESSIONS[0]!, id: "ses-past1", startsAt: past(7), endsAt: past(7) },
  },
];

// ── Pagos del alumno ──────────────────────────────────────────────────────────

export const DEMO_PAYMENTS: Payment[] = [
  { id: "pay1", userId: "demo-alumno-id", membershipId: "mem1", amountCents: 85000, currency: "MXN", provider: "stripe", status: "pagado", providerRef: "pi_demo_001", description: "Mensualidad Ilimitada", metadata: null, paidAt: past(5), createdAt: past(5) },
];

// ── Eventos ───────────────────────────────────────────────────────────────────

export const DEMO_EVENTS: DanceEvent[] = [
  { id: "ev1", slug: "presentacion-fin-cursos", title: "Presentación de Fin de Cursos", description: "Gran presentación anual con todos los estilos.", coverUrl: null, location: "Teatro de la Ciudad", startsAt: future(28, 17, 0), endsAt: future(28, 20, 0), priceCents: 20000, capacity: 200, status: "publicado", createdAt: past(60) },
  { id: "ev2", slug: "taller-hip-hop", title: "Taller de Hip Hop", description: "Taller intensivo de un día con instructor invitado.", coverUrl: null, location: "Salón 3 - FDS Academy", startsAt: future(14, 11, 0), endsAt: future(14, 14, 0), priceCents: 30000, capacity: 30, status: "publicado", createdAt: past(30) },
];

// ── KPIs Admin ────────────────────────────────────────────────────────────────

export const DEMO_KPIS = {
  activeStudents: 128,
  upcomingSessions: 24,
  revenueCents: 6800000,
  attendanceRate: 94,
};

// ── Pagos recientes (admin) ───────────────────────────────────────────────────

export const DEMO_RECENT_PAYMENTS = [
  { id: "rp1", userId: "demo-alumno-id", membershipId: "mem1", amountCents: 85000, currency: "MXN", provider: "stripe" as const, status: "pagado" as const, providerRef: "pi_demo_001", description: "Mensualidad Ilimitada", metadata: null, paidAt: past(1), createdAt: past(1), user: DEMO_USER_ALUMNO },
  { id: "rp2", userId: "u2", membershipId: "mem2", amountCents: 65000, currency: "MXN", provider: "mercadopago" as const, status: "pagado" as const, providerRef: "mp_demo_002", description: "Paquete 8 Clases", metadata: null, paidAt: past(2), createdAt: past(2), user: { ...DEMO_USER_ALUMNO, id: "u2", firstName: "Marco", lastName: "García", email: "marco@demo.mx" } },
  { id: "rp3", userId: "u3", membershipId: "mem3", amountCents: 85000, currency: "MXN", provider: "stripe" as const, status: "pagado" as const, providerRef: "pi_demo_003", description: "Mensualidad Ilimitada", metadata: null, paidAt: past(3), createdAt: past(3), user: { ...DEMO_USER_ALUMNO, id: "u3", firstName: "Sofía", lastName: "López", email: "sofia@demo.mx" } },
  { id: "rp4", userId: "u4", membershipId: null, amountCents: 15000, currency: "MXN", provider: "efectivo" as const, status: "pagado" as const, providerRef: null, description: "Clase Suelta", metadata: null, paidAt: past(4), createdAt: past(4), user: { ...DEMO_USER_ALUMNO, id: "u4", firstName: "Luis", lastName: "Herrera", email: "luis@demo.mx" } },
];

// ── Alumnos (admin) ───────────────────────────────────────────────────────────

export const DEMO_USERS_ADMIN = [
  { ...DEMO_USER_ALUMNO, memberships: [{ ...DEMO_MEMBERSHIP }] },
  { ...DEMO_USER_ALUMNO, id: "u2", firstName: "Marco", lastName: "García", email: "marco@demo.mx", role: "alumno" as const, createdAt: past(90), memberships: [{ ...DEMO_MEMBERSHIP, id: "mem2", userId: "u2", plan: DEMO_PLANS[1]! }] },
  { ...DEMO_USER_ALUMNO, id: "u3", firstName: "Sofía", lastName: "López", email: "sofia@demo.mx", role: "alumno" as const, createdAt: past(60), memberships: [{ ...DEMO_MEMBERSHIP, id: "mem3", userId: "u3", plan: DEMO_PLANS[0]! }] },
  { ...DEMO_USER_ALUMNO, id: "u4", firstName: "Luis", lastName: "Herrera", email: "luis@demo.mx", role: "alumno" as const, createdAt: past(30), memberships: [] },
  { ...DEMO_USER_ADMIN, memberships: [] },
];

// ── Sesiones de check-in de hoy ───────────────────────────────────────────────

export const DEMO_TODAY_SESSIONS = [
  {
    ...DEMO_SESSIONS[0]!,
    startsAt: future(0, 16, 0),
    endsAt: future(0, 17, 30),
    bookings: [
      { id: "b1", sessionId: "ses1", userId: "demo-alumno-id", status: "reservada" as const, membershipId: "mem1", checkedInAt: null, cancelledAt: null, createdAt: past(2), user: DEMO_USER_ALUMNO },
    ],
  },
];

// ── Clases admin (con relaciones) ─────────────────────────────────────────────

export const DEMO_CLASSES_ADMIN = DEMO_CLASSES_RAW.map((c) => ({
  ...c,
  style: DEMO_STYLES.find((s) => s.id === c.styleId)!,
  instructor: DEMO_INSTRUCTORS_RAW.find((i) => i.id === c.instructorId)!,
  room: DEMO_ROOMS.find((r) => r.id === c.roomId) ?? null,
}));
