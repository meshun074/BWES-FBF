# BWES Backend Phase 1 Repository & Tooling Baseline v1.0

**Status:** Phase 1 implementation baseline reconciled; formal closure pending repository hygiene and committed-state verification  
**Recorded:** 2026-09-30  
**Scope:** Repository and tooling foundation

## 1. Purpose And Scope

This document is the authoritative technical baseline and closure candidate
record for Phase 1 of the BWES AI-Enabled Knowledge Hub backend. It records the repository,
tooling, local development infrastructure, application shells, quality gates,
and foundational engineering capabilities established before substantive BWES
domain implementation begins.

This is not an implementation tutorial. The operational setup procedure remains
in `docs/runbooks/local-development.md`; the approved architecture and domain
rules remain in
`docs/architecture/BWES_Backend_Architecture_Domain_Foundation_v1.0.md`.

Phase 1 established a reproducible base on which later phases can implement the
approved architecture. It did not implement the complete backend or product.

## 2. Relationship To Phase 0

Phase 0 established the approved backend architecture, domain model, workflow
rules, governance constraints, and implementation boundaries. Phase 1
operationalized the repository, tooling, application shells, and development
infrastructure required to begin implementing that architecture.

The Phase 0 decisions remain authoritative unless an explicit ADR or other
approved architectural change supersedes them. Phase 1 does not rewrite or
silently relax those decisions.

## 3. Repository And Monorepo Structure

The repository is a private pnpm workspace. `pnpm-workspace.yaml` includes:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

The committed Phase 1 structure and responsibilities are:

