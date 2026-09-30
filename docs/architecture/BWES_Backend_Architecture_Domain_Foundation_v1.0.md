# BWES Backend Architecture & Domain Foundation v1.0

## 1. Document Purpose

This document is the approved backend architecture and domain foundation for the BWES AI-Enabled Knowledge Hub. It is the implementation baseline for future backend development.

Phase 0 defines the backend architecture, domain rules, workflow model, governance constraints, and implementation boundaries that later phases must follow. Phase 0 contains no repository/application implementation work.

Phase 1 and later backend implementation must follow this baseline and must not casually change these decisions. If implementation later exposes a genuine contradiction, the relevant ADR or domain baseline must be deliberately revised and approved rather than silently bypassed.

## 2. Approved Architecture Baseline

The approved baseline is:

| Area                           | Decision                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Frontend                       | Next.js                                                                                     |
| Primary backend                | NestJS modular monolith                                                                     |
| System of record               | PostgreSQL                                                                                  |
| ORM                            | Prisma ORM                                                                                  |
| Advanced PostgreSQL operations | Selective raw SQL when Prisma does not cleanly support required PostgreSQL functionality    |
| CMS / back office              | Directus, restricted and subordinate to NestJS business workflows                           |
| Application API                | REST                                                                                        |
| Authentication                 | OIDC-based external authentication                                                          |
| Authorization                  | Capability-based RBAC plus contextual domain authorization                                  |
| Initial Search                 | PostgreSQL Full-Text Search plus `pg_trgm`                                                  |
| Future semantic/hybrid Search  | `pgvector`                                                                                  |
| Files                          | S3-compatible object storage                                                                |
| Background processing          | Background Worker plus transactional outbox                                                 |
| AI/RAG                         | Provider-independent abstraction added after governance and Search foundations are reliable |
| Audit                          | Permanent business audit trail separate from operational logs                               |

Conceptual architecture:

```text
Next.js
    -> REST
NestJS Modular Monolith
    ->
PostgreSQL
    |-- authoritative domain data
    |-- workflow/history
    |-- audit
    |-- PostgreSQL FTS / pg_trgm
    `-- later pgvector

NestJS
    |-- Object Storage
    |-- Directus-controlled integration
    `-- Transactional Outbox
              ->
         Background Worker
           |-- expiration
           |-- indexing
           |-- ingestion
           |-- notifications
           `-- later AI/RAG processing
```

## 3. Architectural Principles

These principles are approved for Phase 0 and govern subsequent implementation:

1. PostgreSQL is the authoritative system of record.
2. NestJS owns BWES business invariants and workflow orchestration.
3. Domain state represents business facts rather than frontend labels.
4. FBF Resource identity is stable; substantive content is versioned.
5. Successfully submitted Resource Versions become immutable.
6. Important workflow/history records are explicit and preserved.
7. Consequential operations revalidate authoritative state at execution time.
8. Failed operations must never create false successful transitions.
9. Important invariants are enforced through NestJS rules plus appropriate PostgreSQL constraints.
10. Authorization uses capabilities plus domain context.
11. Separation of duties is enforced server-side.
12. Public eligibility is centralized.
13. Search and AI indexes are derived/rebuildable projections.
14. Governance-critical changes use synchronous consistency.
15. Derived processing may use eventual consistency.
16. Background jobs must be retry-safe and idempotent where required.
17. Directus is not a competing workflow engine.
18. Deferred FBF policies must be supported through explicit extension points rather than invented values.
19. Privacy/restrictions must follow content into Public API, Search, Assets, and AI.
20. Business audit records are different from operational logs.
21. External side effects must not compromise authoritative database transactions.
22. The modular monolith must maintain real domain/module boundaries.
23. Consequential actions use explicit domain commands rather than generic status mutation.
24. Failure/recovery paths are first-class design concerns.
25. Governance rules should remain deterministic unless FBF explicitly approves another mechanism.

## 4. Domain Model

The backend domain model is organized around identity/access, governed Resources and Resource Versions, supporting knowledge entities, review/publication workflows, verification, audit, and derived projections.

### Identity And Access

Conceptual entities:

```text
User
Role
Capability
UserRole
```

Roles are reusable capability bundles. Business authorization must be expressed as capabilities combined with contextual domain checks, not as hard-coded role names alone.

Historical attribution must remain after User deactivation. Deactivation affects future access and responsibility, but it must not erase or rewrite past authorship, decisions, assignments, or audit history.

### Resource Domain

Conceptual entities:

```text
FBF Resource
Resource Version
Resource Type
Resource Relationship

