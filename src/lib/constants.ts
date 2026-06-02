/** Constantes de dominio compartidas entre UI y lógica. */

export const APP_NAME = "Academia de Baile";
export const APP_TAGLINE = "Donde el ritmo se vuelve movimiento";

export const LEVEL_LABELS: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const WEEKDAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const WEEKDAY_ORDER = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  reservada: "Reservada",
  asistio: "Asistió",
  cancelada: "Cancelada",
  no_show: "No asistió",
};

export const MEMBERSHIP_KIND_LABELS: Record<string, string> = {
  mensualidad: "Mensualidad",
  paquete: "Paquete de clases",
  drop_in: "Clase suelta",
};
