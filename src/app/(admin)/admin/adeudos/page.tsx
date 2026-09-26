import { AlertTriangle, CircleDollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/stat-card";
import { getAllUsersAdmin, getRecentPayments } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAdeudosPage() {
  const [users, payments] = await Promise.all([
    getAllUsersAdmin(),
    getRecentPayments(200),
  ]);
  const students = users.filter((user) => user.role === "alumno");
  const pendingPayments = payments.filter((payment) => payment.status === "pendiente");
  const studentsWithoutActivePlan = students.filter(
    (student) => !student.memberships.some((membership) => membership.status === "activa"),
  );
  const debtRows = [
    ...pendingPayments.map((payment) => ({
      id: payment.id,
      name:
        [payment.user.firstName, payment.user.lastName].filter(Boolean).join(" ") ||
        payment.user.email,
      email: payment.user.email,
      concept: payment.description ?? "Pago pendiente",
      amountCents: payment.amountCents,
      status: "Pendiente",
      dueAt: payment.createdAt,
    })),
    ...studentsWithoutActivePlan.map((student) => ({
      id: student.id,
      name:
        [student.firstName, student.lastName].filter(Boolean).join(" ") ||
        student.email,
      email: student.email,
      concept: "Mensualidad sin plan activo",
      amountCents: 85000,
      status: "Adeudo",
      dueAt: new Date("2026-06-05T06:00:00Z"),
    })),
  ];
  const totalDebt = debtRows.reduce((acc, row) => acc + row.amountCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Adeudos</h1>
        <p className="text-muted-foreground">
          Seguimiento de mensualidades vencidas y pagos pendientes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={AlertTriangle} label="Cuentas con adeudo" value={debtRows.length} />
        <StatCard icon={CircleDollarSign} label="Monto pendiente" value={formatCurrency(totalDebt)} />
        <StatCard icon={AlertTriangle} label="Sin plan activo" value={studentsWithoutActivePlan.length} />
      </div>

      {debtRows.length === 0 ? (
        <EmptyState
          icon={CircleDollarSign}
          title="Sin adeudos"
          description="Todos los alumnos activos están al corriente."
        />
      ) : (
        <DataTable headers={["Alumno", "Email", "Concepto", "Monto", "Estado", "Vence"]}>
          {debtRows.map((row) => (
            <tr key={`${row.id}-${row.concept}`}>
              <td className="px-4 py-3 font-medium">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
              <td className="px-4 py-3">{row.concept}</td>
              <td className="px-4 py-3 font-semibold">
                {formatCurrency(row.amountCents)}
              </td>
              <td className="px-4 py-3">
                <Badge variant="warning">{row.status}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(row.dueAt, {
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
