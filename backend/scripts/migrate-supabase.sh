#!/usr/bin/env bash
# Run Lucid migrations against Supabase Postgres (or any remote DB).
# Prerequisites:
#   1. cp .env.supabase.example .env.supabase
#   2. Set DB_PASSWORD in .env.supabase (Supabase → Settings → Database)
#   3. bash scripts/migrate-supabase.sh
# Optional: ENSURE_ALPHA=1 bash scripts/migrate-supabase.sh  — seeds alpha users + passwords
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.supabase ]]; then
  echo "Missing .env.supabase — copy .env.supabase.example, add DB_PASSWORD, retry."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.supabase
set +a

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "DB_PASSWORD is empty in .env.supabase"
  exit 1
fi

echo "Migrating (DB_HOST=$DB_HOST, DB_DATABASE=$DB_DATABASE)..."
node ace migration:run

if [[ "${ENSURE_ALPHA:-}" == "1" ]]; then
  echo "Running ensure:alpha-users..."
  node ace ensure:alpha-users
fi

echo "Done."
