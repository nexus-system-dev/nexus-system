export function createPreDeployQualityGate({
  normalizedTestResults = null,
  validationReport = null,
} = {}) {
  const testStatus = normalizedTestResults?.status ?? "unknown";
  const averageCoverage = normalizedTestResults?.summary?.averageCoverage ?? null;
  const suites = Array.isArray(normalizedTestResults?.suites) ? normalizedTestResults.suites : [];
  const hasSmokeSuite = suites.some((suite) => suite.type === "smoke");
  const smokePassed = suites.some((suite) => suite.type === "smoke" && suite.outcome === "passed");
  const validationReady = validationReport?.isReady ?? validationReport?.status === "ready";
  const blockers = [];

  if (testStatus === "failed") {
    blockers.push("test-failures");
  }

  if (testStatus === "pending") {
    blockers.push("pending-test-suites");
  }

  if (typeof averageCoverage === "number" && averageCoverage < 0.8) {
    blockers.push("coverage-below-threshold");
  }

  if (hasSmokeSuite && !smokePassed) {
    blockers.push("smoke-check-not-passed");
  }

  if (!validationReady) {
    blockers.push("release-validation-not-ready");
  }

  const decision = blockers.length === 0 ? "allow" : "block";

  return {
    qualityGateDecision: {
      decision,
      isAllowed: decision === "allow",
      blockers,
      coverageThreshold: 0.8,
      averageCoverage,
      requiresSmokeCheck: hasSmokeSuite,
      validationStatus: validationReport?.status ?? "unknown",
      testStatus,
    },
  };
}
