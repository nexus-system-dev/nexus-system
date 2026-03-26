function normalizeSuiteResult(suiteResult) {
  const type = suiteResult?.type ?? "unknown";
  const coverage = typeof suiteResult?.coverage === "number" ? suiteResult.coverage : null;
  const status = suiteResult?.status ?? "unknown";
  const isFlaky = type === "e2e" && status !== "completed";

  return {
    suiteId: suiteResult?.suiteId ?? null,
    type,
    status,
    exitCode: typeof suiteResult?.exitCode === "number" ? suiteResult.exitCode : null,
    coverage,
    isFlaky,
    outcome:
      status === "completed"
        ? "passed"
        : status === "staged"
          ? "pending"
          : "failed",
    failureReason:
      status === "completed"
        ? null
        : isFlaky
          ? "flaky-suite"
          : "suite-not-completed",
  };
}

export function createTestResultNormalizationModule({
  rawTestResults = null,
} = {}) {
  const normalizedSuites = (rawTestResults?.suiteResults ?? []).map((suiteResult) => normalizeSuiteResult(suiteResult));
  const failures = normalizedSuites.filter((suite) => suite.outcome === "failed");
  const pendingSuites = normalizedSuites.filter((suite) => suite.outcome === "pending");
  const flakySuites = normalizedSuites.filter((suite) => suite.isFlaky);
  const coverageValues = normalizedSuites.map((suite) => suite.coverage).filter((value) => typeof value === "number");
  const averageCoverage = coverageValues.length > 0
    ? coverageValues.reduce((total, value) => total + value, 0) / coverageValues.length
    : null;

  return {
    normalizedTestResults: {
      buildTarget: rawTestResults?.buildTarget ?? "unknown-build",
      releaseStage: rawTestResults?.releaseStage ?? "build-validation",
      status:
        failures.length > 0
          ? "failed"
          : pendingSuites.length > 0
            ? "pending"
            : "passed",
      suites: normalizedSuites,
      summary: {
        totalSuites: normalizedSuites.length,
        passedSuites: normalizedSuites.filter((suite) => suite.outcome === "passed").length,
        failedSuites: failures.length,
        pendingSuites: pendingSuites.length,
        flakySuites: flakySuites.length,
        averageCoverage,
      },
      failures,
      flakySuites,
    },
  };
}
