/** Constantes de dominio compartidas entre UI y lógica. */

export const APP_NAME = "FDS Academy";
export const APP_TAGLINE = "Entrena tu ritmo. Domina el escenario";

export const ROLE_LABELS: Record<string, string> = {
  alumno: "Alumno",
  padre: "Padre/Tutor",
  tutor: "Padre/Tutor",
  instructor: "Instructor",
  admin: "Administrador",
};

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
