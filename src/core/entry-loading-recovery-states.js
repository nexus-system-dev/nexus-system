function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(appEntryDecision, sessionState, entryStateVariants) {
  const missingInputs = [];
  if (!appEntryDecision || normalizeString(appEntryDecision.status) !== "ready") missingInputs.push("appEntryDecision");
  if (!sessionState || normalizeString(sessionState.status) === null) missingInputs.push("sessionState");
  if (!entryStateVariants || normalizeString(entryStateVariants.status) !== "ready") missingInputs.push("entryStateVariants");
  return missingInputs;
}

export function createEntryLoadingAndRecoveryStates({
  appEntryDecision = null,
  sessionState = null,
  entryStateVariants = null,
} = {}) {
  const normalizedDecision = normalizeObject(appEntryDecision);
  const normalizedSession = normalizeObject(sessionState);
  const normalizedVariants = normalizeObject(entryStateVariants);
  const missingInputs = buildMissingInputs(normalizedDecision, normalizedSession, normalizedVariants);

  if (missingInputs.length > 0) {
    return {
      entryRecoveryState: {
        entryRecoveryStateId: `entry-recovery:${slugify(normalizedDecision?.appEntryDecisionId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const sessionStatus = normalizeString(normalizedSession.status) ?? "unknown";

  return {
    entryRecoveryState: {
      entryRecoveryStateId: `entry-recovery:${slugify(normalizedDecision.appEntryDecisionId)}`,
      status: "ready",
      missingInputs: [],
      loadingState: sessionStatus === "bootstrapping" ? "bootstrapping-session" : "ready",
      recoveryState: sessionStatus === "expired" ? "resume-authentication" : "resume-entry",
      fallbackVariant: normalizedVariants.defaultVariant ?? "returning-user",
    },
  };
}
