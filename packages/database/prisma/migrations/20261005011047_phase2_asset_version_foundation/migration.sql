-- CreateEnum
CREATE TYPE "AssetScanStatus" AS ENUM ('PENDING', 'CLEAN', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResourceAssetPurpose" AS ENUM ('PRIMARY_DOCUMENT', 'DOWNLOAD', 'IMAGE', 'CAPTION', 'TRANSCRIPT', 'SUPPORTING_DOCUMENT');

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_versions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "asset_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "checksum_sha256" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "scan_status" "AssetScanStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_version_assets" (
    "resource_version_id" UUID NOT NULL,
    "asset_version_id" UUID NOT NULL,
    "purpose" "ResourceAssetPurpose" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,

    CONSTRAINT "resource_version_assets_pkey" PRIMARY KEY ("resource_version_id","asset_version_id","purpose")
);

-- CreateIndex
CREATE INDEX "assets_created_by_user_id_idx" ON "assets"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_versions_storage_key_key" ON "asset_versions"("storage_key");

-- CreateIndex
CREATE INDEX "asset_versions_asset_id_idx" ON "asset_versions"("asset_id");

-- CreateIndex
CREATE INDEX "asset_versions_checksum_sha256_idx" ON "asset_versions"("checksum_sha256");

-- CreateIndex
CREATE INDEX "asset_versions_scan_status_idx" ON "asset_versions"("scan_status");

-- CreateIndex
CREATE UNIQUE INDEX "asset_versions_asset_id_version_number_key" ON "asset_versions"("asset_id", "version_number");

-- CreateIndex
CREATE INDEX "resource_version_assets_asset_version_id_idx" ON "resource_version_assets"("asset_version_id");

-- CreateIndex
CREATE INDEX "resource_version_assets_resource_version_id_purpose_sort_or_idx" ON "resource_version_assets"("resource_version_id", "purpose", "sort_order");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_assets" ADD CONSTRAINT "resource_version_assets_resource_version_id_fkey" FOREIGN KEY ("resource_version_id") REFERENCES "resource_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_version_assets" ADD CONSTRAINT "resource_version_assets_asset_version_id_fkey" FOREIGN KEY ("asset_version_id") REFERENCES "asset_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
