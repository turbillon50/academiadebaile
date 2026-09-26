export type NotificationKind = "pago" | "horario" | "evento" | "general";
export type NotificationPriority = "alta" | "media" | "baja";

export interface StudentNotification {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  priority: NotificationPriority;
  createdAt: Date;
  unread: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface BroadcastTemplate {
  id: string;
  title: string;
  audience: string;
  channel: "push" | "email" | "whatsapp";
  body: string;
}

export function getStudentNotifications(): StudentNotification[] {
  return [
    {
      id: "pay-june",
      title: "Recordatorio de mensualidad",
      body: "La mensualidad de junio vence el 5 de junio de 2026. Puedes pagar con Mercado Pago desde la app.",
      kind: "pago",
      priority: "alta",
      createdAt: new Date("2026-06-02T14:00:00Z"),
      unread: true,
      ctaLabel: "Pagar ahora",
      ctaHref: "/app/pagos",
    },
    {
      id: "schedule-jazz",
      title: "Cambio de horario",
      body: "Jazz Funk del viernes se mueve a las 19:30 en Salón 2 por ensayo de exhibición.",
      kind: "horario",
      priority: "media",
      createdAt: new Date("2026-06-01T22:30:00Z"),
      unread: true,
      ctaLabel: "Ver clases",
      ctaHref: "/app/clases",
    },
    {
      id: "workshop-urban",
      title: "Nuevo taller urbano",
      body: "Abrió registro para Workshop Urban Flow. Cupo limitado a 30 alumnos.",
      kind: "evento",
      priority: "media",
      createdAt: new Date("2026-05-31T18:00:00Z"),
      unread: false,
      ctaLabel: "Registrarme",
      ctaHref: "/app/eventos",
    },
    {
      id: "general-costumes",
      title: "Comunicado general",
      body: "Los vestuarios para la exhibición de verano se entregarán del 10 al 12 de junio.",
      kind: "general",
      priority: "baja",
      createdAt: new Date("2026-05-29T16:15:00Z"),
      unread: false,
    },
  ];
}

export function getBroadcastTemplates(): BroadcastTemplate[] {
  return [
    {
      id: "late-payments",
      title: "Recordatorio de pago",
      audience: "Alumnos con adeudo",
      channel: "email",
      body: "Tu mensualidad está pendiente. Puedes liquidarla desde la app de FDS Academy.",
    },
    {
      id: "schedule-change",
      title: "Cambio de horario",
      audience: "Alumnos inscritos en Jazz Funk",
      channel: "push",
      body: "Tu clase cambió de horario. Revisa el nuevo detalle en Mis clases.",
    },
    {
      id: "new-workshop",
      title: "Nuevo taller",
      audience: "Todos los alumnos activos",
      channel: "whatsapp",
      body: "Ya está abierto el registro al nuevo taller intensivo. Cupo limitado.",
    },
  ];
}
