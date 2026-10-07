# BWES Phase 2 Entity Relationship Diagram

## 1. Purpose

This document provides a domain-focused ERD for the implemented Phase 2
database model. It is split into smaller Mermaid diagrams so the relationships
remain readable.

The diagrams emphasize relationships, not every scalar field. Database-level
partial unique indexes and check constraints are summarized separately because
Mermaid ER diagrams cannot represent those invariants directly.

## 2. Core Resource And Classification Model

```mermaid
erDiagram
  UserAccount ||--o{ Resource : creates
  UserAccount ||--o{ ResourceVersion : creates

  Resource ||--o{ ResourceVersion : has_versions
  Resource o|--o| ResourceVersion : current_published_version
  ResourceVersion ||--o{ ResourceVersion : predecessor_successor

  ResourceType ||--o{ ResourceType : parent_of
  Topic ||--o{ Topic : parent_of
  Geography ||--o{ Geography : parent_of

  ResourceType ||--o{ ResourceVersion : classifies
  ContentFormat ||--o{ ResourceVersion : formats

  ResourceVersion ||--o{ ResourceVersionTopic : tagged_topic
  Topic ||--o{ ResourceVersionTopic : joins_resource_version

  ResourceVersion ||--o{ ResourceVersionGeography : tagged_geography
  Geography ||--o{ ResourceVersionGeography : joins_resource_version

  ResourceVersion ||--o{ ResourceVersionPopulation : tagged_population
  Population ||--o{ ResourceVersionPopulation : joins_resource_version

  ResourceVersion ||--o{ ResourceVersionAudience : tagged_audience
  Audience ||--o{ ResourceVersionAudience : joins_resource_version

  ResourceVersion ||--o{ ResourceVersionSector : tagged_sector
  Sector ||--o{ ResourceVersionSector : joins_resource_version
```

## 3. Type-Specific Metadata

```mermaid
erDiagram
  ResourceVersion ||--o| ResearchPublicationDetails : research_details
  ResourceVersion ||--o{ ResourceVersionAuthor : authors
  ResourceVersion ||--o| DatasetDetails : dataset_details
  ResourceVersion ||--o| LivedExperienceDetails : lived_experience_details
  ResourceVersion ||--o| ProgramEventDetails : program_event_details
  ResourceVersion ||--o| OpportunityDetails : opportunity_details

  DatasetDetails ||--o{ DatasetIndicator : measures
  Indicator ||--o{ DatasetIndicator : used_by_dataset

  Organization o|--o{ ResearchPublicationDetails : publisher
  Organization o|--o{ DatasetDetails : source_organization
  Organization o|--o{ ProgramEventDetails : program_partner
  Organization o|--o{ OpportunityDetails : opportunity_organization
  Organization o|--o{ ResourceVersionAuthor : author_affiliation
```

## 4. Organization, Source And Provenance

```mermaid
erDiagram
  OrganizationType o|--o{ Organization : classifies
  Organization o|--o{ OriginalSource : owns_source
  SourceCategory o|--o{ OriginalSource : categorizes

  OriginalSource ||--o{ SourceApproval : governed_approval
  UserAccount ||--o{ SourceApproval : approves

  ResourceVersion ||--o{ ResourceVersionSource : cites
  OriginalSource ||--o{ ResourceVersionSource : cited_by

  Organization ||--o{ DataSharingAgreement : has_agreement

  Resource ||--o{ VerificationEvent : verified_resource
  ResourceVersion o|--o{ VerificationEvent : verified_version
  OriginalSource o|--o{ VerificationEvent : verified_source
  UserAccount ||--o{ VerificationEvent : verifies
```

## 5. Asset Model

```mermaid
erDiagram
  UserAccount ||--o{ Asset : creates
  Asset ||--|{ AssetVersion : has_versions

  ResourceVersion ||--o{ ResourceVersionAsset : references_exact_asset_version
  AssetVersion ||--o{ ResourceVersionAsset : attached_to_resource_version
```

## 6. Consent And Lived Experience

```mermaid
erDiagram
  UserAccount ||--o{ ConsentRecord : creates
  ConsentRecord ||--o| ConsentParticipantIdentity : restricted_identity

  ConsentRecord ||--o{ ConsentPermission : has_permission
  ConsentPermissionPurpose ||--o{ ConsentPermission : defines_purpose
  UserAccount ||--o{ ConsentPermission : records

  ConsentRecord ||--o{ ConsentWithdrawal : withdrawal_history
  UserAccount o|--o{ ConsentWithdrawal : requests_withdrawal
  UserAccount o|--o{ ConsentWithdrawal : processes_withdrawal

  ConsentRecord ||--o{ LivedExperienceDetails : governs
  ResourceVersion ||--o| LivedExperienceDetails : lived_experience_details
```

## 7. Formal Review And Specialist Review

