import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { deleteClass, upsertClass } from "@/lib/actions/admin";
import {
  getAllClassesAdmin,
  getAllInstructorsAdmin,
  getAllStylesAdmin,
  getRoomsAdmin,
} from "@/lib/queries";
import { LEVEL_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Class, Instructor, Room, Style } from "@/db/schema";

export const dynamic = "force-dynamic";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ClassFields({
  cls,
  styles,
  instructors,
  rooms,
}: {
  cls?: Class;
  styles: Style[];
  instructors: Instructor[];
  rooms: Room[];
}) {
  return (
    <>
      {cls ? <input type="hidden" name="id" value={cls.id} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre de la clase</Label>
        <Input id="name" name="name" defaultValue={cls?.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="styleId">Estilo</Label>
          <select id="styleId" name="styleId" defaultValue={cls?.styleId} className={selectClass} required>
            {styles.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Nivel</Label>
          <select id="level" name="level" defaultValue={cls?.level ?? "principiante"} className={selectClass}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="instructorId">Instructor</Label>
          <select id="instructorId" name="instructorId" defaultValue={cls?.instructorId} className={selectClass} required>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.fullName}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roomId">Sala</Label>
          <select id="roomId" name="roomId" defaultValue={cls?.roomId ?? ""} className={selectClass}>
            <option value="">Sin asignar</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Cupo</Label>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={cls?.capacity ?? 20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationMin">Duración (min)</Label>
          <Input id="durationMin" name="durationMin" type="number" min={15} defaultValue={cls?.durationMin ?? 60} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dropInPriceCents">Drop-in (centavos)</Label>
          <Input id="dropInPriceCents" name="dropInPriceCents" type="number" min={0} defaultValue={cls?.dropInPriceCents ?? 15000} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={cls?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={cls?.isActive ?? true} />
        Activa
      </label>
    </>
  );
}

export default async function AdminClasesPage() {
  const [classes, styles, instructors, rooms] = await Promise.all([
    getAllClassesAdmin(),
    getAllStylesAdmin(),
    getAllInstructorsAdmin(),
    getRoomsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Clases</h1>
          <p className="text-muted-foreground">
            Define las clases y su configuración.
          </p>
        </div>
        <FormDialog title="Nueva clase" action={upsertClass}>
          <ClassFields styles={styles} instructors={instructors} rooms={rooms} />
        </FormDialog>
      </div>

      <DataTable headers={["Clase", "Nivel", "Instructor", "Cupo", "Drop-in", ""]}>
        {classes.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.style.name}</p>
            </td>
            <td className="px-4 py-3">
              <Badge variant="outline">{LEVEL_LABELS[c.level] ?? c.level}</Badge>
            </td>
            <td className="px-4 py-3">{c.instructor.fullName}</td>
            <td className="px-4 py-3">{c.capacity}</td>
            <td className="px-4 py-3">{formatCurrency(c.dropInPriceCents)}</td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <FormDialog
                  title="Editar clase"
                  action={upsertClass}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                  }
                >
                  <ClassFields cls={c} styles={styles} instructors={instructors} rooms={rooms} />
                </FormDialog>
                <DeleteButton id={c.id} action={deleteClass} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <p className="text-xs text-muted-foreground">
        {/* TODO(horarios): añadir gestión de horarios recurrentes y generación
            automática de sesiones desde esta vista (actualmente vía seed). */}
        Las sesiones se generan a partir de los horarios recurrentes de cada clase.
      </p>
    </div>
  );
}
