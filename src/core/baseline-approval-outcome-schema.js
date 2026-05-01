function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildOutcomeEntries({ items, selections, key, fallbackDecision = "pending" }) {
  const normalizedSelections = normalizeArray(selections);
  const selectionMap = new Map(
    normalizedSelections.map((entry) => {
      const normalizedEntry = normalizeObject(entry);
      return [normalizedEntry[key], normalizedEntry];
    }),
  );
  const normalizedItems = normalizeArray(items);
  const entries = normalizedItems.map((item) => {
    const normalizedItem = normalizeObject(item);
    const selection = selectionMap.get(normalizedItem[key]) ?? {};

    return {
      [key]: normalizedItem[key] ?? null,
      decision: selection.decision ?? normalizedItem.status ?? fallbackDecision,
      note: selection.note ?? null,
    };
  });

  for (const selection of normalizedSelections) {
    const normalizedSelection = normalizeObject(selection);
    const selectionId = normalizedSelection[key];
    if (!entries.some((entry) => entry[key] === selectionId)) {
      entries.push({
        [key]: selectionId ?? null,
        decision: normalizedSelection.decision ?? fallbackDecision,
        note: normalizedSelection.note ?? null,
      });
    }
  }

  return entries;
}

function resolveStatus({ approvalStatus, approvalRecords, partialAcceptanceSelection }) {
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedSelection = normalizeObject(partialAcceptanceSelection);
  const hasSelection =
    normalizeArray(normalizedSelection.sectionOutcomes ?? normalizedSelection.sections).length > 0
    || normalizeArray(normalizedSelection.componentOutcomes ?? normalizedSelection.components).length > 0
    || normalizeArray(normalizedSelection.copyOutcomes ?? normalizedSelection.copy).length > 0;

  if (normalizedApprovalStatus.status === "approved") {
    return "approved";
  }

  if (normalizedApprovalStatus.status === "rejected") {
    return "rejected";
  }

  if (hasSelection) {
    return "pending";
  }

  return normalizedApprovalStatus.status ?? "pending";
}

export function createBaselineApprovalOutcomeSchema({
  approvalRequest = null,
  approvalRecords = null,
  approvalStatus = null,
  partialAcceptanceSelection = null,
} = {}) {
  const normalizedApprovalRequest = normalizeObject(approvalRequest);
  const normalizedApprovalRecords = normalizeArray(approvalRecords);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedSelection = normalizeObject(partialAcceptanceSelection);

  const sectionOutcomes = buildOutcomeEntries({
    items: normalizedApprovalRequest.actionPayload?.sections,
    selections: normalizedSelection.sectionOutcomes ?? normalizedSelection.sections,
    key: "sectionId",
  });
  const componentOutcomes = buildOutcomeEntries({
    items: normalizedApprovalRequest.actionPayload?.components,
    selections: normalizedSelection.componentOutcomes ?? normalizedSelection.components,
    key: "componentId",
  });
  const copyOutcomes = buildOutcomeEntries({
    items: normalizedApprovalRequest.actionPayload?.copy,
    selections: normalizedSelection.copyOutcomes ?? normalizedSelection.copy,
    key: "copyId",
  });
  const status = resolveStatus({
    approvalStatus: normalizedApprovalStatus,
    approvalRecords: normalizedApprovalRecords,
    partialAcceptanceSelection: normalizedSelection,
  });

  return {
    approvalOutcome: {
      approvalOutcomeId: `approval-outcome:${normalizedApprovalRequest.approvalRequestId ?? "unknown-request"}`,
      approvalRequestId: normalizedApprovalRequest.approvalRequestId ?? null,
      status,
      sectionOutcomes,
      componentOutcomes,
      copyOutcomes,
      summary: {
        outcomeStatus: status,
        totalSections: sectionOutcomes.length,
        totalComponents: componentOutcomes.length,
        totalCopyItems: copyOutcomes.length,
        derivedFromRecords: normalizedApprovalRecords.length > 0,
      },
    },
  };
}
