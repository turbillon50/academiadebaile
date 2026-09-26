import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BroadcastButton } from "@/components/admin/broadcast-button";
import { getBroadcastTemplates } from "@/services/notifications";

export const dynamic = "force-dynamic";

const channelIcon = {
  push: Smartphone,
  email: Mail,
  whatsapp: MessageCircle,
};

export default function AdminAvisosPage() {
  const templates = getBroadcastTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Avisos masivos</h1>
        <p className="text-muted-foreground">
          Envía recordatorios, cambios de horario y comunicados por segmento.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              Nuevo aviso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-sm font-semibold">Arquitectura preparada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                En producción este formulario enviará push, email con Resend y
                WhatsApp vía webhook n8n. En demo, los botones confirman envío
                local con toast.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border/70 p-3">
                <p className="text-muted-foreground">Segmentos</p>
                <p className="font-semibold">Todos, adeudos, clases, eventos</p>
              </div>
              <div className="rounded-lg border border-border/70 p-3">
                <p className="text-muted-foreground">Canales</p>
                <p className="font-semibold">Push, email, WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {templates.map((template) => {
            const Icon = channelIcon[template.channel];
            return (
              <Card key={template.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <h2 className="font-semibold">{template.title}</h2>
                      <Badge variant="secondary">{template.channel}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {template.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Audiencia: {template.audience}
                    </p>
                  </div>
                  <BroadcastButton audience={template.audience} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
