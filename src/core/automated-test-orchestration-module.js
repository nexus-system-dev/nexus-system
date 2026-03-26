function normalizeChangeSet(changeSet = []) {
  return Array.isArray(changeSet) ? changeSet.filter((item) => item && typeof item === "object") : [];
}

function inferRiskLevel(changeSet, testExecutionRequest) {
  const kinds = new Set(changeSet.map((item) => item.kind));
  const releaseStage = testExecutionRequest?.releaseStage ?? "build-validation";

  if (kinds.has("migration") || releaseStage === "pre-deploy") {
    return "high";
  }

  if (kinds.has("infra") || (testExecutionRequest?.testTypes ?? []).includes("e2e")) {
    return "medium";
  }

  return "low";
}

function shouldIncludeSuite(suite, riskLevel, releaseStage, changeSet) {
  if (!suite) {
    return false;
  }

  const kinds = new Set(changeSet.map((item) => item.kind));

  if (suite.type === "e2e") {
    return riskLevel !== "low" || releaseStage === "pre-deploy";
  }

  if (suite.type === "integration") {
    return kinds.has("migration") || kinds.has("infra") || riskLevel !== "low";
  }

  if (suite.type === "smoke" || suite.type === "sanity") {
    return true;
  }

  return true;
}

export function createAutomatedTestOrchestrationModule({
  testExecutionRequest = null,
  changeSet = [],
} = {}) {
  const normalizedChangeSet = normalizeChangeSet(changeSet);
  const suites = Array.isArray(testExecutionRequest?.suites) ? testExecutionRequest.suites : [];
  const releaseStage = testExecutionRequest?.releaseStage ?? "build-validation";
  const riskLevel = inferRiskLevel(normalizedChangeSet, testExecutionRequest);
  const selectedSuites = suites
    .filter((suite) => shouldIncludeSuite(suite, riskLevel, releaseStage, normalizedChangeSet))
    .map((suite, index) => ({
      ...suite,
      order: index + 1,
      reason:
        suite.type === "e2e"
          ? "high-risk-or-release-stage"
          : suite.type === "integration"
            ? "change-impact"
            : "baseline-quality",
    }));

  return {
    testRunPlan: {
      buildTarget: testExecutionRequest?.buildTarget ?? "unknown-build",
      releaseStage,
      riskLevel,
      runner: testExecutionRequest?.runner ?? "generic-test-runner",
      environment: testExecutionRequest?.environment ?? "ci",
      selectedSuites,
      totalSuites: selectedSuites.length,
      changeSummary: {
        totalChanges: normalizedChangeSet.length,
        changeKinds: [...new Set(normalizedChangeSet.map((item) => item.kind).filter(Boolean))],
      },
    },
  };
}
