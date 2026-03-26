function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function findScenario(acceptanceScenario) {
  const scenarios = Array.isArray(acceptanceScenario?.scenarios) ? acceptanceScenario.scenarios : [];
  return scenarios.find((scenario) => scenario.scenarioKey === "approval-explanation") ?? null;
}

export function createApprovalExplanationAcceptanceTest({
  acceptanceScenario = null,
  approvalStatus = null,
  approvalExplanation = null,
  projectExplanation = null,
} = {}) {
  const normalizedAcceptanceScenario = normalizeObject(acceptanceScenario);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedApprovalExplanation = normalizeObject(approvalExplanation);
  const normalizedProjectExplanation = normalizeObject(projectExplanation);
  const scenario = findScenario(normalizedAcceptanceScenario);
  const approvalGated = Boolean(
    normalizedApprovalStatus.status === "missing" || normalizedApprovalStatus.status === "pending",
  );
  const hasApprovalExplanation = Boolean(
    normalizedApprovalExplanation.summary ?? normalizedApprovalExplanation.whatIfRejected,
  );
  const hasProjectExplanation = Boolean(
    normalizedProjectExplanation.approval?.summary ?? normalizedProjectExplanation.approval?.headline,
  );
  const passed = Boolean(scenario && approvalGated && hasApprovalExplanation && hasProjectExplanation);

  return {
    acceptanceResult: {
      acceptanceResultId: `acceptance:approval-explanation:${normalizedApprovalStatus.approvalRequestId ?? "unknown"}`,
      scenarioKey: "approval-explanation",
      status: passed ? "passed" : "failed",
      expectedOutcome: scenario?.expectedOutcome ?? "Approval gating is enforced with clear explanation",
      observedOutcome: approvalGated
        ? normalizedApprovalExplanation.summary ?? "Approval was gated with a clear explanation"
        : "Approval gating was not enforced",
      checks: {
        scenarioResolved: Boolean(scenario),
        approvalGated,
        hasApprovalExplanation,
        hasProjectExplanation,
      },
      summary: {
        passed,
        requiredOutputs: scenario?.requiredOutputs ?? ["approvalExplanation", "projectExplanation"],
      },
    },
  };
}
