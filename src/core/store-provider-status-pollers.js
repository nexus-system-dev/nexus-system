const TERMINAL_STATES = ["published", "rejected", "failed"];

function mapReleaseTargetCategory(releaseTarget = "") {
  if (releaseTarget === "app-store" || releaseTarget === "play-store") {
    return "store";
  }

  if (releaseTarget.includes("deployment")) {
    return "deployment";
  }

  if (releaseTarget.includes("distribution")) {
    return "distribution";
  }

  return "generic";
}

export function defineReleasePollingSchema({
  releaseTarget,
  providerSession = null,
} = {}) {
  const normalizedTarget = typeof releaseTarget === "string" && releaseTarget.trim()
    ? releaseTarget.trim()
    : "private-deployment";
  const providerType = providerSession?.providerType ?? "generic";

  return {
    pollingRequest: {
      releaseTarget: normalizedTarget,
      providerType,
      targetCategory: mapReleaseTargetCategory(normalizedTarget),
      pollOperation: providerSession?.operationTypes?.includes("poll") ? "poll" : "status-check",
      cursor: null,
      attempt: 1,
    },
  };
}

export function createProviderStatusResolver({
  pollingRequest = null,
} = {}) {
  const providerType = pollingRequest?.providerType ?? "generic";
  const targetCategory = pollingRequest?.targetCategory ?? "generic";

  return {
    resolvedPoller: {
      pollerId: `poller:${providerType}:${targetCategory}`,
      providerType,
      targetCategory,
      operationType: pollingRequest?.pollOperation ?? "status-check",
      mode: "canonical",
    },
  };
}

export function createPollingExecutionModule({
  resolvedPoller = null,
  pollingRequest = null,
} = {}) {
  const targetCategory = resolvedPoller?.targetCategory ?? pollingRequest?.targetCategory ?? "generic";
  const providerType = resolvedPoller?.providerType ?? pollingRequest?.providerType ?? "generic";
  const releaseTarget = pollingRequest?.releaseTarget ?? "private-deployment";

  return {
    rawStatusResponse: {
      providerType,
      releaseTarget,
      targetCategory,
      providerStatus: targetCategory === "store" ? "in_review" : "deployed",
      attempt: pollingRequest?.attempt ?? 1,
      cursor: pollingRequest?.cursor ?? null,
    },
  };
}

export function createStatusNormalizationModule({
  rawStatusResponse = null,
} = {}) {
  const providerStatus = rawStatusResponse?.providerStatus ?? "unknown";
  const normalizedStatus = providerStatus === "deployed"
    ? "published"
    : providerStatus === "in_review"
      ? "review"
      : providerStatus === "rejected"
        ? "rejected"
        : providerStatus === "failed"
          ? "failed"
          : "pending";

  return {
    statusEvents: [
      {
        id: `status:${rawStatusResponse?.providerType ?? "generic"}:${rawStatusResponse?.releaseTarget ?? "release"}`,
        providerType: rawStatusResponse?.providerType ?? "generic",
        releaseTarget: rawStatusResponse?.releaseTarget ?? "private-deployment",
        status: normalizedStatus,
        rawStatus: providerStatus,
        category: rawStatusResponse?.targetCategory ?? "generic",
      },
    ],
  };
}

export function createTerminalStateDetector({
  statusEvents = [],
} = {}) {
  const latestStatus = (Array.isArray(statusEvents) ? statusEvents : []).at(-1)?.status ?? "pending";
  return {
    pollingDecision: {
      isTerminal: TERMINAL_STATES.includes(latestStatus),
      latestStatus,
      shouldContinuePolling: !TERMINAL_STATES.includes(latestStatus),
    },
  };
}

export function createPollingMetadataBuilder({
  pollingRequest = null,
  statusEvents = [],
  pollingDecision = null,
} = {}) {
  return {
    pollingMetadata: {
      attempt: pollingRequest?.attempt ?? 1,
      nextPollInSeconds: pollingDecision?.shouldContinuePolling ? 30 : null,
      cursor: pollingRequest?.cursor ?? null,
      lastStatus: (Array.isArray(statusEvents) ? statusEvents : []).at(-1)?.status ?? "pending",
    },
  };
}

export function createStoreAndProviderStatusPollers({
  releaseTarget,
  providerSession = null,
} = {}) {
  const { pollingRequest } = defineReleasePollingSchema({
    releaseTarget,
    providerSession,
  });
  const { resolvedPoller } = createProviderStatusResolver({
    pollingRequest,
  });
  const { rawStatusResponse } = createPollingExecutionModule({
    resolvedPoller,
    pollingRequest,
  });
  const { statusEvents } = createStatusNormalizationModule({
    rawStatusResponse,
  });
  const { pollingDecision } = createTerminalStateDetector({
    statusEvents,
  });
  const { pollingMetadata } = createPollingMetadataBuilder({
    pollingRequest,
    statusEvents,
    pollingDecision,
  });

  return {
    pollingRequest,
    resolvedPoller,
    rawStatusResponse,
    statusEvents,
    pollingDecision,
    pollingMetadata,
  };
}
