# BWES — Repository Instructions for Codex

## 1. Project Identity

This repository implements the **BWES AI-Enabled Knowledge Hub** for Future Black Female.

BWES is an existing, actively developed system with approved:

- UX research and requirements;
- information architecture;
- interaction flows;
- high-fidelity design direction;
- backend architecture;
- domain model;
- governance workflows;
- repository/tooling foundation.

Do not treat this as a greenfield project.

Before making substantial changes, inspect the existing implementation and relevant documentation.

Approved project decisions are constraints unless the user explicitly approves a change.

---

# 2. Engineering Objective

Implement BWES incrementally while preserving:

- correctness;
- maintainability;
- transactional integrity;
- security;
- auditability;
- accessibility;
- testability;
- observability;
- clear ownership boundaries;
- approved UX and governance behaviour.

Prefer simple, explicit implementations over unnecessary abstraction.

Do not introduce major architecture, infrastructure, frameworks, libraries, or services without a concrete need.

---

# 3. Repository Structure

The repository is a pnpm monorepo.

Primary areas include:

```text
apps/
  api/
  worker/
  web/

packages/
  config/
  contracts/
  database/
  observability/

database/
  migrations/
  seeds/
  fixtures/

docs/
  adrs/
  api/
  architecture/
  domain/
  runbooks/

infrastructure/
  docker/
  deployment/

.github/
  workflows/
```

Inspect the actual repository before assuming this structure is unchanged.

---

# 4. Application Responsibilities

## apps/api

NestJS backend API.

Primary responsibilities:

- HTTP/API endpoints;
- application services;
- domain orchestration;
- authorization;
- workflow enforcement;
- transactions;
- integration with persistence and background jobs.

Do not place substantial business logic directly in controllers.

---

## apps/worker

NestJS background worker.

Use for:

- asynchronous processing;
- ingestion work;
- scheduled jobs;
- outbox/event processing;
- expensive non-request-path tasks;
- retries where appropriate.

Jobs must be designed for safe retry and idempotency where required.

---

## apps/web

Next.js / React frontend.

Implement approved BWES UX rather than inventing new product flows.

Responsibilities include:

- public Knowledge Hub;
- internal content-management interfaces;
- administrator interfaces;
- API integration;
- accessibility;
- responsive behaviour;
- frontend validation and testing.

---

## packages/contracts

Shared contracts between applications.

Changes here can affect multiple systems.

Before modifying a shared contract:

1. identify all consumers;
2. determine compatibility impact;
3. define migration/order of implementation;
4. avoid concurrent incompatible modifications.

---

## packages/database

Primary database and Prisma integration layer.

Treat database changes carefully because they may affect:

- API;
- worker;
- Directus;
- tests;
- migrations;
- existing data.

---

## packages/config

Shared application configuration.

Do not introduce duplicated environment configuration when a shared mechanism already exists.

---

## packages/observability

Shared logging, telemetry, and observability utilities.

Sensitive information must not be logged.

---

# 5. Approved Core Technology

The approved stack includes:

- TypeScript;
- NestJS;
- Next.js;
- React;
- PostgreSQL;
- Prisma ORM;
- Directus;
- S3-compatible object storage;
- Docker;
- pnpm workspaces.

Do not replace Prisma with another ORM.

Do not replace the modular-monolith architecture with microservices unless explicitly approved.

---

# 6. Prisma and PostgreSQL

Prisma is the default application ORM/data-access layer.

PostgreSQL-specific raw SQL is allowed where Prisma is insufficient, including cases such as:

- `SELECT ... FOR UPDATE`;
- pessimistic locking;
- advanced constraints;
- partial indexes;
- PostgreSQL full-text search;
- pgvector;
- specialized migrations;
- concurrency-sensitive operations.

Prefer database constraints for invariants that the database can reliably enforce.

Do not rely exclusively on application validation for critical consistency rules.

---

# 7. Concurrency and Transactions

Approved concurrency mechanisms include:

- optimistic locking using `lock_version`;
- pessimistic locking where appropriate;
- explicit database transactions;
- database constraints;
- idempotency;
- outbox/event processing.

Concurrency-sensitive workflows must be reasoned about explicitly.

Do not introduce read-modify-write logic that can silently overwrite concurrent changes.

