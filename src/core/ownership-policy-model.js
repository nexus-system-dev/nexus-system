function normalizeOwnerUserId(userId, projectId) {
  if (typeof userId === "string" && userId.trim()) {
    return userId.trim();
  }

  return `project-owner:${projectId ?? "unknown-project"}`;
}

export function createOwnershipPolicyModel({
  userId,
  projectId,
  linkedAccounts = [],
  releasePlan = null,
  artifactRecord = null,
} = {}) {
  const ownerUserId = normalizeOwnerUserId(userId, projectId);
  const distributionTargets = [
    releasePlan?.releaseTarget,
    ...(Array.isArray(linkedAccounts)
      ? linkedAccounts
          .map((account) => account?.accountRecord?.accountType ?? account?.accountRecord?.provider ?? null)
      : []),
  ].filter(Boolean);
  const assetIds = [
    artifactRecord?.artifactId ?? null,
    ...(Array.isArray(artifactRecord?.artifacts) ? artifactRecord.artifacts : []),
  ].filter(Boolean);
  const accountIds = (Array.isArray(linkedAccounts) ? linkedAccounts : [])
    .map((account) => account?.accountRecord?.accountId ?? null)
    .filter(Boolean);

  return {
    ownershipPolicy: {
      ownerUserId,
      projectId: projectId ?? null,
      assets: {
        ownerUserId,
        assetIds,
      },
      accounts: {
        ownerUserId,
        accountIds,
      },
      distributionTargets: {
        ownerUserId,
        targets: [...new Set(distributionTargets)],
      },
      policyStatus: "owner-controlled",
    },
  };
}
