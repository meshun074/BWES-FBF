# BWES Backend Phase 2 Database & Domain Model v1.0

**Status:** Phase 2 persistence baseline documentation  
**Recorded:** 2026-10-06  
**Scope:** Database schema, migrations, reference seed data, integrity
constraints, and database-backed verification

## 1. Purpose And Scope

This document records the implemented Phase 2 persistence baseline for the BWES
AI-Enabled Knowledge Hub backend. It documents the current Prisma/PostgreSQL
domain model, reference data strategy, migration history, integrity constraints,
and database verification approach.

This is a documentation record, not a new database design. The source of truth
for implementation remains:

- `packages/database/prisma/schema.prisma`;
- `packages/database/prisma/migrations/`;
- `packages/database/prisma/seed.ts`;
- `packages/database/prisma.config.ts`; and
- database-backed tests under `apps/api/test`.

Phase 2 established the persistence layer needed by later application services.
It does not implement the Phase 3 service layer, controllers, workers, Directus
workflow integration, Search, RAG, or AI evaluation.

## 2. Relationship To Phase 0 And Phase 1

Phase 0 established the approved backend architecture, resource governance
model, review/publication boundaries, consent concepts, audit principles,
transactional outbox pattern, and deferred-policy list. The Phase 0 v1.1
addendum refined the classification, metadata, source governance, review,
publication withdrawal, deletion, and consent boundaries.

Phase 1 established the repository, pnpm workspace, NestJS API and worker
shells, Next.js shell, PostgreSQL/Prisma foundation, Directus and local
S3-compatible infrastructure, shared logging/redaction, CI, and quality gates.

Phase 2 builds on those decisions by implementing the database/domain
persistence baseline. It preserves these Phase 0/1 boundaries:

- PostgreSQL is authoritative persisted state.
- Prisma is the primary data-access layer.
- PostgreSQL-specific SQL is used where Prisma cannot express required
  invariants safely.
- Resource identity is stable and substantive content is versioned.
- Approval is separate from publication.
- Publication withdrawal is separate from archive.
- Consent, review, verification, audit, and outbox history are explicit.
- Deferred FBF policy decisions remain configurable extension points.

## 3. Database Technology Baseline

The implemented baseline uses:

| Area                    | Phase 2 baseline                                                               |
| ----------------------- | ------------------------------------------------------------------------------ |
| Database                | PostgreSQL 18 through the local/CI `pgvector/pgvector:0.8.6-pg18` image family |
| ORM and migration layer | Prisma ORM `7.10.0`                                                            |
| PostgreSQL adapter      | `@prisma/adapter-pg` `7.10.0` with `pg`                                        |
| Identifier default      | PostgreSQL `uuidv7()`                                                          |
| Instant timestamp type  | `TIMESTAMPTZ(6)`                                                               |
| Calendar-date type      | `DATE`                                                                         |
| Search/AI extensions    | `pg_trgm` and `vector`                                                         |
| Prisma config           | `packages/database/prisma.config.ts`                                           |
| Generated client        | `packages/database/generated/prisma`, CommonJS module format                   |

The Prisma schema intentionally declares only `provider = "postgresql"` in the
datasource block. The database URL, migration path, and seed command are
configured through Prisma 7's `prisma.config.ts`.

The first migration enables `vector` and `pg_trgm`. Later migrations use raw SQL
for partial unique indexes, check constraints, extension-level behavior, and
other PostgreSQL-specific invariants Prisma cannot fully encode.

## 4. Database Naming And Identity Conventions

Phase 2 uses UUID primary keys backed by PostgreSQL `uuidv7()` defaults for
domain tables. Human-readable labels, slugs, canonical keys, and references are
not primary keys.

Database naming conventions are:

- Prisma model names are PascalCase.
- PostgreSQL tables use snake_case through `@@map`.
- PostgreSQL columns use snake_case through `@map` where needed.
- Controlled reference data uses `canonical_key` unique values.
- Stable resources use `canonical_slug`.
- Historical and governed records use `created_at`, event-specific timestamps,
  and actor foreign keys where implemented.

Instants use `TIMESTAMPTZ(6)`. True calendar values such as publication dates,
reference-period dates, and data-sharing-agreement effective/expiration dates
use `DATE`.

