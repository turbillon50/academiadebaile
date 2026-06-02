# 💃 Academia de Baile

Plataforma de producción para la gestión integral de una academia de baile en
México: clases, reservas en tiempo real, membresías, pagos (Stripe + Mercado
Pago), eventos con boletaje, asistencia y panel administrativo.

PWA instalable, mobile-first, con modo claro/oscuro y diseño premium.

---

## ⚡ Demo en 1 comando (sin cuentas externas)

¿Solo quieres **ver la app funcionando** ya, sin abrir cuentas de Neon, Clerk
ni Stripe? Hay un **modo demo** autosuficiente:

```bash
npm run demo
```

Esto levanta un **Postgres local en Docker**, aplica el schema, siembra datos
de ejemplo (clases, instructores, eventos, alumnos) y arranca la app en
`http://localhost:3000`.

- **Sin login real:** Clerk se omite. Arriba a la derecha hay un selector
  **«Demo»** para alternar entre **Alumno** (`/app`) y **Admin** (`/admin`).
- **Sin pagos reales:** las llaves de Stripe/Mercado Pago son ficticias.

> El modo demo se activa con `DEMO_MODE=1` y `NEXT_PUBLIC_DEMO_MODE=1`
> (ver `.env.demo`). En ese modo el cliente de base de datos usa el driver
> `node-postgres` en vez de Neon. Para **producción**, sigue la guía de abajo
> con credenciales reales.

---

## 🧱 Stack

| Capa        | Tecnología                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + TypeScript estricto           |
| UI          | Tailwind CSS v4 · shadcn/ui · Framer Motion · Lucide     |
| Auth        | Clerk (roles: `alumno`, `instructor`, `admin`)          |
| Base de datos | Neon Postgres + Drizzle ORM (schema versionado)       |
| Pagos       | Stripe (tarjetas) · Mercado Pago (México)               |
| Correo      | Resend · Recordatorios vía webhook n8n/WhatsApp         |
| Deploy      | Vercel (auto-deploy en push a `main`)                   |

---

## 🚀 Puesta en marcha

### 1. Requisitos

- Node.js 20+ (recomendado 22)
- Cuenta en [Neon](https://neon.tech), [Clerk](https://clerk.com),
  [Stripe](https://stripe.com), [Mercado Pago](https://mercadopago.com.mx) y
  [Resend](https://resend.com).

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

Todas las variables están documentadas en `.env.example`. Las mínimas para
arrancar son `DATABASE_URL`, las llaves de Clerk y `NEXT_PUBLIC_APP_URL`.

### 4. Migraciones de base de datos

El schema vive en [`src/db/schema.ts`](src/db/schema.ts).

```bash
# Genera los archivos SQL de migración a partir del schema
npm run db:generate

# Aplica las migraciones a la base de datos (usa DATABASE_URL_UNPOOLED)
npm run db:migrate

# Alternativa rápida en desarrollo: empuja el schema sin generar migración
npm run db:push
```

### 5. Sembrar datos de ejemplo

Carga estilos, instructores, clases, horarios, sesiones de las próximas 3
semanas, planes de membresía, eventos y alumnos demo:

```bash
npm run db:seed
```

### 6. Desarrollo

```bash
npm run dev
# http://localhost:3000
```

---

## 👤 Roles y rutas

| Rol         | Acceso                                                          |
| ----------- | -------------------------------------------------------------- |
| Público     | `/`, `/clases`, `/instructores`, `/precios`, `/eventos`        |
| Alumno      | `/app` (dashboard, reservar, reservas, membresía, perfil)      |
| Admin       | `/admin` (KPIs, CRUD, check-in, reportes, export CSV)          |

El rol se define en `publicMetadata.role` de Clerk y se replica en la tabla
`users`. Para hacer admin a un usuario, en el dashboard de Clerk agrega a su
**Public metadata**:

```json
{ "role": "admin" }
```

El middleware (`src/middleware.ts`) protege `/app` (requiere sesión) y `/admin`
(requiere rol `admin`).

---

## 🔌 Webhooks

Configura estos endpoints en cada proveedor:

| Proveedor    | Endpoint                          | Secreto                    |
| ------------ | --------------------------------- | -------------------------- |
| Clerk        | `/api/webhooks/clerk`             | `CLERK_WEBHOOK_SECRET`     |
| Stripe       | `/api/webhooks/stripe`            | `STRIPE_WEBHOOK_SECRET`    |
| Mercado Pago | `/api/webhooks/mercadopago`       | `MERCADOPAGO_WEBHOOK_SECRET` |

- **Clerk** sincroniza altas/bajas/ediciones de usuarios con la tabla `users`.
- **Stripe / Mercado Pago** confirman el pago y activan la membresía
  (`src/lib/membership.ts`), de forma idempotente por referencia del proveedor.

### Recordatorios (cron)

`vercel.json` programa un cron diario a `/api/cron/reminders` que recopila las
clases del día siguiente y dispara un webhook a n8n (`N8N_REMINDER_WEBHOOK_URL`)
para enviar recordatorios por WhatsApp/SMS.

---

## ☁️ Deploy en Vercel

1. Importa el repositorio en Vercel.
2. Agrega todas las variables de entorno (las de `.env.example`).
3. Cada `push` a `main` despliega automáticamente.
4. Ejecuta las migraciones contra tu base de Neon de producción
   (`npm run db:migrate`) y, si lo deseas, el seed.

> El `start_url` de la PWA es `/app`. Los usuarios pueden "Agregar a pantalla de
> inicio" para instalarla como app nativa.

---

## 📁 Estructura

```
src/
├── app/
│   ├── (marketing)/      # Landing y páginas públicas
│   ├── (auth)/           # Sign-in / Sign-up (Clerk)
│   ├── (app)/app/        # Área de alumno
│   ├── (admin)/admin/    # Panel administrativo
│   └── api/              # Route handlers (checkout, webhooks, cron, export)
├── components/           # UI (shadcn), marketing, app, admin
├── db/                   # schema, cliente y seed (Drizzle + Neon)
└── lib/                  # auth, queries, actions, pagos, validaciones (Zod)
```

---

## 🗺️ Roadmap (TODOs marcados en código)

- Descuento de créditos de paquete / validación de mensualidad al reservar.
- Checkout de boletos para eventos (`event_tickets` + QR).
- Gestión de horarios recurrentes y generación automática de sesiones desde el
  panel admin.
- Validación de firma del webhook de Mercado Pago.
- Reportes con filtros por fecha y gráficas de ocupación.
- Observabilidad (Sentry / logging estructurado).

---

Hecho con ritmo en México 🇲🇽