| Path                             | Responsibility                                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`                       | NestJS REST API shell, configuration validation, database integration, health/readiness, request correlation, authorization scaffolding, audit foundation, and API operational logging |
| `apps/worker`                    | NestJS standalone application-context shell for future background processing, with configuration validation, database lifecycle, and operational logging                               |
| `apps/web`                       | Next.js application shell and verified Web-to-API connectivity path                                                                                                                    |
| `packages/contracts`             | Shared API types, role and permission constants, role-to-permission mappings, and permission resolution                                                                                |
| `packages/database`              | Prisma schema, generated-client configuration, PostgreSQL adapter, committed migrations, and shared client factory                                                                     |
| `packages/observability`         | Shared structured-log construction, safe serialization, and sensitive-field redaction                                                                                                  |
| `infrastructure/docker/postgres` | Docker Compose local infrastructure and PostgreSQL initialization SQL                                                                                                                  |
| `README.md`                      | Repository entry point for project scope, monorepo structure, setup, commands, endpoints, quality gates, workflow, documentation, and implementation boundaries                        |
| `.husky`                         | Git hooks for staged-file formatting and Conventional Commit message validation                                                                                                        |
| `docs/architecture`              | Approved architecture baselines and closure records                                                                                                                                    |
| `docs/runbooks`                  | Local operational procedures                                                                                                                                                           |
| `.github/workflows/ci.yml`       | Repository verification workflow for pushes and pull requests                                                                                                                          |

There is no committed `packages/config` implementation in the Phase 1
baseline. API and worker environment validation are maintained locally in each
application, and web public-environment validation is maintained in `apps/web`.

## 4. Runtime And Toolchain Baseline

The baseline versions and constraints are derived from the committed manifests,
lockfile, and Docker Compose configuration.

| Component                                | Established baseline                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js                                  | `24.21.0`, required by the root `engines` field and CI                                                                                                         |
| pnpm                                     | `10.33.2`, pinned by `packageManager` and the root `engines` field                                                                                             |
| TypeScript                               | Root/database toolchain resolves to `7.0.2`; API, worker, and web toolchains resolve to `5.9.3` under their declared TypeScript 5 constraints                  |
| NestJS                                   | Declared as `^11.0.1`; lockfile installation resolves core runtime packages to `11.2.6`                                                                        |
| Next.js                                  | `16.3.6`                                                                                                                                                       |
| React / React DOM                        | `19.2.8`                                                                                                                                                       |
| Prisma CLI / Client / PostgreSQL adapter | `7.10.0`                                                                                                                                                       |
| PostgreSQL local/CI image                | `pgvector/pgvector:0.8.6-pg18`, the PostgreSQL 18 image variant with pgvector 0.8.6                                                                            |
| Directus                                 | `directus/directus:12.4.1`                                                                                                                                     |
| SeaweedFS                                | `chrislusf/seaweedfs` pinned by digest `sha256:4e61d15fd35994cb1e43e1e553dff106794841fd9a99ade2fc8c8bfce4d7872d`; no release tag is asserted by the repository |
| Jest                                     | API and worker installations resolve to `30.5.2`                                                                                                               |
| Prettier                                 | Root installation resolves to `3.9.9`                                                                                                                          |
| Developer workflow                       | Husky, lint-staged, commitlint, and `@commitlint/config-conventional`                                                                                          |

The root `tsconfig.base.json` supplies strict shared compiler defaults. Each
application or package owns the additional compiler settings needed for its
runtime and output format.

## 5. PostgreSQL And Prisma Foundation

### 5.1 Database Roles

PostgreSQL is the primary application database and intended system of record.
The local Docker service creates the `bwes` development database. Tests are
restricted to the isolated `bwes_test` database, and test helpers reject unsafe
database targets.

Directus uses a separate `bwes_directus` database. It does not place its system
tables in `bwes`.

### 5.2 Prisma Data Access

Prisma is the primary ORM and migration foundation. `@bwes/database`:

- configures the PostgreSQL datasource through `DATABASE_URL`;
- uses `@prisma/adapter-pg` and `pg` for PostgreSQL connectivity;
- exports a shared `createPrismaClient` factory and database types;
- configures the generated Prisma Client at
  `packages/database/generated/prisma` in CommonJS format; and
- keeps generated client files out of version control.

Fresh environments generate the client with `pnpm db:generate`. CI performs
this explicitly after dependency installation and before migrations or builds.

### 5.3 Schema And Migrations

Phase 1 commits two migrations:

1. `20260927000000_database_foundation` enables `vector` and `pg_trgm`.
2. `20260929025132_audit_event_foundation` creates `audit_events` with UUID
   identity, `TIMESTAMPTZ(6)`, JSONB metadata, optional request correlation,
   and supporting indexes.

The Prisma schema currently models `AuditEvent`. Broader domain tables are
intentionally deferred to later phases.

PostgreSQL initialization also enables `vector` and `pg_trgm` for a fresh local
Docker volume. The migration repeats those idempotent extension declarations so
the committed migration history remains sufficient outside that Docker
initialization path.

Phase 1 closure verification applied the committed migrations successfully to a
newly created empty temporary database. This established that migration history,
rather than pre-existing local state, can create the current schema.

### 5.4 Migration Commands

| Command                  | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `pnpm db:migrate`        | Apply/create development migrations through Prisma migrate dev |
| `pnpm db:migrate:status` | Check development migration status                             |
| `pnpm db:test:migrate`   | Deploy committed migrations to `bwes_test`                     |
| `pnpm db:test:status`    | Check `bwes_test` migration status                             |
| `pnpm db:generate`       | Generate the Prisma Client                                     |

No credential value in this document is an operational secret. Real database
credentials must remain outside version control.

## 6. Directus Local Foundation

Directus is established as the Docker-managed local CMS/back-office foundation,
subordinate to the NestJS business workflow boundaries approved in Phase 0.

The local baseline provides:

- image `directus/directus:12.4.1`;
- local endpoint `http://localhost:8055`;
- administration endpoint `http://localhost:8055/admin`;
- dedicated PostgreSQL database `bwes_directus`, created for a fresh PostgreSQL
  volume by `infrastructure/docker/postgres/init/002-directus-database.sql`;
- startup after the PostgreSQL health check succeeds;
- a named `bwes_directus_uploads` volume mounted at `/directus/uploads`; and
- secret and administrator bootstrap conventions based on
  `DIRECTUS_SECRET`, `DIRECTUS_ADMIN_EMAIL`, and
  `DIRECTUS_ADMIN_PASSWORD`.

