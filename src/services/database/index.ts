import { db, schema } from "@/db";

export { db, schema };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
