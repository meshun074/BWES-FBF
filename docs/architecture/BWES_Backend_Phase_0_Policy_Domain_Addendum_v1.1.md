# BWES Backend Phase 0 Policy & Domain Addendum v1.1

**Status:** Approved Phase 0 policy and domain reconciliation  
**Date:** 2026-10-02  
**Predecessor:** `BWES_Backend_Architecture_Domain_Foundation_v1.0.md`  
**Source:** New Future Black Female confirmation decisions  
**Scope:** Controlled policy and conceptual-domain refinement; no Phase 2 implementation

## 1. Purpose And Authority

This addendum adopts the latest FBF governance and content-model decisions into
the completed Phase 0 baseline. It supplements, and does not replace,
`BWES_Backend_Architecture_Domain_Foundation_v1.0.md`.

Phase 2 and later implementation must read the two documents together. If this
addendum expressly resolves or refines a deferred policy in v1.0, this addendum
governs that policy. All other v1.0 decisions remain authoritative.

This reconciliation does not reopen Phase 0 architecture, reopen Phase 1, or
begin Phase 2. It defines domain concepts and policy boundaries; it does not
prescribe final Prisma tables, migrations, API contracts, or UI behavior.

## 2. Preserved Architecture

The following foundations remain unchanged:

- NestJS modular monolith and REST application API;
- PostgreSQL as the authoritative system of record;
- Prisma as the primary data-access and migration layer, with selective
  PostgreSQL-specific SQL where required;
- Next.js frontend and controlled Directus back-office surface;
- stable FBF Resource identity with immutable submitted/reviewed Resource
  Versions;
- approval distinct from publication;
- one active formal reviewer per Review Round and immutable Review Decisions;
- archive and restoration as governed lifecycle concepts;
- centralized public eligibility and distinct AI eligibility;
- capability-based RBAC with contextual server-side authorization;
- optimistic locking for drafts and explicit transactions/row locking for
  concurrency-sensitive commands;
- transactional outbox and retry-safe asynchronous effects;
- permanent business audit history distinct from operational logging;
- S3-compatible object storage; and
- AI/RAG as a later governed subsystem using eligible content.

Directus must not become an independent workflow or authorization engine.
Search and AI projections remain derived and cannot authorize access.

## 3. Classification Model

### 3.1 Resource Type And Content Format

`ResourceType` remains the semantic classification of what a Resource is.
`ContentFormat` is the canonical backend name for the newly confirmed
presentation/content-kind dimension. They are separate, versioned concepts:

```text
ResourceType != ContentFormat != Topic
```

The approved Resource Type hierarchy remains:

```text
Knowledge / Information Resource
  |-- Research / Publication
  |-- Dataset / Quantitative Resource
  |-- Lived Experience
  `-- Blog / News / Editorial Content

Program / Service

Opportunity
  |-- Employment Opportunity
  |-- Volunteer Opportunity
  |-- Networking Opportunity
  `-- Mentorship Opportunity
```

Volunteer opportunities extend the Opportunity family without replacing its
existing kinds.

The initial controlled `ContentFormat` vocabulary and conceptual mappings are:

| Content format                   | Semantic Resource Type mapping                           |
| -------------------------------- | -------------------------------------------------------- |
| Dataset / Dashboard              | Dataset / Quantitative Resource                          |
| Mobility Index data              | Dataset / Quantitative Resource                          |
| Research Report                  | Research / Publication                                   |
| Academic Publication             | Research / Publication                                   |
| Policy Brief                     | Research / Publication                                   |
| Discussion Paper                 | Research / Publication                                   |
| Literature Review                | Research / Publication                                   |
| Infographic                      | Knowledge / Information Resource                         |
| Toolkit                          | Knowledge / Information Resource                         |
| Community Story                  | Lived Experience                                         |
| Interview, video, quote, podcast | Community Story formats associated with Lived Experience |
| Event / Workshop / Webinar       | Program / Service unless FBF later approves another rule |
| Opportunity                      | Opportunity family                                       |

Controlled vocabularies must support governance changes without treating every
label as a permanent database enum.

### 3.2 Classification Axes

The primary versioned classification axes are:

1. Topic
2. Geography
3. Population
4. Content Format
5. optional Audience Tag

Sector remains an optional supporting classification. Its omission from the
new four primary axes does not remove it from the model.

Topics must support hierarchy. The initial top-level vocabulary is Employment,
Income, Entrepreneurship, Education, Leadership, Housing, Financial Security,
Immigration, Health & Wellbeing, Caregiving, and Workplace Equity. For example:

```text
Employment
  |-- Labour Force Participation
  |-- Wage Gap
  |-- Job Search
  `-- Workplace Experience
```

Geography must support hierarchy:

```text
Canada
  -> Province / Territory
       -> Region / Municipality
