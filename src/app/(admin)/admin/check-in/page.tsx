import { CalendarX, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckInButton } from "@/components/admin/check-in-button";
import { getTodaySessionsForCheckIn } from "@/lib/queries";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const sessions = await getTodaySessionsForCheckIn();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Check-in de hoy</h1>
        <p className="text-muted-foreground">
          Registra la asistencia de las clases del día.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No hay clases hoy"
          description="Disfruta el descanso. Vuelve mañana para el check-in."
        />
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => {
            const activeBookings = s.bookings.filter(
              (b) => b.status !== "cancelada",
            );
            const present = activeBookings.filter(
              (b) => b.status === "asistio",
            ).length;
            return (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span>{s.class.name}</span>
                    <div className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" /> {formatTime(s.startsAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" /> {present}/{activeBookings.length}
                      </span>
                      <Badge variant="secondary">{s.instructor.fullName}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Sin reservas para esta clase.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border/60">
                      {activeBookings.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                              {initials(
                                [b.user.firstName, b.user.lastName]
                                  .filter(Boolean)
                                  .join(" "),
                              )}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {[b.user.firstName, b.user.lastName]
                                  .filter(Boolean)
                                  .join(" ") || b.user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                              </p>
                            </div>
                          </div>
                          <CheckInButton bookingId={b.id} status={b.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
