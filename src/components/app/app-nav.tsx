"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, CreditCard, LayoutDashboard, Ticket, User } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Inicio", icon: LayoutDashboard },
  { href: "/app/reservar", label: "Reservar", icon: CalendarPlus },
  { href: "/app/reservas", label: "Reservas", icon: Ticket },
  { href: "/app/membresia", label: "Membresía", icon: CreditCard },
  { href: "/app/perfil", label: "Perfil", icon: User },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border/60 p-4 md:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(pathname, item.href)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <item.icon className="size-4" /> {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/60 glass md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive(pathname, item.href)
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          <item.icon className="size-5" /> {item.label}
        </Link>
      ))}
    </nav>
  );
}
