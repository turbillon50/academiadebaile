import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Crear cuenta" };

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  // En modo demo no hay Clerk: se entra directo al panel.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) redirect("/app");
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-background to-card px-4 py-12">
      <SignUp />
    </div>
  );
}
