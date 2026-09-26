import Image from "next/image";
import { CalendarPlus, MapPin, PartyPopper, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EventRegistrationButton } from "@/components/app/event-registration-button";
import { getPublishedEvents } from "@/lib/queries";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const eventTypes = [
  { label: "Presentaciones", icon: PartyPopper },
  { label: "Talleres", icon: CalendarPlus },
  { label: "Concursos", icon: Trophy },
  { label: "Exhibiciones", icon: Users },
] as const;

export default async function AppEventosPage() {
  const events = await getPublishedEvents();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Eventos</h1>
        <p className="text-muted-foreground">
          Presentaciones, talleres, concursos y exhibiciones de FDS Academy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {eventTypes.map((type) => (
          <Card key={type.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <type.icon className="size-5" />
              </div>
              <p className="text-sm font-semibold">{type.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Sin eventos publicados"
          description="Los eventos abiertos a registro aparecerán aquí."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative h-56 bg-muted">
                {event.coverUrl ? (
                  <Image
                    src={event.coverUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Badge variant={event.status === "agotado" ? "warning" : "secondary"}>
                    {event.status}
                  </Badge>
                  <Badge variant="outline" className="bg-black/40">
                    {event.priceCents === 0
                      ? "Gratis"
                      : formatCurrency(event.priceCents)}
                  </Badge>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="font-display text-2xl font-extrabold text-white">
                    {event.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-white/75">
                    {event.description}
                  </p>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <CalendarPlus className="size-4 text-primary" />
                    {formatDate(event.startsAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <PartyPopper className="size-4 text-primary" />
                    {formatTime(event.startsAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {event.location ?? "FDS Academy"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Cupo {event.capacity}
                  </span>
                </div>
                <EventRegistrationButton eventTitle={event.title} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
