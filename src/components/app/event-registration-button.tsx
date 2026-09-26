"use client";

import { useState } from "react";
import { CheckCircle2, Ticket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function EventRegistrationButton({
  eventTitle,
}: {
  eventTitle: string;
}) {
  const [registered, setRegistered] = useState(false);

  return (
    <Button
      className="w-full"
      variant={registered ? "secondary" : "default"}
      onClick={() => {
        setRegistered(true);
        toast.success(`Registro demo confirmado para ${eventTitle}.`);
      }}
      disabled={registered}
    >
      {registered ? <CheckCircle2 className="size-4" /> : <Ticket className="size-4" />}
      {registered ? "Registrado" : "Registrarme"}
    </Button>
  );
}