Administrator creation is an explicit local bootstrap procedure in the runbook.
The administrator email, password, role ID, and Directus secret are not part of
this baseline record.

Directus data persists in the PostgreSQL named volume, while uploaded files
persist in `bwes_directus_uploads`. Directus content models and ingestion into
BWES are outside Phase 1.

## 7. S3-Compatible Object Storage Foundation

Local S3-compatible storage is provided by SeaweedFS through the Docker Compose
`object-storage` service.

| Property                | Baseline                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Container image         | Digest-pinned `chrislusf/seaweedfs@sha256:4e61d15fd35994cb1e43e1e553dff106794841fd9a99ade2fc8c8bfce4d7872d` |
| API mode                | SeaweedFS server with S3 enabled                                                                            |
| Local endpoint          | `http://localhost:8333`                                                                                     |
| Credential inputs       | `S3_ACCESS_KEY` and `S3_SECRET_KEY`                                                                         |
| Local region convention | `us-east-1`                                                                                                 |
| Persistent volume       | `bwes_object_storage_data`, mounted at `/data`                                                              |
| Bucket convention       | `bwes-files`, represented by `S3_BUCKET` and the local-development runbook                                  |

Anonymous access is intentionally denied. Phase 1 closure verification
confirmed authenticated upload, authenticated read, authenticated delete, and
denial of anonymous access. It also confirmed object persistence across
container recreation through `bwes_object_storage_data`.

The Compose service configures storage and credentials; it does not itself
declare a bucket-creation job. `bwes-files` is the application/local-development
bucket convention for clients using the service.

Actual access keys and secret keys must never be committed or copied into
documentation.

## 8. Local Development Environment

### 8.1 Docker-Managed Infrastructure

`pnpm db:up` starts:

- PostgreSQL with pgvector and `pg_trgm` support;
- Directus; and
- SeaweedFS S3-compatible object storage.

The services bind their ports to the local loopback interface. PostgreSQL,
Directus uploads, and object data use named Docker volumes. Repository scripts
do not expose a shortcut that deletes those volumes.

### 8.2 Local Endpoints

| Service                      | Endpoint                              |
| ---------------------------- | ------------------------------------- |
| Web                          | `http://localhost:3000`               |
| API base                     | `http://localhost:4000/api/v1`        |
| API health                   | `http://localhost:4000/api/v1/health` |
| API readiness                | `http://localhost:4000/api/v1/ready`  |
| Directus                     | `http://localhost:8055`               |
| Directus Admin               | `http://localhost:8055/admin`         |
| S3-compatible object storage | `http://localhost:8333`               |

### 8.3 Repository Commands

| Command                  | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `pnpm install`           | Install workspace dependencies                                  |
| `pnpm db:up`             | Start local Docker infrastructure                               |
| `pnpm db:down`           | Stop local Docker infrastructure without removing named volumes |
| `pnpm db:status`         | Inspect infrastructure status                                   |
| `pnpm db:logs`           | Follow infrastructure logs                                      |
| `pnpm db:generate`       | Generate the Prisma Client                                      |
| `pnpm db:migrate`        | Apply development migrations                                    |
| `pnpm db:migrate:status` | Inspect development migration status                            |
| `pnpm db:test:migrate`   | Apply migrations to the isolated test database                  |
| `pnpm db:test:status`    | Inspect test migration status                                   |
| `pnpm dev`               | Run workspace applications exposing a `dev` script              |
| `pnpm test:e2e`          | Run API and worker E2E/integration suites                       |
| `pnpm format:check`      | Check repository formatting                                     |
| `pnpm verify`            | Run the complete repository quality gate                        |

Local configuration starts from `.env.example`. Developers replace credential
placeholders in an ignored `.env`; real credentials are never committed.

## 9. API, Worker, And Web Foundations

### 9.1 NestJS API

The API is a NestJS application shell with:

