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

3. Start PostgreSQL:

   pnpm db:up

4. Verify PostgreSQL:

   pnpm db:status

5. Apply development database migrations:

   pnpm db:migrate

6. Apply test database migrations:

   pnpm db:test:migrate

7. Generate the Prisma client:

   pnpm db:generate

## Start Development

Start the workspace development processes:

pnpm dev

This starts the applications that expose a `dev` script, including:

- BWES API
- BWES background worker
- BWES web application

Default local endpoints:

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- API health: http://localhost:4000/api/v1/health
- API readiness: http://localhost:4000/api/v1/ready

## Database Commands

Start PostgreSQL:

pnpm db:up

Check PostgreSQL:

pnpm db:status

View PostgreSQL logs:

pnpm db:logs

Stop PostgreSQL:

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

The database-backed test suites are restricted to the isolated `bwes_test`
database and must not run against the development database.

## Full Verification

Before considering a backend foundation change complete, run:

pnpm verify

This verifies:

- shared contracts type checking and build
- database package build
- API lint, build, and unit tests
- worker lint, build, and unit tests
- API and worker E2E/integration tests
- test database migration state
- repository formatting
- web lint and production build

## Formatting

Check formatting:

pnpm format:check

Apply formatting:

pnpm format

Generated Prisma Client files under `packages/database/generated/` are
excluded from repository Prettier checks because they are generated artifacts.

## Local Database Safety

The standard repository scripts intentionally do not provide a shortcut that
removes the PostgreSQL Docker volume.

Do not delete the local database volume unless a destructive database reset is
explicitly intended.

Production and staging credentials must never be committed to repository
scripts or environment example files.