```

Population includes Black women (all), Black girls and youth, immigrant Black
women, Black women entrepreneurs, and other groups defined by source data. Age
bands follow the applicable source dataset and must not be hard-coded globally.

Initial optional Audience Tags are Community, Researcher, Policymaker, Student,
Employer, Journalist, Funder, and Educator.

## 4. Resource Metadata

All Resource Versions require:

- title;
- Content Format;
- at least one Topic;
- Geography;
- plain-language summary;
- source/citation;
- publication or data date; and
- Creator.

`Creator` means the internal BWES authoring user (`created_by_user_id` or an
equivalent relationship). Public Author metadata is distinct and is required
for applicable research/publication content. The model must remain extensible
if FBF later confirms another public-facing Creator field.

Conditional metadata includes:

| Resource/content category                    | Required or conditional metadata                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Dataset / Dashboard                          | Source organization, reference period, methodology note, Population, and downloadable file when licensing permits                 |
| Research Report / Publication / Policy Brief | Author(s), publisher, key findings, policy implications or recommendations when present, and optional peer-reviewed status        |
| Community Story                              | Consent record reference, identity visibility, AI-use permission, related data Topic, and transcripts/captions for video or audio |
| Event / Workshop / Webinar                   | Date, time, location or virtual link, registration link, and optional partner                                                     |
| Opportunity                                  | Title, organization, deadline when one exists, optional compensation, and optional remote/hybrid designation                      |

Common versioned fields, relational classifications, and appropriate
type-specific detail structures are preferred over one Resource Version record
with many unrelated nullable fields. Readiness/domain validation must enforce
conditional requirements. Exact persistence design belongs to Phase 2.

Accessibility metadata must anticipate alt text, transcript references,
caption references, readable formatting, and useful media-accessibility status.

## 5. Roles And Contextual Authorization

FBF role names are reusable capability bundles. A staff member may hold
multiple roles, but authorization remains capability plus context and workflow
state, never a hard-coded role-name comparison.

| Role bundle               | Conceptual responsibilities                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Contributor               | Create and edit permitted drafts; submit for review                                                         |
| Reviewer                  | Conduct formal review; approve, decline, or return for changes                                              |
| Research/Evidence Lead    | Specialist review for data, research, and Mobility Index content; approve new AI knowledge sources          |
| Privacy & Consent Officer | Specialist lived-experience review; access restricted identity/consent records                              |
| Publisher                 | Publish, unpublish, and archive where authorized                                                            |
| Administrator             | Manage users, roles, permissions, and approved AI-source configuration; execute governed permanent deletion |

Phase 2 should reserve capabilities consistent with existing naming conventions
for research and privacy specialist review, restricted consent access,
unpublishing, AI-source approval/configuration, and deletion execution. Candidate
names include `specialist_review.research`, `specialist_review.privacy`,
`consent.view_restricted`, `publication.unpublish`,
`source.approve_for_ai`, `source.configure_for_ai`, and `deletion.execute`.
These names are not frozen if implementation conventions require equivalent
names.

Creator separation of duty remains mandatory. Examples of effective checks are:

```text
canPerformFormalReview =
  active user
  + review.decide capability
  + active formal assignment
  + reviewable Review Round
  + creator/submitter separation of duty
  + required specialist prerequisites satisfied before approval

canReadRestrictedConsent =
  active user
  + restricted consent/identity capability
  + authorized Privacy & Consent Officer or Administrator bundle

canExecutePermanentDeletion =
  deletion execution capability
  + approved Deletion Case
  + written Executive Director/delegate approval
  + retention, consent, and partner rules permit deletion
```

These rules must be enforced by NestJS against authoritative PostgreSQL state,
not solely by frontend or Directus permissions.

## 6. Review Reconciliation

### 6.1 Return For Changes

Formal `ReviewDecision` outcomes remain exactly:

```text
APPROVE
DECLINE
```

FBF's “return with comments” is a separate `ReturnForChanges` or
`ChangeRequest` workflow action, not a third final Review Decision. It requires
comments/reason, preserves all history, and does not make the submitted version
editable. Corrections occur in a successor Draft Version. Resubmission creates
a new Review Round and should normally return to the previous eligible reviewer
unless an Administrator reassigns it.

```text
Submitted -> Formal Review
                    |-- Approve
                    |-- Decline
                    `-- Return For Changes
                              -> successor Draft
                              -> resubmit
                              -> new Review Round
```

### 6.2 Specialist Prerequisites

Exactly one active formal Reviewer Assignment remains permitted per Review
Round. Specialist reviews are separate prerequisite records, conceptually
`SpecialistReviewRequirement` and `SpecialistReviewCheck`, rather than parallel
formal reviewers.

Required checks are:

- lived-experience content: Privacy & Consent Officer verifies consent,
  identity visibility, and AI-use permission;
