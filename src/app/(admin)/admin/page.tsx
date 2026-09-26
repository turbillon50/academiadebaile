import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarRange,
  Download,
  Percent,
  Receipt,
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
          label="Eventos próximos"
          value={kpis.upcomingEvents}
        />
        <StatCard
          icon={TrendingUp}
          label="Ingresos mensuales"
          value={formatCurrency(kpis.monthlyRevenueCents)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Adeudos pendientes"
          value={kpis.pendingPayments}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="Pagos del mes"
          value={formatCurrency(kpis.monthlyRevenueCents)}
        />
        <StatCard
          icon={CalendarRange}
          label="Clases próximas"
          value={kpis.upcomingSessions}
        />
        <StatCard
          icon={Percent}
          label="Asistencia"
          value={`${kpis.attendanceRate}%`}
        />
        <StatCard
          icon={TrendingUp}
          label="Ingresos totales"
          value={formatCurrency(kpis.revenueCents)}
        />
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Gestión de academia</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/alumnos", label: "Alumnos", icon: Users },
            { href: "/admin/pagos", label: "Pagos", icon: Receipt },
            { href: "/admin/adeudos", label: "Adeudos", icon: AlertTriangle },
            { href: "/admin/clases", label: "Clases / Horarios", icon: CalendarRange },
            { href: "/admin/eventos", label: "Eventos", icon: CalendarRange },
            { href: "/admin/avisos", label: "Avisos masivos", icon: Bell },
            { href: "/admin/instructores", label: "Instructores", icon: Users },
            { href: "/admin/reportes", label: "Reportes", icon: TrendingUp },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5"
            >
              <item.icon className="mb-3 size-5 text-primary" />
              <p className="font-semibold">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

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

      <Card className="border-primary/20">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Acciones rápidas</p>
            <p className="text-sm text-muted-foreground">
              Check-in operativo y avisos masivos para el día.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/check-in">Check-in de hoy</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/avisos">Enviar aviso masivo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