## 5. Classification And Reference Model

The implemented reference/classification model includes:

- `ResourceType`;
- `ContentFormat`;
- `Topic`;
- `Geography`;
- `Population`;
- `Audience`;
- `Sector`; and
- associated ResourceVersion join tables.

`ResourceType`, `Topic`, and `Geography` support parent/child hierarchy.
`Population`, `Audience`, `Sector`, and `ContentFormat` are non-hierarchical in
the current schema. All reference tables include `is_active` and `retired_at`,
so retirement can preserve historical references without deleting or rewriting
linked ResourceVersions.

`ResourceType` is the semantic classification of what the Resource is.
`ContentFormat` is a separate presentation/content-kind dimension. Neither
replaces `Topic`.

The implemented canonical ResourceType hierarchy is:

```text
FBF Resource
  Knowledge / Information Resource
    Research / Publication
    Dataset / Quantitative Resource
    Lived Experience
    Blog / News / Editorial Content
  Program / Service
  Opportunity
    Employment Opportunity
    Networking Opportunity
    Mentorship Opportunity
    Volunteer Opportunity
```

The implemented ContentFormat seed baseline is:

- Dataset / Dashboard;
- Mobility Index Data;
- Research Report;
- Academic Publication;
- Policy Brief;
- Discussion Paper;
- Literature Review;
- Infographic;
- Toolkit;
- Community Story;
- Event / Workshop / Webinar; and
- Opportunity.

The implemented classification axes are:

- Topic;
- Geography;
- Population;
- Content Format;
- optional Audience; and
- optional supporting Sector.

The initial Topic seed values are Employment, Income, Entrepreneurship,
Education, Leadership, Housing, Financial Security, Immigration,
Health & Wellbeing, Caregiving, and Workplace Equity.

The initial Population seed values in `seed.ts` are Black Women, Immigrants,
Students, and Newcomers. No age-banded population such as
`Black Women 16-22` is currently seeded.

The initial Audience seed values are Community, Researcher, Policymaker,
Student, Employer, Journalist, Funder, and Educator. The initial Geography seed
is Canada.

## 6. Resource And ResourceVersion Model

`Resource` is the stable identity for a governed BWES knowledge-hub item.
`ResourceVersion` holds substantive versioned content and versioned
classification relationships.

Implemented `Resource` state is intentionally small:

- stable UUID identity;
- unique `canonical_slug`;
- `lifecycle_state` of `ACTIVE` or `ARCHIVED`;
- creator attribution;
- optional `current_published_version_id`;
- archive timestamp; and
- links to versions and lifecycle history.

Implemented `ResourceVersion` state includes:

- resource ownership;
- positive `version_number`;
- `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `DECLINED`, or `APPROVED` state;
- same-Resource predecessor lineage;
- title and plain-language summary;
- publication date and optional expiration instant;
- required ResourceType and ContentFormat;
- creator attribution;
- optional submission timestamp;
- nonnegative optimistic-locking `lock_version`; and
- versioned joins to Topic, Geography, Population, optional Audience, and
  optional Sector.

Publication is not represented by a `ResourceVersion` `PUBLISHED` state.
Instead, `Resource.current_published_version_id` records the currently published
version for the stable Resource. Published versions are not modified in place;
substantive changes use a new ResourceVersion.

The implemented invariants include:

- `version_number > 0`;
- `lock_version >= 0`;
- unique `(resource_id, version_number)`;
- unique `(resource_id, id)` to support same-Resource composite references;
- same-Resource predecessor protection through a composite foreign key; and
- at most one `DRAFT` ResourceVersion per Resource through a partial unique
  index.

## 7. Type-Specific Resource Metadata

Phase 2 does not collapse all conditional metadata into a single nullable
ResourceVersion table. Instead, it implements type-specific one-to-one detail
tables and supporting author/indicator relationships.

The implemented tables are:

| Model                        | Purpose                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ResearchPublicationDetails` | Publisher organization, key findings, policy implications, and peer-reviewed flag for research/publication content |
| `ResourceVersionAuthor`      | Ordered public author names, with optional Organization affiliation                                                |
| `DatasetDetails`             | Source organization, reference period, methodology note, download permission flag, and indicators                  |
| `LivedExperienceDetails`     | Identity visibility and required ConsentRecord link                                                                |
| `ProgramEventDetails`        | Partner organization, start/end instants, location, virtual URL, and registration URL                              |
| `OpportunityDetails`         | Deadline, compensation text, work arrangement, application URL, and opportunity Organization                       |

