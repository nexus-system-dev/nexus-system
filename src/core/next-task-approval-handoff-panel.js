function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildSafeAlternatives(nextTaskPresentation) {
  const alternatives = normalizeArray(nextTaskPresentation.alternatives);

  return alternatives.filter((item) =>
    ["wait-for-approval", "switch-to-safe-path", "fallback-path", "defer-task"].includes(item)
  );
}

export function createNextTaskApprovalHandoffPanel({
  nextTaskPresentation = null,
  approvalExplanation = null,
} = {}) {
  const presentation = normalizeObject(nextTaskPresentation);
  const explanation = normalizeObject(approvalExplanation);
  const approvalState = normalizeObject(presentation.approvalState);
  const expectedOutcome = normalizeObject(presentation.expectedOutcome);
  const safeAlternatives = buildSafeAlternatives(presentation);

  return {
    nextTaskApprovalPanel: {
      panelId: `next-task-approval-panel:${presentation.presentationId ?? "unknown"}`,
      title: "Next Task Approval",
      status: approvalState.requiresApproval ? "attention" : "clear",
      approvalRequired: approvalState.requiresApproval,
      nextStep: presentation.selectedTask?.summary ?? expectedOutcome.headline ?? null,
      afterApproval: {
        headline: expectedOutcome.headline ?? null,
        expectedImpact: expectedOutcome.expectedImpact ?? null,
        successCriteria: normalizeArray(expectedOutcome.successCriteria),
      },
      explanation: {
        whyApproval: explanation.whyApproval ?? approvalState.reason ?? null,
        whatIfRejected: explanation.whatIfRejected ?? null,
        riskLevel: explanation.riskLevel ?? "unknown",
      },
      safeAlternatives,
      summary: {
        showsApprovalState: true,
        safeAlternativeCount: safeAlternatives.length,
        canProceedWithoutApproval: approvalState.requiresApproval !== true,
      },
    },
  };
}
