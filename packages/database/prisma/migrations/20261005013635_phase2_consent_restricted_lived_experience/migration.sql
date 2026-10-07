/*
  Warnings:

  - Added the required column `consent_record_id` to the `lived_experience_details` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConsentWithdrawalStatus" AS ENUM ('REQUESTED', 'PROCESSED');

-- AlterTable
ALTER TABLE "lived_experience_details" ADD COLUMN     "consent_record_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "recorded_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "retention_policy_reference" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_participant_identities" (
    "consent_record_id" UUID NOT NULL,
    "full_name" TEXT,
    "preferred_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consent_participant_identities_pkey" PRIMARY KEY ("consent_record_id")
);

-- CreateTable
CREATE TABLE "consent_permission_purposes" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consent_permission_purposes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_permissions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "consent_record_id" UUID NOT NULL,
    "purpose_id" UUID NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "recorded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consent_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_withdrawals" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "consent_record_id" UUID NOT NULL,
    "status" "ConsentWithdrawalStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "reason" TEXT,
    "requested_by_user_id" UUID,
    "processed_by_user_id" UUID,

    CONSTRAINT "consent_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_records_created_by_user_id_idx" ON "consent_records"("created_by_user_id");

-- CreateIndex
CREATE INDEX "consent_records_recorded_at_idx" ON "consent_records"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "consent_permission_purposes_canonical_key_key" ON "consent_permission_purposes"("canonical_key");

-- CreateIndex
CREATE INDEX "consent_permission_purposes_is_active_idx" ON "consent_permission_purposes"("is_active");

-- CreateIndex
CREATE INDEX "consent_permissions_purpose_id_idx" ON "consent_permissions"("purpose_id");

-- CreateIndex
CREATE INDEX "consent_permissions_recorded_by_user_id_idx" ON "consent_permissions"("recorded_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "consent_permissions_consent_record_id_purpose_id_key" ON "consent_permissions"("consent_record_id", "purpose_id");

-- CreateIndex
CREATE INDEX "consent_withdrawals_consent_record_id_requested_at_idx" ON "consent_withdrawals"("consent_record_id", "requested_at");

-- CreateIndex
CREATE INDEX "consent_withdrawals_status_idx" ON "consent_withdrawals"("status");

-- CreateIndex
CREATE INDEX "consent_withdrawals_requested_by_user_id_idx" ON "consent_withdrawals"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "consent_withdrawals_processed_by_user_id_idx" ON "consent_withdrawals"("processed_by_user_id");

-- CreateIndex
CREATE INDEX "lived_experience_details_consent_record_id_idx" ON "lived_experience_details"("consent_record_id");

-- AddForeignKey
ALTER TABLE "lived_experience_details" ADD CONSTRAINT "lived_experience_details_consent_record_id_fkey" FOREIGN KEY ("consent_record_id") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_participant_identities" ADD CONSTRAINT "consent_participant_identities_consent_record_id_fkey" FOREIGN KEY ("consent_record_id") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_permissions" ADD CONSTRAINT "consent_permissions_consent_record_id_fkey" FOREIGN KEY ("consent_record_id") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_permissions" ADD CONSTRAINT "consent_permissions_purpose_id_fkey" FOREIGN KEY ("purpose_id") REFERENCES "consent_permission_purposes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_permissions" ADD CONSTRAINT "consent_permissions_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_withdrawals" ADD CONSTRAINT "consent_withdrawals_consent_record_id_fkey" FOREIGN KEY ("consent_record_id") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_withdrawals" ADD CONSTRAINT "consent_withdrawals_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_withdrawals" ADD CONSTRAINT "consent_withdrawals_processed_by_user_id_fkey" FOREIGN KEY ("processed_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
