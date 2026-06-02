/**
 * Cliente de base de datos (Neon serverless + Drizzle).
 * Se usa en Server Components, Route Handlers y Server Actions.
 *
 * Inicialización perezosa: NO conecta ni valida en tiempo de import, para que
 * `next build` no falle cuando DATABASE_URL aún no está disponible. La conexión
 * real ocurre en la primera consulta (siempre en rutas dinámicas / runtime).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Configúrala en .env.local (Neon Postgres pooled).",
    );
  }
  _db = drizzle(neon(connectionString), { schema, casing: "snake_case" });
  return _db;
}

/**
 * Proxy que difiere la construcción del cliente hasta el primer acceso.
 * Permite `import { db }` en cualquier lugar sin efectos secundarios.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as DB;

export { schema };
