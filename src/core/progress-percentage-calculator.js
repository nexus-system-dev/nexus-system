export function createProgressPercentageCalculator({
  normalizedProgressInputs = null,
  progressPhase = "queued",
} = {}) {
  const basePercent = normalizedProgressInputs?.progressPercent ?? 0;
  const hasRuntimeLogs = normalizedProgressInputs?.hasRuntimeLogs === true;
  const hasTaskResults = (normalizedProgressInputs?.taskResults?.length ?? 0) > 0;

  let progressPercent = basePercent;

  if (progressPhase === "queued") {
    progressPercent = Math.max(basePercent, 0);
  } else if (progressPhase === "running") {
    progressPercent = Math.max(basePercent, hasRuntimeLogs ? 25 : 10);
  } else if (progressPhase === "blocked") {
    progressPercent = Math.max(basePercent, hasTaskResults ? 15 : 5);
  } else if (progressPhase === "failed") {
    progressPercent = Math.max(basePercent, 90);
  } else if (progressPhase === "completed") {
    progressPercent = 100;
  }

  return {
    progressPercent: Math.min(progressPercent, 100),
  };
}
