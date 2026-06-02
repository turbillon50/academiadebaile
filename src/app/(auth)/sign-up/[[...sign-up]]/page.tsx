import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Crear cuenta" };

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-background to-card px-4 py-12">
      <SignUp />
    </div>
  );
}
