import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getOrSyncUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: el middleware ya bloquea, pero revalidamos aquí.
  const user = await getOrSyncUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/app");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2 font-display font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              AB
            </span>
            <span>Admin · Academia de Baile</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Vista alumno
            </Link>
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <aside className="border-b border-border/60 md:w-60 md:shrink-0 md:border-b-0 md:border-r">
          <AdminNav />
        </aside>
        <main className="flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
