import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { AppBottomNav, AppSidebar } from "@/components/app/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DemoAccountButton,
  DemoRoleSwitcher,
} from "@/components/demo-role-switcher";
import { Badge } from "@/components/ui/badge";
import { getOrSyncUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

import { IS_DEMO as DEMO } from "@/lib/mode";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrSyncUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2 font-display font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              AB
            </span>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            {user?.role === "admin" ? (
              <Link href="/admin">
                <Badge variant="secondary">Panel admin</Badge>
              </Link>
            ) : null}
            <ThemeToggle />
            {DEMO ? (
              <>
                <DemoRoleSwitcher />
                <DemoAccountButton />
              </>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <AppSidebar />
        <main className="flex-1 px-4 pb-24 pt-6 md:pb-10">{children}</main>
      </div>

      <AppBottomNav />
    </div>
  );
}
