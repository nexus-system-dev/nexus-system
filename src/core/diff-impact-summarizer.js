function normalizeCodeDiff(codeDiff) {
  return codeDiff && typeof codeDiff === "object"
    ? codeDiff
    : { totalCodeChanges: 0, files: [], affectedPaths: [] };
}

function normalizeMigrationDiff(migrationDiff) {
  return migrationDiff && typeof migrationDiff === "object"
    ? migrationDiff
    : { totalMigrationChanges: 0, migrations: [], dbRisks: [] };
}

function normalizeInfraDiff(infraDiff) {
  return infraDiff && typeof infraDiff === "object"
    ? infraDiff
    : { totalInfraChanges: 0, changes: [], impactedAreas: [] };
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function buildRiskFlags({ migrationDiff, infraDiff, decisionIntelligence }) {
  const flags = [];

  for (const dbRisk of migrationDiff.dbRisks ?? []) {
    flags.push(dbRisk);
  }

  for (const area of infraDiff.impactedAreas ?? []) {
    if (area === "deployment") {
      flags.push("deployment-impact");
    }

    if (area === "environment") {
      flags.push("environment-config-change");
    }

    if (area === "routing") {
      flags.push("routing-surface-change");
    }

    if (area === "ci") {
      flags.push("delivery-pipeline-change");
    }
  }

  if (decisionIntelligence?.summary?.requiresApproval) {
    flags.push("approval-required");
  }

  if (decisionIntelligence?.summary?.hasUncertainty) {
    flags.push("uncertain-impact");
  }

  return unique(flags);
}

export function createDiffImpactSummarizer({
  codeDiff,
  migrationDiff,
  infraDiff,
  decisionIntelligence = null,
} = {}) {
  const normalizedCodeDiff = normalizeCodeDiff(codeDiff);
  const normalizedMigrationDiff = normalizeMigrationDiff(migrationDiff);
  const normalizedInfraDiff = normalizeInfraDiff(infraDiff);
  const totalChanges = normalizedCodeDiff.totalCodeChanges
    + normalizedMigrationDiff.totalMigrationChanges
    + normalizedInfraDiff.totalInfraChanges;
  const riskFlags = buildRiskFlags({
    migrationDiff: normalizedMigrationDiff,
    infraDiff: normalizedInfraDiff,
    decisionIntelligence,
  });

  return {
    impactSummary: {
      totalChanges,
      codeImpact: normalizedCodeDiff.totalCodeChanges > 0 ? "present" : "none",
      migrationImpact: normalizedMigrationDiff.totalMigrationChanges > 0 ? "present" : "none",
      infraImpact: normalizedInfraDiff.totalInfraChanges > 0 ? "present" : "none",
      affectedCodePaths: normalizedCodeDiff.affectedPaths ?? [],
      affectedMigrationPaths: (normalizedMigrationDiff.migrations ?? []).map((entry) => entry.path).filter(Boolean),
      affectedInfraAreas: normalizedInfraDiff.impactedAreas ?? [],
      requiresApproval: Boolean(decisionIntelligence?.summary?.requiresApproval),
      hasUncertainty: Boolean(decisionIntelligence?.summary?.hasUncertainty),
    },
    riskFlags,
  };
}
