import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { getMembershipPlans } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { MEMBERSHIP_KIND_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Precios y membresías",
  description: "Elige el plan ideal: clase suelta, paquetes o mensualidad ilimitada.",
};

function planPerks(kind: string, credits: number | null): string[] {
  if (kind === "mensualidad") {
    return ["Clases ilimitadas", "Todos los estilos", "Acceso a sociales", "Sin permanencia"];
  }
  if (kind === "paquete") {
    return [`${credits ?? ""} clases a elegir`, "Vigencia flexible", "Todos los estilos", "Reagenda fácil"];
  }
  return ["1 clase a elegir", "Ideal para probar", "Sin compromiso"];
}

export default async function PreciosPage() {
  const plans = await safe(getMembershipPlans(), []);
  // El plan destacado: la mensualidad ilimitada si existe.
  const featuredId = plans.find((p) => p.kind === "mensualidad")?.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl font-extrabold">Precios y membresías</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Sin contratos complicados. Paga con tarjeta (Stripe) o Mercado Pago.
          Cancela cuando quieras.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4 sm:grid-cols-2">
        {plans.map((plan, i) => {
          const featured = plan.id === featuredId;
          return (
            <Reveal key={plan.id} delay={i * 0.05} className="h-full">
              <Card
                className={
                  featured
                    ? "relative h-full border-primary shadow-lg ring-1 ring-primary"
                    : "h-full"
                }
              >
                {featured ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                    <Sparkles className="size-3" /> Más popular
                  </Badge>
                ) : null}
                <CardContent className="flex h-full flex-col p-6">
                  <Badge variant="secondary" className="w-fit">
                    {MEMBERSHIP_KIND_LABELS[plan.kind] ?? plan.kind}
                  </Badge>
                  <h3 className="mt-3 font-display text-xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <p className="mt-4 font-display text-4xl font-extrabold">
                    {formatCurrency(plan.priceCents)}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {planPerks(plan.kind, plan.classCredits).map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <Check className="size-4 text-success" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-6 w-full"
                    variant={featured ? "default" : "outline"}
                  >
                    <Link href="/app/membresia">Elegir plan</Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿Eres principiante? Empieza con una clase suelta y descubre tu estilo.{" "}
        <Link href="/clases" className="text-primary underline-offset-4 hover:underline">
          Ver horarios
        </Link>
      </p>
    </div>
  );
}
