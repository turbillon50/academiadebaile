import Link from "next/link";
import {
  CalendarRange,
  Download,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/stat-card";
import { getAdminKpis, getRecentPayments } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [kpis, recent] = await Promise.all([
    getAdminKpis(),
    getRecentPayments(8),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Resumen</h1>
          <p className="text-muted-foreground">
            Métricas clave de la academia en tiempo real.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/export" download>
            <Download className="size-4" /> Exportar pagos (CSV)
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Membresías activas"
          value={kpis.activeStudents}
        />
        <StatCard
          icon={CalendarRange}
          label="Sesiones próximas"
          value={kpis.upcomingSessions}
        />
        <StatCard
          icon={TrendingUp}
          label="Ingresos cobrados"
          value={formatCurrency(kpis.revenueCents)}
        />
        <StatCard
          icon={Percent}
          label="% Asistencia"
          value={`${kpis.attendanceRate}%`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Aún no hay pagos"
              description="Los pagos de membresías aparecerán aquí."
            />
          ) : (
            <DataTable headers={["Alumno", "Concepto", "Monto", "Proveedor", "Estado", "Fecha"]}>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") ||
                      p.user.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(p.amountCents, p.currency)}
                  </td>
                  <td className="px-4 py-3 capitalize">{p.provider}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "pagado" ? "success" : "secondary"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.createdAt, { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Accesos rápidos</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin/clases">Gestionar clases</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin/check-in">Check-in de hoy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
