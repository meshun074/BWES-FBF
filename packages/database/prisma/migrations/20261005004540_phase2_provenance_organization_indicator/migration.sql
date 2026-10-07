-- AlterTable
ALTER TABLE "dataset_details" ADD COLUMN     "source_organization_id" UUID;

-- AlterTable
ALTER TABLE "opportunity_details" ADD COLUMN     "organization_id" UUID;

-- AlterTable
ALTER TABLE "program_event_details" ADD COLUMN     "partner_organization_id" UUID;

-- AlterTable
ALTER TABLE "research_publication_details" ADD COLUMN     "publisher_organization_id" UUID;

-- AlterTable
ALTER TABLE "resource_version_authors" ADD COLUMN     "organization_id" UUID;

-- CreateTable
CREATE TABLE "organization_types" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_name" TEXT NOT NULL,
    "canonical_key" TEXT,
    "website_url" TEXT,
    "organization_type_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_categories" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "source_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "original_sources" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organization_id" UUID,
    "source_category_id" UUID,
    "title" TEXT,
    "source_url" TEXT,
    "source_reference" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "original_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_approvals" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "original_source_id" UUID NOT NULL,
    "approved_by_user_id" UUID NOT NULL,
    "approved_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "notes" TEXT,

    CONSTRAINT "source_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_sources" (
    "resource_version_id" UUID NOT NULL,
    "original_source_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "citation_text" TEXT,

    CONSTRAINT "resource_version_sources_pkey" PRIMARY KEY ("resource_version_id","original_source_id")
);

-- CreateTable
CREATE TABLE "data_sharing_agreements" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organization_id" UUID NOT NULL,
    "agreement_reference" TEXT NOT NULL,
    "effective_date" DATE,
    "expiration_date" DATE,
    "terminated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "data_sharing_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_indicators" (
    "resource_version_id" UUID NOT NULL,
    "indicator_id" UUID NOT NULL,

    CONSTRAINT "dataset_indicators_pkey" PRIMARY KEY ("resource_version_id","indicator_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_types_canonical_key_key" ON "organization_types"("canonical_key");

-- CreateIndex
CREATE INDEX "organization_types_is_active_idx" ON "organization_types"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_canonical_key_key" ON "organizations"("canonical_key");

-- CreateIndex
CREATE INDEX "organizations_organization_type_id_idx" ON "organizations"("organization_type_id");

-- CreateIndex
CREATE INDEX "organizations_canonical_name_idx" ON "organizations"("canonical_name");

-- CreateIndex
CREATE INDEX "organizations_is_active_idx" ON "organizations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "source_categories_canonical_key_key" ON "source_categories"("canonical_key");

-- CreateIndex
CREATE INDEX "source_categories_is_active_idx" ON "source_categories"("is_active");

-- CreateIndex
CREATE INDEX "original_sources_organization_id_idx" ON "original_sources"("organization_id");

-- CreateIndex
CREATE INDEX "original_sources_source_category_id_idx" ON "original_sources"("source_category_id");

-- CreateIndex
CREATE INDEX "source_approvals_original_source_id_approved_at_idx" ON "source_approvals"("original_source_id", "approved_at");

-- CreateIndex
CREATE INDEX "source_approvals_approved_by_user_id_idx" ON "source_approvals"("approved_by_user_id");

-- CreateIndex
CREATE INDEX "resource_version_sources_original_source_id_idx" ON "resource_version_sources"("original_source_id");

-- CreateIndex
CREATE INDEX "data_sharing_agreements_organization_id_idx" ON "data_sharing_agreements"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_sharing_agreements_organization_id_agreement_reference_key" ON "data_sharing_agreements"("organization_id", "agreement_reference");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_canonical_key_key" ON "indicators"("canonical_key");

-- CreateIndex
CREATE INDEX "indicators_is_active_idx" ON "indicators"("is_active");

-- CreateIndex
CREATE INDEX "dataset_indicators_indicator_id_idx" ON "dataset_indicators"("indicator_id");

-- CreateIndex
CREATE INDEX "dataset_details_source_organization_id_idx" ON "dataset_details"("source_organization_id");

-- CreateIndex
CREATE INDEX "opportunity_details_organization_id_idx" ON "opportunity_details"("organization_id");

-- CreateIndex
CREATE INDEX "program_event_details_partner_organization_id_idx" ON "program_event_details"("partner_organization_id");

-- CreateIndex
CREATE INDEX "research_publication_details_publisher_organization_id_idx" ON "research_publication_details"("publisher_organization_id");

-- CreateIndex
CREATE INDEX "resource_version_authors_organization_id_idx" ON "resource_version_authors"("organization_id");

-- AddForeignKey
ALTER TABLE "research_publication_details" ADD CONSTRAINT "research_publication_details_publisher_organization_id_fkey" FOREIGN KEY ("publisher_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_authors" ADD CONSTRAINT "resource_version_authors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_details" ADD CONSTRAINT "dataset_details_source_organization_id_fkey" FOREIGN KEY ("source_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_event_details" ADD CONSTRAINT "program_event_details_partner_organization_id_fkey" FOREIGN KEY ("partner_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_details" ADD CONSTRAINT "opportunity_details_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_organization_type_id_fkey" FOREIGN KEY ("organization_type_id") REFERENCES "organization_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "original_sources" ADD CONSTRAINT "original_sources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "original_sources" ADD CONSTRAINT "original_sources_source_category_id_fkey" FOREIGN KEY ("source_category_id") REFERENCES "source_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_approvals" ADD CONSTRAINT "source_approvals_original_source_id_fkey" FOREIGN KEY ("original_source_id") REFERENCES "original_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_approvals" ADD CONSTRAINT "source_approvals_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_sources" ADD CONSTRAINT "resource_version_sources_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_sources" ADD CONSTRAINT "resource_version_sources_original_source_id_fkey" FOREIGN KEY ("original_source_id") REFERENCES "original_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_agreements" ADD CONSTRAINT "data_sharing_agreements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_indicators" ADD CONSTRAINT "dataset_indicators_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "dataset_details"("resource_version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_indicators" ADD CONSTRAINT "dataset_indicators_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
