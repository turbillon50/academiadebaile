#!/usr/bin/env bash
# =====================================================================
# Academia de Baile — MODO DEMO autosuficiente
# Levanta la app SIN cuentas externas (sin Neon, sin Clerk, sin pagos):
#   - Postgres local en Docker
#   - Aplica el schema y siembra datos de ejemplo
#   - Arranca Next.js en modo demo (login simulado con selector de rol)
#
# Uso:  npm run demo
# Requisitos: Docker y Node 20+.
# =====================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

DB_URL="postgresql://postgres:postgres@127.0.0.1:5432/academiadebaile"
CONTAINER="academiadebaile-demo-db"

echo "🐘 Levantando Postgres local (Docker)…"
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  docker run -d --name "$CONTAINER" \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=academiadebaile \
    -p 5432:5432 postgres:16 >/dev/null
else
  docker start "$CONTAINER" >/dev/null
fi

echo "⏳ Esperando a la base de datos…"
until docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

# .env.local de demo (no se sobreescribe si ya existe)
if [ ! -f .env.local ]; then
  echo "📝 Generando .env.local de demo…"
  cp .env.demo .env.local
fi

echo "📦 Instalando dependencias…"
npm install --silent

echo "🧱 Aplicando schema…"
DATABASE_URL="$DB_URL" DATABASE_URL_UNPOOLED="$DB_URL" npx drizzle-kit push --force

echo "🌱 Sembrando datos demo…"
npm run db:seed

echo ""
echo "✅ Listo. Abre http://localhost:3000"
echo "   Usa el selector 'Demo' (arriba a la derecha) para cambiar entre Alumno y Admin."
echo ""
npm run dev
