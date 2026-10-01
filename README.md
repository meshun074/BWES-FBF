# BWES AI-Enabled Knowledge Hub

BWES is the backend and platform repository for the BWES AI-Enabled Knowledge
Hub. It currently provides the approved architecture foundation, application
shells, local development infrastructure, shared engineering packages, and
quality gates needed for later domain implementation.

The repository does not yet represent the complete BWES product or its
later-phase business workflows.

## Repository Overview

BWES is a TypeScript monorepo managed with pnpm workspaces.

### Applications

| Path          | Purpose                                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`    | NestJS REST API shell with configuration validation, PostgreSQL integration, health/readiness endpoints, request correlation, authorization scaffolding, audit support, and structured logging |
| `apps/worker` | NestJS application-context shell for future background processing, with database lifecycle and structured startup/error logging                                                                |
| `apps/web`    | Next.js application shell with validated API configuration and a basic Web-to-API status check                                                                                                 |

### Shared Packages

| Path                     | Purpose                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `packages/contracts`     | Shared API contracts, roles, permissions, and role-to-permission mappings                                |
| `packages/database`      | Prisma schema, migrations, generated-client configuration, PostgreSQL adapter, and shared client factory |
| `packages/observability` | Structured JSON log construction, severity filtering, safe serialization, and sensitive-field redaction  |

Runtime configuration validation currently lives within each application; there
is no committed shared configuration package implementation.

## Technology Stack

| Area                 | Technology                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| Language             | TypeScript                                                                   |
| API and worker       | NestJS                                                                       |
| Web                  | Next.js and React                                                            |
| Database             | PostgreSQL with pgvector and `pg_trgm`                                       |
| ORM and migrations   | Prisma                                                                       |
| Local CMS foundation | Directus                                                                     |
| Local object storage | SeaweedFS with an S3-compatible API                                          |
| Workspace            | pnpm workspaces                                                              |
| Local infrastructure | Docker Compose                                                               |
| Operational logging  | Structured JSON logs with `LOG_LEVEL` filtering and sensitive-data redaction |

## Prerequisites

- Node.js 24.21.0
- pnpm 10.33.2
- Docker with Docker Compose
- PostgreSQL CLI tools (`psql`) for the documented Directus bootstrap workflow

PostgreSQL itself is supplied through Docker; a separate local PostgreSQL server
is not required.

## Initial Setup

From a local clone of the repository:

```bash
pnpm install
cp .env.example .env
```

Replace the Directus and S3 credential placeholders in `.env` with local-only
values. Do not commit actual credentials. `LOG_LEVEL` accepts `info`, `warn`, or
`error` and defaults to `info`.

Start the infrastructure and prepare the databases and Prisma Client:

```bash
pnpm db:up
pnpm db:migrate
pnpm db:test:migrate
pnpm db:generate
```

Start the API, worker, and web development processes:

```bash
pnpm dev
```

See the [local development runbook](docs/runbooks/local-development.md) for
Directus administrator bootstrap, object-storage details, migration procedures,
infrastructure diagnostics, and local data-safety guidance.

## Development Commands

| Command                  | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `pnpm dev`               | Run workspace development processes in parallel          |
| `pnpm build`             | Build workspace projects that expose a build script      |
| `pnpm db:up`             | Start PostgreSQL, Directus, and SeaweedFS                |
| `pnpm db:status`         | Show local infrastructure status                         |
| `pnpm db:logs`           | Follow local infrastructure logs                         |
| `pnpm db:down`           | Stop local infrastructure without removing named volumes |
| `pnpm db:generate`       | Generate the Prisma Client                               |
| `pnpm db:migrate`        | Apply/create development migrations                      |
| `pnpm db:migrate:status` | Check development migration status                       |
| `pnpm db:test:migrate`   | Apply committed migrations to `bwes_test`                |
| `pnpm db:test:status`    | Check test-database migration status                     |
| `pnpm test`              | Run workspace unit tests where configured                |
| `pnpm test:e2e`          | Run API and worker E2E/integration tests                 |
| `pnpm verify`            | Run the repository-wide quality gate                     |
| `pnpm format`            | Format supported repository files                        |
| `pnpm format:check`      | Check repository formatting                              |

## Local Services

| Service                      | Endpoint                                                                   |
| ---------------------------- | -------------------------------------------------------------------------- |
| Web                          | [http://localhost:3000](http://localhost:3000)                             |
| API                          | [http://localhost:4000/api/v1](http://localhost:4000/api/v1)               |
| API health                   | [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) |
| API readiness                | [http://localhost:4000/api/v1/ready](http://localhost:4000/api/v1/ready)   |
| Directus                     | [http://localhost:8055](http://localhost:8055)                             |
| Directus Admin               | [http://localhost:8055/admin](http://localhost:8055/admin)                 |
| S3-compatible object storage | [http://localhost:8333](http://localhost:8333)                             |

The persistent local object-storage bucket convention is `bwes-files`.

## Verification And CI

Run the complete local quality gate with:

```bash
pnpm verify
```

The verification pipeline checks shared contracts, the database package, API
and worker lint/build/unit tests, the Next.js lint/production build, API and
worker E2E/integration tests, test-database migration status, and repository
formatting.

GitHub Actions runs the same quality gate for pushes and pull requests after a
frozen dependency install, Prisma Client generation, PostgreSQL provisioning,
test-database creation, and migration deployment. Directus and SeaweedFS are not
started by the current CI workflow.

## Commit Workflow

Husky installs the repository Git hooks through the root `prepare` script.

- `pre-commit` runs `lint-staged`, which formats staged TypeScript, JavaScript,
  JSON, Markdown, and YAML files with Prettier.
- `commit-msg` runs commitlint using `@commitlint/config-conventional`.

Commit messages must follow the
[Conventional Commits](https://www.conventionalcommits.org/) format.

## Documentation

- [Local Development Runbook](docs/runbooks/local-development.md)
- [Backend Architecture & Domain Foundation v1.0](docs/architecture/BWES_Backend_Architecture_Domain_Foundation_v1.0.md)
- [Phase 1 Repository & Tooling Baseline v1.0](docs/architecture/BWES_Backend_Phase_1_Repository_Tooling_Baseline_v1.0.md)

## Current Implementation Scope

The repository currently represents the Phase 0 architecture/domain foundation
and the Phase 1 repository/tooling foundation. It does not imply completion of
the governed BWES domain workflows, Directus content models and ingestion,
search or RAG pipelines, production identity integration, production
infrastructure, deployment, monitoring, or other later-phase capabilities.
