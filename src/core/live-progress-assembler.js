export function createLiveProgressAssembler({
  progressPhase = "queued",
  progressPercent = 0,
  completionEstimate = "pending",
} = {}) {
  return {
    progressState: {
      phase: progressPhase,
      percent: progressPercent,
      status:
        progressPhase === "completed"
          ? "done"
          : progressPhase === "failed"
            ? "failed"
            : progressPhase === "blocked"
              ? "blocked"
              : "active",
      completionEstimate,
    },
    completionEstimate,
  };
}
