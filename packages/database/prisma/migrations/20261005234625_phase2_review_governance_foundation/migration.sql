-- CreateEnum
CREATE TYPE "ReviewRoundState" AS ENUM ('PENDING_ASSIGNMENT', 'IN_REVIEW', 'RETURNED_FOR_CHANGES', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewDecisionOutcome" AS ENUM ('APPROVE', 'DECLINE');

-- CreateEnum
CREATE TYPE "ReviewRoundActionType" AS ENUM ('RETURNED_FOR_CHANGES', 'REASSIGNED', 'ASSIGNMENT_RELEASED');

-- CreateEnum
CREATE TYPE "SpecialistReviewStatus" AS ENUM ('REQUIRED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SpecialistReviewOutcome" AS ENUM ('SATISFIED', 'NOT_SATISFIED', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "review_checklist_versions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "version_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "effective_at" TIMESTAMPTZ(6) NOT NULL,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_checklist_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_checklist_items" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "checklist_version_id" UUID NOT NULL,
    "canonical_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "review_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_rounds" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_version_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL,
    "state" "ReviewRoundState" NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
    "checklist_version_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "review_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewer_assignments" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "review_round_id" UUID NOT NULL,
    "reviewer_user_id" UUID NOT NULL,
    "assigned_by_user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMPTZ(6),

    CONSTRAINT "reviewer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_decisions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "review_round_id" UUID NOT NULL,
    "reviewer_user_id" UUID NOT NULL,
    "decision" "ReviewDecisionOutcome" NOT NULL,
    "comments" TEXT,
    "decided_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_round_actions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "review_round_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "action_type" "ReviewRoundActionType" NOT NULL,
    "comments" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_round_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_review_types" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialist_review_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_review_requirements" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "review_round_id" UUID NOT NULL,
    "specialist_review_type_id" UUID NOT NULL,
    "status" "SpecialistReviewStatus" NOT NULL DEFAULT 'REQUIRED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_review_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_review_checks" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "requirement_id" UUID NOT NULL,
    "specialist_user_id" UUID NOT NULL,
    "outcome" "SpecialistReviewOutcome" NOT NULL,
    "comments" TEXT,
    "checked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_review_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_checklist_responses" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "review_round_id" UUID NOT NULL,
    "checklist_item_id" UUID NOT NULL,
    "reviewer_user_id" UUID NOT NULL,
    "response" TEXT NOT NULL,
    "comment" TEXT,
    "responded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_checklist_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_checklist_versions_version_number_key" ON "review_checklist_versions"("version_number");

-- CreateIndex
CREATE INDEX "review_checklist_items_checklist_version_id_idx" ON "review_checklist_items"("checklist_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_checklist_items_checklist_version_id_canonical_key_key" ON "review_checklist_items"("checklist_version_id", "canonical_key");

-- CreateIndex
CREATE UNIQUE INDEX "review_checklist_items_checklist_version_id_sort_order_key" ON "review_checklist_items"("checklist_version_id", "sort_order");

-- CreateIndex
CREATE INDEX "review_rounds_resource_version_id_state_idx" ON "review_rounds"("resource_version_id", "state");

-- CreateIndex
CREATE INDEX "review_rounds_checklist_version_id_idx" ON "review_rounds"("checklist_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_rounds_resource_version_id_round_number_key" ON "review_rounds"("resource_version_id", "round_number");

-- CreateIndex
CREATE INDEX "reviewer_assignments_review_round_id_assigned_at_idx" ON "reviewer_assignments"("review_round_id", "assigned_at");

-- CreateIndex
CREATE INDEX "reviewer_assignments_reviewer_user_id_idx" ON "reviewer_assignments"("reviewer_user_id");

-- CreateIndex
CREATE INDEX "reviewer_assignments_assigned_by_user_id_idx" ON "reviewer_assignments"("assigned_by_user_id");

-- CreateIndex
CREATE INDEX "review_decisions_review_round_id_decided_at_idx" ON "review_decisions"("review_round_id", "decided_at");

-- CreateIndex
CREATE INDEX "review_decisions_reviewer_user_id_idx" ON "review_decisions"("reviewer_user_id");

-- CreateIndex
CREATE INDEX "review_round_actions_review_round_id_occurred_at_idx" ON "review_round_actions"("review_round_id", "occurred_at");

-- CreateIndex
CREATE INDEX "review_round_actions_actor_user_id_idx" ON "review_round_actions"("actor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_review_types_canonical_key_key" ON "specialist_review_types"("canonical_key");

-- CreateIndex
CREATE INDEX "specialist_review_types_is_active_idx" ON "specialist_review_types"("is_active");

-- CreateIndex
CREATE INDEX "specialist_review_requirements_specialist_review_type_id_idx" ON "specialist_review_requirements"("specialist_review_type_id");

-- CreateIndex
CREATE INDEX "specialist_review_requirements_status_idx" ON "specialist_review_requirements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_review_requirements_review_round_id_specialist_r_key" ON "specialist_review_requirements"("review_round_id", "specialist_review_type_id");

-- CreateIndex
CREATE INDEX "specialist_review_checks_requirement_id_checked_at_idx" ON "specialist_review_checks"("requirement_id", "checked_at");

-- CreateIndex
CREATE INDEX "specialist_review_checks_specialist_user_id_idx" ON "specialist_review_checks"("specialist_user_id");

-- CreateIndex
CREATE INDEX "review_checklist_responses_checklist_item_id_idx" ON "review_checklist_responses"("checklist_item_id");

-- CreateIndex
CREATE INDEX "review_checklist_responses_reviewer_user_id_idx" ON "review_checklist_responses"("reviewer_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_checklist_responses_review_round_id_checklist_item_i_key" ON "review_checklist_responses"("review_round_id", "checklist_item_id");

-- AddForeignKey
ALTER TABLE "review_checklist_items" ADD CONSTRAINT "review_checklist_items_checklist_version_id_fkey" FOREIGN KEY ("checklist_version_id") REFERENCES "review_checklist_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_rounds" ADD CONSTRAINT "review_rounds_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_rounds" ADD CONSTRAINT "review_rounds_checklist_version_id_fkey" FOREIGN KEY ("checklist_version_id") REFERENCES "review_checklist_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_review_round_id_fkey" FOREIGN KEY ("review_round_id") REFERENCES "review_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_review_round_id_fkey" FOREIGN KEY ("review_round_id") REFERENCES "review_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_round_actions" ADD CONSTRAINT "review_round_actions_review_round_id_fkey" FOREIGN KEY ("review_round_id") REFERENCES "review_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_round_actions" ADD CONSTRAINT "review_round_actions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_review_requirements" ADD CONSTRAINT "specialist_review_requirements_review_round_id_fkey" FOREIGN KEY ("review_round_id") REFERENCES "review_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_review_requirements" ADD CONSTRAINT "specialist_review_requirements_specialist_review_type_id_fkey" FOREIGN KEY ("specialist_review_type_id") REFERENCES "specialist_review_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_review_checks" ADD CONSTRAINT "specialist_review_checks_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "specialist_review_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_review_checks" ADD CONSTRAINT "specialist_review_checks_specialist_user_id_fkey" FOREIGN KEY ("specialist_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_review_round_id_fkey" FOREIGN KEY ("review_round_id") REFERENCES "review_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "review_checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
