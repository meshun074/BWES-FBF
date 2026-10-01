# BWES Local Development Runbook

## Prerequisites

- Node.js 24.21.0
- pnpm 10.33.2
- Docker with Docker Compose
- PostgreSQL is provided through Docker; a separate local PostgreSQL installation is not required.

## Initial Setup

From the repository root:

1. Install dependencies:

   pnpm install

2. Create the local environment file:

   cp .env.example .env

3. Replace the placeholder Directus values in `.env`.

   `DIRECTUS_SECRET` must be a long random local secret.

   `DIRECTUS_ADMIN_EMAIL` and `DIRECTUS_ADMIN_PASSWORD` are used when
   bootstrapping the local Directus administrator account. Do not commit
   actual credentials.

   Replace the `S3_ACCESS_KEY` and `S3_SECRET_KEY` placeholders with local
   object-storage credentials. Do not commit actual credentials.

   `LOG_LEVEL` controls the minimum emitted log severity: `info` is the normal
   local default and emits info, warning, and error logs; `warn` emits warning
   and error logs; and `error` emits error logs only.

4. Start the local infrastructure:

   pnpm db:up

   This starts:

   - PostgreSQL
   - Directus
   - SeaweedFS S3-compatible object storage

5. Verify the infrastructure:

   pnpm db:status

6. Apply development database migrations:

   pnpm db:migrate

7. Apply test database migrations:

   pnpm db:test:migrate

8. Generate the Prisma client:

   pnpm db:generate

## Directus Initial Setup

Directus uses the dedicated `bwes_directus` PostgreSQL database. It does not
use the BWES application database (`bwes`) for its internal system tables.

For a fresh PostgreSQL Docker volume, the Directus database is created by:

`infrastructure/docker/postgres/init/002-directus-database.sql`

After Directus has started for the first time, obtain the Administrator role
UUID:

    psql "postgresql://bwes:bwes_local_dev@localhost:5432/bwes_directus" \
      -c 'SELECT id, name FROM directus_roles;'

Load the local environment variables:

    set -a
    source .env
    set +a

Create the local administrator, replacing `<administrator-role-uuid>` with
the UUID returned for the Administrator role:

    docker compose \
      --env-file .env \
      -f infrastructure/docker/postgres/compose.yml \
      exec directus \
      node /directus/cli.js users create \
      --email "$DIRECTUS_ADMIN_EMAIL" \
      --password "$DIRECTUS_ADMIN_PASSWORD" \
      --role <administrator-role-uuid>

The administrator creation command is required only when bootstrapping an
environment that does not already contain the administrator account.

Sign in at:

http://localhost:8055/admin

The Directus `/server/health` endpoint may return HTTP 403 when accessed
without appropriate permissions. A 403 response from Directus demonstrates
that the service is responding and is not by itself evidence of a failed
container.

## Start Development

Start the workspace development processes:

pnpm dev

This starts applications that expose a `dev` script, including:

- BWES API
- BWES background worker
- BWES web application

PostgreSQL, Directus, and S3-compatible object storage are Docker-managed
infrastructure and should already be running through `pnpm db:up`.

Default local endpoints:

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- API health: http://localhost:4000/api/v1/health
- API readiness: http://localhost:4000/api/v1/ready
- Directus: http://localhost:8055
- Directus Admin: http://localhost:8055/admin
- S3-compatible object storage: [http://localhost:8333](http://localhost:8333)

## Object Storage

- Endpoint: [http://localhost:8333](http://localhost:8333)
- Persistent local development bucket: `bwes-files`
- Credentials come from `S3_ACCESS_KEY` and `S3_SECRET_KEY` in `.env`.
- Anonymous access is intentionally denied.
- Storage persists through the named Docker volume
  `bwes_object_storage_data`.
- Actual credentials must never be committed.

## Database and Infrastructure Commands

Start local infrastructure:

pnpm db:up

Check infrastructure status:

pnpm db:status

View infrastructure logs:

pnpm db:logs

Stop local infrastructure:

pnpm db:down

Check development migration status:

pnpm db:migrate:status

Apply development migrations:

pnpm db:migrate

Check test database migration status:

pnpm db:test:status

Apply test database migrations:

pnpm db:test:migrate

Regenerate Prisma Client:

pnpm db:generate

## Testing

Run API and worker E2E/integration tests:

pnpm test:e2e

Database-backed test suites are restricted to the isolated `bwes_test`
database and must not run against the development database.

## Full Verification

Before considering a backend foundation change complete, run:

pnpm verify

This verifies:

- shared contracts type checking and build
- database package build
- API lint, build, and unit tests
- worker lint, build, and unit tests
- web lint and production build
- API and worker E2E/integration tests
- test database migration state
- repository formatting

## Continuous Integration

GitHub Actions runs the repository verification workflow for pushes and pull
requests.

The workflow:

- provisions PostgreSQL with pgvector
- creates the isolated `bwes_test` database
- applies development and test database migrations
- runs `pnpm verify`

Directus is not currently required by the automated test suite and is
therefore not started in Phase 1 CI.

## Formatting

Check formatting:

pnpm format:check

Apply formatting:

pnpm format

Generated Prisma Client files under `packages/database/generated/` are
excluded from repository Prettier checks because they are generated artifacts.

Generated Prisma Client files are regenerated locally with:

pnpm db:generate

## Local Database Safety

The standard repository scripts intentionally do not provide a shortcut that
removes Docker volumes.

Do not delete local database, Directus upload, or object-storage volumes unless
a destructive local reset is explicitly intended.

Production and staging credentials must never be committed to repository
scripts, workflow files, or environment example files.