The implementation supports organization links for research publishers, dataset
source organizations, program partners, opportunity organizations, and author
affiliations.

## 8. Organization, Source, Provenance And Indicator Model

The implemented provenance and supporting-entity model includes:

- `OrganizationType`;
- `Organization`;
- `SourceCategory`;
- `OriginalSource`;
- `SourceApproval`;
- `ResourceVersionSource`;
- `DataSharingAgreement`;
- `Indicator`; and
- `DatasetIndicator`.

`Organization` and `Indicator` are supporting entities, not ResourceTypes.
Their `is_active` and `retired_at` fields allow retirement while preserving
historical references. Duplicate Organization merge behavior and duplicate
Indicator merge behavior remain unresolved governance policies.

`OriginalSource` preserves provenance independently from approval. A source can
be linked to an Organization, SourceCategory, title, source URL, and/or source
reference. A database check requires at least one meaningful source identity
field.

`SourceApproval` records governed approval of an OriginalSource, including
approver, approval time, optional revocation time, and notes. A partial unique
index permits at most one active SourceApproval per OriginalSource.

`ResourceVersionSource` links ResourceVersions to OriginalSources and records
whether a source is primary plus citation text. A partial unique index permits
at most one primary source per ResourceVersion.

`DataSharingAgreement` records organization-specific agreement references and
optional effective/expiration dates. `Indicator` records canonical indicator
metadata, and `DatasetIndicator` links dataset details to indicators.

## 9. Asset And AssetVersion Model

The asset model separates stable file identity from immutable file versions:

- `Asset` records the stable asset identity, creator, and creation time.
- `AssetVersion` records the exact storage key, MIME type, size, checksum,
  original filename, scan status, and positive version number.
- `ResourceVersionAsset` links a reviewed ResourceVersion to an exact
  AssetVersion and records the asset purpose, sort order, and optional alt text.

ResourceVersions therefore reference exact AssetVersions, not mutable Asset
identity alone. This preserves what was reviewed.

Important asset constraints include:

- `AssetVersion.version_number > 0`;
- `AssetVersion.size_bytes >= 0`;
- `ResourceVersionAsset.sort_order >= 0`; and
- at most one `PRIMARY_DOCUMENT` per ResourceVersion through a partial unique
  index.

## 10. Consent And Restricted Lived-Experience Data

The implemented consent model includes:

- `ConsentRecord`;
- `ConsentParticipantIdentity`;
- `ConsentPermissionPurpose`;
- `ConsentPermission`;
- `ConsentWithdrawal`; and
- `LivedExperienceDetails`.

Sensitive participant identity is stored separately in
`ConsentParticipantIdentity`, linked one-to-one to `ConsentRecord`. Ordinary
lived-experience version metadata references the ConsentRecord and records the
approved identity-visibility mode.

`ConsentPermissionPurpose` is a governed reference table for permission
purposes. `ConsentPermission` records purpose-specific permission and defaults
`is_granted` to `false`, so AI or other purpose-specific reuse is not granted
unless explicitly recorded.

`ConsentWithdrawal` records requested and processed withdrawal states. A
database check protects processed-withdrawal consistency: processed withdrawals
must include `processed_at` and `processed_by_user_id`; requested withdrawals
must not.

Consent retention duration is not hard-coded. `ConsentRecord` includes an
optional `retention_policy_reference` field so future policy can be recorded
without encoding an unresolved duration constant.

## 11. Verification Model

`VerificationEvent` records governed verification activity. It includes:

- required Resource reference;
- optional same-Resource ResourceVersion reference;
- optional OriginalSource reference;
- verification type;
- verification outcome;
- source URL snapshot;
- verifier UserAccount;
- verification timestamp; and
- notes.

The ResourceVersion reference is protected through a composite foreign key to
`(resource_id, id)`, ensuring the optional version belongs to the referenced
Resource. The implementation does not encode a hard-coded verification freshness
interval.

