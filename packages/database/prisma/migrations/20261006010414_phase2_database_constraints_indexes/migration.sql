-- BWES Phase 2 database-specific integrity constraints and indexes.
-- These constraints strengthen invariants that are not fully represented
-- by the Prisma schema or are intentionally PostgreSQL-specific.

-- ============================================================
-- Hierarchical reference-data integrity
-- ============================================================

ALTER TABLE "resource_types"
ADD CONSTRAINT "resource_types_parent_not_self_chk"
CHECK ("parent_id" IS NULL OR "parent_id" <> "id");

ALTER TABLE "topics"
ADD CONSTRAINT "topics_parent_not_self_chk"
CHECK ("parent_id" IS NULL OR "parent_id" <> "id");

ALTER TABLE "geographies"
ADD CONSTRAINT "geographies_parent_not_self_chk"
CHECK ("parent_id" IS NULL OR "parent_id" <> "id");


-- ============================================================
-- Resource / ResourceVersion integrity
-- ============================================================

ALTER TABLE "resource_versions"
ADD CONSTRAINT "resource_versions_version_number_positive_chk"
CHECK ("version_number" > 0);

ALTER TABLE "resource_versions"
ADD CONSTRAINT "resource_versions_lock_version_nonnegative_chk"
CHECK ("lock_version" >= 0);

-- At most one active editable Draft per stable Resource.
CREATE UNIQUE INDEX "resource_versions_one_draft_per_resource_uidx"
ON "resource_versions" ("resource_id")
WHERE "state" = 'DRAFT';


-- ============================================================
-- Type-specific metadata integrity
-- ============================================================

ALTER TABLE "resource_version_authors"
ADD CONSTRAINT "resource_version_authors_sequence_nonnegative_chk"
CHECK ("sequence" >= 0);

ALTER TABLE "dataset_details"
ADD CONSTRAINT "dataset_details_reference_period_valid_chk"
CHECK (
  "reference_period_start" IS NULL
  OR "reference_period_end" IS NULL
  OR "reference_period_end" >= "reference_period_start"
);

ALTER TABLE "program_event_details"
ADD CONSTRAINT "program_event_details_time_range_valid_chk"
CHECK (
  "starts_at" IS NULL
  OR "ends_at" IS NULL
  OR "ends_at" >= "starts_at"
);


-- ============================================================
-- Provenance / source integrity
-- ============================================================

-- A source record must contain some meaningful provenance.
ALTER TABLE "original_sources"
ADD CONSTRAINT "original_sources_identity_present_chk"
CHECK (
  "organization_id" IS NOT NULL
  OR NULLIF(BTRIM("title"), '') IS NOT NULL
  OR NULLIF(BTRIM("source_url"), '') IS NOT NULL
  OR NULLIF(BTRIM("source_reference"), '') IS NOT NULL
);

-- At most one currently active approval for a source.
CREATE UNIQUE INDEX "source_approvals_one_active_per_source_uidx"
ON "source_approvals" ("original_source_id")
WHERE "revoked_at" IS NULL;

-- At most one primary source per ResourceVersion.
CREATE UNIQUE INDEX "resource_version_sources_one_primary_uidx"
ON "resource_version_sources" ("resource_version_id")
WHERE "is_primary" = true;

ALTER TABLE "data_sharing_agreements"
ADD CONSTRAINT "data_sharing_agreements_date_range_valid_chk"
CHECK (
  "effective_date" IS NULL
  OR "expiration_date" IS NULL
  OR "expiration_date" >= "effective_date"
);


-- ============================================================
-- Asset integrity
-- ============================================================

ALTER TABLE "asset_versions"
ADD CONSTRAINT "asset_versions_version_number_positive_chk"
CHECK ("version_number" > 0);

ALTER TABLE "asset_versions"
ADD CONSTRAINT "asset_versions_size_bytes_nonnegative_chk"
CHECK ("size_bytes" >= 0);

ALTER TABLE "resource_version_assets"
ADD CONSTRAINT "resource_version_assets_sort_order_nonnegative_chk"
CHECK ("sort_order" >= 0);

-- A ResourceVersion can have at most one primary document.
CREATE UNIQUE INDEX "resource_version_assets_one_primary_document_uidx"
ON "resource_version_assets" ("resource_version_id")
WHERE "purpose" = 'PRIMARY_DOCUMENT';


-- ============================================================
-- Consent integrity
-- ============================================================

ALTER TABLE "consent_permissions"
ADD CONSTRAINT "consent_permissions_dates_valid_chk"
CHECK (
  ("granted_at" IS NULL OR "granted_at" >= "created_at")
  AND
  ("revoked_at" IS NULL OR "granted_at" IS NULL OR "revoked_at" >= "granted_at")
);

ALTER TABLE "consent_withdrawals"
ADD CONSTRAINT "consent_withdrawals_processing_valid_chk"
CHECK (
  (
    "status" = 'REQUESTED'
    AND "processed_at" IS NULL
    AND "processed_by_user_id" IS NULL
  )
  OR
  (
    "status" = 'PROCESSED'
    AND "processed_at" IS NOT NULL
    AND "processed_by_user_id" IS NOT NULL
    AND "processed_at" >= "requested_at"
  )
);


-- ============================================================
-- Review-governance integrity
-- ============================================================

