function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function inferRiskSummary(approvalRequest, policyTrace, activeBottleneck) {
  const riskLevel = approvalRequest.riskContext?.riskLevel ?? "medium";
  const reason = approvalRequest.riskContext?.reason
    ?? policyTrace.reason
    ?? activeBottleneck.reason
    ?? "Approval is required for this action";

  return {
    riskLevel,
    reason,
  };
}

function humanizeApprovalReason(reason) {
  if (!reason) {
    return "צריך את האישור שלך לפני שממשיכים.";
  }

  return reason
    .replace("Recommended defaults are still provisional", "יש כמה הגדרות שעדיין דורשות את האישור שלך")
    .replace("Business defaults still need confirmation", "צריך לאשר את הגדרות העסק לפני שמתקדמים")
    .replace("Production deploy needs confirmation", "השינוי הזה דורש אישור לפני שנמשיך");
}

function inferNonApprovalOutcome(policyTrace, activeBottleneck) {
  if (activeBottleneck.blockerType === "approval-blocker") {
    return "בלי אישור, הפרויקט יישאר תקוע בשלב הזה או יעבור למסלול חלופי.";
  }

  if (policyTrace.finalDecision === "blocked") {
    return "בלי אישור, המדיניות תמשיך לעצור את הפעולה הזאת.";
  }

  return "בלי אישור, הפעולה הזאת לא תמשיך אוטומטית.";
}

export function createApprovalExplanationBuilder({
  approvalRequest = null,
  approvalStatus = null,
  policyTrace = null,
  activeBottleneck = null,
} = {}) {
  const normalizedApprovalRequest = normalizeObject(approvalRequest);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);
  const risk = inferRiskSummary(
    normalizedApprovalRequest,
    normalizedPolicyTrace,
    normalizedActiveBottleneck,
  );

  return {
    approvalExplanation: {
      explanationId: `approval-explanation:${normalizedApprovalRequest.approvalRequestId ?? "unknown"}`,
      approvalRequestId: normalizedApprovalRequest.approvalRequestId ?? null,
      whyApproval: humanizeApprovalReason(risk.reason),
      riskLevel: risk.riskLevel,
      whatIfRejected: inferNonApprovalOutcome(
        normalizedPolicyTrace,
        normalizedActiveBottleneck,
      ),
      summary: {
        finalDecision: normalizedPolicyTrace.finalDecision ?? "unknown",
        requiresApproval: normalizedApprovalStatus.status === "missing"
          || normalizedApprovalStatus.status === "pending"
          || (
            normalizedApprovalStatus.status == null
            && (
              normalizedPolicyTrace.requiresApproval === true
              || normalizedApprovalRequest.status === "pending"
            )
          ),
        blockerType: normalizedActiveBottleneck.blockerType ?? "none",
      },
    },
  };
}
