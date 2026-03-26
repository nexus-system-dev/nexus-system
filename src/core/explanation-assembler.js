function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildHeadline(nextAction, failure, approval) {
  if (approval.summary?.requiresApproval || nextAction.blockerType === "approval-blocker") {
    return "צריך את האישור שלך כדי שנוכל להמשיך.";
  }

  if (failure.failureStatus === "blocked") {
    return "יש חסם אחד ברור שצריך לפתור לפני הצעד הבא.";
  }

  return "הפרויקט מתקדם, והצעד הבא כבר ברור.";
}

function buildUserSummary(nextAction, failure, approval, change) {
  const parts = [];

  if (change.changedWhat) {
    parts.push(change.changedWhat);
  }

  if (approval.whyApproval && (approval.summary?.requiresApproval || nextAction.blockerType === "approval-blocker")) {
    parts.push(approval.whyApproval);
  } else if (failure.failedWhat) {
    parts.push(failure.failedWhat);
  }

  if (nextAction.userFacingAction) {
    parts.push(`הצעד הבא הוא ${nextAction.userFacingAction}.`);
  }

  return parts.filter(Boolean).join(" ");
}

export function createExplanationAssembler({
  nextActionExplanation = null,
  failureExplanation = null,
  approvalExplanation = null,
  changeExplanation = null,
} = {}) {
  const normalizedNextActionExplanation = normalizeObject(nextActionExplanation);
  const normalizedFailureExplanation = normalizeObject(failureExplanation);
  const normalizedApprovalExplanation = normalizeObject(approvalExplanation);
  const normalizedChangeExplanation = normalizeObject(changeExplanation);

  return {
    projectExplanation: {
      explanationId: `project-explanation:${normalizedNextActionExplanation.explanationId ?? "unknown"}`,
      nextAction: normalizedNextActionExplanation,
      failure: normalizedFailureExplanation,
      approval: normalizedApprovalExplanation,
      change: normalizedChangeExplanation,
      headline: buildHeadline(
        normalizedNextActionExplanation,
        normalizedFailureExplanation,
        normalizedApprovalExplanation,
      ),
      userSummary: buildUserSummary(
        normalizedNextActionExplanation,
        normalizedFailureExplanation,
        normalizedApprovalExplanation,
        normalizedChangeExplanation,
      ),
      summary: {
        hasNextAction: Boolean(normalizedNextActionExplanation.explanationId),
        hasFailure: Boolean(normalizedFailureExplanation.explanationId),
        hasApproval: Boolean(normalizedApprovalExplanation.explanationId),
        hasChange: Boolean(normalizedChangeExplanation.explanationId),
      },
    },
  };
}
