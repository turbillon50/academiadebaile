import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Heart,
  MapPin,
  Music,
  Sparkles,
  Star,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { SessionCard } from "@/components/session-card";
import {
  getActiveInstructors,
  getActiveStyles,
  getMembershipPlans,
  getPublishedEvents,
  getUpcomingSessions,
} from "@/lib/queries";
import { safe } from "@/lib/safe";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { formatCurrency, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&q=80";

const testimonios = [
  { name: "Valeria M.", text: "Llegué sin saber nada de salsa y hoy bailo en sociales. El ambiente es increíble.", style: "Salsa" },
  { name: "Andrés L.", text: "Los instructores te corrigen con paciencia. Mejoré muchísimo mi musicalidad.", style: "Bachata" },
  { name: "Paola R.", text: "Reservar clases desde el cel es lo mejor. Nunca pierdo mi lugar.", style: "Contemporáneo" },
];

const pasos = [
  { icon: UserCheck, title: "Crea tu cuenta", desc: "Regístrate en segundos y elige tu nivel." },
  { icon: CalendarCheck, title: "Reserva tu clase", desc: "Mira los cupos en tiempo real y aparta tu lugar." },
  { icon: CreditCard, title: "Paga seguro", desc: "Membresías y paquetes con Stripe o Mercado Pago." },
  { icon: Heart, title: "Vive el ritmo", desc: "Llega, haz check-in y disfruta de bailar." },
];

export default async function LandingPage() {
  const [styles, instructors, sessions, plans, events] = await Promise.all([
    safe(getActiveStyles(), []),
    safe(getActiveInstructors(), []),
    safe(getUpcomingSessions({ limit: 6 }), []),
    safe(getMembershipPlans(), []),
    safe(getPublishedEvents(), []),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="Bailarines en movimiento"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-28 md:py-40">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3.5" /> Inscripciones abiertas
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {APP_TAGLINE}.
            <span className="block text-gradient">Baila con nosotros.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Clases de salsa, bachata, cumbia y más en el corazón de la ciudad.
            Reserva en línea, sigue tu progreso y forma parte de la comunidad de{" "}
            {APP_NAME}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Empieza hoy <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/clases">Ver horarios</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-warning text-warning" /> 4.9/5 reseñas
            </span>
            <span className="flex items-center gap-1.5">
              <Music className="size-4 text-primary" /> {styles.length || 6} estilos
            </span>
          </div>
        </div>
      </section>

      {/* ESTILOS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Encuentra tu estilo
          </h2>
          <p className="mt-2 text-muted-foreground">
            Del sabor latino al movimiento urbano. Hay un ritmo para ti.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {(styles.length > 0
            ? styles
            : []
          ).map((style, i) => (
            <Reveal key={style.id} delay={i * 0.05}>
              <Link href={`/clases?estilo=${style.slug}`}>
                <Card
                  className="group relative h-40 overflow-hidden border-0"
                  style={{
                    background: `linear-gradient(135deg, ${style.accentColor ?? "#e11d48"}, color-mix(in oklch, ${style.accentColor ?? "#e11d48"} 40%, black))`,
                  }}
                >
                  <CardContent className="flex h-full flex-col justify-end p-5 text-white">
                    <Music className="absolute right-4 top-4 size-8 opacity-30 transition-transform group-hover:scale-125" />
                    <h3 className="font-display text-xl font-bold">{style.name}</h3>
                    <p className="line-clamp-2 text-sm text-white/80">
                      {style.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
          {styles.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              Pronto publicaremos nuestros estilos. ¡Mantente al ritmo!
            </p>
          ) : null}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Empezar es muy fácil
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-4">
            {pasos.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <p.icon className="size-7" />
                  </div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTORES */}
      {instructors.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Tus instructores
              </h2>
              <p className="mt-2 text-muted-foreground">
                Profesionales que viven el baile y te llevan al siguiente nivel.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/instructores">
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {instructors.slice(0, 4).map((ins, i) => (
              <Reveal key={ins.id} delay={i * 0.05}>
                <Card className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    {ins.photoUrl ? (
                      <Image
                        src={ins.photoUrl}
                        alt={ins.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-2xl font-bold text-muted-foreground">
                        {initials(ins.fullName)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{ins.fullName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {ins.styles.map((s) => s.name).join(" · ")}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* PRÓXIMAS CLASES */}
      {sessions.length > 0 ? (
        <section className="border-y border-border/60 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <Reveal className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Próximas clases
              </h2>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/clases">
                  Horario completo <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {sessions.slice(0, 6).map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05}>
                  <SessionCard session={s} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* PRECIOS */}
      {plans.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Planes para cada ritmo
            </h2>
            <p className="mt-2 text-muted-foreground">
              Desde una clase suelta hasta acceso ilimitado.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.05}>
                <Card className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <p className="mt-4 font-display text-3xl font-extrabold">
                      {formatCurrency(plan.priceCents)}
                    </p>
                    <Button asChild className="mt-6 w-full">
                      <Link href="/precios">Elegir</Link>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* TESTIMONIOS */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Lo que dicen nuestros alumnos
            </h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonios.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <Card className="h-full">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="size-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm">“{t.text}”</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{t.name}</span>
                      <Badge variant="secondary">{t.style}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + UBICACIÓN */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center md:p-16">
            <h2 className="max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">
              ¿List@ para subir a la pista?
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Tu primera clase te está esperando. Únete a {APP_NAME} y descubre
              de lo que eres capaz.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/sign-up">
                Crear mi cuenta <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="flex items-center gap-2 text-sm text-primary-foreground/80">
              <MapPin className="size-4" /> Av. del Ritmo 123, Ciudad de México
            </p>
            {events.length > 0 ? (
              <p className="text-sm text-primary-foreground/80">
                Próximo evento: <strong>{events[0]?.title}</strong>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