Asset
Asset Version
```

#### FBF Resource

The FBF Resource is the stable identity throughout the resource lifecycle. It represents the enduring item being governed, revised, archived, restored, searched, and related to other resources.

Potential Resource-level concepts include:

```text
resource_id
resource_type
created_at
created_by
current_responsible_owner
current_published_version
resource lifecycle
stable system/canonical identifier
```

Substantive editable, reviewed, or public content should not be placed directly on the stable Resource unless there is a clear architectural reason. The Resource should identify the enduring entity; the Resource Version should contain the reviewable substance.

#### Resource Version

The Resource Version contains substantive content and metadata that must correspond exactly to what was reviewed. It is the governed unit for submission, review, approval, decline, publication, correction, and restoration.

Versioned content may include:

```text
title
summary
body/content

Program/Service fields
Opportunity fields
Research fields
Dataset fields
Lived Experience presentation
News/Editorial content

eligibility
application instructions
dates
deadline
location
format
cost/commitments

provenance
Original Source details

Topics
Populations
Geographies
Sectors

Organization relationships
Indicator relationships
Resource relationships

Asset Version references

privacy/publication restrictions where version-specific

change summary
```

## 5. Supporting Knowledge Entities

The following supporting knowledge entities are conceptually distinct:

```text
Topic
Population
Geography
Sector
Organization
Indicator
Original Source
```

The backend must preserve these semantic distinctions:

```text
Resource Type != Topic
Population Represented != Intended Audience
Organization != Original Source
Dataset != Indicator
Resource Expiration Date != Program/Opportunity deadline/end date
Public Program/Opportunity status != internal Resource lifecycle
Research != Data != Lived Experience != Commentary
Search != Explore != AI Assistant
AI-generated synthesis != FBF-authored editorial content
```

Organization and Indicator are supporting entities, not FBF Resource Types. Retiring supporting entities must not automatically archive linked Resources. Retirement behavior for supporting entities should be implemented as a governed policy, not as an implicit content lifecycle transition.

## 6. Resource Versioning Model

The approved Resource Versioning rules are:

```text
RV01 Resource identity is stable across all versions.
RV02 Substantive public/reviewed content belongs to Resource Version.
RV03 Draft versions are mutable.
RV04 Successful Submit freezes the Resource Version.
RV05 Submitted, Under Review, Approved, Declined and Stopped versions are immutable.
RV06 Declined content is corrected through a new Resource Version.
RV07 Approved content cannot be edited before publication.
RV08 Published Resource changes use a new Revision/Resource Version.
RV09 Current public version changes only after successful publication.
RV10 Failed publication does not affect the current published version.
RV11 Archive makes unfinished Revision pathways non-publishable.
RV12 Restoration creates a new governed Resource Version.
RV13 Resource Versions reference immutable Asset Versions where files form part of reviewed content.
RV14 Substantive classifications and relationships are versioned.
RV15 Verification Events reference the Resource Version they verified.
RV16 Version numbers are monotonically increasing and never reused.
RV17 Initially allow at most one active editable working version per Resource.
RV18 New versions record lineage through based_on_version_id or equivalent.
```

The key immutability rule is:

```text
DRAFT = mutable

successful Submit
      |
      v

SUBMITTED = immutable
UNDER_REVIEW = immutable
APPROVED = immutable
DECLINED = immutable
STOPPED = immutable
```

## 7. Workflow/State Model

The system must not be defined around a single `resource.status`. Resource lifecycle, Resource Version lifecycle, review state, assignment state, publication state, verification state, public eligibility, and derived indexing state are distinct dimensions.

### Resource Lifecycle

```text
ACTIVE
   |
   | archive
   v
ARCHIVED
   |
   | successful restoration publication
   v
ACTIVE
```

Expiry results in Archive rather than a separate terminal Expired state.

### Resource Version Lifecycle

```text
DRAFT
  |
  | Submit
  v
SUBMITTED
  |
  v
UNDER_REVIEW
  |-- APPROVED
  |-- DECLINED
  `-- STOPPED
```

Publication is separate from Review/Version state. Approval authorizes a version to be published; it does not itself make the version public.

### Review Round

