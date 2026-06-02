import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { deleteStyle, upsertStyle } from "@/lib/actions/admin";
import { getAllStylesAdmin } from "@/lib/queries";
import type { Style } from "@/db/schema";

export const dynamic = "force-dynamic";

function StyleFields({ style }: { style?: Style }) {
  return (
    <>
      {style ? <input type="hidden" name="id" value={style.id} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={style?.name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={style?.description ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="accentColor">Color de acento</Label>
          <Input
            id="accentColor"
            name="accentColor"
            type="color"
            defaultValue={style?.accentColor ?? "#e11d48"}
            className="h-10 p-1"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={style?.imageUrl ?? ""} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={style?.isActive ?? true} />
        Activo
      </label>
    </>
  );
}

export default async function AdminEstilosPage() {
  const styles = await getAllStylesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Estilos</h1>
          <p className="text-muted-foreground">Administra los estilos de baile.</p>
        </div>
        <FormDialog
          title="Nuevo estilo"
          description="Agrega un estilo de baile al catálogo."
          action={upsertStyle}
        >
          <StyleFields />
        </FormDialog>
      </div>

      <DataTable headers={["Estilo", "Color", "Estado", ""]}>
        {styles.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3">
              <p className="font-medium">{s.name}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {s.description}
              </p>
            </td>
            <td className="px-4 py-3">
              <span
                className="inline-block size-5 rounded-full border"
                style={{ backgroundColor: s.accentColor ?? "#e11d48" }}
              />
            </td>
            <td className="px-4 py-3">
              <Badge variant={s.isActive ? "success" : "secondary"}>
                {s.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <FormDialog
                  title="Editar estilo"
                  action={upsertStyle}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                  }
                >
                  <StyleFields style={s} />
                </FormDialog>
                <DeleteButton id={s.id} action={deleteStyle} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
