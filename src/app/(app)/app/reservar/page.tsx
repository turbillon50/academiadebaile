import { CalendarX, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionCard } from "@/components/session-card";
import { ReserveButton } from "@/components/app/reserve-button";
import { requireUser } from "@/lib/auth";
import { getUpcomingSessions, getUserBookings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Reservar clase</h1>
        <p className="text-muted-foreground">
          Elige tu próxima clase. Los cupos se actualizan al instante.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No hay clases disponibles"
          description="Pronto publicaremos nuevas fechas en el horario."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const alreadyBooked = bookedSessionIds.has(s.id);
            return (
              <SessionCard
                key={s.id}
                session={s}
                action={
                  alreadyBooked ? (
                    <Button size="sm" variant="secondary" disabled className="w-full">
                      <Check className="size-4" /> Ya reservada
                    </Button>
                  ) : (
                    <ReserveButton
                      sessionId={s.id}
                      disabled={(s.available ?? 0) <= 0}
                    />
                  )
                }
              />
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-1">
          Tip
        </Badge>
        Puedes cancelar hasta 2 horas antes del inicio sin penalización.
      </p>
    </div>
  );
}
