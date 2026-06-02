"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/lib/actions/bookings";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await cancelBooking(bookingId);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <Button
      onClick={onClick}
      loading={pending}
      size="sm"
      variant="outline"
    >
      Cancelar
    </Button>
  );
}