---

# 8. Canonical BWES Resource Model

The canonical parent concept is:

**FBF Resource**

Approved Resource Type hierarchy:

```text
FBF Resource

├── Knowledge / Information Resource
│   ├── Research / Publication
│   ├── Lived Experience
│   └── Dataset / Quantitative Resource
│
├── Program / Service
│   ├── Training Program
│   ├── Career Development Program
│   └── Other Support Program
│
└── Opportunity
    ├── Employment Opportunity
    ├── Networking Opportunity
    ├── Mentorship Opportunity
    └── Volunteer Opportunity
```

Do not replace this semantic hierarchy with content-format labels.

---

# 9. Classification Model

The primary classification dimensions include:

- Topic;
- Geography;
- Population;
- Resource Type;
- Content Format / Content Kind.

Audience may be optional.

Sector may remain an optional supporting classification unless explicitly changed.

Resource Type and Content Format are different concepts.

Examples of Content Format include:

- Research Report;
- Academic Publication;
- Policy Brief;
- Discussion Paper;
- Literature Review;
- Dataset / Dashboard;
- Mobility Index Data;
- Video;
- Audio;
- Infographic;
- Toolkit;
- Webinar;
- News;
- Updates;
- Commentary & Analysis;
- Articles & Blogs;
- Issue-Based Editorials.

Representative mappings:

```text
Research Report
Academic Publication
Policy Brief
Discussion Paper
Literature Review
    → Research / Publication

Dataset / Dashboard
Mobility Index Data
    → Dataset / Quantitative Resource

Community Story
    → Lived Experience
```

Video, Audio, Infographic, Toolkit, Webinar, and similar labels are primarily formats and must not replace semantic Resource Type.

---

# 10. Creator Semantics

The universal resource `Creator` represents the internal BWES user who created the record.

Conceptually:

```text
created_by_user_id
```

This is different from public attribution fields such as:

- authors;
- publisher;
- provider;
- organization;
- source.

Do not conflate internal creator/ownership metadata with public authorship.

---

# 11. Review Workflow Invariants

These rules are critical.

## Active reviewer

A resource can have exactly one active formal reviewer at a time.

Administrators may:

- assign;
- reassign;
- release reviewer assignments.

Reviewer reassignment must preserve historical review information.

Never rewrite completed review decisions.

---

## Declined resources

When a resource is declined:

- reviewer comments remain available to the creator;
- creator may revise and resubmit;
- resubmission defaults to the previous reviewer;
- an Administrator may explicitly reassign the review.

---

## Published-resource changes

A published resource must not be silently modified in place when substantive content changes.

Substantive changes must return through formal review.

The editor must supply appropriate change information such as:

- change summary;
- sections changed.

---

# 12. Approval and Publication

Approval and publication are separate concepts.

Only an approved version may be published.

If substantive problems are found before publication, return the resource to review.

If publication fails for a technical reason:

- preserve the approval;
- permit safe retry.

Prevent duplicate simultaneous publication.

Scheduled publication is supported.

---

# 13. Expiry and Archival

A resource may have an expiry date.

At expiry, the resource should be automatically archived according to the approved workflow.

A null expiry means no expiry.

Archived resources must not be restored directly to Published.

Restoration must re-enter review.

If archival occurs while a revision is under review, the active review must be handled according to the approved workflow rather than silently continuing.

---

# 14. External Opportunity Verification

External opportunities must be confirmed against the original organization's source.

Store the verification/check date.

If required verification cannot be completed:

- the resource must not be published;
- submission for review should be blocked where required.

Do not weaken this rule for convenience.

---

# 15. User Deactivation

When internal staff access is deactivated:

- unfinished drafts requiring ownership must be reassigned appropriately;
- active reviewer assignments must be released;
- historical attribution must remain preserved.

Do not delete historical attribution to simplify account handling.

---

# 16. Authorization

Use least privilege.

Authorization must be enforced server-side.

Do not rely on hidden frontend buttons as authorization.

Permissions affecting actions such as:

- review;
- approval;
- publication;
- administration;
- controlled-vocabulary management;
- role management

must be validated in trusted backend logic.

Where relevant, preserve separation-of-duties rules.

---

# 17. Auditability

