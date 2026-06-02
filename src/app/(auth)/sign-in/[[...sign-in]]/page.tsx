import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Ingresar" };

export const dynamic = "force-dynamic";

export default function SignInPage() {
  // En modo demo no hay Clerk: se entra directo al panel.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) redirect("/app");
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-background to-card px-4 py-12">
      <SignIn />
    </div>
  );
}
