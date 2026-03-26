export function createCompletionEstimateCalculator({
  normalizedProgressInputs = null,
  progressPercent = 0,
} = {}) {
  const explicitEstimate = normalizedProgressInputs?.completionEstimate ?? null;

  if (explicitEstimate) {
    return {
      completionEstimate: explicitEstimate,
    };
  }

  if (progressPercent >= 100) {
    return {
      completionEstimate: "completed",
    };
  }

  if (normalizedProgressInputs?.status === "failed") {
    return {
      completionEstimate: "unknown",
    };
  }

  if (progressPercent >= 75) {
    return {
      completionEstimate: "soon",
    };
  }

  if (progressPercent >= 25) {
    return {
      completionEstimate: "in-progress",
    };
  }

  return {
    completionEstimate: "pending",
  };
}
