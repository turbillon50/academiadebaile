"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/bookings";

export function DeleteButton({
  id,
  action,
  label = "Eliminar",
  confirmText = "¿Eliminar este registro? Esta acción no se puede deshacer.",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await action(id);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <Button
      onClick={onClick}
      loading={pending}
      variant="ghost"
      size="icon"
      aria-label={label}
    >
      {!pending ? <Trash2 className="size-4 text-destructive" /> : null}
    </Button>
  );
}
