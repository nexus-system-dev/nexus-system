function normalizeRawExecutionResults(rawExecutionResult) {
  if (Array.isArray(rawExecutionResult)) {
    return rawExecutionResult
      .map((item) => item?.rawExecutionResult ?? item)
      .filter((item) => item && typeof item === "object");
  }

  if (rawExecutionResult?.rawExecutionResult) {
    return [rawExecutionResult.rawExecutionResult];
  }

  if (rawExecutionResult && typeof rawExecutionResult === "object") {
    return [rawExecutionResult];
  }

  return [];
}

export function createBootstrapExecutionResultEnvelope({
  rawExecutionResult = null,
  artifacts = [],
} = {}) {
  const normalizedRuns = normalizeRawExecutionResults(rawExecutionResult);
  const normalizedArtifacts = Array.isArray(artifacts) ? artifacts.filter(Boolean) : [];
  const commandResults = normalizedRuns.flatMap((run) => run.commandResults ?? []);
  const statuses = [...new Set(normalizedRuns.map((run) => run?.status).filter(Boolean))];
  const executionStatus = statuses.includes("invoked")
    ? statuses.length === 1
      ? "invoked"
      : "partial"
    : statuses[0] ?? "unknown";

  return {
    executionResult: {
      status: executionStatus,
      artifacts: normalizedArtifacts,
      metadata: {
        totalRuns: normalizedRuns.length,
        totalCommands: commandResults.length,
        totalArtifacts: normalizedArtifacts.length,
        surfaces: [...new Set(normalizedRuns.map((run) => run?.surfaceId).filter(Boolean))],
        statuses,
      },
    },
    artifacts: normalizedArtifacts,
  };
}
