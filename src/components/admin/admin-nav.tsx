"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  Music,
  PartyPopper,
  QrCode,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/clases", label: "Clases", icon: CalendarRange },
  { href: "/admin/instructores", label: "Instructores", icon: Users },
  { href: "/admin/estilos", label: "Estilos", icon: Music },
  { href: "/admin/eventos", label: "Eventos", icon: PartyPopper },
  { href: "/admin/alumnos", label: "Alumnos", icon: GraduationCap },
  { href: "/admin/check-in", label: "Check-in", icon: QrCode },
  { href: "/admin/reportes", label: "Reportes", icon: Settings },
] as const;

function active(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-1 md:overflow-visible md:p-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active(pathname, item.href)
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
