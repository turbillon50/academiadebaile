import Link from "next/link";
import { ArrowRight, CalendarCheck, CreditCard, Sparkles, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionCard } from "@/components/session-card";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import {
  getActiveMembership,
  getUserBookings,
} from "@/lib/queries";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlumnoDashboard() {
  const user = await requireUser();
  const [bookings, membership] = await Promise.all([
    getUserBookings(user.id),
    getActiveMembership(user.id),
  ]);

  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status === "reservada" && b.session.startsAt > now)
    .sort((a, b) => a.session.startsAt.getTime() - b.session.startsAt.getTime());
  const attended = bookings.filter((b) => b.status === "asistio").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">
          ¡Hola, {user.firstName ?? "bailarín/a"}! 👋
        </h1>
        <p className="text-muted-foreground">Este es tu panel. Listo para bailar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label="Próximas clases"
          value={upcoming.length}
        />
        <StatCard icon={Ticket} label="Clases tomadas" value={attended} />
        <StatCard
          icon={CreditCard}
          label="Membresía"
          value={membership ? membership.plan.name : "Sin plan"}
          hint={
            membership?.creditsRemaining != null
              ? `${membership.creditsRemaining} créditos`
              : membership
                ? "Ilimitada"
                : undefined
          }
        />
      </div>

      {!membership ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="size-6 text-primary" />
              <div>
                <p className="font-semibold">Activa tu membresía</p>
                <p className="text-sm text-muted-foreground">
                  Reserva clases sin límites con nuestros planes.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/app/membresia">
                Ver planes <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Tus próximas clases</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/reservar">
              Reservar más <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No tienes clases reservadas"
            description="Explora el horario y aparta tu lugar en la pista."
            action={
              <Button asChild>
                <Link href="/app/reservar">Reservar una clase</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 6).map((b) => (
              <SessionCard key={b.id} session={b.session} />
            ))}
          </div>
        )}
      </section>

      {bookings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{b.session.class.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(b.session.startsAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    b.status === "asistio"
                      ? "success"
                      : b.status === "cancelada" || b.status === "no_show"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {membership ? (
        <p className="text-center text-xs text-muted-foreground">
          {membership.expiresAt
            ? `Tu membresía vence el ${formatDate(membership.expiresAt)}.`
            : null}{" "}
          {membership.plan.priceCents
            ? `Plan ${membership.plan.name} · ${formatCurrency(membership.plan.priceCents)}`
            : null}
        </p>
      ) : null}
    </div>
  );
}
