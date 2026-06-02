"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoRoleSwitcher } from "@/components/demo-role-switcher";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DEMO = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const links = [
  { href: "/clases", label: "Clases" },
  { href: "/instructores", label: "Instructores" },
  { href: "/precios", label: "Precios" },
  { href: "/eventos", label: "Eventos" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            AB
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === l.href && "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {DEMO ? (
            <DemoRoleSwitcher />
          ) : (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Ingresar
                  </Button>
                </SignInButton>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/sign-up">Crear cuenta</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
                  <Link href="/app">Mi panel</Link>
                </Button>
                <UserButton />
              </Show>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {DEMO ? (
                <Button asChild size="sm" className="flex-1">
                  <Link href="/app">Entrar al demo</Link>
                </Button>
              ) : (
                <>
                  <Show when="signed-out">
                    <Button asChild size="sm" className="flex-1">
                      <Link href="/sign-up">Crear cuenta</Link>
                    </Button>
                  </Show>
                  <Show when="signed-in">
                    <Button asChild size="sm" className="flex-1">
                      <Link href="/app">Mi panel</Link>
                    </Button>
                  </Show>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
