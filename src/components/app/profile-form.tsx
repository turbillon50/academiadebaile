"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";

export function ProfileForm({
  defaults,
}: {
  defaults: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}) {
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" defaultValue={defaults.firstName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" defaultValue={defaults.lastName} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="55 1234 5678"
          defaultValue={defaults.phone}
        />
        <p className="text-xs text-muted-foreground">
          Lo usamos para enviarte recordatorios de tus clases.
        </p>
      </div>
      <Button type="submit" loading={pending}>
        Guardar cambios
      </Button>
    </form>
  );
}
