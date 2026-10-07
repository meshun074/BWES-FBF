-- CreateEnum
CREATE TYPE "PublicationAttemptOutcome" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "RestorationCaseState" AS ENUM ('REQUESTED', 'IN_REVIEW', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DeletionCaseOutcome" AS ENUM ('EXECUTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "publication_requests" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_version_id" UUID NOT NULL,
    "requested_by_user_id" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_schedules" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_version_id" UUID NOT NULL,
    "scheduled_for" TIMESTAMPTZ(6) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ(6),

    CONSTRAINT "publication_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_attempts" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_version_id" UUID NOT NULL,
    "attempted_by_user_id" UUID,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcome" "PublicationAttemptOutcome" NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,

    CONSTRAINT "publication_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_withdrawals" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "resource_version_id" UUID NOT NULL,
    "withdrawn_by_user_id" UUID NOT NULL,
    "withdrawn_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "publication_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_events" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "archived_by_user_id" UUID NOT NULL,
    "archived_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "archive_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restoration_cases" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "requested_by_user_id" UUID NOT NULL,
    "state" "RestorationCaseState" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "notes" TEXT,

    CONSTRAINT "restoration_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion_cases" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "requested_by_user_id" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_reference" TEXT,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "executed_by_user_id" UUID,
    "executed_at" TIMESTAMPTZ(6),
    "outcome" "DeletionCaseOutcome",

    CONSTRAINT "deletion_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "publication_requests_resource_version_id_requested_at_idx" ON "publication_requests"("resource_version_id", "requested_at");

-- CreateIndex
CREATE INDEX "publication_requests_requested_by_user_id_idx" ON "publication_requests"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "publication_schedules_resource_version_id_scheduled_for_idx" ON "publication_schedules"("resource_version_id", "scheduled_for");

-- CreateIndex
CREATE INDEX "publication_schedules_scheduled_for_idx" ON "publication_schedules"("scheduled_for");

-- CreateIndex
CREATE INDEX "publication_schedules_created_by_user_id_idx" ON "publication_schedules"("created_by_user_id");

-- CreateIndex
CREATE INDEX "publication_attempts_resource_version_id_attempted_at_idx" ON "publication_attempts"("resource_version_id", "attempted_at");

-- CreateIndex
CREATE INDEX "publication_attempts_attempted_by_user_id_idx" ON "publication_attempts"("attempted_by_user_id");

-- CreateIndex
CREATE INDEX "publication_attempts_outcome_idx" ON "publication_attempts"("outcome");

-- CreateIndex
CREATE INDEX "publication_withdrawals_resource_id_withdrawn_at_idx" ON "publication_withdrawals"("resource_id", "withdrawn_at");

-- CreateIndex
CREATE INDEX "publication_withdrawals_resource_version_id_idx" ON "publication_withdrawals"("resource_version_id");

-- CreateIndex
CREATE INDEX "publication_withdrawals_withdrawn_by_user_id_idx" ON "publication_withdrawals"("withdrawn_by_user_id");

-- CreateIndex
CREATE INDEX "archive_events_resource_id_archived_at_idx" ON "archive_events"("resource_id", "archived_at");

-- CreateIndex
CREATE INDEX "archive_events_archived_by_user_id_idx" ON "archive_events"("archived_by_user_id");

-- CreateIndex
CREATE INDEX "restoration_cases_resource_id_requested_at_idx" ON "restoration_cases"("resource_id", "requested_at");

-- CreateIndex
CREATE INDEX "restoration_cases_requested_by_user_id_idx" ON "restoration_cases"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "restoration_cases_state_idx" ON "restoration_cases"("state");

-- CreateIndex
CREATE INDEX "deletion_cases_resource_id_requested_at_idx" ON "deletion_cases"("resource_id", "requested_at");

-- CreateIndex
CREATE INDEX "deletion_cases_requested_by_user_id_idx" ON "deletion_cases"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "deletion_cases_approved_by_user_id_idx" ON "deletion_cases"("approved_by_user_id");

-- CreateIndex
CREATE INDEX "deletion_cases_executed_by_user_id_idx" ON "deletion_cases"("executed_by_user_id");

-- CreateIndex
CREATE INDEX "deletion_cases_outcome_idx" ON "deletion_cases"("outcome");

-- AddForeignKey
ALTER TABLE "publication_requests" ADD CONSTRAINT "publication_requests_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_requests" ADD CONSTRAINT "publication_requests_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_schedules" ADD CONSTRAINT "publication_schedules_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_schedules" ADD CONSTRAINT "publication_schedules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_attempts" ADD CONSTRAINT "publication_attempts_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_attempts" ADD CONSTRAINT "publication_attempts_attempted_by_user_id_fkey" FOREIGN KEY ("attempted_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_withdrawals" ADD CONSTRAINT "publication_withdrawals_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_withdrawals" ADD CONSTRAINT "publication_withdrawals_resource_id_resource_version_id_fkey" FOREIGN KEY ("resource_id", "resource_version_id") REFERENCES "resource_versions"("resource_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_withdrawals" ADD CONSTRAINT "publication_withdrawals_withdrawn_by_user_id_fkey" FOREIGN KEY ("withdrawn_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_events" ADD CONSTRAINT "archive_events_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_events" ADD CONSTRAINT "archive_events_archived_by_user_id_fkey" FOREIGN KEY ("archived_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restoration_cases" ADD CONSTRAINT "restoration_cases_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restoration_cases" ADD CONSTRAINT "restoration_cases_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_cases" ADD CONSTRAINT "deletion_cases_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_cases" ADD CONSTRAINT "deletion_cases_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_cases" ADD CONSTRAINT "deletion_cases_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_cases" ADD CONSTRAINT "deletion_cases_executed_by_user_id_fkey" FOREIGN KEY ("executed_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