- data, dashboards, Mobility Index, and research summaries: Research/Evidence
  Lead verifies figures, methodology, and interpretation;
- policy briefs and policy-recommendation content: Research/Evidence Lead is
  required; Executive Director/delegate involvement remains unresolved;
- a new AI knowledge-base source: Research/Evidence Lead approves and an
  Administrator configures it; and
- partner-supplied content: compliance with the applicable Data Sharing
  Agreement is checked.

Formal approval must be blocked until all required specialist prerequisites
pass. Each check preserves requirement type, actor, outcome, timestamp,
comments, and history.

```text
Resource Version
  -> determine prerequisite checks
  -> complete specialist check(s)
  -> all required checks satisfied
  -> formal approval may complete
```

### 6.3 Versioned Review Checklist

Review checklists are versioned through concepts such as
`ReviewChecklistVersion`, `ReviewChecklistItem`, and
`ReviewChecklistResponse`. Each Review Round records the checklist version used
so later checklist changes do not rewrite historical meaning.

The confirmed checklist assesses:

1. accuracy against the original source;
2. citation presence and link to the original;
3. FBF-approved source status;
4. required-field completeness and current dates/reference periods;
5. correct classification;
6. clear, accessible plain-language summary;
7. respectful, inclusive, culturally responsive language that avoids
   deficit-based framing and recognizes strengths and structural factors;
8. satisfied privacy/consent requirements and correct AI-use permission; and
9. applicable accessibility requirements, including alt text, captions,
   transcripts, and readable formatting.

## 7. Source Governance

The model must keep these concepts distinct:

```text
Original Source
!= FBF-approved source status
!= External Opportunity Verification
!= AI knowledge-base eligibility
```

An `ApprovedSourceRegistry` (or equivalent Source Governance concept) records
governed source approval. Current categories include BWES reports, Mobility
Index, Statistics Canada, government datasets, peer-reviewed literature, and
approved partners. These must be maintainable governance data, not a permanent
enum.

New AI knowledge-base sources require Research/Evidence Lead approval followed
by Administrator configuration. Partner content supports a reference to the
applicable Data Sharing Agreement.

## 8. Publication Withdrawal And Archive

`PublicationWithdrawal` (Unpublish) is distinct from Archive:

```text
Approved Version -> Publish -> Published

Published -> Unpublish -> not publicly available
                         Resource may remain ACTIVE

Published/Active -> Archive -> ARCHIVED
                              -> Restoration required for public return
```

Unpublish removes the current publication from public eligibility and public
Search/AI exposure while preserving publication history. It does not
automatically change the Resource lifecycle to `ARCHIVED`.

Republishing an unchanged approved version is permitted only when the
withdrawal reason has not invalidated approval, consent, or content. Substantive
changes require a new Resource Version, review, approval, and publication. A
withdrawn or invalid governance prerequisite blocks publication until policy
allows it.

## 9. Retention And Governed Deletion

Archive, not permanent deletion, is the default. Archived content is excluded
from public access and AI-retrievable sources and retained for seven years.
After seven years, deletion may be considered; seven years is not an automatic
deletion timer.

Permanent deletion requires a governed `DeletionCase` or `DeletionRequest`,
Administrator execution, written Executive Director/delegate approval, and an
Audit Event. The case preserves the requested Resource, reason, request time,
approving authority and evidence, approval time, executing Administrator,
execution time, and outcome.

Lived Experience remains subject to consent/withdrawal requirements, and
partner content remains subject to its Data Sharing Agreement. Deletion must
retain minimum non-sensitive proof that the governed action occurred without
copying deleted sensitive content into audit payloads.

```text
Eligible archived content
  -> Deletion Case
  -> written Executive Director/delegate approval
  -> Administrator execution
  -> governed deletion + minimal non-sensitive audit proof
```

## 10. Lived-Experience Consent

Sensitive identity and consent records are separate from ordinary Resource
Version metadata. The normalized conceptual model includes `ConsentRecord`,
`ConsentPermission`, and `ConsentWithdrawal`.

Consent is independently recorded for:

- public BWES/Data Hub publication;
- reuse in reports, presentations, social media, and funder materials;
- AI retrieval, summarization, and quotation, defaulting to **No** unless
  explicitly granted; and
- identity visibility as named, first name only, or anonymous/de-identified.

De-identification may include altering or removing voice, face, or other
identifying information. Only the Privacy & Consent Officer and Administrator
may access restricted identity/consent records; other staff see resulting
permission settings only.

A participant may withdraw at any time. Authoritative public and AI eligibility
must be revoked immediately in PostgreSQL. Publication is then withdrawn, and
the transactional outbox initiates deletion from embeddings, Search
projections, generated AI artifacts, and caches. FBF's ten-business-day removal
deadline governs completion of derived cleanup; it does not permit continued
retrieval during that period. Already printed or distributed material cannot be
recalled, and that limitation must be disclosed during consent.

