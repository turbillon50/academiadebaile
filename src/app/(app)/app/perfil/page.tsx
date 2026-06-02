import { Mail, Shield } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/app/profile-form";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await requireUser();
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mi perfil</h1>
        <p className="text-muted-foreground">
          Mantén tus datos actualizados para una mejor experiencia.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-16">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={fullName} />
            ) : null}
            <AvatarFallback>{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {fullName || "Sin nombre"}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" /> {user.email}
            </p>
            <Badge variant="secondary" className="mt-1 gap-1">
              <Shield className="size-3" />
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaults={{
              firstName: user.firstName ?? "",
              lastName: user.lastName ?? "",
              phone: user.phone ?? "",
            }}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Para cambiar tu correo o contraseña, usa el menú de tu cuenta (avatar) en
        la barra superior, gestionado de forma segura por Clerk.
      </p>
    </div>
  );
}
