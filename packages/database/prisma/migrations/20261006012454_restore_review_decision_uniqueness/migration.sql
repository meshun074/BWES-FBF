/*
  Warnings:

  - A unique constraint covering the columns `[review_round_id]` on the table `review_decisions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[review_round_id]` on the table `review_round_actions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[review_round_id]` on the table `specialist_review_requirements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "review_decisions_review_round_id_key" ON "review_decisions"("review_round_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_round_actions_review_round_id_key" ON "review_round_actions"("review_round_id");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_review_requirements_review_round_id_key" ON "specialist_review_requirements"("review_round_id");

-- RenameIndex
ALTER INDEX "reviewer_assignments_one_active_per_round_uidx" RENAME TO "reviewer_assignments_review_round_id_key";
