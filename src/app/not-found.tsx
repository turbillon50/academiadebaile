import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="space-y-4">
        <p className="font-display text-7xl font-extrabold text-gradient">404</p>
        <h1 className="font-display text-2xl font-bold">Página no encontrada</h1>
        <p className="text-muted-foreground">
          Parece que este paso no está en la coreografía.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
