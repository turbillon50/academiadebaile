import type { Metadata } from "next";
import Image from "next/image";
import { Instagram, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/reveal";
import { getActiveInstructors } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Instructores",
  description: "Conoce al equipo de instructores de Academia de Baile.",
};

export default async function InstructoresPage() {
  const instructors = await safe(getActiveInstructors(), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-extrabold">Instructores</h1>
        <p className="mt-2 text-muted-foreground">
          Bailarines profesionales apasionados por enseñar.
        </p>
      </header>

      {instructors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no hay instructores publicados"
          description="Estamos armando el mejor equipo. Vuelve pronto."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((ins, i) => (
            <Reveal key={ins.id} delay={i * 0.05}>
              <Card className="h-full overflow-hidden">
                <div className="relative h-60 bg-muted">
                  {ins.photoUrl ? (
                    <Image
                      src={ins.photoUrl}
                      alt={ins.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-3xl font-bold text-muted-foreground">
                      {initials(ins.fullName)}
                    </div>
                  )}
                </div>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">
                      {ins.fullName}
                    </h3>
                    {ins.instagram ? (
                      <a
                        href={`https://instagram.com/${ins.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label={`Instagram de ${ins.fullName}`}
                      >
                        <Instagram className="size-5" />
                      </a>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ins.styles.map((s) => (
                      <Badge key={s.id} variant="secondary">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                  {ins.bio ? (
                    <p className="text-sm text-muted-foreground">{ins.bio}</p>
                  ) : null}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
