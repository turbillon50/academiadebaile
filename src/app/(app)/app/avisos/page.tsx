import Link from "next/link";
import { Bell, CalendarClock, CreditCard, Megaphone, PartyPopper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  getStudentNotifications,
  type NotificationKind,
} from "@/services/notifications";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const kindMeta: Record<
  NotificationKind,
  { label: string; icon: typeof Bell; variant: "default" | "secondary" | "warning" | "outline" }
> = {
  pago: { label: "Pago", icon: CreditCard, variant: "warning" },
  horario: { label: "Horario", icon: CalendarClock, variant: "secondary" },
  evento: { label: "Evento", icon: PartyPopper, variant: "default" },
  general: { label: "General", icon: Megaphone, variant: "outline" },
};

function NotificationCard({
  notification,
}: {
  notification: ReturnType<typeof getStudentNotifications>[number];
}) {
  const meta = kindMeta[notification.kind];
  const Icon = meta.icon;

  return (
    <Card
      className={
        notification.unread ? "border-primary/40 bg-primary/5" : undefined
      }
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{notification.title}</h2>
                {notification.unread ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.body}
              </p>
            </div>
          </div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {formatDate(notification.createdAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {notification.ctaHref && notification.ctaLabel ? (
            <Button asChild size="sm" variant="outline">
              <Link href={notification.ctaHref}>{notification.ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AvisosPage() {
  const notifications = getStudentNotifications();
  const unread = notifications.filter((notification) => notification.unread);
  const byKind = (kind: NotificationKind) =>
    notifications.filter((notification) => notification.kind === kind);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Avisos</h1>
        <p className="text-muted-foreground">
          Recordatorios de pago, cambios de horario, talleres y comunicados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/25">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">No leídos</p>
            <p className="font-display text-3xl font-extrabold">{unread.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Alta prioridad</p>
            <p className="font-display text-3xl font-extrabold">
              {
                notifications.filter(
                  (notification) => notification.priority === "alta",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Canales</p>
            <p className="font-display text-3xl font-extrabold">Push + Email</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pago">Pagos</TabsTrigger>
          <TabsTrigger value="horario">Horario</TabsTrigger>
          <TabsTrigger value="evento">Eventos</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </TabsContent>
        {(["pago", "horario", "evento", "general"] as const).map((kind) => (
          <TabsContent key={kind} value={kind} className="space-y-3">
            {byKind(kind).map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
