#!/usr/bin/env bash
# Applies database changes to the live Supabase project BEFORE pushing code that needs them.
# Run from the repo folder in WSL:  bash scripts/deploy-db.sh
# Asks for the database password without showing it; nothing is saved to disk or shell history.
set -euo pipefail
cd "$(dirname "$0")/.."

REF="${SUPABASE_REF:-uzhblxwwqbhnedjdcyuu}"
HOST="${SUPABASE_POOLER_HOST:-aws-0-us-east-1.pooler.supabase.com}"

read -rsp "Supabase database password: " PW </dev/tty; echo
[ -n "$PW" ] || { echo "No password entered."; exit 1; }
ENC=$(printf %s "$PW" | python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.stdin.read(),safe=""))')
unset PW
export DATABASE_URL="postgresql://postgres.${REF}:${ENC}@${HOST}:5432/postgres"

[ -d node_modules ] || npm ci
echo "== Migrations";            npm run -s db:migrate
echo "== New catalog drafts";    npm run -s db:seed
echo "== Copy updates";          npm run -s db:content-updates
echo "== Check (session pooler)"; npm run -s db:check
export DATABASE_URL="postgresql://postgres.${REF}:${ENC}@${HOST}:6543/postgres"
echo "== Check (transaction pooler, used by Vercel)"; npm run -s db:check
echo "Database is ready. Now push the code."
