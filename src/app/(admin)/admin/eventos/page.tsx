import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { deleteEvent, upsertEvent } from "@/lib/actions/admin";
import { getAllEventsAdmin } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DanceEvent } from "@/db/schema";

export const dynamic = "force-dynamic";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Date → "YYYY-MM-DDTHH:mm" para <input type="datetime-local">. */
function toLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_VARIANT: Record<string, "success" | "secondary" | "destructive" | "warning"> = {
  publicado: "success",
  borrador: "secondary",
  agotado: "warning",
  finalizado: "secondary",
  cancelado: "destructive",
};

function EventFields({ event }: { event?: DanceEvent }) {
  return (
    <>
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={event?.title} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={event?.description ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Inicia</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(event?.startsAt)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Termina (opcional)</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(event?.endsAt)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" name="location" defaultValue={event?.location ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coverUrl">Portada (URL)</Label>
        <Input id="coverUrl" name="coverUrl" defaultValue={event?.coverUrl ?? ""} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="priceCents">Precio (centavos)</Label>
          <Input id="priceCents" name="priceCents" type="number" min={0} defaultValue={event?.priceCents ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Cupo</Label>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? 100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Estado</Label>
          <select id="status" name="status" defaultValue={event?.status ?? "borrador"} className={selectClass}>
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
            <option value="agotado">Agotado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
    </>
  );
}

export default async function AdminEventosPage() {
  const events = await getAllEventsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Eventos</h1>
          <p className="text-muted-foreground">Talleres, sociales y competencias.</p>
        </div>
        <FormDialog title="Nuevo evento" action={upsertEvent}>
          <EventFields />
        </FormDialog>
      </div>

      <DataTable headers={["Evento", "Fecha", "Precio", "Cupo", "Estado", ""]}>
        {events.map((ev) => (
          <tr key={ev.id}>
            <td className="px-4 py-3">
              <p className="font-medium">{ev.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{ev.location}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {formatDate(ev.startsAt, { day: "numeric", month: "short", year: "numeric" })}
            </td>
            <td className="px-4 py-3">
              {ev.priceCents === 0 ? "Gratis" : formatCurrency(ev.priceCents)}
            </td>
            <td className="px-4 py-3">{ev.capacity}</td>
            <td className="px-4 py-3">
              <Badge variant={STATUS_VARIANT[ev.status] ?? "secondary"}>
                {ev.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <FormDialog
                  title="Editar evento"
                  action={upsertEvent}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                  }
                >
                  <EventFields event={ev} />
                </FormDialog>
                <DeleteButton id={ev.id} action={deleteEvent} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