- Joi validation for runtime mode, host, port, CORS origin, and database URL;
- a global `/api/v1` prefix;
- JSON and URL-encoded request limits of 1 MiB;
- Helmet security middleware and configured credential-aware CORS;
- a global validation pipe and standardized HTTP exception filter;
- `/status`, `/health`, and database-backed `/ready` endpoints;
- a global Prisma provider and disconnect-on-shutdown lifecycle;
- server-generated request IDs returned through `x-request-id`;
- pagination, sorting, and search DTO foundations;
- role, permission, principal, identity-resolver, authentication-guard, and
  permission-guard scaffolding; and
- an audit service backed by the `audit_events` table.

The request-ID middleware always generates its own UUID. It attaches that value
to the request and response and does not trust caller-provided `x-request-id`
values.

Authorization is foundational rather than production-complete. Shared roles and
capabilities, guards, decorators, and identity-resolution contracts exist, but
complete OIDC integration and comprehensive endpoint/domain enforcement remain
later work.

### 9.2 NestJS Worker

The worker is a standalone NestJS application context with:

- Joi validation for runtime mode and database URL;
- the shared Prisma client factory and shutdown lifecycle;
- structured startup and startup-failure logging; and
- a long-running Phase 1 process handle.

The process handle is explicitly temporary. No queue engine, job catalog,
transactional-outbox processor, or domain background jobs are implemented yet.

### 9.3 Next.js Web Shell

The web application is a Next.js shell with validated
`NEXT_PUBLIC_API_BASE_URL` configuration and a shared `apiFetch` helper. Its
homepage calls `/status` and renders the API service status while tolerating API
unavailability.

Phase 1 closure verified this path end to end:

```text
Next.js Web -> apiFetch -> BWES API
```

The homepage successfully retrieved the API status through the configured API
base URL.

## 10. Structured Logging And Sensitive-Data Redaction

`@bwes/observability` is the shared operational logging policy used by the API
and worker NestJS adapters. It does not replace NestJS logging with a large
external logging framework.

Each serialized JSON log entry can contain:

- `level` (`info`, `warn`, or `error`);
- `message`;
- an ISO timestamp;
- application identity (`bwes-api` or `bwes-worker`);
- an optional top-level `requestId`; and
- optional structured context.

When a caller supplies `requestId` in structured context, the shared builder
promotes a string value to the top level of the log entry. API request IDs are
generated by middleware; logging call sites must pass that generated value when
correlation is required.

Centralized redaction:

- normalizes field names case-insensitively and across common punctuation;
- covers passwords, authorization, cookies, tokens, API keys, client secrets,
  database URLs, S3 credentials, and Directus secrets/passwords;
- also redacts field names ending in `password`, `secret`, `token`, or `apiKey`;
- recursively handles nested objects and arrays;
- returns a cloned structure rather than mutating caller input;
- handles null, undefined, primitive, bigint, symbol, function, date, circular,
  and unreadable values without relying on unsafe direct serialization; and
- replaces sensitive values with `[REDACTED]`.

The API and worker retain small NestJS `ApplicationLogger` adapters so the
shared policy integrates with existing NestJS logging infrastructure. Neither
adapter logs HTTP request objects, request bodies, or request headers by
default. Worker bootstrap failure logging records only the error type rather
than arbitrary exception contents.

Explicit `LOG_LEVEL` configuration controls logging consistently across
environments. The API and worker both validate the setting, which supports
`info`, `warn`, and `error` and defaults to `info`.

| `LOG_LEVEL` | Emitted levels          |
| ----------- | ----------------------- |
| `info`      | `info`, `warn`, `error` |
| `warn`      | `warn`, `error`         |
| `error`     | `error` only            |

The threshold is resolved when an application logger is constructed; runtime
hot-reconfiguration is not part of Phase 1. The worker's pre-Nest bootstrap
logger remains supported and applies the same shared filtering and redaction
policy before the Nest application exists.

Known limitation: redaction is based on field names. It cannot reliably detect
a secret embedded in arbitrary free-form text or hidden under a misleading,
non-sensitive field name. Callers must therefore avoid placing credentials in
log messages and must use accurately named structured fields.

Operational logs remain distinct from permanent business audit records, as
required by the Phase 0 architecture.

No production log aggregation platform is established in Phase 1.

