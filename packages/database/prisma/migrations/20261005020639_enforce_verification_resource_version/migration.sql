-- DropForeignKey
ALTER TABLE "verification_events" DROP CONSTRAINT "verification_events_resource_version_id_fkey";

-- AddForeignKey
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_resource_id_resource_version_id_fkey" FOREIGN KEY ("resource_id", "resource_version_id") REFERENCES "resource_versions"("resource_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