Important actions should remain attributable.

Examples include:

- creation;
- editing;
- submission;
- assignment;
- reassignment;
- review;
- decline;
- approval;
- publication;
- archival;
- restoration;
- permission changes;
- administrative actions.

Do not overwrite historical records simply to represent the current state.

Prefer append-only history/audit semantics where appropriate.

---

# 18. Directus

Directus is the approved CMS/content-authoring platform.

Directus may support:

- content editing;
- CMS configuration;
- controlled vocabularies;
- internal authoring workflows;
- ingestion triggers.

Do not place critical BWES business invariants exclusively inside Directus when they belong in the BWES backend/database.

The BWES backend remains responsible for authoritative application behaviour where appropriate.

---

# 19. AI / RAG Direction

BWES uses an **Owned RAG + Knowledge Mapping** architecture.

The intended high-level flow is:

```text
Directus
  ↓
Ingestion
  ↓
Extract / Validate / Chunk
  ↓
Embedding
  ↓
PostgreSQL + pgvector
  +
Object Storage
  ↓
Hybrid Retrieval
  ↓
Reranking
  ↓
Evidence Sufficiency
  ↓
LLM
  ↓
Citation / Claim Verification
  ↓
NestJS API
  ↓
Next.js UI
```

Important requirements include:

- keyword retrieval;
- semantic/vector retrieval;
- metadata filtering;
- permission filtering;
- reranking;
- evidence sufficiency checks;
- source traceability;
- citations;
- refusal when supporting evidence is insufficient.

Do not implement AI where deterministic business logic is appropriate.

Do not begin foundation-model training.

---

# 20. UX Authority

The BWES UX process has already established approved:

- personas/user groups;
- requirements;
- information architecture;
- public user flows;
- staff flows;
- administrator flows;
- accessibility expectations;
- high-fidelity direction.

Do not redesign approved workflows during engineering implementation without an identified implementation issue and explicit approval.

When implementation details are unclear, inspect the relevant project documentation before inventing behaviour.

---

# 21. Development Process

Before implementing a meaningful task:

1. inspect the relevant code;
2. inspect relevant tests;
3. inspect relevant documentation;
4. understand existing conventions;
5. identify affected modules;
6. identify cross-system dependencies;
7. identify relevant domain invariants;
8. determine appropriate verification.

Do not modify code merely from assumptions about filenames or architecture.

---

# 22. Scope Discipline

Each task should be bounded.

Avoid unrelated refactors.

Do not opportunistically:

- rename unrelated files;
- reformat unrelated code;
- upgrade dependencies;
- restructure modules;
- change architecture;
- rewrite working functionality.

If unrelated issues are discovered, report them separately.

---

# 23. Parallel Agent Rules

BWES may use multiple specialist Codex sessions concurrently.

Avoid multiple agents changing the same mutable files simultaneously.

Typical ownership boundaries:

```text
Backend Engineer
  apps/api/**
  apps/worker/**

Frontend Engineer
  apps/web/**

Database Engineer
  packages/database/**
  database/**

DevOps Engineer
  infrastructure/**
  .github/workflows/**
```

Shared areas require explicit coordination:

```text
packages/contracts/**
packages/config/**
packages/observability/**
```

Before a specialist modifies shared code, determine ownership and affected consumers.

Stable contracts should preferably be agreed before dependent frontend/backend work proceeds concurrently.

---

# 24. Tests

New behaviour should be tested at the appropriate level.

Use:

- unit tests;
- integration tests;
- end-to-end tests;

based on the risk and behaviour being implemented.

Important workflow invariants deserve integration or database-backed testing where practical.

Do not change tests merely to make incorrect behaviour pass.

When fixing a defect, add a regression test where reasonable.

---

# 25. Repository Verification

The repository contains a root verification workflow.

Use the actual current scripts in `package.json` as authoritative.

A known command is:

```bash
pnpm verify
```

Relevant validation may also include:

```bash
git diff --check
git status --short
```

For targeted work, run targeted checks first.

Before declaring substantial work complete, run the broadest reasonable repository verification.

Do not report success if relevant verification has not actually been executed.

Report failing tests accurately.

---

# 26. Git Rules

Unless explicitly instructed:

