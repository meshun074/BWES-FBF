-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('ORIGINAL_SOURCE', 'EXTERNAL_OPPORTUNITY', 'SOURCE_REVERIFICATION');

-- CreateEnum
CREATE TYPE "VerificationOutcome" AS ENUM ('VERIFIED', 'FAILED', 'INCONCLUSIVE');

-- CreateTable
CREATE TABLE "verification_events" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "resource_version_id" UUID,
    "original_source_id" UUID,
    "verification_type" "VerificationType" NOT NULL,
    "outcome" "VerificationOutcome" NOT NULL,
    "source_url" TEXT,
    "verified_by_user_id" UUID NOT NULL,
    "verified_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "verification_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_events_resource_id_verified_at_idx" ON "verification_events"("resource_id", "verified_at");

-- CreateIndex
CREATE INDEX "verification_events_resource_version_id_verified_at_idx" ON "verification_events"("resource_version_id", "verified_at");

-- CreateIndex
CREATE INDEX "verification_events_original_source_id_verified_at_idx" ON "verification_events"("original_source_id", "verified_at");

-- CreateIndex
CREATE INDEX "verification_events_verified_by_user_id_idx" ON "verification_events"("verified_by_user_id");

-- CreateIndex
CREATE INDEX "verification_events_verification_type_verified_at_idx" ON "verification_events"("verification_type", "verified_at");

-- CreateIndex
CREATE INDEX "verification_events_outcome_idx" ON "verification_events"("outcome");

-- AddForeignKey
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_original_source_id_fkey" FOREIGN KEY ("original_source_id") REFERENCES "original_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
