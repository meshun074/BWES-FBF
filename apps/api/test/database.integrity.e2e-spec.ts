import { getTestDatabase, disconnectTestDatabase } from './test-database';
import { createResourceVersionFixture } from './database-fixtures';

describe('Database integrity constraints', () => {
  const database = getTestDatabase();

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  async function expectConstraintViolation(
    operation: () => Promise<unknown>,
  ): Promise<void> {
    await expect(operation()).rejects.toThrow();
  }

  it('rejects a negative outbox attempt count', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        await tx.$executeRaw`
          INSERT INTO "outbox_events" (
            "event_type",
            "payload",
            "attempt_count"
          )
          VALUES (
            'INTEGRITY_TEST',
            '{}'::jsonb,
            -1
          )
        `;
      }),
    );
  });

  it('rejects a non-positive review checklist version number', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        await tx.$executeRaw`
          INSERT INTO "review_checklist_versions" (
            "version_number",
            "name",
            "effective_at"
          )
          VALUES (
            0,
            'Integrity Test Checklist',
            NOW()
          )
        `;
      }),
    );
  });

  it('rejects a ResourceType that is its own parent', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO "resource_types" (
            "canonical_key",
            "name",
            "is_active",
            "created_at",
            "updated_at"
          )
          VALUES (
            'integrity_self_parent_resource_type',
            'Integrity Self Parent',
            true,
            NOW(),
            NOW()
          )
          RETURNING "id"
        `;

        const id = rows[0]?.id;

        if (!id) {
          throw new Error('Failed to create ResourceType test fixture.');
        }

        await tx.$executeRaw`
          UPDATE "resource_types"
          SET "parent_id" = ${id}::uuid
          WHERE "id" = ${id}::uuid
        `;
      }),
    );
  });

  it('rejects a Topic that is its own parent', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO "topics" (
            "canonical_key",
            "name",
            "is_active",
            "created_at",
            "updated_at"
          )
          VALUES (
            'integrity_self_parent_topic',
            'Integrity Self Parent Topic',
            true,
            NOW(),
            NOW()
          )
          RETURNING "id"
        `;

        const id = rows[0]?.id;

        if (!id) {
          throw new Error('Failed to create Topic test fixture.');
        }

        await tx.$executeRaw`
          UPDATE "topics"
          SET "parent_id" = ${id}::uuid
          WHERE "id" = ${id}::uuid
        `;
      }),
    );
  });

  it('rejects a Geography that is its own parent', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO "geographies" (
            "canonical_key",
            "name",
            "is_active",
            "created_at",
            "updated_at"
          )
          VALUES (
            'integrity_self_parent_geography',
            'Integrity Self Parent Geography',
            true,
            NOW(),
            NOW()
          )
          RETURNING "id"
        `;

        const id = rows[0]?.id;

        if (!id) {
          throw new Error('Failed to create Geography test fixture.');
        }

        await tx.$executeRaw`
          UPDATE "geographies"
          SET "parent_id" = ${id}::uuid
          WHERE "id" = ${id}::uuid
        `;
      }),
    );
  });

  it('rejects an invalid dataset reference period', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
            INSERT INTO "dataset_details" (
            "resource_version_id",
            "reference_period_start",
            "reference_period_end",
            "download_allowed"
            )
            VALUES (
            ${fixture.resourceVersionId}::uuid,
            DATE '2026-12-31',
            DATE '2026-01-01',
            false
            )
        `;
      }),
    );
  });

  it('rejects a non-positive ResourceVersion version number', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        UPDATE "resource_versions"
        SET "version_number" = 0
        WHERE "id" = ${fixture.resourceVersionId}::uuid
      `;
      }),
    );
  });

  it('rejects a negative ResourceVersion lock version', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        UPDATE "resource_versions"
        SET "lock_version" = -1
        WHERE "id" = ${fixture.resourceVersionId}::uuid
      `;
      }),
    );
  });

  it('rejects more than one Draft ResourceVersion per Resource', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
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
          ${fixture.resourceId}::uuid,
          2,
          'DRAFT',
          'Second Draft',
          'Should be rejected by the partial unique index.',
          ${fixture.resourceTypeId}::uuid,
          ${fixture.contentFormatId}::uuid,
          ${fixture.userId}::uuid,
          0,
          NOW(),
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects more than one active SourceApproval per OriginalSource', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const sources = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "original_sources" (
          "title",
          "created_at",
          "updated_at"
        )
        VALUES (
          'Integrity Test Source',
          NOW(),
          NOW()
        )
        RETURNING "id"
      `;

        const sourceId = sources[0]?.id;

        if (!sourceId) {
          throw new Error('Failed to create OriginalSource fixture.');
        }

        await tx.$executeRaw`
        INSERT INTO "source_approvals" (
          "original_source_id",
          "approved_by_user_id",
          "approved_at"
        )
        VALUES
          (${sourceId}::uuid, ${fixture.userId}::uuid, NOW()),
          (${sourceId}::uuid, ${fixture.userId}::uuid, NOW())
      `;
      }),
    );
  });

  it('rejects more than one primary source per ResourceVersion', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const sources = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "original_sources" (
          "title",
          "created_at",
          "updated_at"
        )
        VALUES
          ('Integrity Primary Source One', NOW(), NOW()),
          ('Integrity Primary Source Two', NOW(), NOW())
        RETURNING "id"
      `;

        if (sources.length !== 2) {
          throw new Error('Failed to create source fixtures.');
        }

        await tx.$executeRaw`
        INSERT INTO "resource_version_sources" (
          "resource_version_id",
          "original_source_id",
          "is_primary"
        )
        VALUES
          (
            ${fixture.resourceVersionId}::uuid,
            ${sources[0].id}::uuid,
            true
          ),
          (
            ${fixture.resourceVersionId}::uuid,
            ${sources[1].id}::uuid,
            true
          )
      `;
      }),
    );
  });

  it('rejects an AuditEvent version reference without its Resource', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "audit_events" (
          "event_type",
          "resource_version_id",
          "occurred_at"
        )
        VALUES (
          'INTEGRITY_TEST',
          ${fixture.resourceVersionId}::uuid,
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects a processed consent withdrawal without processing metadata', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const consents = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "consent_records" (
          "recorded_at",
          "created_by_user_id",
          "created_at"
        )
        VALUES (
          NOW(),
          ${fixture.userId}::uuid,
          NOW()
        )
        RETURNING "id"
      `;

        const consentId = consents[0]?.id;

        if (!consentId) {
          throw new Error('Failed to create ConsentRecord fixture.');
        }

        await tx.$executeRaw`
        INSERT INTO "consent_withdrawals" (
          "consent_record_id",
          "status",
          "requested_at"
        )
        VALUES (
          ${consentId}::uuid,
          'PROCESSED',
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects a non-positive AssetVersion version number', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const assets = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "assets" (
          "created_by_user_id",
          "created_at"
        )
        VALUES (
          ${fixture.userId}::uuid,
          NOW()
        )
        RETURNING "id"
      `;

        const assetId = assets[0]?.id;

        if (!assetId) {
          throw new Error('Failed to create Asset fixture.');
        }

        await tx.$executeRaw`
        INSERT INTO "asset_versions" (
          "asset_id",
          "version_number",
          "storage_key",
          "mime_type",
          "size_bytes",
          "checksum_sha256",
          "original_filename",
          "scan_status",
          "created_at"
        )
        VALUES (
          ${assetId}::uuid,
          0,
          'integrity-test/' || uuidv7()::text,
          'application/pdf',
          100,
          'integrity-test-checksum',
          'integrity-test.pdf',
          'PENDING',
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects a negative AssetVersion size', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const assets = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "assets" (
          "created_by_user_id",
          "created_at"
        )
        VALUES (
          ${fixture.userId}::uuid,
          NOW()
        )
        RETURNING "id"
      `;

        const assetId = assets[0]?.id;

        if (!assetId) {
          throw new Error('Failed to create Asset fixture.');
        }

        await tx.$executeRaw`
        INSERT INTO "asset_versions" (
          "asset_id",
          "version_number",
          "storage_key",
          "mime_type",
          "size_bytes",
          "checksum_sha256",
          "original_filename",
          "scan_status",
          "created_at"
        )
        VALUES (
          ${assetId}::uuid,
          1,
          'integrity-test/' || uuidv7()::text,
          'application/pdf',
          -1,
          'integrity-test-checksum',
          'integrity-test.pdf',
          'PENDING',
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects more than one primary document per ResourceVersion', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        const assets = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "assets" (
          "created_by_user_id",
          "created_at"
        )
        VALUES
          (${fixture.userId}::uuid, NOW()),
          (${fixture.userId}::uuid, NOW())
        RETURNING "id"
      `;

        if (assets.length !== 2) {
          throw new Error('Failed to create Asset fixtures.');
        }

        const assetVersions = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO "asset_versions" (
            "asset_id",
            "version_number",
            "storage_key",
            "mime_type",
            "size_bytes",
            "checksum_sha256",
            "original_filename",
            "scan_status",
            "created_at"
          )
          VALUES
            (
              ${assets[0].id}::uuid,
              1,
              'integrity-test/' || uuidv7()::text,
              'application/pdf',
              100,
              'integrity-test-checksum-1',
              'one.pdf',
              'PENDING',
              NOW()
            ),
            (
              ${assets[1].id}::uuid,
              1,
              'integrity-test/' || uuidv7()::text,
              'application/pdf',
              100,
              'integrity-test-checksum-2',
              'two.pdf',
              'PENDING',
              NOW()
            )
          RETURNING "id"
        `;

        if (assetVersions.length !== 2) {
          throw new Error('Failed to create AssetVersion fixtures.');
        }

        await tx.$executeRaw`
        INSERT INTO "resource_version_assets" (
          "resource_version_id",
          "asset_version_id",
          "purpose",
          "sort_order"
        )
        VALUES
          (
            ${fixture.resourceVersionId}::uuid,
            ${assetVersions[0].id}::uuid,
            'PRIMARY_DOCUMENT',
            0
          ),
          (
            ${fixture.resourceVersionId}::uuid,
            ${assetVersions[1].id}::uuid,
            'PRIMARY_DOCUMENT',
            1
          )
      `;
      }),
    );
  });

  async function createReviewRoundFixture(
    tx: Parameters<Parameters<typeof database.$transaction>[0]>[0],
  ) {
    const fixture = await createResourceVersionFixture(tx);

    const checklistVersions = await tx.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "review_checklist_versions" (
        "version_number",
        "name",
        "effective_at",
        "created_at"
      )
      VALUES (
        999999,
        'Integrity Test Checklist',
        NOW(),
        NOW()
      )
      RETURNING "id"
    `;

    const checklistVersionId = checklistVersions[0]?.id;

    if (!checklistVersionId) {
      throw new Error('Failed to create ReviewChecklistVersion fixture.');
    }

    const rounds = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "review_rounds" (
      "resource_version_id",
      "round_number",
      "state",
      "checklist_version_id",
      "started_at"
    )
    VALUES (
      ${fixture.resourceVersionId}::uuid,
      1,
      'PENDING_ASSIGNMENT',
      ${checklistVersionId}::uuid,
      NOW()
    )
    RETURNING "id"
  `;

    const reviewRoundId = rounds[0]?.id;

    if (!reviewRoundId) {
      throw new Error('Failed to create ReviewRound fixture.');
    }

    return {
      ...fixture,
      checklistVersionId,
      reviewRoundId,
    };
  }

  it('rejects more than one active ReviewerAssignment per ReviewRound', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createReviewRoundFixture(tx);

        const reviewers = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "user_accounts" (
          "display_name",
          "is_active",
          "created_at"
        )
        VALUES
          ('Integrity Reviewer One', true, NOW()),
          ('Integrity Reviewer Two', true, NOW())
        RETURNING "id"
      `;

        if (reviewers.length !== 2) {
          throw new Error('Failed to create reviewer fixtures.');
        }

        await tx.$executeRaw`
        INSERT INTO "reviewer_assignments" (
          "review_round_id",
          "reviewer_user_id",
          "assigned_by_user_id",
          "assigned_at"
        )
        VALUES
          (
            ${fixture.reviewRoundId}::uuid,
            ${reviewers[0].id}::uuid,
            ${fixture.userId}::uuid,
            NOW()
          ),
          (
            ${fixture.reviewRoundId}::uuid,
            ${reviewers[1].id}::uuid,
            ${fixture.userId}::uuid,
            NOW()
          )
      `;
      }),
    );
  });

  it('rejects more than one final ReviewDecision per ReviewRound', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createReviewRoundFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "review_decisions" (
          "review_round_id",
          "reviewer_user_id",
          "decision",
          "decided_at"
        )
        VALUES
          (
            ${fixture.reviewRoundId}::uuid,
            ${fixture.userId}::uuid,
            'APPROVE',
            NOW()
          ),
          (
            ${fixture.reviewRoundId}::uuid,
            ${fixture.userId}::uuid,
            'DECLINE',
            NOW()
          )
      `;
      }),
    );
  });

  it('rejects a non-positive ReviewRound round number', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createReviewRoundFixture(tx);

        await tx.$executeRaw`
        UPDATE "review_rounds"
        SET "round_number" = 0
        WHERE "id" = ${fixture.reviewRoundId}::uuid
      `;
      }),
    );
  });

  it('rejects a completed RestorationCase without completed_at', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "restoration_cases" (
          "resource_id",
          "requested_by_user_id",
          "state",
          "requested_at"
        )
        VALUES (
          ${fixture.resourceId}::uuid,
          ${fixture.userId}::uuid,
          'COMPLETED',
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects a pending RestorationCase with completed_at', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "restoration_cases" (
          "resource_id",
          "requested_by_user_id",
          "state",
          "requested_at",
          "completed_at"
        )
        VALUES (
          ${fixture.resourceId}::uuid,
          ${fixture.userId}::uuid,
          'REQUESTED',
          NOW(),
          NOW()
        )
      `;
      }),
    );
  });

  it('rejects an executed DeletionCase without approval metadata', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "deletion_cases" (
          "resource_id",
          "reason",
          "requested_by_user_id",
          "requested_at",
          "executed_by_user_id",
          "executed_at",
          "outcome"
        )
        VALUES (
          ${fixture.resourceId}::uuid,
          'Integrity test deletion',
          ${fixture.userId}::uuid,
          NOW(),
          ${fixture.userId}::uuid,
          NOW(),
          'EXECUTED'
        )
      `;
      }),
    );
  });

  it('rejects DeletionCase execution before approval', async () => {
    await expectConstraintViolation(() =>
      database.$transaction(async (tx) => {
        const fixture = await createResourceVersionFixture(tx);

        await tx.$executeRaw`
        INSERT INTO "deletion_cases" (
          "resource_id",
          "reason",
          "requested_by_user_id",
          "requested_at",
          "approval_reference",
          "approved_by_user_id",
          "approved_at",
          "executed_by_user_id",
          "executed_at",
          "outcome"
        )
        VALUES (
          ${fixture.resourceId}::uuid,
          'Integrity test deletion chronology',
          ${fixture.userId}::uuid,
          NOW() - INTERVAL '3 hours',
          'INTEGRITY-APPROVAL',
          ${fixture.userId}::uuid,
          NOW(),
          ${fixture.userId}::uuid,
          NOW() - INTERVAL '1 hour',
          'EXECUTED'
        )
      `;
      }),
    );
  });
});
