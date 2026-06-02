"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, UserX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { checkInBooking, markNoShow } from "@/lib/actions/check-in";

export function CheckInButton({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(fn: (id: string) => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn(bookingId);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant={status === "asistio" ? "default" : "outline"}
        loading={pending}
        onClick={() => run(checkInBooking)}
      >
        {!pending ? <Check className="size-4" /> : null}
        {status === "asistio" ? "Presente" : "Check-in"}
      </Button>
      {status !== "asistio" ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label="No asistió"
          onClick={() => run(markNoShow)}
        >
          <UserX className="size-4 text-muted-foreground" />
        </Button>
      ) : null}
    </div>
  );
}
