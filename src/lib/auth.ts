/**
 * Helpers de autenticación y autorización (Clerk + DB local).
 * El rol canónico vive en Clerk (`publicMetadata.role`) y se replica en la
 * tabla `users` para poder hacer JOINs y reportes.
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type User, type UserRole } from "@/db/schema";

/** Lee el rol desde los claims de la sesión de Clerk (default: alumno). */
export async function getSessionRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as { role?: UserRole } | undefined;
  return metadata?.role ?? "alumno";
}

/**
 * Devuelve el usuario local, creándolo/actualizándolo desde Clerk si hace
 * falta (sincronización perezosa, complementa al webhook de Clerk).
 * Retorna null si no hay sesión.
 */
export async function getOrSyncUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const role = await getSessionRole();
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const values = {
    clerkId: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    role,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        imageUrl: values.imageUrl,
        role: values.role,
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  return row ?? null;
}

/** Igual que getOrSyncUser pero lanza si no hay sesión (para zonas privadas). */
export async function requireUser(): Promise<User> {
  const user = await getOrSyncUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return user;
}

/** Verifica que el usuario tenga uno de los roles permitidos. */
export async function hasRole(...allowed: UserRole[]): Promise<boolean> {
  const role = await getSessionRole();
  return allowed.includes(role);
}

/** Busca el usuario local por clerkId (sin sincronizar). */
export async function getUserByClerkId(
  clerkId: string,
): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}
