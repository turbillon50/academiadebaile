import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { deleteInstructor, upsertInstructor } from "@/lib/actions/admin";
import {
  getAllInstructorsAdmin,
  getAllStylesAdmin,
  getInstructorStyleIds,
} from "@/lib/queries";
import type { Instructor, Style } from "@/db/schema";

export const dynamic = "force-dynamic";

function InstructorFields({
  instructor,
  styles,
  selectedStyleIds,
}: {
  instructor?: Instructor;
  styles: Style[];
  selectedStyleIds: string[];
}) {
  return (
    <>
      {instructor ? <input type="hidden" name="id" value={instructor.id} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" defaultValue={instructor?.fullName} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" name="bio" defaultValue={instructor?.bio ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="photoUrl">Foto (URL)</Label>
          <Input id="photoUrl" name="photoUrl" defaultValue={instructor?.photoUrl ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" defaultValue={instructor?.instagram ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Estilos</Label>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="styleIds"
                value={s.id}
                defaultChecked={selectedStyleIds.includes(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={instructor?.isActive ?? true} />
        Activo
      </label>
    </>
  );
}

export default async function AdminInstructoresPage() {
  const [instructors, styles] = await Promise.all([
    getAllInstructorsAdmin(),
    getAllStylesAdmin(),
  ]);

  // Precargamos las relaciones estilo↔instructor para los formularios de edición.
  const styleIdsByInstructor = new Map<string, string[]>();
  await Promise.all(
    instructors.map(async (i) => {
      styleIdsByInstructor.set(i.id, await getInstructorStyleIds(i.id));
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Instructores</h1>
          <p className="text-muted-foreground">Gestiona al equipo docente.</p>
        </div>
        <FormDialog
          title="Nuevo instructor"
          action={upsertInstructor}
        >
          <InstructorFields styles={styles} selectedStyleIds={[]} />
        </FormDialog>
      </div>

      <DataTable headers={["Instructor", "Instagram", "Estado", ""]}>
        {instructors.map((i) => (
          <tr key={i.id}>
            <td className="px-4 py-3">
              <p className="font-medium">{i.fullName}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{i.bio}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {i.instagram ? `@${i.instagram}` : "—"}
            </td>
            <td className="px-4 py-3">
              <Badge variant={i.isActive ? "success" : "secondary"}>
                {i.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <FormDialog
                  title="Editar instructor"
                  action={upsertInstructor}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                  }
                >
                  <InstructorFields
                    instructor={i}
                    styles={styles}
                    selectedStyleIds={styleIdsByInstructor.get(i.id) ?? []}
                  />
                </FormDialog>
                <DeleteButton id={i.id} action={deleteInstructor} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
