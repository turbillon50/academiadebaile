import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, PartyPopper, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/reveal";
import { getPublishedEvents } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos y talleres",
  description: "Sociales, talleres intensivos y competencias de baile.",
};

export default async function EventosPage() {
  const events = await safe(getPublishedEvents(), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-extrabold">Eventos y talleres</h1>
        <p className="mt-2 text-muted-foreground">
          Vive la comunidad: sociales, talleres intensivos y mucho más.
        </p>
      </header>

      {events.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="No hay eventos próximos"
          description="Estamos preparando algo especial. ¡Síguenos para no perdértelo!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.05}>
              <Card className="overflow-hidden">
                <div className="relative h-52 bg-muted">
                  {ev.coverUrl ? (
                    <Image src={ev.coverUrl} alt={ev.title} fill className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <PartyPopper className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  {ev.status === "agotado" ? (
                    <Badge variant="destructive" className="absolute right-3 top-3">
                      Agotado
                    </Badge>
                  ) : null}
                </div>
                <CardContent className="space-y-3 p-5">
                  <h3 className="font-display text-xl font-bold">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground">{ev.description}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {formatDate(ev.startsAt)} · {formatTime(ev.startsAt)}
                    </p>
                    {ev.location ? (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4" /> {ev.location}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-display text-xl font-bold">
                      {ev.priceCents === 0 ? "Gratis" : formatCurrency(ev.priceCents)}
                    </span>
                    {/* TODO(boletaje): conectar a checkout de boletos (Stripe/MP)
                        creando un registro en event_tickets con código QR. */}
                    <Button asChild disabled={ev.status === "agotado"}>
                      <Link href="/app">
                        <Ticket className="size-4" /> Reservar lugar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
