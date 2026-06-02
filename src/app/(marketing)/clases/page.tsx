import type { Metadata } from "next";
import { CalendarX } from "lucide-react";

import { ClassesFilter } from "@/components/marketing/classes-filter";
import { SessionCard } from "@/components/session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getActiveStyles, getUpcomingSessions } from "@/lib/queries";
import { safe } from "@/lib/safe";
import type { DanceLevelValue } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clases y horarios",
  description: "Consulta el horario semanal y reserva tu clase de baile.",
};

const LEVELS = ["principiante", "intermedio", "avanzado"];

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: Promise<{ estilo?: string; nivel?: string }>;
}) {
  const sp = await searchParams;
  const styles = await safe(getActiveStyles(), []);
  const styleMatch = styles.find((s) => s.slug === sp.estilo);
  const level =
    sp.nivel && LEVELS.includes(sp.nivel)
      ? (sp.nivel as DanceLevelValue)
      : undefined;

  const sessions = await safe(
    getUpcomingSessions({
      styleId: styleMatch?.id,
      level,
      limit: 80,
    }),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-extrabold">Clases y horarios</h1>
        <p className="mt-2 text-muted-foreground">
          Filtra por estilo y nivel. Los cupos se actualizan en tiempo real.
        </p>
      </header>

      <div className="mb-8">
        <ClassesFilter styles={styles} />
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No hay clases con esos filtros"
          description="Prueba con otro estilo o nivel, o vuelve más tarde para ver el nuevo horario."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
