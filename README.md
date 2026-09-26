# FDS Academy

PWA mobile-first para una academia de baile: alumnos consultan clases, pagan
mensualidades, reciben avisos, revisan eventos y gestionan su perfil. Incluye
panel administrativo para alumnos, pagos, adeudos, clases/horarios, eventos,
avisos masivos, instructores y reportes.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui + lucide-react
- Clerk Authentication
- Neon PostgreSQL + Drizzle ORM
- Mercado Pago Checkout Pro
- Resend para email
- Vercel + PWA manifest

## Pantallas listas

Alumno:

- `/sign-in` y `/sign-up`
- `/app` dashboard
- `/app/clases` horario semanal, asistencia e inscripción
- `/app/pagos` saldo, adeudos, Mercado Pago, historial y recibo
- `/app/eventos` eventos y registro demo
- `/app/avisos` avisos por categoría
- `/app/perfil` datos personales, emergencia, nivel y notificaciones

Admin:

- `/admin` dashboard operativo
- `/admin/alumnos`
- `/admin/pagos`
- `/admin/adeudos`
- `/admin/clases`
- `/admin/eventos`
- `/admin/avisos`
- `/admin/instructores`
- `/admin/check-in`
- `/admin/reportes`

## Demo local sin cuentas externas

```bash
npm install
npm run demo
```

El modo demo copia `.env.demo`, levanta Postgres local con Docker, aplica el
schema, siembra datos y arranca la app en `http://localhost:3000`.

## Desarrollo local normal

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev
```

Requisito recomendado: Node.js 20.9+.

## Variables de entorno

Minimas:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `RESEND_API_KEY`

Webhooks/produccion:

- `CLERK_WEBHOOK_SECRET`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` si se mantiene Stripe opcional
- `N8N_REMINDER_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`

## Deploy en Vercel

1. Importa el repo en Vercel.
2. Configura las variables de `.env.example`.
3. Conecta Clerk, Neon y Resend desde Marketplace si quieres auto-provisionar.
4. Configura Mercado Pago con webhook:
   `/api/webhooks/mercadopago`.
5. Ejecuta migraciones contra Neon:

```bash
npm run db:migrate
```

6. Despliega con el build de Vercel.

## Produccion real pendiente

- Persistir avisos masivos y preferencias de notificacion en DB.
- Validar firma completa de webhooks de Mercado Pago.
- Conectar registro de eventos a pagos/tickets reales.
- Persistir contacto de emergencia, tutor y perfil extendido del alumno.
- Agregar metricas/graficas avanzadas y filtros por rango de fecha.
- Revisar vulnerabilidades moderadas reportadas por `npm audit`.
