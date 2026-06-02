/**
 * Cliente de base de datos (Drizzle).
 *
 * Producción: Neon serverless (HTTP).
 * Demo / desarrollo local: Postgres estándar vía node-postgres, activado con
 * `DEMO_MODE=1` (o `DB_DRIVER=node`). Esto permite levantar la app sin una
 * cuenta de Neon, contra un Postgres local.
 *
 * Inicialización perezosa: NO conecta ni valida en tiempo de import, para que
 * `next build` no falle cuando DATABASE_URL aún no está disponible. La conexión
 * real ocurre en la primera consulta (siempre en rutas dinámicas / runtime).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;

function useNodeDriver(): boolean {
  return process.env.DEMO_MODE === "1" || process.env.DB_DRIVER === "node";
}

function getDb(): DB {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Configúrala en .env.local (Neon Postgres pooled).",
    );
  }

  if (useNodeDriver()) {
    // Driver Postgres estándar para demo/local (no requiere Neon).
    const pool = new Pool({ connectionString });
    _db = drizzleNode(pool, {
      schema,
      casing: "snake_case",
    }) as unknown as DB;
    return _db;
  }

  _db = drizzleNeon(neon(connectionString), { schema, casing: "snake_case" });
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