## 12. Review Governance Model

The implemented review governance model includes:

- `ReviewRound`;
- `ReviewerAssignment`;
- `ReviewDecision`;
- `ReviewRoundAction`;
- `SpecialistReviewType`;
- `SpecialistReviewRequirement`;
- `SpecialistReviewCheck`;
- `ReviewChecklistVersion`;
- `ReviewChecklistItem`; and
- `ReviewChecklistResponse`.

`ReviewRound` belongs to a ResourceVersion and records the round number, state,
started/completed timestamps, and exact checklist version used. Review round
numbers must be positive and are unique per ResourceVersion.

`ReviewerAssignment` records formal reviewer assignment history. Reassignment
does not overwrite prior assignments; released assignments remain historical. A
partial unique index permits at most one active formal reviewer per ReviewRound.
In the current database this index may appear as
`reviewer_assignments_review_round_id_key`, but its actual definition remains:

```sql
UNIQUE (review_round_id) WHERE released_at IS NULL
```

`ReviewDecision` records the final formal decision. Its enum allows only
`APPROVE` or `DECLINE`. `RETURNED_FOR_CHANGES` is intentionally represented as a
separate `ReviewRoundAction`, not as a final decision. A ReviewRound has at most
one final ReviewDecision.

Specialist review is separate from formal reviewer assignment.
`SpecialistReviewRequirement` records the required specialist-review type for a
ReviewRound, and `SpecialistReviewCheck` records specialist actor, outcome,
timestamp, and comments. The unresolved Executive Director/delegate
specialist-review policy is not hard-coded.

Review checklists are versioned. `ReviewChecklistResponse` references the
ReviewRound, ReviewChecklistVersion, and ReviewChecklistItem through composite
constraints so responses are tied to the exact checklist version used by the
ReviewRound.

## 13. Publication And Lifecycle Governance

The implemented publication/lifecycle model includes:

- `PublicationRequest`;
- `PublicationSchedule`;
- `PublicationAttempt`;
- `PublicationWithdrawal`;
- `ArchiveEvent`;
- `RestorationCase`; and
- `DeletionCase`.

Approval is separate from publication. Publication history is represented
through requests, schedules, and attempts; successful publication is reflected
by setting `Resource.current_published_version_id`.

Publication withdrawal is distinct from archive. `PublicationWithdrawal`
records the Resource, same-Resource ResourceVersion, actor, timestamp, and
reason. It does not automatically archive the Resource.

Archive history is represented by `ArchiveEvent`. Restoration is represented by
`RestorationCase`; restoration does not directly republish content. Deletion
governance is represented by `DeletionCase`; it is separate from physical
deletion. Seven-year retention remains a governance rule and does not mean
automatic deletion in the database.

Database checks protect schedule cancellation chronology, publication-attempt
failure details, restoration completion consistency, and deletion approval,
execution, and executed-outcome consistency.

## 14. Business Audit Model

`AuditEvent` evolved from the Phase 1 audit foundation into a broader business
audit record while preserving temporary Phase 1 compatibility fields.

Temporary Phase 1 compatibility fields remain:

- `action`;
- `entity_type`; and
- `entity_id`.

Newer Phase 2 fields include:

- event type;
- actor id and actor type;
- Resource and optional same-Resource ResourceVersion;
- target type and target id;
- reason;
- request and correlation identifiers;
- before and after context; and
- metadata.

The ResourceVersion audit reference requires a Resource reference. AuditEvent
payloads must not contain passwords, tokens, full sensitive content, or
unnecessary personal information. Business audit history remains separate from
operational logs.

## 15. Transactional Outbox Model

`OutboxEvent` implements the durable database-side record for future asynchronous
work. It includes:

- event type;
- aggregate type and aggregate id;
- JSONB payload;
- created timestamp;
- available timestamp;
- processed timestamp;
- attempt count;
- last error; and
- optional deduplication key.

The database enforces `attempt_count >= 0` and valid processed-time chronology.
A partial index supports the pending worker access pattern:

```sql
CREATE INDEX "outbox_events_pending_available_idx"
ON "outbox_events" ("available_at", "created_at")
WHERE "processed_at" IS NULL;
```

