import { desc } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { hasRole } from "@/lib/auth";

/** Exporta los pagos a CSV. Sólo admin. */
export async function GET(): Promise<Response> {
  if (!(await hasRole("admin"))) {
    return new Response("No autorizado", { status: 403 });
  }

  const rows = await db.query.payments.findMany({
    orderBy: desc(payments.createdAt),
    with: { user: true },
  });

  const header = [
    "fecha",
    "alumno",
    "email",
    "concepto",
    "monto_mxn",
    "proveedor",
    "estado",
    "referencia",
  ];

  const escape = (v: unknown): string => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = rows.map((p) =>
    [
      p.createdAt.toISOString(),
      `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim(),
      p.user.email,
      p.description ?? "",
      (p.amountCents / 100).toFixed(2),
      p.provider,
      p.status,
      p.providerRef ?? "",
    ]
      .map(escape)
      .join(","),
  );

  const csv = [header.join(","), ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="pagos-academiadebaile.csv"`,
    },
  });
}
