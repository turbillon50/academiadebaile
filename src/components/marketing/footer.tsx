import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              AB
            </span>
            {APP_NAME}
          </div>
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Explora</p>
          <Link href="/clases" className="block text-muted-foreground hover:text-foreground">Clases</Link>
          <Link href="/instructores" className="block text-muted-foreground hover:text-foreground">Instructores</Link>
          <Link href="/precios" className="block text-muted-foreground hover:text-foreground">Precios</Link>
          <Link href="/eventos" className="block text-muted-foreground hover:text-foreground">Eventos</Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Cuenta</p>
          <Link href="/sign-in" className="block text-muted-foreground hover:text-foreground">Ingresar</Link>
          <Link href="/sign-up" className="block text-muted-foreground hover:text-foreground">Crear cuenta</Link>
          <Link href="/app" className="block text-muted-foreground hover:text-foreground">Mi panel</Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Contacto</p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" /> Av. del Ritmo 123, CDMX
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4" /> 55 1234 5678
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Instagram className="size-4" /> @academiadebaile
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Hecho con ritmo en México.
      </div>
    </footer>
  );
}
