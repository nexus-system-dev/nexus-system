function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(appEntryDecision) {
  const missingInputs = [];
  if (!appEntryDecision || normalizeString(appEntryDecision.status) !== "ready") {
    missingInputs.push("appEntryDecision");
  }
  return missingInputs;
}

export function createPostLoginDestinationResolver({
  appEntryDecision = null,
  userSessionMetric = null,
  projectState = null,
} = {}) {
  const normalizedDecision = normalizeObject(appEntryDecision);
  const normalizedSessionMetric = normalizeObject(userSessionMetric);
  const normalizedProjectState = normalizeObject(projectState);
  const missingInputs = buildMissingInputs(normalizedDecision);

  if (missingInputs.length > 0) {
    return {
      postLoginDestination: {
        postLoginDestinationId: `post-login-destination:${slugify(normalizedDecision?.appEntryDecisionId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  let destination = "dashboard";
  if (normalizedDecision.decision === "waitlist-state") {
    destination = "waitlist-status";
  } else if (normalizedDecision.decision === "access-gate") {
    destination = "approval-inbox";
  } else if (!normalizedProjectState?.projectIdentity && (normalizedSessionMetric?.totalSessions ?? 0) <= 1) {
    destination = "first-project-kickoff";
  } else if ((normalizedSessionMetric?.totalSessions ?? 0) <= 1) {
    destination = "onboarding-resume";
  }

  return {
    postLoginDestination: {
      postLoginDestinationId: `post-login-destination:${slugify(normalizedDecision.appEntryDecisionId)}`,
      status: "ready",
      missingInputs: [],
      destination,
      entryDecision: normalizedDecision.decision,
    },
  };
}
