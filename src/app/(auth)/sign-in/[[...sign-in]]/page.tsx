import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Ingresar" };

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-background to-card px-4 py-12">
      <SignIn />
    </div>
  );
}
