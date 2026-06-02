/**
 * Detección automática de modo demo.
 * Demo se activa cuando no hay credenciales de Clerk — sin variables extra.
 */

/** true cuando no hay clave de Clerk (demo automático, sin configuración). */
export const IS_DEMO = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** true cuando tampoco hay DATABASE_URL — se usan datos mock en memoria. */
export const DEMO_NO_DB = IS_DEMO && !process.env.DATABASE_URL;
