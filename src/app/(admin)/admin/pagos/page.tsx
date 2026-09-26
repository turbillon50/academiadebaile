import { Download, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/stat-card";
import { getRecentPayments } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPagosPage() {
  const payments = await getRecentPayments(100);
  const paid = payments.filter((payment) => payment.status === "pagado");
  const pending = payments.filter((payment) => payment.status === "pendiente");
  const total = paid.reduce((acc, payment) => acc + payment.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Pagos</h1>
          <p className="text-muted-foreground">
            Control de mensualidades, proveedores y conciliación.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/export" download>
            <Download className="size-4" /> Exportar CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Receipt} label="Pagos confirmados" value={paid.length} />
        <StatCard icon={Receipt} label="Pendientes" value={pending.length} />
        <StatCard icon={Receipt} label="Total cobrado" value={formatCurrency(total)} />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin pagos registrados"
          description="Los pagos de Mercado Pago aparecerán aquí al recibir webhooks."
        />
      ) : (
        <DataTable headers={["Alumno", "Concepto", "Monto", "Proveedor", "Estado", "Fecha"]}>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3">
                {[payment.user.firstName, payment.user.lastName]
                  .filter(Boolean)
                  .join(" ") || payment.user.email}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {payment.description ?? "Mensualidad"}
              </td>
              <td className="px-4 py-3 font-medium">
                {formatCurrency(payment.amountCents, payment.currency)}
              </td>
              <td className="px-4 py-3 capitalize">{payment.provider}</td>
              <td className="px-4 py-3">
                <Badge
                  variant={payment.status === "pagado" ? "success" : "secondary"}
                >
                  {payment.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(payment.createdAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
