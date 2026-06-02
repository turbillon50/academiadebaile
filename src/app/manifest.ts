import type { MetadataRoute } from "next";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: "Reserva clases de baile, membresías y eventos.",
    start_url: "/app",
    display: "standalone",
    background_color: "#221a20",
    theme_color: "#221a20",
    lang: "es-MX",
    orientation: "portrait",
    categories: ["lifestyle", "health", "education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
