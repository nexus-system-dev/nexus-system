function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildMissingInputs({ workspaceNavigationModel, sessionState }) {
  const missingInputs = [];
  if (normalizeString(workspaceNavigationModel?.projectId) === null) {
    missingInputs.push("projectState.workspaceNavigationModel");
  }
  if (normalizeString(sessionState?.sessionId) === null || normalizeString(sessionState?.status) !== "active") {
    missingInputs.push("sessionState");
  }
  return missingInputs;
}

export function createReturnTomorrowContinuityResolver({
  sessionState = null,
  projectState = null,
  postAuthRedirect = null,
  userSessionHistory = null,
  returningUserMetric = null,
} = {}) {
  const normalizedSessionState = normalizeObject(sessionState);
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedWorkspaceNavigationModel = normalizeObject(
    normalizedProjectState.workspaceNavigationModel
      ?? normalizedProjectState.context?.workspaceNavigationModel
      ?? null,
  );
  const normalizedPostAuthRedirect = normalizeObject(postAuthRedirect);
  const normalizedHistory = normalizeObject(userSessionHistory);
  const normalizedReturningMetric = normalizeObject(returningUserMetric);
  const missingInputs = buildMissingInputs({
    workspaceNavigationModel: normalizedWorkspaceNavigationModel,
    sessionState: normalizedSessionState,
  });

  const continuityId = `return-tomorrow:${normalizeString(normalizedWorkspaceNavigationModel.projectId) ?? "unknown-project"}:${normalizeString(normalizedSessionState.userId) ?? "anonymous"}`;

  if (missingInputs.length > 0) {
    return {
      returnTomorrowContinuity: {
        returnTomorrowContinuityId: continuityId,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const totalHistoricalSessions = Object.values(normalizedHistory.byUser ?? {}).reduce(
    (sum, entry) => sum + (Number.isInteger(entry?.totalSessions) ? entry.totalSessions : 0),
    0,
  );
  const resumeToken = normalizeString(normalizedWorkspaceNavigationModel.handoffContext?.resumeToken);
  const currentWorkspace = normalizeString(normalizedWorkspaceNavigationModel.currentWorkspace?.key);
  const baseDestination = normalizeString(normalizedPostAuthRedirect.destination) ?? "workbench";
  const recommendedDestination = resumeToken ? "resume-workspace" : baseDestination;
  const canResumeTomorrow = Boolean(
    resumeToken
    && currentWorkspace
    && (totalHistoricalSessions > 0 || normalizedReturningMetric.isReturningUser === true),
  );

  return {
    returnTomorrowContinuity: {
      returnTomorrowContinuityId: continuityId,
      status: "ready",
      missingInputs: [],
      projectId: normalizeString(normalizedWorkspaceNavigationModel.projectId),
      userId: normalizeString(normalizedSessionState.userId),
      canResumeTomorrow,
      recommendedDestination: canResumeTomorrow ? recommendedDestination : "workbench",
      resumeWorkspace: currentWorkspace,
      resumeToken,
      continuitySource:
        normalizedReturningMetric.isReturningUser === true
          ? "returning-user-metric"
          : totalHistoricalSessions > 0
            ? "session-history"
            : "active-session-only",
      summary: {
        totalHistoricalSessions,
        hasResumeToken: Boolean(resumeToken),
        hasWorkspaceNavigation: Boolean(currentWorkspace),
      },
    },
  };
}
