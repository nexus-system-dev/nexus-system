function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function findScenario(acceptanceScenario) {
  const scenarios = Array.isArray(acceptanceScenario?.scenarios) ? acceptanceScenario.scenarios : [];
  return scenarios.find((scenario) => scenario.scenarioKey === "workspace-continuity") ?? null;
}

export function createWorkspaceContinuityAcceptanceTest({
  acceptanceScenario = null,
  workspaceNavigationModel = null,
} = {}) {
  const normalizedAcceptanceScenario = normalizeObject(acceptanceScenario);
  const normalizedWorkspaceNavigationModel = normalizeObject(workspaceNavigationModel);
  const scenario = findScenario(normalizedAcceptanceScenario);
  const availableWorkspaces = Array.isArray(normalizedWorkspaceNavigationModel.availableWorkspaces)
    ? normalizedWorkspaceNavigationModel.availableWorkspaces
    : [];
  const hasCrossWorkspaceNavigation = availableWorkspaces.length >= 4;
  const hasHandoffContext = Boolean(
    normalizedWorkspaceNavigationModel.handoffContext?.projectId ??
      normalizedWorkspaceNavigationModel.projectId,
  );
  const hasResumeState = Boolean(
    normalizedWorkspaceNavigationModel.handoffContext?.resumeToken ??
      normalizedWorkspaceNavigationModel.handoffContext?.currentWorkspace ??
      normalizedWorkspaceNavigationModel.currentWorkspace,
  );
  const passed = Boolean(scenario && hasCrossWorkspaceNavigation && hasHandoffContext && hasResumeState);

  return {
    acceptanceResult: {
      acceptanceResultId: `acceptance:workspace-continuity:${normalizedWorkspaceNavigationModel.projectId ?? "unknown"}`,
      scenarioKey: "workspace-continuity",
      status: passed ? "passed" : "failed",
      expectedOutcome:
        scenario?.expectedOutcome ?? "Workspace navigation preserves project context and resume continuity",
      observedOutcome: hasCrossWorkspaceNavigation
        ? normalizedWorkspaceNavigationModel.summary?.headline ??
          "Workspace navigation preserved project context across workspaces"
        : "Workspace continuity could not be verified",
      checks: {
        scenarioResolved: Boolean(scenario),
        hasCrossWorkspaceNavigation,
        hasHandoffContext,
        hasResumeState,
      },
      summary: {
        passed,
        requiredOutputs: scenario?.requiredOutputs ?? ["workspaceNavigationModel"],
      },
    },
  };
}
