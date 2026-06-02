import { defineConfig } from "drizzle-kit";

// Las migraciones usan la conexión directa (sin pooler) cuando está disponible.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Falta DATABASE_URL (o DATABASE_URL_UNPOOLED) para ejecutar drizzle-kit.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