```text
UNASSIGNED
    |
    | assign
    v
ACTIVE
    |-- COMPLETED_APPROVED
    |-- COMPLETED_DECLINED
    `-- STOPPED
```

A formal review has exactly one active reviewer when assigned. Reviewer reassignment remains within the same Review Round. Resubmission following a completed Decline creates a new Review Round.

### Reviewer Assignment

Reviewer Assignment history must support states or terminal reasons such as:

```text
ASSIGNED

-> ENDED_REASSIGNED
-> ENDED_PERMISSION_REMOVED
-> ENDED_USER_DEACTIVATED
-> ENDED_REVIEW_COMPLETED
-> ENDED_WORKFLOW_STOPPED
```

Historical assignments and saved review work must remain preserved.

## 8. Review Rules

Formal review outcomes are:

```text
APPROVE
DECLINE
```

Review Decision records are immutable.

The effective review authorization must conceptually require:

```text
user is active
AND
user has review.decide
AND
user is the current assigned reviewer
AND
Review Round is ACTIVE
AND
Resource is ACTIVE
AND
separation-of-duty rules pass
```

Creators/submitting users cannot formally Approve or Decline their own submission. This separation of duties is enforced server-side and is not waived merely because a user has an elevated role.

## 9. Publication Model

Publication uses explicit concepts such as:

```text
Publication Request
Publication Attempt
Publication Schedule
```

Approval does not equal publication. Only the exact Approved immutable Resource Version may be published. Publishers cannot substantively edit the approved version while publishing.

Example:

```text
Resource R1

V1 = currently public
V2 = APPROVED
```

Until V2 successfully publishes:

```text
PUBLIC = V1
```

Successful publication atomically switches:

```text
currentPublishedVersion:
V1 -> V2
```

If V2 publication fails technically:

```text
V1 remains public
V2 remains APPROVED
PublicationAttempt = FAILED
```

A technical publication failure does not require another formal review. A substantive problem discovered after approval must produce another corrected Resource Version and another formal review.

## 10. Archive And Expiry

Archive may result from:

```text
manual action
expiration
privacy/governance action
```

Archive must:

```text
Resource -> ARCHIVED

remove public eligibility

create Archive Event

stop incompatible active Revision workflows

end affected active reviewer assignment

preserve history

write Audit Event

enqueue Search/AI removal
```

If:

```text
V1 Published
V2 UNDER_REVIEW
```

and the Resource is Archived:

```text
Resource -> ARCHIVED
V2 -> STOPPED
Review Round -> STOPPED
Reviewer Assignment -> ended
```

It must not create:

```text
APPROVE
DECLINE
```

Expiry should call the same authoritative Archive domain operation using an expiration-specific reason.

## 11. Restoration

Restoration must not mean:

```text
archived = false
```

Restoration is a governed workflow:

```text
ARCHIVED
   |
   v
Restoration Case
   |
   v
new Restoration Version DRAFT
   |
   v
Submit
   |
   v
Review
   |
   v
Approve
   |
   v
Publish
   |
   v
ACTIVE
```

Successful Restoration publication is what returns the Resource to Active/public status.

## 12. Verification Model

Verification is append-oriented:

```text
Verification Event
```

Possible verification information includes:

```text
resource_version
verification_type
source
verified_by
verified_at
result
notes
```

External Opportunities require original-source verification. Missing required verification blocks Submit.

Re-verification behavior:

```text
No substantive public change
-> new Verification Event only

Substantive change
-> new Resource Version / Revision
```

## 13. Authorization Model

Authorization follows this conceptual path:

```text
Role
  |
  v
Capabilities
  |
  v
Contextual Authorization
```

Recommended capability families include:

```text
resource.create
resource.edit_own
resource.edit_any
resource.submit
resource.archive
resource.restore

review.assign
review.reassign
review.view
review.decide

publication.publish
publication.schedule

verification.perform
verification.view_sensitive

asset.manage

taxonomy.manage
organization.manage
indicator.manage

user.manage
role.manage
governance.manage

