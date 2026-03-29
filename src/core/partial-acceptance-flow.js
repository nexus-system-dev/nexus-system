function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toDecisionSet(items, key, fallbackStatus = "pending") {
  return new Map(
    normalizeArray(items).map((item) => {
      const normalizedItem = normalizeObject(item);
      return [
        normalizedItem[key],
        {
          id: normalizedItem[key],
          decision: normalizedItem.decision ?? normalizedItem.status ?? fallbackStatus,
          note: normalizedItem.note ?? null,
        },
      ];
    }),
  );
}

function classifyDecision(decision) {
  if (["approved", "accepted", "keep"].includes(decision)) {
    return "approved";
  }

  if (["rejected", "declined", "drop"].includes(decision)) {
    return "rejected";
  }

  return "needs-review";
}

function resolveItems(items, decisions, key) {
  const approved = [];
  const rejected = [];
  const remaining = [];

  for (const item of normalizeArray(items)) {
    const normalizedItem = normalizeObject(item);
    const decisionEntry = decisions.get(normalizedItem[key]);
    const normalizedDecision = classifyDecision(decisionEntry?.decision ?? normalizedItem.status ?? "pending");
    const enrichedItem = {
      ...normalizedItem,
      decision: normalizedDecision,
      decisionNote: decisionEntry?.note ?? null,
    };

    if (normalizedDecision === "approved") {
      approved.push(enrichedItem);
      continue;
    }

    if (normalizedDecision === "rejected") {
      rejected.push(enrichedItem);
      continue;
    }

    remaining.push(enrichedItem);
  }

  return {
    approved,
    rejected,
    remaining,
  };
}

function buildRemainingProposalScope(editedProposal, sectionResolution, componentResolution, copyResolution) {
  const normalizedProposal = normalizeObject(editedProposal);
  const nextAction = normalizeObject(normalizedProposal.nextAction);

  return {
    remainingProposalScope: {
      scopeId: `remaining-proposal-scope:${normalizedProposal.revisionId ?? normalizedProposal.proposalId ?? "unknown"}`,
      proposalId: normalizedProposal.proposalId ?? null,
      revisionId: normalizedProposal.revisionId ?? null,
      sectionsNeedingReview: sectionResolution.remaining,
      rejectedSections: sectionResolution.rejected,
      componentsNeedingRegeneration: componentResolution.rejected,
      copyNeedingReview: copyResolution.remaining,
      nextAction:
        nextAction.requiresApproval && sectionResolution.remaining.length === 0 && componentResolution.remaining.length === 0
          ? { ...nextAction, status: "ready-after-partial-acceptance" }
          : { ...nextAction, status: "awaiting-follow-up" },
      summary: {
        remainingSectionCount: sectionResolution.remaining.length,
        rejectedSectionCount: sectionResolution.rejected.length,
        remainingComponentCount: componentResolution.remaining.length + componentResolution.rejected.length,
        remainingCopyCount: copyResolution.remaining.length,
      },
    },
  };
}

export function createPartialAcceptanceFlow({
  editedProposal = null,
  approvalOutcome = null,
} = {}) {
  const normalizedProposal = normalizeObject(editedProposal);
  const normalizedOutcome = normalizeObject(approvalOutcome);
  const sectionDecisions = toDecisionSet(
    normalizedOutcome.sectionOutcomes ?? normalizedOutcome.sections,
    "sectionId",
  );
  const componentDecisions = toDecisionSet(
    normalizedOutcome.componentOutcomes ?? normalizedOutcome.components,
    "componentId",
  );
  const copyDecisions = toDecisionSet(
    normalizedOutcome.copyOutcomes ?? normalizedOutcome.copy,
    "copyId",
  );

  const sectionResolution = resolveItems(normalizedProposal.sections, sectionDecisions, "sectionId");
  const componentResolution = resolveItems(normalizedProposal.components, componentDecisions, "componentId");
  const copyResolution = resolveItems(normalizedProposal.copy, copyDecisions, "copyId");
  const totalApproved =
    sectionResolution.approved.length + componentResolution.approved.length + copyResolution.approved.length;
  const totalRemaining =
    sectionResolution.remaining.length
    + componentResolution.remaining.length
    + componentResolution.rejected.length
    + copyResolution.remaining.length
    + sectionResolution.rejected.length;

  const { remainingProposalScope } = buildRemainingProposalScope(
    normalizedProposal,
    sectionResolution,
    componentResolution,
    copyResolution,
  );

  return {
    partialAcceptanceDecision: {
      decisionId: `partial-acceptance:${normalizedProposal.revisionId ?? normalizedProposal.proposalId ?? "unknown"}`,
      proposalId: normalizedProposal.proposalId ?? null,
      revisionId: normalizedProposal.revisionId ?? null,
      status:
        totalRemaining === 0
          ? "fully-accepted"
          : totalApproved > 0
            ? "partially-accepted"
            : "needs-regeneration",
      approvedSections: sectionResolution.approved,
      rejectedSections: sectionResolution.rejected,
      approvedComponents: componentResolution.approved,
      rejectedComponents: componentResolution.rejected,
      approvedCopy: copyResolution.approved,
      remainingCopy: copyResolution.remaining,
      followUpAction:
        totalRemaining === 0
          ? "proceed"
          : totalApproved > 0
            ? "regenerate-rejected-scope"
            : "review-full-proposal",
      summary: {
        approvedCount: totalApproved,
        remainingCount: totalRemaining,
        canProceed: totalRemaining === 0,
        requiresRegeneration: totalRemaining > 0,
      },
    },
    remainingProposalScope,
  };
}
