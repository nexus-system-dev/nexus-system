function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function appendLiveUpdateDiagnosticEvent(project, {
  projectId = null,
  taskId = "OBS-001",
  summary = "Live updates are unavailable; Nexus is continuing with scheduled refresh.",
} = {}) {
  const normalizedProject = normalizeObject(project);
  const existingEvents = Array.isArray(normalizedProject.events) ? normalizedProject.events : [];

  return {
    ...normalizedProject,
    events: [
      ...existingEvents,
      {
        type: "diagnostic.live-events.unavailable",
        payload: {
          projectId,
          taskId,
          summary,
        },
      },
    ],
  };
}
