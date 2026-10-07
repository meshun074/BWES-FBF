import type { DatabaseClient } from '@bwes/database';

type TransactionClient = Parameters<
  Parameters<DatabaseClient['$transaction']>[0]
>[0];

export interface ResourceVersionFixture {
  userId: string;
  resourceId: string;
  resourceVersionId: string;
  resourceTypeId: string;
  contentFormatId: string;
}

export async function createResourceVersionFixture(
  tx: TransactionClient,
): Promise<ResourceVersionFixture> {
  const users = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "user_accounts" (
      "display_name",
      "is_active",
      "created_at"
    )
    VALUES (
      'Database Integrity Test User',
      true,
      NOW()
    )
    RETURNING "id"
  `;

  const userId = users[0]?.id;

  if (!userId) {
    throw new Error('Failed to create integrity-test UserAccount.');
  }

  const resourceTypes = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "resource_types"
    WHERE "canonical_key" = 'research_publication'
    LIMIT 1
  `;

  const resourceTypeId = resourceTypes[0]?.id;

  if (!resourceTypeId) {
    throw new Error(
      'Seeded ResourceType "research_publication" was not found.',
    );
  }

  const contentFormats = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "content_formats"
    WHERE "canonical_key" = 'research_report'
    LIMIT 1
  `;

  const contentFormatId = contentFormats[0]?.id;

  if (!contentFormatId) {
    throw new Error('Seeded ContentFormat "research_report" was not found.');
  }

  const resources = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "resources" (
      "canonical_slug",
      "created_by_user_id",
      "created_at",
      "updated_at"
    )
    VALUES (
      'integrity-test-' || uuidv7()::text,
      ${userId}::uuid,
      NOW(),
      NOW()
    )
    RETURNING "id"
  `;

  const resourceId = resources[0]?.id;

  if (!resourceId) {
    throw new Error('Failed to create integrity-test Resource.');
  }

  const versions = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "resource_versions" (
      "resource_id",
      "version_number",
      "state",
      "title",
      "plain_language_summary",
      "resource_type_id",
      "content_format_id",
      "created_by_user_id",
      "lock_version",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${resourceId}::uuid,
      1,
      'DRAFT',
      'Database Integrity Test Resource',
      'Fixture used only for database integrity tests.',
      ${resourceTypeId}::uuid,
      ${contentFormatId}::uuid,
      ${userId}::uuid,
      0,
      NOW(),
      NOW()
    )
    RETURNING "id"
  `;

  const resourceVersionId = versions[0]?.id;

  if (!resourceVersionId) {
    throw new Error('Failed to create integrity-test ResourceVersion.');
  }

  return {
    userId,
    resourceId,
    resourceVersionId,
    resourceTypeId,
    contentFormatId,
  };
}
