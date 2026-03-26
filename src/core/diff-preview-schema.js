function normalizeExecutionPlan(executionPlan) {
  return executionPlan && typeof executionPlan === "object" ? executionPlan : {};
}

function normalizeChangeSet(changeSet) {
  if (Array.isArray(changeSet)) {
    return changeSet;
  }

  return changeSet && typeof changeSet === "object" ? [changeSet] : [];
}

function inferChangeType(changeSet) {
  if (changeSet.some((change) => change?.kind === "migration")) {
    return "migration";
  }

  if (changeSet.some((change) => change?.kind === "config" || change?.kind === "infra")) {
    return "infra";
  }

  if (changeSet.some((change) => change?.kind === "code")) {
    return "code";
  }

  return "unknown";
}

export function defineDiffPreviewSchema({
  executionPlan,
  changeSet,
} = {}) {
  const normalizedExecutionPlan = normalizeExecutionPlan(executionPlan);
  const normalizedChangeSet = normalizeChangeSet(changeSet);

  return {
    diffPreviewSchema: {
      previewId: normalizedExecutionPlan.executionRequestId ?? "diff-preview:pending",
      executionPlan: {
        executionRequestId: normalizedExecutionPlan.executionRequestId ?? null,
        taskId: normalizedExecutionPlan.taskId ?? null,
        actionType: normalizedExecutionPlan.actionType ?? "unspecified-action",
        target: normalizedExecutionPlan.target ?? null,
      },
      changeSet: normalizedChangeSet,
      changeSummary: {
        totalChanges: normalizedChangeSet.length,
        changeType: inferChangeType(normalizedChangeSet),
        includesCodeChanges: normalizedChangeSet.some((change) => change?.kind === "code"),
        includesMigrationChanges: normalizedChangeSet.some((change) => change?.kind === "migration"),
        includesInfraChanges: normalizedChangeSet.some((change) => change?.kind === "config" || change?.kind === "infra"),
      },
      sections: {
        code: [],
        migrations: [],
        infra: [],
      },
      riskFlags: [],
    },
  };
}
