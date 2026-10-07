-- CreateEnum
CREATE TYPE "ResourceLifecycleState" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResourceVersionState" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'DECLINED', 'APPROVED');

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "external_subject" TEXT,
    "display_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivated_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_slug" TEXT NOT NULL,
    "lifecycle_state" "ResourceLifecycleState" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" UUID NOT NULL,
    "current_published_version_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_versions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "resource_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "state" "ResourceVersionState" NOT NULL DEFAULT 'DRAFT',
    "predecessor_version_id" UUID,
    "title" TEXT NOT NULL,
    "plain_language_summary" TEXT NOT NULL,
    "publication_date" DATE,
    "expiration_at" TIMESTAMPTZ(6),
    "resource_type_id" UUID NOT NULL,
    "content_format_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "submitted_at" TIMESTAMPTZ(6),
    "lock_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "resource_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_topics" (
    "resource_version_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,

    CONSTRAINT "resource_version_topics_pkey" PRIMARY KEY ("resource_version_id","topic_id")
);

-- CreateTable
CREATE TABLE "resource_version_geographies" (
    "resource_version_id" UUID NOT NULL,
    "geography_id" UUID NOT NULL,

    CONSTRAINT "resource_version_geographies_pkey" PRIMARY KEY ("resource_version_id","geography_id")
);

-- CreateTable
CREATE TABLE "resource_version_populations" (
    "resource_version_id" UUID NOT NULL,
    "population_id" UUID NOT NULL,

    CONSTRAINT "resource_version_populations_pkey" PRIMARY KEY ("resource_version_id","population_id")
);

-- CreateTable
CREATE TABLE "resource_version_audiences" (
    "resource_version_id" UUID NOT NULL,
    "audience_id" UUID NOT NULL,

    CONSTRAINT "resource_version_audiences_pkey" PRIMARY KEY ("resource_version_id","audience_id")
);

-- CreateTable
CREATE TABLE "resource_version_sectors" (
    "resource_version_id" UUID NOT NULL,
    "sector_id" UUID NOT NULL,

    CONSTRAINT "resource_version_sectors_pkey" PRIMARY KEY ("resource_version_id","sector_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_external_subject_key" ON "user_accounts"("external_subject");

-- CreateIndex
CREATE INDEX "user_accounts_is_active_idx" ON "user_accounts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "resources_canonical_slug_key" ON "resources"("canonical_slug");

-- CreateIndex
CREATE UNIQUE INDEX "resources_current_published_version_id_key" ON "resources"("current_published_version_id");

-- CreateIndex
CREATE INDEX "resources_lifecycle_state_idx" ON "resources"("lifecycle_state");

-- CreateIndex
CREATE INDEX "resources_created_by_user_id_idx" ON "resources"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_id_current_published_version_id_key" ON "resources"("id", "current_published_version_id");

-- CreateIndex
CREATE INDEX "resource_versions_resource_id_state_idx" ON "resource_versions"("resource_id", "state");

-- CreateIndex
CREATE INDEX "resource_versions_resource_type_id_idx" ON "resource_versions"("resource_type_id");

-- CreateIndex
CREATE INDEX "resource_versions_content_format_id_idx" ON "resource_versions"("content_format_id");

-- CreateIndex
CREATE INDEX "resource_versions_predecessor_version_id_idx" ON "resource_versions"("predecessor_version_id");

-- CreateIndex
CREATE INDEX "resource_versions_created_by_user_id_idx" ON "resource_versions"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_versions_resource_id_version_number_key" ON "resource_versions"("resource_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "resource_versions_resource_id_id_key" ON "resource_versions"("resource_id", "id");

-- CreateIndex
CREATE INDEX "resource_version_topics_topic_id_idx" ON "resource_version_topics"("topic_id");

-- CreateIndex
CREATE INDEX "resource_version_geographies_geography_id_idx" ON "resource_version_geographies"("geography_id");

-- CreateIndex
CREATE INDEX "resource_version_populations_population_id_idx" ON "resource_version_populations"("population_id");

-- CreateIndex
CREATE INDEX "resource_version_audiences_audience_id_idx" ON "resource_version_audiences"("audience_id");

-- CreateIndex
CREATE INDEX "resource_version_sectors_sector_id_idx" ON "resource_version_sectors"("sector_id");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_id_current_published_version_id_fkey" FOREIGN KEY ("id", "current_published_version_id") REFERENCES "resource_versions"("resource_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_predecessor_version_id_fkey" FOREIGN KEY ("predecessor_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "resource_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_content_format_id_fkey" FOREIGN KEY ("content_format_id") REFERENCES "content_formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_topics" ADD CONSTRAINT "resource_version_topics_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_topics" ADD CONSTRAINT "resource_version_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_geographies" ADD CONSTRAINT "resource_version_geographies_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_geographies" ADD CONSTRAINT "resource_version_geographies_geography_id_fkey" FOREIGN KEY ("geography_id") REFERENCES "geographies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_populations" ADD CONSTRAINT "resource_version_populations_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_populations" ADD CONSTRAINT "resource_version_populations_population_id_fkey" FOREIGN KEY ("population_id") REFERENCES "populations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_audiences" ADD CONSTRAINT "resource_version_audiences_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_audiences" ADD CONSTRAINT "resource_version_audiences_audience_id_fkey" FOREIGN KEY ("audience_id") REFERENCES "audiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_sectors" ADD CONSTRAINT "resource_version_sectors_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_sectors" ADD CONSTRAINT "resource_version_sectors_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
