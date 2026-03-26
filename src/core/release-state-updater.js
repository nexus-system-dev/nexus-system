import { buildExecutionGraph } from "./project-graph.js";

function toReleaseGraphTasks(releaseEvents = [], validationReport = {}) {
  return releaseEvents.map((event, index) => ({
    id: event.id ?? `release-event-${index + 1}`,
    lane: "release",
    summary: event.summary ?? event.step ?? `Release step ${index + 1}`,
    successCriteria: event.successCriteria ?? [],
    dependencies: index > 0 ? [releaseEvents[index - 1].id ?? `release-event-${index}`] : [],
    lockKey: event.lockKey ?? event.step ?? `release-${index + 1}`,
    status: validationReport?.isReady ? "done" : "blocked",
  }));
}

export function createReleaseStateUpdater({
  releaseEvents = [],
  validationReport = null,
  projectState = {},
} = {}) {
  const completedEventIds = new Set(
    validationReport?.isReady ? releaseEvents.map((event, index) => event.id ?? `release-event-${index + 1}`) : [],
  );
  const updatedExecutionGraph = buildExecutionGraph(
    toReleaseGraphTasks(releaseEvents, validationReport),
    { completedTaskIds: completedEventIds },
  );

  const updatedProjectState = {
    ...projectState,
    release: {
      status: validationReport?.isReady ? "validated" : "blocked",
      validationReport,
      completedEventIds: [...completedEventIds],
      eventCount: releaseEvents.length,
    },
  };

  return {
    updatedProjectState,
    updatedExecutionGraph,
  };
}