- do not push;
- do not force-push;
- do not merge;
- do not rewrite history;
- do not delete branches;
- do not create commits containing unrelated changes.

Before making substantial modifications, inspect:

```bash
git status --short
git log --oneline --decorate -n 10
```

Never discard existing user changes without explicit authorization.

If the working tree contains unrelated modifications, preserve them.

---

# 27. Commits

Do not commit automatically unless instructed.

When instructed to commit:

- ensure the change is coherent;
- ensure tests/checks relevant to it pass;
- inspect the diff;
- avoid unrelated files;
- use a clear conventional commit message where consistent with the repository.

Example:

```text
feat(api): implement resource review submission
```

---

# 28. Dependency Changes

Do not add dependencies casually.

Before adding one, determine:

- whether existing dependencies already solve the problem;
- maintenance implications;
- security implications;
- bundle/runtime implications;
- whether the dependency is genuinely necessary.

Do not perform broad dependency upgrades as part of unrelated feature work.

---

# 29. Security

Never commit:

- passwords;
- API keys;
- access tokens;
- private credentials;
- production secrets.

Do not expose sensitive configuration in logs.

Validate untrusted input.

Use parameterized/database-safe access patterns.

Enforce authorization on the backend.

Treat uploaded documents and external content as untrusted input.

---

# 30. Logging

Use the repository's structured logging/observability approach.

Do not log:

- passwords;
- tokens;
- secret keys;
- sensitive authentication information;
- unnecessary personal information.

Include useful operational context without leaking protected data.

---

# 31. Error Handling

Errors should be:

- explicit;
- actionable;
- appropriately typed/classified;
- safe for external clients;
- sufficiently detailed internally for diagnostics.

Do not expose stack traces or sensitive internal details through public API responses.

---

# 32. API Design

Follow existing API conventions.

Prefer predictable resource-oriented APIs.

Use appropriate:

- status codes;
- validation;
- pagination;
- filtering;
- authorization;
- error formats;
- versioning conventions.

Do not invent a second API style when an established repository convention exists.

---

# 33. Migrations

Database schema changes require proper migrations.

Do not manually alter the expected production schema without migration history.

Migrations should be:

- deterministic;
- reviewable;
- safe;
- compatible with expected environments.

For destructive changes, explicitly identify migration risk.

---

# 34. Data Integrity

Critical invariants should preferably be protected at multiple appropriate layers:

```text
API validation
    +
application/domain logic
    +
transaction handling
    +
database constraints
```

Do not assume frontend validation protects data integrity.

---

# 35. Performance

Do not prematurely optimize.

However, watch for obvious issues such as:

- N+1 queries;
- unbounded queries;
- missing pagination;
- expensive synchronous work;
- repeated external calls;
- unnecessary large payloads;
- missing indexes for established access patterns.

Use measurement where possible before introducing complex optimization.

---

# 36. Documentation

Update technical documentation when implementation changes:

- architecture;
- API contracts;
- domain behaviour;
- operations;
- configuration;
- runbooks.

Do not allow important behaviour to exist only in chat history.

When code and documentation disagree, determine which represents the approved current behaviour before modifying either.

---

# 37. Specialist Behaviour

If operating as a specialist agent:

Stay within the assigned role and task.

Do not independently redesign another specialist's domain.

For cross-boundary changes:

1. identify the dependency;
2. report it;
3. define the required contract;
4. coordinate before modifying another specialist's owned area.

---

# 38. Completion Report

After implementing a substantial task, report:

## Summary

What was implemented.

## Files Changed

Important files modified.

## Verification

Commands actually executed and their result.

## Remaining Issues

Any unresolved issue or risk.

## Git State

Relevant `git status --short` result.

Do not claim completion without mentioning unresolved failures.

---

# 39. Decision Hierarchy

When instructions conflict, use this order:

1. explicit current user instruction;
2. approved BWES requirements and architecture;
3. applicable repository `AGENTS.md` instructions;
4. established repository conventions;
5. general engineering best practice.

Do not silently override an approved BWES decision because another approach appears preferable.

---

# 40. Default Operating Principle

Before changing BWES, first understand BWES.

Preserve approved behaviour.

Make the smallest coherent change necessary.

Test the behaviour.

Inspect the result.

Report evidence rather than assumptions.
