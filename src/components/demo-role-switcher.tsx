"use client";

/**
 * Selector de rol para el MODO DEMO (sin Clerk).
 * Cambia la cookie `demo_role` y recarga para entrar como alumno o admin.
 * Solo se monta cuando NEXT_PUBLIC_DEMO_MODE === "1".
 */
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "alumno" | "admin";

function readRole(): Role {
  if (typeof document === "undefined") return "alumno";
  const match = document.cookie.match(/(?:^|; )demo_role=([^;]+)/);
  return match?.[1] === "admin" ? "admin" : "alumno";
}

export function DemoRoleSwitcher() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("alumno");

  useEffect(() => setRole(readRole()), []);

  function pick(next: Role) {
    document.cookie = `demo_role=${next}; path=/; max-age=2592000; samesite=lax`;
    setRole(next);
    router.push(next === "admin" ? "/admin" : "/app");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-1.5 py-1 shadow-sm backdrop-blur">
      <UserCog className="ml-1 size-4 text-muted-foreground" />
      <span className="px-1 text-xs font-medium text-muted-foreground">Demo</span>
      {(["alumno", "admin"] as const).map((r) => (
        <button
          key={r}
          onClick={() => pick(r)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
            role === r
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/** Botón de cuenta usado en navbars del demo (reemplaza al UserButton de Clerk). */
export function DemoAccountButton({ className }: { className?: string }) {
  const router = useRouter();
  function exit() {
    document.cookie = "demo_role=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={exit}
      className={cn("text-xs", className)}
    >
      Salir
    </Button>
  );
}
