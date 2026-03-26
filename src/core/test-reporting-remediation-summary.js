export function createTestReportingAndRemediationSummary({
  normalizedTestResults = null,
  failureSummary = null,
  followUpTasks = [],
} = {}) {
  const failures = Array.isArray(normalizedTestResults?.failures) ? normalizedTestResults.failures : [];
  const flakySuites = Array.isArray(normalizedTestResults?.flakySuites) ? normalizedTestResults.flakySuites : [];
  const remediationActions = [
    ...new Set(
      [
        ...failures.map((failure) => `Investigate ${failure.type ?? "test"} suite`),
        ...flakySuites.map((suite) => `Stabilize flaky ${suite.type ?? "test"} suite`),
        ...(Array.isArray(followUpTasks) ? followUpTasks.map((task) => task.summary ?? task.title ?? String(task)) : []),
      ].filter(Boolean),
    ),
  ];

  return {
    testReportSummary: {
      status: normalizedTestResults?.status ?? "unknown",
      headline:
        normalizedTestResults?.status === "passed"
          ? "All required test suites passed"
          : normalizedTestResults?.status === "pending"
            ? "Some test suites still require execution"
            : "Test run requires remediation",
      summary: {
        totalSuites: normalizedTestResults?.summary?.totalSuites ?? 0,
        failedSuites: normalizedTestResults?.summary?.failedSuites ?? failures.length,
        flakySuites: normalizedTestResults?.summary?.flakySuites ?? flakySuites.length,
        averageCoverage: normalizedTestResults?.summary?.averageCoverage ?? null,
      },
      failedSuites: failures.map((failure) => ({
        suiteId: failure.suiteId ?? null,
        type: failure.type ?? "unknown",
        reason: failure.failureReason ?? "unknown-failure",
      })),
      flakySuites: flakySuites.map((suite) => ({
        suiteId: suite.suiteId ?? null,
        type: suite.type ?? "unknown",
      })),
      failureSummary: failureSummary ?? null,
      remediationActions,
    },
  };
}