audit.view
```

Final authorization must combine:

```text
authenticated identity
+
active User
+
capability
+
workflow state
+
ownership/responsibility
+
review assignment
+
separation of duties
+
governance rules
```

Administrators do not automatically bypass governance merely because of the Administrator role. Roles should remain reusable permission bundles rather than hard-coded business logic.

## 14. Responsibility Vs Historical Attribution

The backend must keep:

```text
created_by
```

separate from:

```text
current_responsible_owner
```

A Draft may be reassigned without rewriting who originally created it. Historical attribution must survive staff deactivation.

## 15. Staff Deactivation And Permission Removal

Before staff deactivation:

- active Draft/content responsibilities must be safely reassigned;
- active formal reviewer assignments may be released to Unassigned;
- saved review progress/history must remain;
- historical attribution must remain unchanged.

If required responsibility reassignment cannot be completed safely, deactivation must not partially succeed.

If a reviewer loses review permission:

```text
permission removal
+
release affected active Reviewer Assignments
+
retain review history/progress
```

Affected Review Rounds become safely Unassigned where appropriate.

## 16. Directus / NestJS / PostgreSQL Responsibility Contract

### NestJS Owns

```text
workflow orchestration
authorization
submission
review assignment/reassignment
review decisions
publication
archive
expiration
restoration
verification enforcement
public eligibility
Search orchestration
AI/RAG access policy
user deactivation consequences
permission-removal consequences
transactions
concurrency
idempotency
audit-event creation
```

### Directus Is Limited To Controlled Back-Office Capabilities

```text
Draft editorial entry
asset/file management UI
selected metadata editing
Organization administration
Indicator administration
taxonomy administration
internal browsing/admin convenience
```

Directus must not independently:

```text
approve review
decline review
publish content
archive Resources
restore Resources
switch current published version
reassign reviewers
deactivate users without workflow impact handling
```

Consequential Directus actions must call the authoritative NestJS operation.

### PostgreSQL Owns

```text
authoritative persisted state
foreign keys
uniqueness
structural constraints
partial indexes
locking
transactional integrity
```

The main business workflow should not be implemented through hidden database-trigger chains. Database constraints and locks enforce integrity; NestJS orchestrates explicit domain commands and workflow transitions.

## 17. Prisma / PostgreSQL Approach

The primary data access path is:

```text
NestJS
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

Prisma is the normal data-access/migration layer. Selective PostgreSQL raw SQL is explicitly allowed when required for correctness or PostgreSQL-specific capabilities, including:

```text
SELECT ... FOR UPDATE

partial indexes

advanced constraints

PostgreSQL Full-Text Search

pg_trgm

pgvector

specialized concurrency-sensitive operations

migrations Prisma cannot represent cleanly
```

Correctness must not be sacrificed simply to avoid raw SQL.

## 18. Optimistic Locking

Editable Drafts use:

```text
lock_version INTEGER
```

On update, the caller must provide the expected `lock_version`.

Example:

```text
A loads lock_version 5
B loads lock_version 5

A saves successfully
-> lock_version 6

B attempts save using expected 5
-> update affects zero rows
-> HTTP 409 Conflict
```

Stale edits must never silently overwrite newer work.

## 19. Pessimistic Locking

Use PostgreSQL row locks such as:

```sql
SELECT ... FOR UPDATE
```

where concurrent success would break governance.

Likely operations include:

```text
Approve
Decline
Assign reviewer
Reassign reviewer
Publish
Archive
Restoration publication
Staff deactivation
Permission removal affecting active responsibility
```

Do not use pessimistic locking for ordinary Draft editing.

## 20. Transaction Strategy

Preferred baseline:

```text
READ COMMITTED

+

explicit FOR UPDATE where races matter

+

database constraints

+

optimistic locking
```

Do not default the whole application to Serializable isolation.

Multi-record governance operations must be atomic. Examples:

```text
Submit
Assign
Reassign
Approve
Decline
Publish
Archive
Start Restoration
Staff Deactivation
Permission Removal
```

## 21. Publication Transaction

Conceptually:

```text
BEGIN

lock Resource
lock target Resource Version

re-read authoritative state

verify:
  Resource ACTIVE
  Version APPROVED
  actor authorized
  version still publishable
  no conflicting successful publication

record publication success
switch currentPublishedVersion
write Audit Event
write Outbox Event

COMMIT
```

Only after commit should asynchronous processing occur.

## 22. Transactional Outbox

Use:

```text
business transaction
    |-- authoritative state change
    |-- audit event
    `-- outbox record
COMMIT

Background Worker
    |
    v
