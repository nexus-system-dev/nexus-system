function normalizeTargets(releasePlan, ownershipPolicy) {
  return {
    releaseTarget: releasePlan?.releaseTarget ?? null,
    ownedTargets: ownershipPolicy?.distributionTargets?.targets ?? [],
    ownedAccountIds: ownershipPolicy?.accounts?.accountIds ?? [],
    ownedAssetIds: ownershipPolicy?.assets?.assetIds ?? [],
  };
}

export function createOwnershipAwareReleaseGuard({
  releasePlan = null,
  linkedAccounts = [],
  ownershipPolicy = null,
} = {}) {
  const { releaseTarget, ownedTargets, ownedAccountIds, ownedAssetIds } = normalizeTargets(
    releasePlan,
    ownershipPolicy,
  );
  const accounts = Array.isArray(linkedAccounts) ? linkedAccounts : [];
  const linkedAccountIds = accounts
    .map((account) => account?.accountRecord?.accountId ?? null)
    .filter(Boolean);
  const linkedAccountTypes = accounts
    .map((account) => account?.accountRecord?.accountType ?? account?.accountRecord?.provider ?? null)
    .filter(Boolean);
  const hasOwnedTarget = releaseTarget ? ownedTargets.includes(releaseTarget) : false;
  const usesOwnedAccount = linkedAccountIds.some((accountId) => ownedAccountIds.includes(accountId));
  const hasGuardCoverage =
    hasOwnedTarget
    || linkedAccountTypes.includes(releaseTarget)
    || usesOwnedAccount
    || ownedAssetIds.length > 0;

  return {
    guardResult: {
      status: hasGuardCoverage ? "allowed" : "blocked",
      isAllowed: hasGuardCoverage,
      releaseTarget,
      ownedTargets,
      linkedAccountIds,
      usesOwnedAccount,
      reason: hasGuardCoverage
        ? "release flow is aligned with owned accounts or owned distribution targets"
        : "release flow is not yet mapped to owned accounts or owned distribution targets",
    },
  };
}