Worker/event-dispatch behavior is deferred. Phase 2 creates the persistence
foundation, not the outbox processor.

## 16. PostgreSQL-Specific Integrity Baseline

Step 2O established 31 PostgreSQL `CHECK` constraints plus PostgreSQL-specific
unique and partial indexes. These constraints supplement Prisma schema
constraints and foreign keys.

Implemented PostgreSQL-specific protections include:

- ResourceType, Topic, and Geography self-parent prevention;
- ResourceVersion positive version number;
- ResourceVersion nonnegative lock version;
- at most one `DRAFT` ResourceVersion per Resource;
- nonnegative author sequence;
- dataset reference-period validation;
- program/event start/end validation;
- OriginalSource identity requirement;
- at most one active SourceApproval per OriginalSource;
- at most one primary source per ResourceVersion;
- DataSharingAgreement date-range validation;
- AssetVersion positive version number;
- AssetVersion nonnegative size;
- ResourceVersionAsset nonnegative sort order;
- at most one primary document per ResourceVersion;
- consent-permission date validation;
- processed consent-withdrawal consistency;
- positive review checklist version number;
- nonnegative review checklist item sort order;
- positive review round number;
- review round completion chronology;
- at most one active formal ReviewerAssignment per ReviewRound;
- reviewer assignment release chronology;
- at most one final ReviewDecision per ReviewRound;
- publication schedule cancellation chronology;
- failed PublicationAttempt detail requirement;
- RestorationCase state/completion consistency;
- DeletionCase approval and execution consistency;
- AuditEvent ResourceVersion reference requiring Resource;
- OutboxEvent attempt count `>= 0`;
- OutboxEvent processed-time validation; and
- pending outbox partial index for ready unprocessed events.

The active reviewer partial unique index may be named
`reviewer_assignments_review_round_id_key` after later migration history, but it
must not be described as unconditional uniqueness.

## 17. Reference Seed Strategy

Reference seeding is implemented in `packages/database/prisma/seed.ts` and
registered through Prisma 7 seed configuration in `prisma.config.ts`.

Root commands:

```bash
pnpm db:seed
pnpm db:test:seed
```

The seed strategy is idempotent and canonical-key based. Existing rows are not
silently rewritten or reactivated. The seed creates canonical reference data
only; it does not create fake users, Resources, ResourceVersions, assets,
consent records, review records, publication records, audit records, or outbox
records.

Verified clean seed counts are:

| Reference table | Count |
| --------------- | ----: |
| Resource Types  |    12 |
| Content Formats |    12 |
| Topics          |    11 |
| Audiences       |     8 |
| Populations     |     4 |
| Geographies     |     1 |

No unresolved vocabularies such as complete Organization Type, SourceCategory,
Sector, Indicator, specialist-review type, or consent-purpose vocabularies are
seeded by the current seed file.

## 18. Migration Strategy

The implemented migration history contains 19 migrations. It begins with
database extension setup and the Phase 1 audit foundation, then adds Phase 2
reference classifications, Resource/ResourceVersion, type-specific metadata,
provenance, assets, consent, verification, review governance,
publication/lifecycle governance, audit/outbox expansion, and database-specific
constraints/indexes.

Prisma migrations remain the authoritative database history. Raw SQL inside
migrations is intentionally used for PostgreSQL features and invariants that
Prisma cannot express safely, including partial unique indexes, extension
enabling, and complex check constraints.

Migration history also contains corrective migrations that preserve intended
review invariants, including restoration of ReviewDecision uniqueness and
cleanup of accidental uniqueness on review-round actions and specialist
requirements.

## 19. Test Database Safety

Database-backed tests are restricted to `bwes_test`. API and worker test helpers
parse `DATABASE_URL` and reject any database name other than `bwes_test`.

The root test database commands point at the isolated database:

```bash
pnpm db:test:migrate
pnpm db:test:status
pnpm db:test:seed
```

This guard prevents database-backed tests from mutating the development
database or another unsafe target.

## 20. Database Integrity Test Strategy

Database integrity tests live at:

```text
apps/api/test/database.integrity.e2e-spec.ts
```

The fixture helper lives at:

