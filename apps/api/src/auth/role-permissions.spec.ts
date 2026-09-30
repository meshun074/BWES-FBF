import {
  BwesPermission,
  BwesRole,
  resolvePermissionsForRoles,
} from '@bwes/contracts';

describe('BWES role permissions', () => {
  it('combines permissions when a staff member holds multiple roles', () => {
    const permissions = resolvePermissionsForRoles([
      BwesRole.CONTRIBUTOR,
      BwesRole.REVIEWER,
      BwesRole.PUBLISHER,
    ]);

    expect(permissions).toEqual(
      expect.arrayContaining([
        BwesPermission.RESOURCE_CREATE,
        BwesPermission.RESOURCE_EDIT,
        BwesPermission.RESOURCE_SUBMIT_REVIEW,
        BwesPermission.REVIEW_PERFORM,
        BwesPermission.PUBLICATION_PUBLISH,
        BwesPermission.PUBLICATION_UNPUBLISH,
        BwesPermission.RESOURCE_ARCHIVE,
      ]),
    );
  });

  it('grants the Research/Evidence Lead specialist permissions', () => {
    const permissions = resolvePermissionsForRoles([
      BwesRole.RESEARCH_EVIDENCE_LEAD,
    ]);

    expect(permissions).toEqual(
      expect.arrayContaining([
        BwesPermission.REVIEW_PERFORM,
        BwesPermission.RESEARCH_EVIDENCE_REVIEW,
      ]),
    );
  });

  it('grants the Privacy & Consent Officer specialist permissions', () => {
    const permissions = resolvePermissionsForRoles([
      BwesRole.PRIVACY_CONSENT_OFFICER,
    ]);

    expect(permissions).toEqual(
      expect.arrayContaining([
        BwesPermission.REVIEW_PERFORM,
        BwesPermission.LIVED_EXPERIENCE_REVIEW,
        BwesPermission.CONSENT_RECORD_ACCESS,
      ]),
    );
  });

  it('gives the Publisher publish, unpublish, and archive permissions', () => {
    const permissions = resolvePermissionsForRoles([BwesRole.PUBLISHER]);

    expect(permissions).toEqual(
      expect.arrayContaining([
        BwesPermission.PUBLICATION_PUBLISH,
        BwesPermission.PUBLICATION_UNPUBLISH,
        BwesPermission.RESOURCE_ARCHIVE,
      ]),
    );
  });

  it('gives the Administrator the newly approved administrative permissions', () => {
    const permissions = resolvePermissionsForRoles([BwesRole.ADMINISTRATOR]);

    expect(permissions).toEqual(
      expect.arrayContaining([
        BwesPermission.USER_MANAGE,
        BwesPermission.ROLE_MANAGE,
        BwesPermission.PERMISSION_MANAGE,
        BwesPermission.AI_KNOWLEDGE_SOURCE_MANAGE,
        BwesPermission.RESOURCE_PERMANENT_DELETE,
      ]),
    );
  });

  it('does not implicitly give the Administrator publisher permissions', () => {
    const permissions = resolvePermissionsForRoles([BwesRole.ADMINISTRATOR]);

    expect(permissions).not.toContain(BwesPermission.PUBLICATION_PUBLISH);
    expect(permissions).not.toContain(BwesPermission.PUBLICATION_UNPUBLISH);
    expect(permissions).not.toContain(BwesPermission.RESOURCE_ARCHIVE);
  });

  it('deduplicates permissions shared by multiple roles', () => {
    const permissions = resolvePermissionsForRoles([
      BwesRole.REVIEWER,
      BwesRole.RESEARCH_EVIDENCE_LEAD,
      BwesRole.PRIVACY_CONSENT_OFFICER,
    ]);

    expect(
      permissions.filter(
        (permission) => permission === BwesPermission.REVIEW_PERFORM,
      ),
    ).toHaveLength(1);
  });
});
