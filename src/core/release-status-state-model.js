const TERMINAL_STATES = ["published", "rejected", "failed"];

function classifyReleaseStage(step = "") {
  if (step.includes("build")) {
    return "build";
  }

  if (step.includes("deploy")) {
    return "deploy";
  }

  if (step.includes("review")) {
    return "review";
  }

  if (step.includes("publish") || step.includes("submission")) {
    return "publish";
  }

  if (step.includes("reject")) {
    return "rejection";
  }

  return "release";
}

function deriveOverallStatus(events = []) {
  if (events.some((event) => event.status === "failed")) {
    return "failed";
  }

  if (events.some((event) => event.status === "rejected")) {
    return "rejected";
  }

  if (events.length > 0 && events.every((event) => event.status === "published" || event.status === "completed")) {
    return "published";
  }

  if (events.some((event) => event.status === "running")) {
    return "in-progress";
  }

  return "pending";
}

export function createReleaseStatusStateModel({ releaseEvents = [] } = {}) {
  const normalizedEvents = (Array.isArray(releaseEvents) ? releaseEvents : []).map((event, index) => {
    const status = event?.status ?? "pending";
    return {
      id: event?.id ?? `release-event-${index + 1}`,
      stage: classifyReleaseStage(event?.step ?? event?.summary ?? ""),
      step: event?.step ?? `release-step-${index + 1}`,
      status,
      isTerminal: TERMINAL_STATES.includes(status),
      summary: event?.summary ?? event?.step ?? `release step ${index + 1}`,
    };
  });

  return {
    releaseStatus: {
      status: deriveOverallStatus(normalizedEvents),
      stages: normalizedEvents,
      terminalStates: TERMINAL_STATES,
      lastEventId: normalizedEvents.at(-1)?.id ?? null,
    },
  };
}
