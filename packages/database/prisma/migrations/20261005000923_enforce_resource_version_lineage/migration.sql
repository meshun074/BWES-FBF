-- DropForeignKey
ALTER TABLE "resource_versions" DROP CONSTRAINT "resource_versions_predecessor_version_id_fkey";

-- AddForeignKey
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resource_id_predecessor_version_id_fkey" FOREIGN KEY ("resource_id", "predecessor_version_id") REFERENCES "resource_versions"("resource_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
