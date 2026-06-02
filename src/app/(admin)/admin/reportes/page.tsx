import { Download, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/stat-card";
import { getRecentPayments } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReportesPage() {
  const payments = await getRecentPayments(100);
  const paid = payments.filter((p) => p.status === "pagado");
  const total = paid.reduce((acc, p) => acc + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Reportes</h1>
          <p className="text-muted-foreground">
            Ingresos y conciliación de pagos.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/export" download>
            <Download className="size-4" /> Exportar CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Receipt} label="Pagos registrados" value={payments.length} />
        <StatCard icon={Receipt} label="Pagos confirmados" value={paid.length} />
        <StatCard icon={Receipt} label="Total cobrado" value={formatCurrency(total)} />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin pagos registrados"
          description="Cuando haya transacciones, podrás analizarlas y exportarlas aquí."
        />
      ) : (
        <DataTable headers={["Fecha", "Alumno", "Concepto", "Monto", "Proveedor", "Estado"]}>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(p.createdAt, { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 py-3">
                {[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") ||
                  p.user.email}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.description ?? "—"}</td>
              <td className="px-4 py-3 font-medium">
                {formatCurrency(p.amountCents, p.currency)}
              </td>
              <td className="px-4 py-3 capitalize">{p.provider}</td>
              <td className="px-4 py-3">
                <Badge variant={p.status === "pagado" ? "success" : "secondary"}>
                  {p.status}
                </Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <p className="text-xs text-muted-foreground">
        {/* TODO(reportes): añadir filtros por rango de fechas, gráficas de
            ocupación por estilo y desglose de ingresos por método de pago. */}
        Próximamente: filtros por fecha y gráficas de ocupación.
      </p>
    </div>
  );
}