## 11. CI, Quality Gates, And Developer Workflow

GitHub Actions runs `.github/workflows/ci.yml` for pushes and pull requests on
Ubuntu.

The workflow:

1. checks out the repository;
2. enables Corepack and sets up Node.js `24.21.0` with pnpm caching;
3. installs dependencies with `pnpm install --frozen-lockfile`;
4. generates the ignored Prisma Client for the fresh CI environment;
5. provisions PostgreSQL through `pgvector/pgvector:0.8.6-pg18`;
6. creates the isolated `bwes_test` database;
7. deploys migrations to the development and test databases; and
8. runs `pnpm verify`.

Directus and SeaweedFS are not required by the Phase 1 automated test suites and
are not started in CI.

The root verification pipeline performs:

- shared-contract type checking and build;
- database package build;
- API lint, build, and unit tests;
- worker lint, build, and unit tests;
- web lint and a Next.js production build;
- API E2E and database integration tests;
- worker E2E and database integration tests;
- test-database migration-status validation; and
- repository formatting validation.

The web verification command explicitly sets `NODE_ENV=production` for the
Next.js build so a developer shell cannot make the production-build gate inherit
`NODE_ENV=development`.

The local commit workflow is established through:

- a root `prepare` script that initializes Husky;
- a pre-commit hook that invokes lint-staged;
- lint-staged rules that run Prettier on the configured staged TypeScript,
  JavaScript, JSON, Markdown, and YAML files;
- a commit-msg hook that invokes commitlint; and
- commitlint configured with `@commitlint/config-conventional`, enforcing
  Conventional Commits.

Invalid commit-message verification was performed successfully: a
non-conforming message was rejected by the configured commit-msg workflow.

## 12. Phase 1 Closure Verification

The following table records the Phase 1 implementation and closure-candidate
state. Repository evidence was supplemented by completed hands-on checks for
fresh-clone setup, empty-database migration, persistence, object-storage
behavior, and full-stack startup.

|   # | Closure area                                         | Status   | Evidence summary                                                                                                                               |
| --: | ---------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Directus local foundation                            | Complete | Pinned Docker service, dedicated database initialization, persistent uploads, documented bootstrap and endpoints                               |
|   2 | S3-compatible object storage foundation              | Complete | Digest-pinned SeaweedFS S3 service, credential inputs, bucket convention, authenticated operations, anonymous denial, and persistence verified |
|   3 | Complete local Docker/development environment        | Complete | PostgreSQL, Directus, and SeaweedFS are managed together through repository scripts and named volumes                                          |
|   4 | CI pipeline                                          | Complete | Push/PR workflow provisions PostgreSQL, generates Prisma Client, creates the test database, deploys migrations, and runs verification          |
|   5 | Structured logging and sensitive-data redaction      | Complete | Shared package, API/worker adapters, recursive redaction, request-ID support, explicit log-level filtering, and automated tests                |
|   6 | Fresh-clone reproducibility                          | Complete | Closure validation confirmed setup from committed manifests, lockfiles, examples, migrations, and generated-client procedure                   |
|   7 | Empty-database migration verification                | Complete | Both committed migrations applied successfully to a newly created empty temporary database                                                     |
|   8 | Database and object-storage persistence verification | Complete | Named-volume persistence was verified across container recreation; authenticated object upload/read/delete was also verified                   |
|   9 | Full-stack local startup and Web-to-API connectivity | Complete | Docker infrastructure and application shells started; homepage retrieved API status through `apiFetch`                                         |
|  10 | Final `pnpm verify` quality gate                     | Complete | Full root verification pipeline passed during the final closure audit                                                                          |
|  11 | Developer workflow tooling                           | Complete | Husky, lint-staged formatting, commitlint, Conventional Commits, and successful invalid-message rejection                                      |
|  12 | Root repository README                               | Complete | Repository entry point records scope, structure, stack, setup, commands, endpoints, quality gates, workflow, links, and boundaries             |
|  13 | Formal Phase 1 closure                               | Pending  | Implementation requirements and the final quality gate passed; repository hygiene and committed-state verification remain                      |