```text
Consent Withdrawal
  -> public eligibility = false immediately
  -> AI eligibility = false immediately
  -> Unpublish
  -> transactional outbox
  -> derived Search/AI cleanup
  -> retention/deletion handling
```

The proposed consent-record retention period of content lifetime plus two years
remains unconfirmed and must not be encoded as an authoritative constant.

## 11. Deferred-Policy Reconciliation

### 11.1 Resolved By This Decision Set

The following v1.0 deferred areas are now substantially resolved, subject to
the remaining confirmations below:

- primary classification structure;
- required and conditional metadata categories;
- FBF staff role names and conceptual responsibilities;
- publication review checklist and its versioning requirement;
- specialist-review categories and prerequisite treatment;
- general archive/deletion/retention rule; and
- general Lived Experience consent, reuse, identity, withdrawal, and AI-use
  model.

### 11.2 Still Unresolved

The following remain policy/configuration extension points. Phase 2 must not
invent constants for them:

1. Executive Director/delegate specialist approval for policy briefs and
   policy-recommendation content;
2. consent-record retention for content lifetime plus two years;
3. External Opportunity verification freshness/re-verification interval;
4. Expiring Soon threshold;
5. maintenance/re-verification cadence;
6. retired Topic, Organization, and Indicator public behavior and
   migration/replacement rules;
7. duplicate Organization and Indicator merge governance;
8. AI evidence-sufficiency thresholds; and
9. complete Organization Type vocabulary, if required by the approved
   information model.

## 12. Conceptual Domain Additions

This addendum records the following concepts without requiring one database
table per concept:

- ContentFormat;
- AudienceTag;
- SpecialistReviewRequirement and SpecialistReviewCheck;
- ReturnForChanges/ChangeRequest;
- ReviewChecklistVersion, ReviewChecklistItem, and ReviewChecklistResponse;
- PublicationWithdrawal;
- ApprovedSourceRegistry/SourceApproval;
- DataSharingAgreement reference;
- DeletionCase/DeletionRequest; and
- ConsentRecord, ConsentPermission, and ConsentWithdrawal.

Phase 2 determines their exact Prisma/PostgreSQL representation while
preserving these semantic boundaries and histories.

## 13. Phase 1 Impact

This reconciliation does not require reopening or changing Phase 1 code or
tooling. The monorepo, NestJS API and worker, Next.js shell, PostgreSQL, Prisma,
Directus foundation, S3-compatible object storage, CI, structured logging,
tests, and environment configuration remain valid.

Only documentation references are updated so future implementation uses v1.0
and this addendum together.

## 14. Phase 2 Handoff

Phase 2 database and domain implementation must use:

```text
Phase 0 Architecture & Domain Foundation v1.0
+
Phase 0 Policy & Domain Addendum v1.1
```

Implementation must preserve ResourceType/ContentFormat separation;
hierarchical Topic and Geography; Population and Audience classifications;
common and type-specific metadata; versioned classifications; capability-based
roles; immutable submitted Resource Versions; Review Rounds; Return For
Changes; specialist prerequisites; checklist versioning; approved-source
governance; Publication Withdrawal; Archive/Restoration; governed Deletion
Cases; purpose-specific consent and withdrawal; restricted identity access;
purpose-specific AI eligibility; and complete auditability.

No Prisma schema, migration, API, workflow service, Directus model, Search/RAG
pipeline, or other Phase 2 implementation is created by this addendum.

## 15. Consistency Validation

The reconciliation was checked against the preserved Phase 0 invariants:

- [x] Resource Type and Topic remain distinct.
- [x] ContentFormat does not replace ResourceType.
- [x] Submitted and reviewed Resource Versions remain immutable.
- [x] Each Review Round still has at most one active formal reviewer.
- [x] Formal ReviewDecision remains Approve or Decline.
- [x] Return For Changes does not overwrite completed decisions.
- [x] Specialist checks do not violate the one-formal-reviewer invariant.
- [x] Creator separation of duty is preserved.
- [x] Approval remains separate from publication.
- [x] Unpublish remains distinct from Archive.
- [x] Archive still requires Restoration for future public return.
- [x] Public eligibility remains distinct from AI eligibility.
- [x] Consent withdrawal revokes public and AI access immediately.
- [x] Permanent deletion remains exceptional and governed.
- [x] PostgreSQL remains authoritative.
- [x] Directus does not become a competing rule engine.
- [x] Transactional, audit, and outbox principles remain unchanged.
- [x] Unresolved confirmation items are not treated as final.
- [x] No Phase 2 implementation has started.

No contradiction with the preserved Phase 0 architecture remains. The open
policy items in Section 11.2 are explicit extension points rather than assumed
values.
