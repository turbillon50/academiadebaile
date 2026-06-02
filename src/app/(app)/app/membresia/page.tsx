import { CheckCircle2, CreditCard, Info, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckoutButtons } from "@/components/app/checkout-buttons";
import { requireUser } from "@/lib/auth";
import {
  getActiveMembership,
  getMembershipPlans,
  getUserPayments,
} from "@/lib/queries";
import { MEMBERSHIP_KIND_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MembresiaPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const [membership, plans, payments] = await Promise.all([
    getActiveMembership(user.id),
    getMembershipPlans(),
    getUserPayments(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Membresía y pagos</h1>
        <p className="text-muted-foreground">
          Gestiona tu plan y revisa tu historial de pagos.
        </p>
      </div>

      {sp.pago === "exito" ? (
        <Card className="border-success/40 bg-success/10">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <CheckCircle2 className="size-5 text-success" />
            ¡Pago recibido! Tu membresía se activará en unos segundos.
          </CardContent>
        </Card>
      ) : null}
      {sp.pago === "cancelado" ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <XCircle className="size-5 text-destructive" />
            El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
          </CardContent>
        </Card>
      ) : null}
      {sp.pago === "pendiente" ? (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <Info className="size-5 text-warning-foreground" />
            Tu pago está pendiente de confirmación.
          </CardContent>
        </Card>
      ) : null}

      {membership ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tu plan actual
              <Badge variant="success">Activa</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-semibold">{membership.plan.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Créditos restantes</p>
              <p className="font-semibold">
                {membership.creditsRemaining ?? "Ilimitados"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Vence</p>
              <p className="font-semibold">
                {membership.expiresAt ? formatDate(membership.expiresAt) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">
          {membership ? "Renovar o cambiar de plan" : "Elige tu plan"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <Badge variant="secondary" className="w-fit">
                  {MEMBERSHIP_KIND_LABELS[plan.kind] ?? plan.kind}
                </Badge>
                <h3 className="mt-2 font-display text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <p className="my-3 font-display text-2xl font-extrabold">
                  {formatCurrency(plan.priceCents)}
                </p>
                <CheckoutButtons planId={plan.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Historial de pagos</h2>
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Sin pagos todavía"
            description="Cuando compres un plan, tus recibos aparecerán aquí."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border/60 p-0">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.description ?? "Pago"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.createdAt)} · {p.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(p.amountCents, p.currency)}
                    </p>
                    <Badge
                      variant={p.status === "pagado" ? "success" : "secondary"}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
