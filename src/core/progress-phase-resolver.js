export function createProgressPhaseResolver({
  normalizedProgressInputs = null,
} = {}) {
  const latestTaskResult = normalizedProgressInputs?.latestTaskResult ?? null;
  const status = normalizedProgressInputs?.status ?? "unknown";
  const progressPercent = normalizedProgressInputs?.progressPercent ?? 0;

  let progressPhase = "queued";

  if (latestTaskResult?.status === "failed" || status === "failed") {
    progressPhase = "failed";
  } else if (latestTaskResult?.status === "completed" || progressPercent >= 100 || status === "validated") {
    progressPhase = "completed";
  } else if (status === "blocked") {
    progressPhase = "blocked";
  } else if (progressPercent > 0 || normalizedProgressInputs?.hasRuntimeLogs) {
    progressPhase = "running";
  }

  return {
    progressPhase,
  };
}
