"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function BroadcastButton({ audience }: { audience: string }) {
  const [sent, setSent] = useState(false);

  return (
    <Button
      size="sm"
      variant={sent ? "secondary" : "default"}
      onClick={() => {
        setSent(true);
        toast.success(`Aviso demo enviado a ${audience}.`);
      }}
      disabled={sent}
    >
      <Send className="size-4" />
      {sent ? "Enviado" : "Enviar"}
    </Button>
  );
}
