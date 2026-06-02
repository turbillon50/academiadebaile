"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StyleOption {
  slug: string;
  name: string;
}

export function ClassesFilter({ styles }: { styles: StyleOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const estilo = params.get("estilo") ?? "todos";
  const nivel = params.get("nivel") ?? "todos";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "todos") next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`/clases?${next.toString()}`);
    });
  }

  return (
    <div
      className="flex flex-wrap gap-4 rounded-xl border bg-card p-4"
      data-pending={pending ? "" : undefined}
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="estilo">Estilo</Label>
        <Select value={estilo} onValueChange={(v) => update("estilo", v)}>
          <SelectTrigger id="estilo">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estilos</SelectItem>
            {styles.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="nivel">Nivel</Label>
        <Select value={nivel} onValueChange={(v) => update("nivel", v)}>
          <SelectTrigger id="nivel">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            <SelectItem value="principiante">Principiante</SelectItem>
            <SelectItem value="intermedio">Intermedio</SelectItem>
            <SelectItem value="avanzado">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
