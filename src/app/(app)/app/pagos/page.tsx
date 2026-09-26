import { CheckCircle2, CreditCard, Download, Info, Wallet, XCircle } from "lucide-react";

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

function PaymentNotice({ status }: { status?: string }) {
  if (status === "exito") {
    return (
      <Card className="border-success/40 bg-success/10">
        <CardContent className="flex items-center gap-3 p-4 text-sm">
          <CheckCircle2 className="size-5 text-success" />
          Pago recibido. La confirmación final llegará cuando el webhook lo
          concilie.
        </CardContent>
      </Card>
    );
  }
  if (status === "cancelado") {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardContent className="flex items-center gap-3 p-4 text-sm">
          <XCircle className="size-5 text-destructive" />
          El pago fue cancelado. Puedes volver a intentarlo con Mercado Pago.
        </CardContent>
      </Card>
    );
  }
  if (status === "pendiente") {
    return (
      <Card className="border-warning/40 bg-warning/10">
        <CardContent className="flex items-center gap-3 p-4 text-sm">
          <Info className="size-5 text-warning-foreground" />
          Pago pendiente de confirmación por el proveedor.
        </CardContent>
      </Card>
    );
  }
  return null;
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const [membership, plans, userPayments] = await Promise.all([
    getActiveMembership(user.id),
    getMembershipPlans(),
    getUserPayments(user.id),
  ]);
  const monthlyPlan =
    plans.find((plan) => plan.kind === "mensualidad") ?? plans.at(-1);
  const currentBalance = membership ? 0 : (monthlyPlan?.priceCents ?? 85000);
  const nextDueDate = membership?.expiresAt ?? new Date("2026-06-05T06:00:00Z");
  const pendingPayments = userPayments.filter((p) => p.status === "pendiente");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mis pagos</h1>
        <p className="text-muted-foreground">
          Saldo, adeudos, historial y pagos con Mercado Pago.
        </p>
      </div>

      <PaymentNotice status={sp.pago} />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              Estado de mensualidad
              <Badge variant={membership ? "success" : "warning"}>
                {membership ? "Al corriente" : "Adeudo pendiente"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Saldo actual</p>
              <p className="font-display text-4xl font-extrabold">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Próximo pago</p>
                <p className="font-semibold">{formatDate(nextDueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-semibold">
                  {membership?.plan.name ?? monthlyPlan?.name ?? "Mensualidad"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proveedor</p>
                <p className="font-semibold">Mercado Pago</p>
              </div>
            </div>
            {monthlyPlan ? (
              <CheckoutButtons planId={monthlyPlan.id} mercadoPagoOnly />
            ) : (
              <p className="text-sm text-muted-foreground">
                Configura planes de membresía para habilitar checkout.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adeudos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentBalance === 0 && pendingPayments.length === 0 ? (
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="font-semibold text-success">Sin adeudos</p>
                <p className="text-sm text-muted-foreground">
                  Tu cuenta está al corriente.
                </p>
              </div>
            ) : (
              <>
                {currentBalance > 0 ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
                    <div>
                      <p className="font-semibold">Mensualidad vigente</p>
                      <p className="text-sm text-muted-foreground">
                        Vence el {formatDate(nextDueDate)}
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(currentBalance)}</p>
                  </div>
                ) : null}
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {payment.description ?? "Pago pendiente"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)} · {payment.provider}
                      </p>
                    </div>
                    <p className="font-bold">
                      {formatCurrency(payment.amountCents, payment.currency)}
                    </p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Planes disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <Badge variant="secondary" className="w-fit">
                  {MEMBERSHIP_KIND_LABELS[plan.kind] ?? plan.kind}
                </Badge>
                <h3 className="mt-3 font-display text-lg font-bold">
                  {plan.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <p className="my-3 font-display text-2xl font-extrabold">
                  {formatCurrency(plan.priceCents)}
                </p>
                <CheckoutButtons planId={plan.id} mercadoPagoOnly />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Historial de pagos</h2>
        {userPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Sin pagos todavía"
            description="Cuando pagues una mensualidad, tus recibos aparecerán aquí."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border/60 p-0">
              {userPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {payment.description ?? "Mensualidad FDS"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.createdAt)} · {payment.provider}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(payment.amountCents, payment.currency)}
                      </p>
                      <Badge
                        variant={
                          payment.status === "pagado" ? "success" : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <a
                      href={`/api/receipts/${payment.id}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Download className="size-4" /> Recibo
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <Card className="border-primary/20">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Wallet className="size-5 text-primary" />
          Mercado Pago se usa para Checkout Pro. En modo demo se muestra el
          flujo listo; en producción se completa con tokens y webhook real.
        </CardContent>
      </Card>
    </div>
  );
}