process outbox
```

This protects against the failure case:

```text
database commits
server crashes before queue message is sent
```

## 23. Idempotency

Use idempotency protection for retryable consequential operations. Examples:

```text
publication
scheduled publication
expiration
archive jobs
Search indexing
AI ingestion
notifications
external event processing
```

For API commands, support an idempotency key where appropriate.

Conceptually store:

```text
idempotency_key
command_type
actor
target
request_hash
status
result_reference
created_at
```

Same key plus same command payload:

```text
return original result
```

Same key plus different payload:

```text
reject
```

Workers must revalidate authoritative PostgreSQL state before changing anything.

## 24. ID Strategy

Preferred domain primary identifiers:

```text
UUIDv7
```

Reasons:

- globally unique;
- safe to expose through APIs;
- roughly chronological;
- better database index locality than UUIDv4.

Optional human-readable identifiers such as:

```text
FBF-R-001284
```

may exist separately and should not be primary keys.

## 25. Time Strategy

Authoritative timestamps use UTC.

Use PostgreSQL:

```text
TIMESTAMPTZ
```

for actual instants such as:

```text
created_at
submitted_at
approved_at
published_at
verified_at
scheduled_publish_at
archived_at
```

APIs use ISO 8601. The frontend performs display timezone conversion.

Use `DATE` only when a business field is genuinely date-only. Do not invent the final FBF time-of-day/timezone interpretation for Resource expiration.

## 26. Audit Architecture

Maintain first-class domain history such as:

```text
ReviewDecision
ReviewerAssignment
PublicationAttempt
VerificationEvent
ArchiveEvent
```

Also maintain append-oriented:

```text
AuditEvent
```

Important Audit Event categories include:

```text
RESOURCE_CREATED
RESOURCE_VERSION_CREATED
RESOURCE_SUBMITTED

REVIEW_ROUND_CREATED
REVIEW_ASSIGNED
REVIEW_REASSIGNED
REVIEW_APPROVED
REVIEW_DECLINED
REVIEW_STOPPED

VERIFICATION_RECORDED

PUBLICATION_REQUESTED
PUBLICATION_SUCCEEDED
PUBLICATION_FAILED

RESOURCE_ARCHIVED
RESOURCE_EXPIRED

RESTORATION_STARTED
RESTORATION_COMPLETED

RESOURCE_RESPONSIBILITY_REASSIGNED

USER_DEACTIVATED

ROLE_ASSIGNED
ROLE_REMOVED
CAPABILITY_CHANGED

TAXONOMY_CHANGED
GOVERNANCE_SETTING_CHANGED
```

Audit Event should capture where applicable:

```text
actor
target
timestamp
event type
reason/comments
correlation ID
request ID
selective before/after context
```

Do not put passwords, tokens, full sensitive content, or unnecessary personal information in Audit Events. Audit history is separate from normal operational/application logging.

## 27. Public Eligibility

Public Eligibility Policy must be centralized.

The following must not appear publicly:

```text
Draft
Submitted
Under Review
Declined
Approved-but-unpublished
Archived
Restricted
otherwise ineligible content
```

This must apply consistently to:

```text
Browse
Explore
Search
Topic collections
Organizations
Resource relationships
Related Resources
public APIs
AI retrieval baseline
```

Search/index state does not override authoritative eligibility.

## 28. Search Architecture

Initial implementation:

```text
PostgreSQL Full-Text Search
+
pg_trgm
```

Future hybrid retrieval:

```text
metadata filtering
+
keyword/FTS retrieval
+
semantic pgvector retrieval
+
reranking
```

Only introduce a dedicated Search engine such as OpenSearch/Elasticsearch if actual scale, relevance, faceting, or operational requirements justify the additional infrastructure.

Search indexes/projections must remain rebuildable from authoritative PostgreSQL data.

## 29. AI/RAG Constraints

The AI Assistant is optional and subordinate to the governed Knowledge Hub.

Requirements:

- AI uses only approved/permitted evidence.
- AI citations must be traceable to BWES Resources/supporting evidence.
- Research, Data, Lived Experience, and Commentary distinctions must remain visible.
- Insufficient evidence is not a system error.
- The model must not silently fill evidence gaps with unsupported general model knowledge.
- Citation/evidence verification failure must not result in displaying unsupported generated claims.
- Restricted information must not leak through AI.
- Publicly visible content does not automatically mean AI-eligible.
- Lived Experience AI use remains dependent on final FBF consent/governance policy.

AI eligibility should therefore be treated conceptually as:

```text
AI Eligible
    subset of