```mermaid
erDiagram
  ResourceVersion ||--o{ ReviewRound : reviewed_in

  ReviewChecklistVersion ||--o{ ReviewChecklistItem : contains
  ReviewChecklistVersion ||--o{ ReviewRound : used_by_round

  ReviewRound ||--o{ ReviewerAssignment : formal_assignments
  UserAccount ||--o{ ReviewerAssignment : assigned_reviewer
  UserAccount ||--o{ ReviewerAssignment : assignment_actor

  ReviewRound ||--o| ReviewDecision : final_decision
  UserAccount ||--o{ ReviewDecision : decides

  ReviewRound ||--o{ ReviewRoundAction : action_history
  UserAccount ||--o{ ReviewRoundAction : acts

  ReviewRound ||--o{ SpecialistReviewRequirement : requires
  SpecialistReviewType ||--o{ SpecialistReviewRequirement : classifies
  SpecialistReviewRequirement ||--o{ SpecialistReviewCheck : checked_by_specialist
  UserAccount ||--o{ SpecialistReviewCheck : specialist

  ReviewRound ||--o{ ReviewChecklistResponse : responses
  ReviewChecklistVersion ||--o{ ReviewChecklistResponse : version_bound
  ReviewChecklistItem ||--o{ ReviewChecklistResponse : item_bound
  UserAccount ||--o{ ReviewChecklistResponse : reviewer_response
```

## 8. Publication And Resource Lifecycle

```mermaid
erDiagram
  ResourceVersion ||--o{ PublicationRequest : requested_for_publication
  UserAccount ||--o{ PublicationRequest : requests

  ResourceVersion ||--o{ PublicationSchedule : scheduled_for_publication
  UserAccount ||--o{ PublicationSchedule : schedules

  ResourceVersion ||--o{ PublicationAttempt : attempted_publication
  UserAccount o|--o{ PublicationAttempt : attempts

  Resource ||--o{ PublicationWithdrawal : withdrawal_resource
  ResourceVersion ||--o{ PublicationWithdrawal : withdrawal_version
  UserAccount ||--o{ PublicationWithdrawal : withdraws

  Resource ||--o{ ArchiveEvent : archive_history
  UserAccount ||--o{ ArchiveEvent : archives

  Resource ||--o{ RestorationCase : restoration_cases
  UserAccount ||--o{ RestorationCase : requests_restoration

  Resource ||--o{ DeletionCase : deletion_cases
  UserAccount ||--o{ DeletionCase : requests_deletion
  UserAccount o|--o{ DeletionCase : approves_deletion
  UserAccount o|--o{ DeletionCase : executes_deletion
```

## 9. Audit And Transactional Outbox

```mermaid
erDiagram
  Resource o|--o{ AuditEvent : audited_resource
  ResourceVersion o|--o{ AuditEvent : audited_version

  OutboxEvent {
    string event_type
    string aggregate_type
    string aggregate_id
    json payload
  }
```

`OutboxEvent` is intentionally modeled as a generic durable asynchronous event
record. It does not currently declare foreign keys to domain aggregate tables.

## 10. Key Database-Level Invariants

Mermaid does not represent partial unique indexes or check constraints, so the
most important implemented invariants are summarized here.

```text
ResourceVersion.version_number > 0
ResourceVersion.lock_version >= 0
UNIQUE(resource_id, version_number)
UNIQUE(resource_id, id)
same-Resource predecessor enforced by composite foreign key
```

```text
At most one DRAFT ResourceVersion per Resource:
UNIQUE(resource_id) WHERE state = 'DRAFT'
```

```text
At most one active SourceApproval per OriginalSource:
UNIQUE(original_source_id) WHERE revoked_at IS NULL
```

```text
At most one primary source per ResourceVersion:
UNIQUE(resource_version_id) WHERE is_primary = true
```

```text
At most one primary document per ResourceVersion:
UNIQUE(resource_version_id) WHERE purpose = 'PRIMARY_DOCUMENT'
```

```text
At most one active ReviewerAssignment per ReviewRound:
UNIQUE(review_round_id) WHERE released_at IS NULL
```

The active-reviewer index may currently appear as
`reviewer_assignments_review_round_id_key`, but it remains a partial unique
index, not unconditional uniqueness.

```text
At most one final ReviewDecision per ReviewRound:
UNIQUE(review_round_id)
```

```text
AuditEvent.resource_version_id requires AuditEvent.resource_id.
OutboxEvent.attempt_count >= 0.
```

## 11. Phase Boundary

The ERD represents the Phase 2 persistence baseline only. It does not imply that
Phase 3 application services, auth integration, workflow transitions,
publication execution, archive/restoration execution, deletion execution,
Directus workflows, object-storage upload processing, outbox processing,
notifications, search, vector ingestion, RAG, or AI evidence evaluation have
been implemented.
