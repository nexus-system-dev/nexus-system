function normalizeChangeSet(changeSet) {
  if (!Array.isArray(changeSet)) {
    return [];
  }

  return changeSet.filter((change) => change && typeof change === "object");
}

function buildText(change) {
  return [change.path, change.summary, change.command]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTestPath(pathname) {
  return typeof pathname === "string"
    && /(^|\/)(test|tests|__tests__)\b|(\.test|\.spec)\./i.test(pathname);
}

function isCodePath(pathname) {
  return typeof pathname === "string"
    && /\.(js|jsx|ts|tsx|mjs|cjs|py|rb|go|java|cs|php)$/i.test(pathname)
    && !isTestPath(pathname);
}

function isConfigChange(change, text) {
  return change.kind === "infra"
    || change.kind === "config"
    || text.includes("env")
    || text.includes("config")
    || text.includes("deploy")
    || text.includes("hosting")
    || text.includes("route")
    || text.includes("routing")
    || text.includes("ci")
    || text.includes("pipeline");
}

function isMigrationChange(change, text) {
  return change.kind === "migration"
    || text.includes("migration")
    || text.includes("schema")
    || text.includes("database")
    || text.includes("db");
}

function isDestructiveChange(change, text) {
  return change.operation === "delete"
    || text.includes("drop table")
    || text.includes("drop column")
    || text.includes("delete file")
    || text.includes("remove route")
    || text.includes("revoke");
}

function createViolation({ change, type, severity, reason, index }) {
  return {
    violationId: change.id ? `${change.id}:${type}` : `policy-violation-${index + 1}`,
    type,
    severity,
    path: change.path ?? null,
    operation: change.operation ?? "modify",
    reason,
  };
}

export function createCodeChangePolicyChecks({
  changeSet,
} = {}) {
  const normalizedChanges = normalizeChangeSet(changeSet);
  const hasTestChange = normalizedChanges.some((change) => isTestPath(change.path));
  const policyViolations = [];

  normalizedChanges.forEach((change, index) => {
    const text = buildText(change);

    if (isCodePath(change.path) && !hasTestChange) {
      policyViolations.push(
        createViolation({
          change,
          type: "missing-test-coverage",
          severity: "medium",
          reason: "Code changes were detected without matching test updates",
          index,
        }),
      );
    }

    if (isConfigChange(change, text)) {
      policyViolations.push(
        createViolation({
          change,
          type: "config-change-review-required",
          severity: "medium",
          reason: "Configuration or infrastructure change requires explicit policy review",
          index,
        }),
      );
    }

    if (isMigrationChange(change, text)) {
      policyViolations.push(
        createViolation({
          change,
          type: "migration-review-required",
          severity: "high",
          reason: "Migration or schema change requires additional database review",
          index,
        }),
      );
    }

    if (isDestructiveChange(change, text)) {
      policyViolations.push(
        createViolation({
          change,
          type: "destructive-change",
          severity: "high",
          reason: "Destructive change detected and must be approved before execution",
          index,
        }),
      );
    }
  });

  return {
    policyViolations,
  };
}