```text
apps/api/test/database-fixtures.ts
```

The tests create small transaction-scoped fixtures, attempt invalid operations,
expect PostgreSQL failures, and roll back the transaction so the test database
remains clean. The implemented suite contains 23 integrity tests and covers
representative hierarchy, ResourceVersion, source, asset, consent, review,
restoration, deletion, audit, and outbox constraints.

Verified integrity coverage: 23/23 tests passed.

## 21. Clean Migration Verification

Recorded Phase 2 clean-rebuild evidence includes:

- 19 migrations;
- fresh `bwes_test` reconstruction from zero;
- `pg_trgm` enabled;
- `vector` enabled;
- exact seed counts for Resource Types, Content Formats, Topics, Audiences,
  Populations, and Geographies;
- 31 `CHECK` constraints;
- required unique and partial indexes preserved;
- 23/23 database integrity tests passed;
- API E2E: 34/34;
- Worker E2E: 4/4;
- API unit: 58/58;
- Worker unit: 13/13;
- development migration status up to date;
- test migration status up to date; and
- `git diff --check` clean.

These results are Phase 2 closure evidence. Step 2S itself adds documentation
only and does not rerun full API, worker, or database rebuild verification.

## 22. Concurrency And Transaction Boundaries

Phase 2 implements the database structures needed for later concurrency-safe
services. It does not implement the domain services that will execute those
transactions.

Implemented persistence support includes:

- `ResourceVersion.lock_version` for optimistic locking of mutable drafts;
- nonnegative lock-version protection;
- partial unique indexes for at-most-one active draft, active reviewer, active
  source approval, primary source, and primary document;
- composite foreign keys for same-Resource ResourceVersion references; and
- outbox records for durable asynchronous follow-up after authoritative
  transactions commit.

Phase 3 services must continue the Phase 0 transaction strategy: ordinary draft
editing uses optimistic locking, while consequential workflow commands use
explicit transactions, authoritative re-read, appropriate row locks, audit
events, and outbox writes where required.

## 23. Deferred Policies

The following remain unresolved or configurable and are not hard-coded in Phase
2:

1. Executive Director/delegate specialist approval requirement;
2. consent lifetime/retention duration;
3. external-opportunity verification freshness;
4. Expiring Soon threshold;
5. maintenance/reverification cadence;
6. retired taxonomy/entity migration rules;
7. duplicate Organization merge behavior;
8. duplicate Indicator merge behavior;
9. AI evidence thresholds; and
10. complete Organization Type vocabulary.

The schema provides extension points for these policies without inventing final
values.

## 24. Phase 3 Boundary

Phase 2 does not implement:

- auth integration;
- domain services;
- controllers;
- workflow transitions;
- review services;
- publication execution;
- archive/restoration execution;
- deletion execution;
- Directus workflows;
- object-storage upload processing;
- outbox worker;
- notifications;
- search;
- vector ingestion;
- RAG; or
- AI evidence evaluation.

Those capabilities belong to later phases and must use the Phase 2 persistence
baseline without redesigning it casually.

## 25. Phase 2 Verification Summary

Phase 2 persistence verification established:

- PostgreSQL 18, Prisma 7.10, `@prisma/adapter-pg`, `pg_trgm`, and `vector`
  baseline;
- 19 committed migrations;
- clean reconstruction of the test database from zero;
- idempotent canonical reference seed data;
- 31 PostgreSQL `CHECK` constraints;
- required partial unique indexes and composite foreign keys;
- database safety guards for `bwes_test`;
- 23/23 database integrity tests passed;
- API and worker E2E/unit verification evidence passed; and
- repository whitespace validation through `git diff --check`.

The implementation is a persistence baseline. It intentionally stops short of
Phase 3 behavior.

## 26. Closure Statement

Phase 2 establishes the BWES database/domain model for governed Resources,
ResourceVersions, classifications, type-specific metadata, provenance, assets,
consent, verification, review governance, publication/lifecycle history,
business audit, and the transactional outbox.

The database preserves the architectural boundaries approved in Phase 0 and the
repository/tooling foundation established in Phase 1. It provides the
authoritative PostgreSQL foundation for Phase 3 application services without
implementing Phase 3 workflows.
