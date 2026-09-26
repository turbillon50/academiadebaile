/**
 * Ejecuta una promesa de datos y devuelve un fallback si falla.
 * Útil en páginas públicas para que un error transitorio de DB no rompa el SSR.
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    // TODO(observabilidad): registrar en logger estructurado / Sentry.
    const message = err instanceof Error ? err.message : "";
    if (
      process.env.NODE_ENV !== "production" &&
      !message.includes("Falta DATABASE_URL")
    ) {
      console.error("[safe] consulta falló:", err);
    }
    return fallback;
  }
}