## 13. Verification Evidence

The final Phase 1 closure audit produced the following evidence:

| Verification                   | Result                                  |
| ------------------------------ | --------------------------------------- |
| API unit tests                 | 13 suites; 58 tests passed              |
| Worker unit tests              | 4 suites; 13 tests passed               |
| API E2E/integration tests      | 2 suites; 11 tests passed               |
| Worker E2E/integration tests   | 2 suites; 4 tests passed                |
| Next.js production build       | Passed                                  |
| Test database migration status | Current; two committed migrations found |
| `pnpm format:check`            | Passed                                  |
| `git diff --check`             | Passed                                  |
| Full `pnpm verify`             | Passed                                  |

These counts are closure evidence, not permanent assertions about future test
suite size. Later phases are expected to add tests and capabilities.

Earlier Phase 1 verification established the following evidence. These checks
were preserved for the baseline and were not rerun during the final closure
audit:

- successful generation of the Prisma Client from a fresh environment;
- migration deployment against an empty database;
- persistence of database, Directus upload, and object-storage data through
  their named-volume arrangements; and
- authenticated S3-compatible upload, read, and delete behavior with anonymous
  access denied; and
- local Web-to-API connectivity through
  `Next.js Web -> apiFetch -> BWES API`.

### Non-Blocking Implementation Notes

- Directus uses an exact version tag rather than an immutable image digest.
- Repository lint scripts currently invoke `eslint --fix`, so verification
  commands can theoretically modify lint-fixable files.
- The runbook does not contain a standalone S3 smoke-test procedure;
  object-storage behavior was manually verified during Phase 1.

## 14. Security And Secret-Handling Baseline

Real local configuration is stored in ignored environment files. Committed
examples contain local-only values or explicit placeholders and identify the
required variable names without recording operational credentials.

The following must never be committed or copied into logs or documentation:

- actual database credentials or connection URLs containing secrets;
- Directus administrator credentials, Directus secret, or private bootstrap
  identifiers;
- S3 access keys or secret keys;
- authorization tokens, refresh tokens, cookies, or API keys; and
- production or staging credentials of any kind.

This document intentionally records only environment-variable names and public
local endpoints.

## 15. Phase 1 Scope Boundaries

Closing Phase 1 means the repository and engineering foundation are ready for
subsequent implementation. It does not mean that the complete BWES backend or
product has been implemented.

The following remain outside the Phase 1 closure baseline:

- complete FBF Resource and Resource Version domain implementation;
- resource authoring and governed version lifecycles;
- review, approval, decline, and publication workflows;
- reviewer assignment and reassignment invariants;
- archival and restoration workflows;
- complete production authentication and identity-provider integration;
- complete production RBAC and contextual authorization enforcement;
- Directus content-model implementation;
- Directus-to-BWES ingestion pipelines;
- document extraction, parsing, chunking, and embedding;
- vector and semantic search implementation;
- hybrid retrieval and reranking;
- RAG orchestration and provider integration;
- evidence-sufficiency checking;
- LLM integration;
- citation and claim verification;
- recommendation and summarization features;
- production object-storage configuration;
- production infrastructure, deployment, and secrets management;
- monitoring, alerting, and production observability; and
- high-fidelity frontend implementation; and
- later domain-specific API endpoints, services, workers, and scheduled jobs.

These are deliberate phase boundaries, not defects in the Phase 1 baseline.
Their implementation must continue to follow the approved Phase 0 architecture
and any subsequent explicit ADRs.

## 16. Closure Statement

Phase 1 established and verified the BWES repository, pnpm monorepo, pinned
runtime/toolchain baseline, Docker-backed local infrastructure, Prisma and
PostgreSQL foundation, Directus and S3-compatible local services, API and worker
shells, web connectivity path, shared contracts, audit foundation, structured
logging/redaction, CI workflow, and repository quality gates.

The Phase 1 implementation requirements are satisfied, and the final repository
quality gate passed. Formal closure remains pending repository hygiene and
committed-state verification. No Phase 2 implementation is included in this
closure candidate record.
