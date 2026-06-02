"use client";

import { useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reserveSession } from "@/lib/actions/bookings";

export function ReserveButton({
  sessionId,
  disabled,
}: {
  sessionId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await reserveSession(sessionId);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <Button
      onClick={onClick}
      loading={pending}
      disabled={disabled}
      size="sm"
      className="w-full"
    >
      {!pending ? <CalendarPlus className="size-4" /> : null}
      {disabled ? "Sin cupo" : "Reservar"}
    </Button>
  );
}