ALTER TABLE "review_checklist_versions"
ADD CONSTRAINT "review_checklist_versions_version_number_positive_chk"
CHECK ("version_number" > 0);

ALTER TABLE "review_checklist_items"
ADD CONSTRAINT "review_checklist_items_sort_order_nonnegative_chk"
CHECK ("sort_order" >= 0);

ALTER TABLE "review_rounds"
ADD CONSTRAINT "review_rounds_round_number_positive_chk"
CHECK ("round_number" > 0);

ALTER TABLE "review_rounds"
ADD CONSTRAINT "review_rounds_completion_time_valid_chk"
CHECK (
  "completed_at" IS NULL
  OR "completed_at" >= "started_at"
);

-- Exactly one active reviewer is a workflow rule; at DB level we can
-- guarantee AT MOST one active assignment per round.
CREATE UNIQUE INDEX "reviewer_assignments_one_active_per_round_uidx"
ON "reviewer_assignments" ("review_round_id")
WHERE "released_at" IS NULL;

ALTER TABLE "reviewer_assignments"
ADD CONSTRAINT "reviewer_assignments_release_time_valid_chk"
CHECK (
  "released_at" IS NULL
  OR "released_at" >= "assigned_at"
);

-- A ReviewRound has at most one final APPROVE/DECLINE decision.
CREATE UNIQUE INDEX "review_decisions_one_final_per_round_uidx"
ON "review_decisions" ("review_round_id");


-- ============================================================
-- Publication / restoration / deletion integrity
-- ============================================================

ALTER TABLE "publication_schedules"
ADD CONSTRAINT "publication_schedules_cancel_time_valid_chk"
CHECK (
  "cancelled_at" IS NULL
  OR "cancelled_at" >= "created_at"
);

ALTER TABLE "publication_attempts"
ADD CONSTRAINT "publication_attempts_failure_details_chk"
CHECK (
  "outcome" <> 'FAILED'
  OR "error_code" IS NOT NULL
  OR "error_message" IS NOT NULL
);

ALTER TABLE "restoration_cases"
ADD CONSTRAINT "restoration_cases_completion_valid_chk"
CHECK (
  (
    "state" IN ('REQUESTED', 'IN_REVIEW')
    AND "completed_at" IS NULL
  )
  OR
  (
    "state" IN ('COMPLETED', 'DECLINED')
    AND "completed_at" IS NOT NULL
    AND "completed_at" >= "requested_at"
  )
);

ALTER TABLE "deletion_cases"
ADD CONSTRAINT "deletion_cases_approval_time_valid_chk"
CHECK (
  "approved_at" IS NULL
  OR "approved_at" >= "requested_at"
);

ALTER TABLE "deletion_cases"
ADD CONSTRAINT "deletion_cases_execution_time_valid_chk"
CHECK (
  "executed_at" IS NULL
  OR (
    "approved_at" IS NOT NULL
    AND "executed_at" >= "approved_at"
  )
);

ALTER TABLE "deletion_cases"
ADD CONSTRAINT "deletion_cases_approval_fields_consistent_chk"
CHECK (
  (
    "approved_at" IS NULL
    AND "approved_by_user_id" IS NULL
  )
  OR
  (
    "approved_at" IS NOT NULL
    AND "approved_by_user_id" IS NOT NULL
    AND NULLIF(BTRIM("approval_reference"), '') IS NOT NULL
  )
);

ALTER TABLE "deletion_cases"
ADD CONSTRAINT "deletion_cases_execution_fields_consistent_chk"
CHECK (
  (
    "executed_at" IS NULL
    AND "executed_by_user_id" IS NULL
  )
  OR
  (
    "executed_at" IS NOT NULL
    AND "executed_by_user_id" IS NOT NULL
  )
);

ALTER TABLE "deletion_cases"
ADD CONSTRAINT "deletion_cases_executed_outcome_consistent_chk"
CHECK (
  "outcome" <> 'EXECUTED'
  OR (
    "approved_at" IS NOT NULL
    AND "approved_by_user_id" IS NOT NULL
    AND NULLIF(BTRIM("approval_reference"), '') IS NOT NULL
    AND "executed_at" IS NOT NULL
    AND "executed_by_user_id" IS NOT NULL
  )
);


-- ============================================================
-- Audit / transactional outbox integrity
-- ============================================================

-- Because the composite FK uses PostgreSQL MATCH SIMPLE semantics,
-- explicitly forbid a version reference without its parent Resource.
ALTER TABLE "audit_events"
ADD CONSTRAINT "audit_events_resource_version_requires_resource_chk"
CHECK (
  "resource_version_id" IS NULL
  OR "resource_id" IS NOT NULL
);

ALTER TABLE "outbox_events"
ADD CONSTRAINT "outbox_events_attempt_count_nonnegative_chk"
CHECK ("attempt_count" >= 0);

ALTER TABLE "outbox_events"
ADD CONSTRAINT "outbox_events_processed_time_valid_chk"
CHECK (
  "processed_at" IS NULL
  OR "processed_at" >= "created_at"
);

-- Primary worker access pattern: ready, unprocessed events.
CREATE INDEX "outbox_events_pending_available_idx"
ON "outbox_events" ("available_at", "created_at")
WHERE "processed_at" IS NULL;