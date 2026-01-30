# Running SQL scripts (local seeding)

This folder contains SQL scripts used to create schema pieces and seed development data (e.g., categories).

Quick options to run them:

1) Run all scripts using psql (recommended for local dev)

- Set your Postgres connection string in `DATABASE_URL`:

  ```sh
  export DATABASE_URL='postgresql://user:password@host:5432/dbname'
  ```

- Run the helper script that executes every `*.sql` in this directory in order:

  ```sh
  npm run db:seed
  # or explicitly
  sh scripts/run-sql-scripts.sh
  ```

- To run a single file:

  ```sh
  sh scripts/run-sql-scripts.sh scripts/006_create_categories_and_seed.sql
  ```

2) Use the Supabase SQL editor (if using Supabase)

- Open your project in Supabase dashboard → SQL Editor.
- Open the `*.sql` file you want to run and paste or upload it, then execute.

Notes
- `run-sql-scripts.sh` requires `psql` to be installed and a valid `DATABASE_URL` environment variable.
- The script runs SQL files in ascending filename order to let you control ordering via prefixes (e.g., `001_...`, `002_...`).
