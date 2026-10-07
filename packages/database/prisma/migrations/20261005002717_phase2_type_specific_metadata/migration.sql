-- CreateEnum
CREATE TYPE "IdentityVisibility" AS ENUM ('NAMED', 'FIRST_NAME_ONLY', 'ANONYMOUS', 'DE_IDENTIFIED');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateTable
CREATE TABLE "research_publication_details" (
    "resource_version_id" UUID NOT NULL,
    "key_findings" TEXT,
    "policy_implications" TEXT,
    "peer_reviewed" BOOLEAN,

    CONSTRAINT "research_publication_details_pkey" PRIMARY KEY ("resource_version_id")
);

-- CreateTable
CREATE TABLE "resource_version_authors" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_version_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resource_version_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_details" (
    "resource_version_id" UUID NOT NULL,
    "reference_period_start" DATE,
    "reference_period_end" DATE,
    "methodology_note" TEXT,
    "download_allowed" BOOLEAN,

    CONSTRAINT "dataset_details_pkey" PRIMARY KEY ("resource_version_id")
);

-- CreateTable
CREATE TABLE "lived_experience_details" (
    "resource_version_id" UUID NOT NULL,
    "identity_visibility" "IdentityVisibility" NOT NULL,

    CONSTRAINT "lived_experience_details_pkey" PRIMARY KEY ("resource_version_id")
);

-- CreateTable
CREATE TABLE "program_event_details" (
    "resource_version_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "location_text" TEXT,
    "virtual_url" TEXT,
    "registration_url" TEXT,

    CONSTRAINT "program_event_details_pkey" PRIMARY KEY ("resource_version_id")
);

-- CreateTable
CREATE TABLE "opportunity_details" (
    "resource_version_id" UUID NOT NULL,
    "application_deadline_at" TIMESTAMPTZ(6),
    "compensation_text" TEXT,
    "work_arrangement" "WorkArrangement",
    "application_url" TEXT,

    CONSTRAINT "opportunity_details_pkey" PRIMARY KEY ("resource_version_id")
);

-- CreateIndex
CREATE INDEX "resource_version_authors_resource_version_id_idx" ON "resource_version_authors"("resource_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_version_authors_resource_version_id_sequence_key" ON "resource_version_authors"("resource_version_id", "sequence");

-- AddForeignKey
ALTER TABLE "research_publication_details" ADD CONSTRAINT "research_publication_details_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_authors" ADD CONSTRAINT "resource_version_authors_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_details" ADD CONSTRAINT "dataset_details_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lived_experience_details" ADD CONSTRAINT "lived_experience_details_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_event_details" ADD CONSTRAINT "program_event_details_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_details" ADD CONSTRAINT "opportunity_details_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
