import Link from "next/link";
import { CalendarX, Check, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReserveButton } from "@/components/app/reserve-button";
import { requireUser } from "@/lib/auth";
import { BOOKING_STATUS_LABELS, LEVEL_LABELS } from "@/lib/constants";
import { getUpcomingSessions, getUserBookings } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MisClasesPage() {
  const user = await requireUser();
  const [sessions, bookings] = await Promise.all([
    getUpcomingSessions({ limit: 80 }),
    getUserBookings(user.id),
  ]);

  const bookedSessionIds = new Set(
    bookings
      .filter((b) => b.status === "reservada" || b.status === "asistio")
      .map((b) => b.sessionId),
  );
  const activeBookings = bookings.filter((b) => b.status === "reservada");
  const attended = bookings.filter((b) => b.status === "asistio").length;
  const noShows = bookings.filter((b) => b.status === "no_show").length;
  const enrolledClasses = Array.from(
    new Map(
      bookings.map((b) => [
        b.session.class.name,
        {
          name: b.session.class.name,
          style: b.session.class.style.name,
          instructor: b.session.instructor.fullName,
          room: b.session.room?.name ?? "Por asignar",
          status: b.status,
        },
      ]),
    ).values(),
  );

  const byDate = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const key = formatDate(session.startsAt, {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    byDate.set(key, [...(byDate.get(key) ?? []), session]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mis clases</h1>
        <p className="text-muted-foreground">
          Horario semanal, asistencia, instructor y salón en un solo lugar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/25">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Reservas activas</p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              {activeBookings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-success/25">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Asistencias</p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              {attended}
            </p>
          </CardContent>
        </Card>
        <Card className="border-warning/25">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">No shows</p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              {noShows}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Horario semanal</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/reservar">Ver todo</Link>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No hay clases programadas"
            description="Cuando la academia publique horarios, aparecerán aquí."
          />
        ) : (
          <div className="space-y-5">
            {Array.from(byDate.entries()).map(([day, daySessions]) => (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="capitalize">{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySessions.map((session) => {
                    const alreadyBooked = bookedSessionIds.has(session.id);
                    return (
                      <div
                        key={session.id}
                        className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/35 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {session.class.style.name}
                            </Badge>
                            <Badge variant="outline">
                              {LEVEL_LABELS[session.class.level] ??
                                session.class.level}
                            </Badge>
                          </div>
                          <p className="font-semibold">{session.class.name}</p>
                          <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-4" />{" "}
                              {formatTime(session.startsAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="size-4" />{" "}
                              {session.instructor.fullName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="size-4" />{" "}
                              {session.room?.name ?? "Por asignar"}
                            </span>
                            <span>
                              {session.available ?? 0} lugares disponibles
                            </span>
                          </div>
                        </div>
                        <div className="w-full sm:w-36">
                          {alreadyBooked ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled
                              className="w-full"
                            >
                              <Check className="size-4" /> Reservada
                            </Button>
                          ) : (
                            <ReserveButton
                              sessionId={session.id}
                              disabled={(session.available ?? 0) <= 0}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Clases inscritas</h2>
        {enrolledClasses.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="Aún no tienes clases inscritas"
            description="Reserva tu primera clase para comenzar tu historial."
            action={
              <Button asChild>
                <Link href="/app/reservar">Reservar clase</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enrolledClasses.map((cls) => (
              <Card key={cls.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.style} · {cls.instructor} · {cls.room}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {BOOKING_STATUS_LABELS[cls.status] ?? cls.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
