function normalizeReleaseRun(releaseRun = null, statusEvents = []) {
  const run = releaseRun && typeof releaseRun === "object" ? releaseRun : {};
  return {
    releaseRunId: run.releaseRunId ?? run.id ?? "release-run",
    steps: Array.isArray(run.steps) ? run.steps : [],
    createdAt: run.createdAt ?? null,
    statusEvents: Array.isArray(statusEvents) ? statusEvents : [],
  };
}

export function createReleaseTimelineBuilder({
  releaseRun = null,
  statusEvents = [],
} = {}) {
  const normalized = normalizeReleaseRun(releaseRun, statusEvents);
  const timeline = normalized.statusEvents.map((event, index) => ({
    timelineId: `${normalized.releaseRunId}:${index + 1}`,
    step: event.step ?? event.category ?? `stage-${index + 1}`,
    status: event.status ?? "pending",
    summary: event.summary ?? event.rawStatus ?? event.status ?? "pending",
    providerType: event.providerType ?? null,
    releaseTarget: event.releaseTarget ?? null,
    isTerminal: Boolean(event.isTerminal),
  }));

  return {
    releaseTimeline: {
      releaseRunId: normalized.releaseRunId,
      events: timeline,
      currentStage: timeline.at(-1)?.step ?? null,
      currentStatus: timeline.at(-1)?.status ?? "pending",
      eventCount: timeline.length,
    },
  };
}
