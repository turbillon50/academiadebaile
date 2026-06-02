import { Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CancelBookingButton } from "@/components/app/cancel-booking-button";
import { requireUser } from "@/lib/auth";
import { getUserBookings } from "@/lib/queries";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BookingRow = Awaited<ReturnType<typeof getUserBookings>>[number];

function BookingItem({ b, cancelable }: { b: BookingRow; cancelable: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{b.session.class.style.name}</Badge>
            <Badge
              variant={
                b.status === "asistio"
                  ? "success"
                  : b.status === "cancelada" || b.status === "no_show"
                    ? "destructive"
                    : "outline"
              }
            >
              {BOOKING_STATUS_LABELS[b.status] ?? b.status}
            </Badge>
          </div>
          <p className="mt-1 truncate font-semibold">{b.session.class.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(b.session.startsAt)} · {formatTime(b.session.startsAt)} ·{" "}
            {b.session.instructor.fullName}
          </p>
        </div>
        {cancelable ? <CancelBookingButton bookingId={b.id} /> : null}
      </CardContent>
    </Card>
  );
}

export default async function ReservasPage() {
  const user = await requireUser();
  const bookings = await getUserBookings(user.id);
  const now = new Date();

  const upcoming = bookings.filter(
    (b) => b.status === "reservada" && b.session.startsAt > now,
  );
  const past = bookings.filter(
    (b) => b.status !== "reservada" || b.session.startsAt <= now,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mis reservas</h1>
        <p className="text-muted-foreground">
          Gestiona tus clases reservadas e historial.
        </p>
      </div>

      <Tabs defaultValue="proximas">
        <TabsList>
          <TabsTrigger value="proximas">Próximas ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="Sin reservas próximas"
              description="Reserva una clase para verla aquí."
            />
          ) : (
            upcoming.map((b) => <BookingItem key={b.id} b={b} cancelable />)
          )}
        </TabsContent>

        <TabsContent value="historial" className="space-y-3">
          {past.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="Aún no hay historial"
              description="Tus clases pasadas aparecerán aquí."
            />
          ) : (
            past.map((b) => <BookingItem key={b.id} b={b} cancelable={false} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
