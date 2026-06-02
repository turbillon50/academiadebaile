import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllUsersAdmin } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAlumnosPage() {
  const users = await getAllUsersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Alumnos</h1>
        <p className="text-muted-foreground">
          Directorio de usuarios y su membresía vigente.
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Sin alumnos todavía"
          description="Cuando se registren usuarios aparecerán aquí."
        />
      ) : (
        <DataTable headers={["Alumno", "Email", "Rol", "Membresía", "Alta"]}>
          {users.map((u) => {
            const active = u.memberships.find((m) => m.status === "activa");
            return (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {active ? (
                    <Badge variant="success">{active.plan.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">Sin plan</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(u.createdAt, { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
