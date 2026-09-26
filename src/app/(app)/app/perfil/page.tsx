import { Bell, GraduationCap, HeartPulse, Mail, Shield } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/app/profile-form";
import { requireUser } from "@/lib/auth";
import { getUserBookings } from "@/lib/queries";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await requireUser();
  const bookings = await getUserBookings(user.id);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const classes = Array.from(
    new Set(bookings.map((booking) => booking.session.class.name)),
  ).slice(0, 4);

  return (
    <div className="max-w-4xl space-y-6">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" />
              Contacto de emergencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-semibold">Laura Martínez</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-semibold">55 9876 4321</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Demo: estos campos quedarán conectados al perfil extendido del
              alumno en producción.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              Nivel de baile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nivel actual</span>
              <Badge variant="secondary">Intermedio</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Objetivo</span>
              <span className="font-semibold">Exhibición verano</span>
            </div>
            <div>
              <p className="text-muted-foreground">Clases inscritas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(classes.length > 0 ? classes : ["Jazz Funk", "Hip Hop"]).map(
                  (name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          {["Recordatorios de pago", "Cambios de horario", "Eventos y talleres"].map(
            (label) => (
              <label
                key={label}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-background/35 p-3"
              >
                <span>{label}</span>
                <input type="checkbox" defaultChecked />
              </label>
            ),
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Para cambiar tu correo o contraseña, usa el menú de tu cuenta (avatar) en
        la barra superior, gestionado de forma segura por Clerk.
      </p>
    </div>
  );
}
