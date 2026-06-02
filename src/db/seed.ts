/**
 * Seed de datos plausibles para Academia de Baile.
 * Ejecutar: `npm run db:seed` (requiere DATABASE_URL en el entorno).
 *
 * Idempotente: limpia las tablas de dominio antes de insertar.
 */
import { db, schema } from "./index";
import { slugify } from "../lib/utils";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta DATABASE_URL. Ejecuta con: tsx --env-file=.env.local src/db/seed.ts",
  );
}

/** Próxima fecha (desde hoy) para un día de la semana dado, a cierta hora. */
function nextOccurrence(weekdayIndex: number, hhmm: string, weeksAhead = 0): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const result = new Date(now);
  const currentDow = (now.getDay() + 6) % 7; // lunes=0 ... domingo=6
  let diff = weekdayIndex - currentDow;
  if (diff < 0) diff += 7;
  result.setDate(now.getDate() + diff + weeksAhead * 7);
  result.setHours(h ?? 0, m ?? 0, 0, 0);
  return result;
}

async function main(): Promise<void> {
  console.log("🌱 Limpiando tablas...");
  // Orden inverso a las dependencias de FK.
  await db.delete(schema.eventTickets);
  await db.delete(schema.events);
  await db.delete(schema.payments);
  await db.delete(schema.bookings);
  await db.delete(schema.memberships);
  await db.delete(schema.membershipPlans);
  await db.delete(schema.classSessions);
  await db.delete(schema.schedules);
  await db.delete(schema.classes);
  await db.delete(schema.instructorStyles);
  await db.delete(schema.instructors);
  await db.delete(schema.rooms);
  await db.delete(schema.styles);
  // No borramos `users` reales de Clerk; sólo los demo.

  console.log("🎵 Estilos...");
  const styleData = [
    { name: "Salsa", accentColor: "#e11d48", desc: "Sabor, giros y conexión en pareja al ritmo del Caribe." },
    { name: "Bachata", accentColor: "#db2777", desc: "Sensualidad y musicalidad dominicana paso a paso." },
    { name: "Cumbia", accentColor: "#f59e0b", desc: "El ritmo que une a toda Latinoamérica en la pista." },
    { name: "Hip Hop", accentColor: "#8b5cf6", desc: "Cultura urbana, groove y actitud." },
    { name: "Jazz", accentColor: "#06b6d4", desc: "Técnica, líneas y expresión escénica." },
    { name: "Contemporáneo", accentColor: "#10b981", desc: "Fluidez, suelo y exploración del movimiento." },
  ];
  const styles = await db
    .insert(schema.styles)
    .values(
      styleData.map((s) => ({
        slug: slugify(s.name),
        name: s.name,
        description: s.desc,
        accentColor: s.accentColor,
        imageUrl: `https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80`,
      })),
    )
    .returning();
  const styleBy = (name: string) =>
    styles.find((s) => s.name === name)!;

  console.log("🏛️ Salas...");
  const rooms = await db
    .insert(schema.rooms)
    .values([
      { name: "Salón Principal", capacity: 30 },
      { name: "Salón Espejo", capacity: 20 },
      { name: "Estudio B", capacity: 15 },
    ])
    .returning();

  console.log("🧑‍🏫 Instructores...");
  const instructorData = [
    { name: "Mariana Ríos", styles: ["Salsa", "Bachata"], ig: "marianarios.dance", bio: "Campeona nacional de salsa en línea. 12 años formando bailarines." },
    { name: "Diego Hernández", styles: ["Bachata", "Cumbia"], ig: "diegoh.bachata", bio: "Especialista en bachata sensual y musicalidad." },
    { name: "Karla Mendoza", styles: ["Hip Hop", "Jazz"], ig: "karla.movement", bio: "Bailarina urbana con giras internacionales." },
    { name: "Toño Vega", styles: ["Cumbia", "Salsa"], ig: "tonovega", bio: "El alma de la pista. Energía pura en cada clase." },
    { name: "Sofía Lara", styles: ["Contemporáneo", "Jazz"], ig: "sofialara.art", bio: "Coreógrafa contemporánea, lenguaje corporal y suelo." },
    { name: "Bruno Castro", styles: ["Hip Hop", "Contemporáneo"], ig: "brunocastro", bio: "Freestyle, popping y composición coreográfica." },
  ];
  const instructors = await db
    .insert(schema.instructors)
    .values(
      instructorData.map((i) => ({
        fullName: i.name,
        slug: slugify(i.name),
        bio: i.bio,
        instagram: i.ig,
        photoUrl: `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80`,
      })),
    )
    .returning();
  const instructorBy = (name: string) =>
    instructors.find((i) => i.fullName === name)!;

  // Especialidades (N:M).
  await db.insert(schema.instructorStyles).values(
    instructorData.flatMap((i) =>
      i.styles.map((styleName) => ({
        instructorId: instructorBy(i.name).id,
        styleId: styleBy(styleName).id,
      })),
    ),
  );

  console.log("💃 Clases + horarios + sesiones...");
  type ClassDef = {
    name: string;
    style: string;
    level: "principiante" | "intermedio" | "avanzado";
    instructor: string;
    room: number;
    days: { day: number; time: string }[];
  };
  const classDefs: ClassDef[] = [
    { name: "Salsa Principiantes", style: "Salsa", level: "principiante", instructor: "Mariana Ríos", room: 0, days: [{ day: 0, time: "19:00" }, { day: 2, time: "19:00" }] },
    { name: "Salsa Intermedia", style: "Salsa", level: "intermedio", instructor: "Toño Vega", room: 0, days: [{ day: 1, time: "20:00" }, { day: 3, time: "20:00" }] },
    { name: "Bachata Sensual", style: "Bachata", level: "intermedio", instructor: "Diego Hernández", room: 1, days: [{ day: 2, time: "20:30" }] },
    { name: "Bachata Básica", style: "Bachata", level: "principiante", instructor: "Mariana Ríos", room: 1, days: [{ day: 4, time: "18:00" }] },
    { name: "Cumbia para Todos", style: "Cumbia", level: "principiante", instructor: "Toño Vega", room: 0, days: [{ day: 5, time: "11:00" }] },
    { name: "Hip Hop Avanzado", style: "Hip Hop", level: "avanzado", instructor: "Karla Mendoza", room: 2, days: [{ day: 1, time: "18:00" }, { day: 3, time: "18:00" }] },
    { name: "Jazz Escénico", style: "Jazz", level: "intermedio", instructor: "Sofía Lara", room: 1, days: [{ day: 4, time: "19:30" }] },
    { name: "Contemporáneo Flow", style: "Contemporáneo", level: "intermedio", instructor: "Bruno Castro", room: 2, days: [{ day: 5, time: "12:30" }] },
  ];

  const weekdayNames = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ] as const;

  for (const def of classDefs) {
    const [cls] = await db
      .insert(schema.classes)
      .values({
        name: def.name,
        slug: slugify(def.name),
        styleId: styleBy(def.style).id,
        level: def.level,
        instructorId: instructorBy(def.instructor).id,
        roomId: rooms[def.room]!.id,
        capacity: rooms[def.room]!.capacity,
        durationMin: 60,
        dropInPriceCents: 15000,
        description: `Clase de ${def.style} nivel ${def.level}.`,
      })
      .returning();
    if (!cls) continue;

    for (const d of def.days) {
      const [sch] = await db
        .insert(schema.schedules)
        .values({
          classId: cls.id,
          weekday: weekdayNames[d.day]!,
          startTime: `${d.time}:00`,
        })
        .returning();

      // Genera sesiones para las próximas 3 semanas.
      for (let w = 0; w < 3; w++) {
        const startsAt = nextOccurrence(d.day, d.time, w);
        const endsAt = new Date(startsAt.getTime() + cls.durationMin * 60000);
        await db.insert(schema.classSessions).values({
          classId: cls.id,
          scheduleId: sch?.id,
          instructorId: cls.instructorId,
          roomId: cls.roomId,
          startsAt,
          endsAt,
          capacity: cls.capacity,
        });
      }
    }
  }

  console.log("🎟️ Planes de membresía...");
  await db.insert(schema.membershipPlans).values([
    { slug: "drop-in", name: "Clase suelta", kind: "drop_in", priceCents: 15000, classCredits: 1, durationDays: 7, description: "Una clase a elegir. Ideal para probar." },
    { slug: "paquete-4", name: "Paquete 4 clases", kind: "paquete", priceCents: 52000, classCredits: 4, durationDays: 30, description: "4 clases para usar en el mes." },
    { slug: "paquete-8", name: "Paquete 8 clases", kind: "paquete", priceCents: 96000, classCredits: 8, durationDays: 45, description: "8 clases con vigencia extendida." },
    { slug: "mensualidad-ilimitada", name: "Mensualidad ilimitada", kind: "mensualidad", priceCents: 159000, classCredits: null, durationDays: 30, description: "Clases ilimitadas durante 30 días." },
  ]);

  console.log("🎉 Eventos...");
  await db.insert(schema.events).values([
    {
      slug: slugify("Social Salsa Noche de Estrellas"),
      title: "Social: Salsa Noche de Estrellas",
      description: "Noche social con DJ en vivo, clase express y mucho baile.",
      location: "Salón Principal — Academia de Baile",
      startsAt: nextOccurrence(5, "21:00", 1),
      priceCents: 12000,
      capacity: 120,
      status: "publicado",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    },
    {
      slug: slugify("Taller Intensivo Bachata Sensual"),
      title: "Taller Intensivo de Bachata Sensual",
      description: "4 horas con Diego Hernández. Técnica, musicalidad y body movement.",
      location: "Salón Espejo",
      startsAt: nextOccurrence(6, "10:00", 2),
      priceCents: 45000,
      capacity: 30,
      status: "publicado",
      coverUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&q=80",
    },
  ]);

  console.log("🧑‍🎓 Alumnos demo...");
  await db
    .insert(schema.users)
    .values([
      { clerkId: "seed_alumno_1", email: "ana.demo@academiadebaile.mx", firstName: "Ana", lastName: "García", role: "alumno" },
      { clerkId: "seed_alumno_2", email: "luis.demo@academiadebaile.mx", firstName: "Luis", lastName: "Pérez", role: "alumno" },
      { clerkId: "seed_admin_1", email: "admin.demo@academiadebaile.mx", firstName: "Admin", lastName: "Demo", role: "admin" },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed completado.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  });
