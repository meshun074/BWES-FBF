-- DropIndex
DROP INDEX "audit_events_entity_type_entity_id_occurred_at_idx";

-- AlterTable
ALTER TABLE "audit_events" ADD COLUMN     "actor_type" TEXT,
ADD COLUMN     "after_context" JSONB,
ADD COLUMN     "before_context" JSONB,
ADD COLUMN     "correlation_id" UUID,
ADD COLUMN     "event_type" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "resource_id" UUID,
ADD COLUMN     "resource_version_id" UUID,
ADD COLUMN     "target_id" TEXT,
ADD COLUMN     "target_type" TEXT,
ALTER COLUMN "id" SET DEFAULT uuidv7(),
ALTER COLUMN "action" DROP NOT NULL;

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "event_type" TEXT NOT NULL,
    "aggregate_type" TEXT,
    "aggregate_id" TEXT,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "deduplication_key" TEXT,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_deduplication_key_key" ON "outbox_events"("deduplication_key");

-- CreateIndex
CREATE INDEX "outbox_events_processed_at_available_at_idx" ON "outbox_events"("processed_at", "available_at");

-- CreateIndex
CREATE INDEX "outbox_events_event_type_created_at_idx" ON "outbox_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "audit_events_event_type_occurred_at_idx" ON "audit_events"("event_type", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_resource_id_occurred_at_idx" ON "audit_events"("resource_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_resource_version_id_occurred_at_idx" ON "audit_events"("resource_version_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_target_type_target_id_occurred_at_idx" ON "audit_events"("target_type", "target_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_correlation_id_idx" ON "audit_events"("correlation_id");

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_resource_id_resource_version_id_fkey" FOREIGN KEY ("resource_id", "resource_version_id") REFERENCES "resource_versions"("resource_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
