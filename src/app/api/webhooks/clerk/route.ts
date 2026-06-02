import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";

export const runtime = "nodejs";

/**
 * Webhook de Clerk: mantiene la tabla `users` sincronizada con el proveedor
 * de identidad (alta, actualización y baja de usuarios).
 * Configura el endpoint en el dashboard de Clerk y guarda CLERK_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest): Promise<Response> {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const data = evt.data;
      const email =
        data.email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ??
        data.email_addresses[0]?.email_address ??
        "";
      const role =
        ((data.public_metadata as { role?: UserRole })?.role ?? "alumno");

      await db
        .insert(users)
        .values({
          clerkId: data.id,
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          role,
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: {
            email,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            role,
            updatedAt: new Date(),
          },
        });
      break;
    }
    case "user.deleted": {
      if (evt.data.id) {
        await db.delete(users).where(eq(users.clerkId, evt.data.id));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
