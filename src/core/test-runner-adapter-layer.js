function normalizeExecutionSurface(executionSurface = null) {
  if (executionSurface?.resolvedSurface) {
    return executionSurface.resolvedSurface;
  }

  return executionSurface ?? null;
}

function createSuiteResult({ suite, executionSurface, index }) {
  const normalizedSurface = normalizeExecutionSurface(executionSurface);
  const readiness = normalizedSurface?.readiness ?? "unknown";
  const status = readiness === "ready" ? "completed" : "staged";

  return {
    suiteId: suite?.id ?? `suite-${index + 1}`,
    type: suite?.type ?? "unknown",
    runner: normalizedSurface?.surfaceType === "agent" ? "agent-test-runner" : "execution-surface-test-runner",
    status,
    exitCode: status === "completed" ? 0 : null,
    output:
      status === "completed"
        ? `Executed ${suite?.type ?? "test"} suite on ${normalizedSurface?.surfaceId ?? "unknown-surface"}`
        : `Staged ${suite?.type ?? "test"} suite for ${normalizedSurface?.surfaceId ?? "unknown-surface"}`,
    coverage:
      suite?.type === "unit"
        ? 0.9
        : suite?.type === "integration"
          ? 0.82
          : suite?.type === "e2e"
            ? 0.76
            : null,
  };
}

export function createTestRunnerAdapterLayer({
  testRunPlan = null,
  executionSurface = null,
} = {}) {
  const normalizedSurface = normalizeExecutionSurface(executionSurface);
  const selectedSuites = Array.isArray(testRunPlan?.selectedSuites) ? testRunPlan.selectedSuites : [];
  const suiteResults = selectedSuites.map((suite, index) =>
    createSuiteResult({
      suite,
      executionSurface: normalizedSurface,
      index,
    }),
  );

  return {
    rawTestResults: {
      buildTarget: testRunPlan?.buildTarget ?? "unknown-build",
      releaseStage: testRunPlan?.releaseStage ?? "build-validation",
      riskLevel: testRunPlan?.riskLevel ?? "unknown",
      surfaceId: normalizedSurface?.surfaceId ?? null,
      surfaceType: normalizedSurface?.surfaceType ?? null,
      status: suiteResults.every((suiteResult) => suiteResult.status === "completed") ? "completed" : "staged",
      suiteResults,
    },
  };
}
