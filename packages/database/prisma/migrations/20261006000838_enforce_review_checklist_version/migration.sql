/*
  Warnings:

  - A unique constraint covering the columns `[id,checklist_version_id]` on the table `review_checklist_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,checklist_version_id]` on the table `review_rounds` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checklist_version_id` to the `review_checklist_responses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "review_checklist_responses" DROP CONSTRAINT "review_checklist_responses_checklist_item_id_fkey";

-- DropForeignKey
ALTER TABLE "review_checklist_responses" DROP CONSTRAINT "review_checklist_responses_review_round_id_fkey";

-- AlterTable
ALTER TABLE "review_checklist_responses" ADD COLUMN     "checklist_version_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "review_checklist_items_id_checklist_version_id_key" ON "review_checklist_items"("id", "checklist_version_id");

-- CreateIndex
CREATE INDEX "review_checklist_responses_checklist_version_id_idx" ON "review_checklist_responses"("checklist_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_rounds_id_checklist_version_id_key" ON "review_rounds"("id", "checklist_version_id");

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_review_round_id_checklist_versi_fkey" FOREIGN KEY ("review_round_id", "checklist_version_id") REFERENCES "review_rounds"("id", "checklist_version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_checklist_version_id_fkey" FOREIGN KEY ("checklist_version_id") REFERENCES "review_checklist_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_checklist_responses" ADD CONSTRAINT "review_checklist_responses_checklist_item_id_checklist_ver_fkey" FOREIGN KEY ("checklist_item_id", "checklist_version_id") REFERENCES "review_checklist_items"("id", "checklist_version_id") ON DELETE RESTRICT ON UPDATE CASCADE;
