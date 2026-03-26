function normalizeCodeDiff(codeDiff) {
  return codeDiff && typeof codeDiff === "object"
    ? codeDiff
    : { totalCodeChanges: 0, files: [] };
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

function normalizeImpactSummary(impactSummary) {
  return impactSummary && typeof impactSummary === "object"
    ? impactSummary
    : {
        totalChanges: 0,
        codeImpact: "none",
        migrationImpact: "none",
        infraImpact: "none",
        affectedCodePaths: [],
        affectedMigrationPaths: [],
        affectedInfraAreas: [],
        requiresApproval: false,
        hasUncertainty: false,
      };
}

function buildHeadline(impactSummary) {
  if (impactSummary.totalChanges === 0) {
    return "לא זוהו שינויים מתוכננים";
  }

  const parts = [];

  if (impactSummary.codeImpact === "present") {
    parts.push("שינויי קוד");
  }

  if (impactSummary.migrationImpact === "present") {
    parts.push("שינויי סכימה");
  }

  if (impactSummary.infraImpact === "present") {
    parts.push("שינויי תשתית");
  }

  return `לפני הביצוע יוחלו ${parts.join(", ")}`;
}

export function createUserFacingDiffPreviewAssembler({
  codeDiff,
  migrationDiff,
  infraDiff,
  impactSummary,
  riskFlags = [],
} = {}) {
  const normalizedCodeDiff = normalizeCodeDiff(codeDiff);
  const normalizedMigrationDiff = normalizeMigrationDiff(migrationDiff);
  const normalizedInfraDiff = normalizeInfraDiff(infraDiff);
  const normalizedImpactSummary = normalizeImpactSummary(impactSummary);

  return {
    diffPreview: {
      headline: buildHeadline(normalizedImpactSummary),
      summary: {
        totalChanges: normalizedImpactSummary.totalChanges,
        requiresApproval: normalizedImpactSummary.requiresApproval,
        hasUncertainty: normalizedImpactSummary.hasUncertainty,
      },
      sections: {
        code: normalizedCodeDiff.files ?? [],
        migrations: normalizedMigrationDiff.migrations ?? [],
        infra: normalizedInfraDiff.changes ?? [],
      },
      affectedAreas: {
        codePaths: normalizedImpactSummary.affectedCodePaths ?? [],
        migrationPaths: normalizedImpactSummary.affectedMigrationPaths ?? [],
        infraAreas: normalizedImpactSummary.affectedInfraAreas ?? [],
      },
      riskFlags: Array.isArray(riskFlags) ? riskFlags : [],
      approvalGuidance: {
        required: normalizedImpactSummary.requiresApproval,
        reason: normalizedImpactSummary.requiresApproval
          ? "יש שינוי מתוכנן שדורש אישור לפני execution"
          : null,
      },
    },
  };
}