Governance/Public Eligible
```

## 30. Background Processing

Background Worker may handle:

```text
expiration
Search indexing
asset processing
notifications
RAG ingestion
chunking
embeddings
other derived processing
```

Governance-critical transitions remain synchronous and transactional. Derived processing may be eventually consistent.

## 31. Deferred FBF Policy Decisions

Do not invent final values for:

```text
required/optional fields per Resource Type

final Topic hierarchy

Population vocabulary

Geography vocabulary

Sector vocabulary

Organization Type vocabulary

detailed review checklist

specialist/additional-review requirements

detailed Lived Experience privacy/consent/reuse/transcription/summarization/AI-use rules

Opportunity verification checklist

Opportunity re-verification freshness/intervals

Expiring Soon threshold

retired controlled-term public behavior

deletion/retention policy

duplicate/merge governance

AI evidence-sufficiency thresholds
```

The architecture must support these policies later without redesigning the core workflow.

## 32. Required Workflow Validation Scenarios

Phase 0 was stress-tested against and passed the following scenarios.

### Scenario A - Normal Publication

```text
Draft
-> Submit
-> Reviewer assigned
-> Approve
-> Publish
```

PASS.

### Scenario B - Decline/Resubmit

```text
Submit
-> Decline
-> corrected new Version
-> new Review Round
-> previous eligible reviewer by default
```

PASS.

### Scenario C - Revision Publication Failure

```text
V1 remains public
V2 approved
V2 publication fails
```

Expected and approved result:

```text
V1 remains public
V2 remains APPROVED
Publication Attempt = FAILED
```

PASS.

### Scenario D - Simultaneous Publication

Two publishers attempt the same publication.

Row locking plus state revalidation plus idempotency allow only one valid publication transition.

PASS.

### Scenario E - Archive During Revision Review

```text
V1 Published
V2 UNDER_REVIEW
-> Resource Archived
```

Expected:

```text
Resource ARCHIVED
V2 STOPPED
Review Round STOPPED
no Approve/Decline decision
```

PASS.

### Scenario F - External Opportunity Missing Verification

Submit blocked.

PASS.

### Scenario G - Expiration

Expiry invokes authoritative Archive operation. Public/Search/AI eligibility removed.

PASS.

### Scenario H - Reviewer Loses Permission

Permission removal releases affected Reviewer Assignment. Review remains safely Unassigned. History preserved.

PASS.

### Scenario I - Staff Deactivation

Draft responsibility is reassigned. Active reviews may become Unassigned. Historical attribution remains intact.

PASS.

### Scenario J - Stale Draft Edit

Optimistic locking rejects stale second save with conflict rather than silent overwrite.

PASS.

The architecture also handles:

```text
Archive vs Publish race

Reviewer Reassignment vs Approve race

Permission Removal vs Approve race

stale Search projection after Archive

stale AI/vector projection after Archive/restriction
```

through locks, transactions, execution-time revalidation, and centralized eligibility.

## 33. Important Illegal Transitions

The backend must reject at least:

```text
DECLINED -> APPROVED

APPROVED -> direct content edit

SUBMITTED -> direct content edit

Published Version -> direct substantive edit

ARCHIVED -> directly Published

ARCHIVED -> normal Revision publication

STOPPED Review -> Approve

STOPPED Review -> Decline

completed Review -> Reassign

unassigned/non-current reviewer -> Approve/Decline

creator/submitting user -> decide own formal review

required-unverified external Opportunity -> Submit

non-approved Resource Version -> Publish

Publisher modifying approved content while publishing

technical publication failure -> mark content Published

Archived Resource -> successful normal publication

duplicate simultaneous successful publication transition
```

## 34. Phase 0 Definition Of Done

Phase 0 now contains:

```text
approved architecture principles
ADR baseline
domain model
Resource vs Resource Version model
relationship model
review model
publication model
archive/restoration model
verification model
capability-based authorization model
workflow state machines
legal/illegal transitions
Directus/NestJS/PostgreSQL responsibility contract
Prisma/PostgreSQL strategy
transaction boundaries
optimistic concurrency
pessimistic locking
idempotency
transactional outbox
audit architecture
public eligibility policy
Search foundation
future AI/RAG boundary
deferred-policy handling
scenario stress tests
```
