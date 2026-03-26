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

function createRunMetadata(run) {
  const commandResults = Array.isArray(run?.commandResults) ? run.commandResults : [];

  return {
    requestId: run?.requestId ?? null,
    taskId: run?.taskId ?? null,
    surfaceId: run?.surfaceId ?? null,
    surfaceType: run?.surfaceType ?? null,
    readiness: run?.readiness ?? "unknown",
    status: run?.status ?? "unknown",
    commandCount: commandResults.length,
    artifactCount: commandResults.reduce(
      (total, commandResult) => total + (Array.isArray(commandResult?.producedArtifacts) ? commandResult.producedArtifacts.length : 0),
      0,
    ),
  };
}

export function createBootstrapArtifactCollector({ rawExecutionResult = null } = {}) {
  const normalizedRuns = normalizeRawExecutionResults(rawExecutionResult);
  const artifacts = [
    ...new Set(
      normalizedRuns.flatMap((run) =>
        (run.commandResults ?? []).flatMap((commandResult) => commandResult?.producedArtifacts ?? []),
      ).filter(Boolean),
    ),
  ];

  return {
    artifacts,
    executionMetadata: {
      totalRuns: normalizedRuns.length,
      totalArtifacts: artifacts.length,
      surfaces: [...new Set(normalizedRuns.map((run) => run?.surfaceId).filter(Boolean))],
      statuses: [...new Set(normalizedRuns.map((run) => run?.status).filter(Boolean))],
      runs: normalizedRuns.map((run) => createRunMetadata(run)),
    },
  };
}
