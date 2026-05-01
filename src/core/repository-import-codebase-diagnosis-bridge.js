function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickRepositoryAsset(existingBusinessAssets) {
  return normalizeArray(existingBusinessAssets?.assets).find((asset) => asset?.assetType === "repository") ?? null;
}

function summarizeStack(scan) {
  return {
    frontend: normalizeArray(scan?.stack?.frontend),
    backend: normalizeArray(scan?.stack?.backend),
    database: normalizeArray(scan?.stack?.database),
  };
}

function buildEvidenceCoverage(scan) {
  const evidence = normalizeObject(scan?.evidence);
  return {
    routeFiles: normalizeArray(evidence.routeFiles),
    schemaFiles: normalizeArray(evidence.schemaFiles),
    migrationFiles: normalizeArray(evidence.migrationFiles),
    envFiles: normalizeArray(evidence.envFiles),
    testFiles: normalizeArray(evidence.testFiles),
    ciFiles: normalizeArray(evidence.ciFiles),
  };
}

function createRepoStatusSummary({ gitSnapshot, scan }) {
  const pullRequests = normalizeArray(gitSnapshot?.pullRequests);
  return {
    branchCount: normalizeArray(gitSnapshot?.branches).length,
    commitCount: normalizeArray(gitSnapshot?.commits).length,
    reviewCount: pullRequests.length,
    openReviewCount: pullRequests.filter((pullRequest) => pullRequest?.state === "open").length,
    gapCount: normalizeArray(scan?.gaps).length,
    architecturePatternCount: normalizeArray(scan?.architecture?.patterns).length,
  };
}

function buildCapabilityReadiness(scan) {
  const findings = normalizeObject(scan?.findings);
  return [
    {
      capability: "auth",
      status: findings.hasAuth ? "present" : "missing",
      source: "scan.findings.hasAuth",
    },
    {
      capability: "tests",
      status: findings.hasTests ? "present" : "missing",
      source: "scan.findings.hasTests",
    },
    {
      capability: "migrations",
      status: findings.hasMigrations ? "present" : "missing",
      source: "scan.findings.hasMigrations",
    },
    {
      capability: "ci",
      status: findings.hasCi ? "present" : "missing",
      source: "scan.findings.hasCi",
    },
  ];
}

function buildRecommendedActions(scan) {
  const gaps = normalizeArray(scan?.gaps);
  const actions = [];

  if (gaps.some((gap) => String(gap).includes("התחברות"))) {
    actions.push("Validate the repository auth implementation path.");
  }
  if (gaps.some((gap) => String(gap).includes("בדיקות"))) {
    actions.push("Audit the existing repository test coverage before import continuation.");
  }
  if (gaps.some((gap) => String(gap).includes("CI"))) {
    actions.push("Verify CI workflow ownership and import pipeline readiness.");
  }
  if (actions.length === 0) {
    actions.push("Continue into imported asset task extraction from the diagnosed repository baseline.");
  }

  return actions;
}

export function createRepositoryImportAndCodebaseDiagnosisBridge({
  projectId = null,
  existingBusinessAssets = null,
  scan = null,
  gitSnapshot = null,
} = {}) {
  const assets = normalizeObject(existingBusinessAssets);
  const repositoryAsset = pickRepositoryAsset(assets);
  const normalizedScan = normalizeObject(scan);
  const repo = normalizeObject(gitSnapshot?.repo);

  if (!repositoryAsset) {
    return {
      repositoryImportAndCodebaseDiagnosis: {
        diagnosisId: `repository-import-diagnosis:${normalizeString(projectId) ?? "unknown-project"}`,
        status: "not-required",
        projectId: normalizeString(projectId),
        repository: null,
        summary: {
          canDiagnoseRepository: false,
          diagnosisStatus: "not-required",
          nextAction: "Connect a repository source before running repository diagnosis.",
        },
        importContinuation: {
          canContinueFromDiagnosis: false,
          nextCapabilities: normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter(
            (capability) => capability !== "repository-diagnosis",
          ),
        },
      },
    };
  }

  const repository = {
    provider: normalizeString(repositoryAsset?.repository?.provider) ?? normalizeString(gitSnapshot?.provider) ?? "github",
    fullName: normalizeString(repositoryAsset?.repository?.fullName) ?? normalizeString(repo.fullName) ?? null,
    defaultBranch: normalizeString(repositoryAsset?.repository?.defaultBranch) ?? normalizeString(repo.defaultBranch) ?? null,
    url: normalizeString(repositoryAsset?.url),
  };

  const stack = summarizeStack(normalizedScan);
  const evidenceCoverage = buildEvidenceCoverage(normalizedScan);
  const repoStatus = createRepoStatusSummary({ gitSnapshot, scan: normalizedScan });
  const codebaseFindings = normalizeObject(normalizedScan.findings);
  const architecturePatterns = normalizeArray(normalizedScan?.architecture?.patterns);
  const blockingGaps = normalizeArray(normalizedScan.gaps).slice(0, 5);
  const capabilityReadiness = buildCapabilityReadiness(normalizedScan);
  const recommendedActions = buildRecommendedActions(normalizedScan);
  const nextCapabilities = [
    "imported-asset-task-extraction",
    ...normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter((capability) => capability !== "repository-diagnosis"),
  ];

  return {
    repositoryImportAndCodebaseDiagnosis: {
      diagnosisId: `repository-import-diagnosis:${normalizeString(projectId) ?? "unknown-project"}`,
      status: "ready",
      projectId: normalizeString(projectId),
      repository,
      summary: {
        canDiagnoseRepository: true,
        diagnosisStatus: "ready",
        codebaseSummary: normalizeString(normalizedScan.summary),
        architectureSummary:
          architecturePatterns.length > 0 ? architecturePatterns.join(", ") : "No architecture pattern detected",
        nextAction: recommendedActions[0] ?? "Review repository diagnosis findings.",
      },
      repoStatus,
      codebaseSignals: {
        stack,
        findings: codebaseFindings,
        architecturePatterns,
        database: normalizeObject(normalizedScan.database),
        messaging: normalizeArray(normalizedScan.messaging),
        queues: normalizeArray(normalizedScan.queues),
        evidenceCoverage,
      },
      diagnosisReadout: {
        knowledgeSummary: normalizeString(normalizedScan?.knowledge?.summary),
        capabilityReadiness,
        blockingGaps,
        recommendedActions,
      },
      importContinuation: {
        canContinueFromDiagnosis: true,
        scanRoot: normalizeString(assets.importAndContinueSeed?.scanRoot),
        nextCapabilities: [...new Set(nextCapabilities)],
      },
    },
  };
}
