function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function countRollbackTargets(rollbackPlan) {
  const scope = normalizeObject(rollbackPlan.scope);
  return Object.values(scope).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
}

function resolveRestoreMode(snapshotRecord, rollbackPlan) {
  const canRestoreFull = snapshotRecord.restoreMetadata?.canRestoreFull === true;
  const canRestorePartial = snapshotRecord.restoreMetadata?.canRestorePartial === true;
  const hasExternalEffects = rollbackPlan.summary?.hasExternalEffects === true;

  if (!canRestoreFull && !canRestorePartial) {
    return "blocked";
  }

  if (hasExternalEffects || rollbackPlan.requiresConfirmation === true) {
    return canRestorePartial ? "partial" : "blocked";
  }

  return canRestoreFull ? "full" : "partial";
}

function resolveBlockedReason(snapshotRecord, rollbackPlan, restoreMode) {
  if (restoreMode !== "blocked") {
    return null;
  }

  if (rollbackPlan.summary?.hasExternalEffects === true) {
    return "External side effects require manual confirmation before restore";
  }

  if (snapshotRecord.restoreMetadata?.requiresApproval === true) {
    return "Restore is gated by approval requirements";
  }

  return "Snapshot cannot be restored safely";
}

export function createProjectStateRestoreResolver({
  snapshotRecord = null,
  rollbackPlan = null,
} = {}) {
  const normalizedSnapshotRecord = normalizeObject(snapshotRecord);
  const normalizedRollbackPlan = normalizeObject(rollbackPlan);
  const restoreMode = resolveRestoreMode(normalizedSnapshotRecord, normalizedRollbackPlan);
  const blockedReason = resolveBlockedReason(normalizedSnapshotRecord, normalizedRollbackPlan, restoreMode);
  const totalTargets = countRollbackTargets(normalizedRollbackPlan);

  return {
    restoreDecision: {
      restoreDecisionId: `restore-decision:${normalizeString(normalizedSnapshotRecord.snapshotRecordId, "unknown-snapshot")}`,
      snapshotRecordId: normalizeString(normalizedSnapshotRecord.snapshotRecordId, null),
      rollbackPlanId: normalizeString(normalizedRollbackPlan.rollbackPlanId, null),
      restoreMode,
      canRestore: restoreMode !== "blocked",
      requiresApproval: normalizedSnapshotRecord.restoreMetadata?.requiresApproval === true,
      requiresManualConfirmation:
        normalizedRollbackPlan.requiresConfirmation === true
        || normalizedRollbackPlan.summary?.hasExternalEffects === true,
      blockedReason: normalizeString(blockedReason, blockedReason),
      restoreTargets:
        restoreMode === "full"
          ? normalizedSnapshotRecord.restoreMetadata?.restoreScope ?? []
          : normalizedRollbackPlan.summary?.hasStateRollback === true
            ? ["project-state", "workspace-reference"]
            : [],
      summary: {
        totalRollbackTargets: totalTargets,
        hasExternalEffects: normalizedRollbackPlan.summary?.hasExternalEffects === true,
        restoreMode,
        isSafeToExecute: restoreMode !== "blocked" && normalizedRollbackPlan.requiresConfirmation !== true,
      },
    },
  };
}
