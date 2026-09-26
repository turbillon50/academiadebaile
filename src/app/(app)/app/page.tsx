import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CreditCard,
  PartyPopper,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionCard } from "@/components/session-card";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import {
  getActiveMembership,
  getPublishedEvents,
  getUserBookings,
} from "@/lib/queries";
import { getStudentNotifications } from "@/services/notifications";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlumnoDashboard() {
  const user = await requireUser();
  const [bookings, membership, events] = await Promise.all([
    getUserBookings(user.id),
    getActiveMembership(user.id),
    getPublishedEvents(),
  ]);

  const now = new Date();
  const notifications = getStudentNotifications();
  const upcoming = bookings
    .filter((b) => b.status === "reservada" && b.session.startsAt > now)
    .sort((a, b) => a.session.startsAt.getTime() - b.session.startsAt.getTime());
  const attended = bookings.filter((b) => b.status === "asistio").length;
  const nextClass = upcoming[0];
  const nextPayment = membership?.expiresAt ?? new Date("2026-06-05T06:00:00Z");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">
          Hola, {user.firstName ?? "bailarín/a"}
        </h1>
        <p className="text-muted-foreground">
          Tu panel de entrenamiento, pagos y avisos de FDS Academy.
        </p>
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
              <Link href="/app/pagos">
                Ver planes <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/25 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" /> Próximo pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {membership ? "Mensualidad vigente" : "Mensualidad pendiente"}
                </p>
                <p className="font-display text-3xl font-extrabold">
                  {membership
                    ? formatCurrency(0)
                    : formatCurrency(85000)}
                </p>
              </div>
              <Badge variant={membership ? "success" : "warning"}>
                {membership ? "Al corriente" : "Por pagar"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Fecha objetivo: {formatDate(nextPayment)}.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/app/pagos">Gestionar pago</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Próxima clase</CardTitle>
          </CardHeader>
          <CardContent>
            {nextClass ? (
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary">
                    {nextClass.session.class.style.name}
                  </Badge>
                  <h2 className="mt-2 font-display text-2xl font-extrabold">
                    {nextClass.session.class.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(nextClass.session.startsAt)} ·{" "}
                    {formatTime(nextClass.session.startsAt)} ·{" "}
                    {nextClass.session.room?.name ?? "Salón por asignar"}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/app/clases">Ver horario</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No tienes clases próximas reservadas.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/app/clases">Reservar clase</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/app/clases", label: "Horario", icon: CalendarCheck },
            { href: "/app/pagos", label: "Pagar", icon: CreditCard },
            { href: "/app/eventos", label: "Eventos", icon: PartyPopper },
            { href: "/app/avisos", label: "Avisos", icon: Bell },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5"
            >
              <item.icon className="mb-3 size-6 text-primary" />
              <p className="font-semibold">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Avisos recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-border/70 bg-background/35 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{notification.title}</p>
                  {notification.unread ? (
                    <Badge variant="default">Nuevo</Badge>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {notification.body}
                </p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/app/avisos">Ver todos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="size-5 text-primary" /> Eventos próximos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-border/70 bg-background/35 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{event.title}</p>
                  <Badge variant="secondary">
                    {event.priceCents === 0
                      ? "Gratis"
                      : formatCurrency(event.priceCents)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(event.startsAt)} · {event.location ?? "FDS Academy"}
                </p>
              </div>
            ))}
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin eventos publicados por ahora.
              </p>
            ) : null}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/app/eventos">Ver eventos</Link>
            </Button>
          </CardContent>
        </Card>
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
