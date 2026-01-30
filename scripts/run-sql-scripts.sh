#!/usr/bin/env sh
set -e

SCRIPTS_DIR="$(dirname "$0")"

# If arguments are provided, run only those files, otherwise run all .sql files in the scripts directory
if [ "$#" -gt 0 ]; then
  FILES="$@"
else
  FILES="$(ls "$SCRIPTS_DIR"/*.sql 2>/dev/null | sort)"
fi

if [ -z "$FILES" ]; then
  echo "No SQL files found in $SCRIPTS_DIR"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install PostgreSQL client (psql) or run the files from Supabase SQL editor."
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Set it to the target Postgres connection string. Example:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/dbname'"
  echo "Or run the scripts from the Supabase SQL editor if you're using Supabase."
  exit 1
fi

for f in $FILES; do
  echo "\n--- Running: $f ---"
  psql "$DATABASE_URL" -f "$f"
done

echo "\n✅ All scripts executed successfully."
