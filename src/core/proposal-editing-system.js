function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function mergeByKey(items, edits, key) {
  const editMap = new Map(
    normalizeArray(edits).map((item) => {
      const normalizedItem = normalizeObject(item);
      return [normalizedItem[key], normalizedItem];
    }),
  );

  return normalizeArray(items).map((item) => {
    const normalizedItem = normalizeObject(item);
    const patch = editMap.get(normalizedItem[key]) ?? {};

    return {
      ...normalizedItem,
      ...patch,
    };
  });
}

function buildAnnotations(userEditInput) {
  return normalizeArray(userEditInput.annotations).map((annotation, index) => {
    const normalizedAnnotation = normalizeObject(annotation);

    return {
      annotationId: normalizedAnnotation.annotationId ?? `annotation-${index + 1}`,
      targetType: normalizedAnnotation.targetType ?? "section",
      targetId: normalizedAnnotation.targetId ?? "overview",
      note: normalizedAnnotation.note ?? normalizedAnnotation.comment ?? "User requested a revision",
      severity: normalizedAnnotation.severity ?? "info",
    };
  });
}

function buildEditedProposal(editableProposal, userEditInput, annotations) {
  const normalizedProposal = normalizeObject(editableProposal);
  const normalizedInput = normalizeObject(userEditInput);
  const revisionNumber = Number.isFinite(normalizedInput.revisionNumber) ? normalizedInput.revisionNumber : 1;

  const sections = mergeByKey(normalizedProposal.sections, normalizedInput.sectionEdits, "sectionId").map((section) => ({
    ...section,
    status: section.status ?? "revised",
  }));
  const components = mergeByKey(normalizedProposal.components, normalizedInput.componentEdits, "componentId");
  const copy = mergeByKey(normalizedProposal.copy, normalizedInput.copyEdits, "copyId");
  const nextAction = {
    ...normalizeObject(normalizedProposal.nextAction),
    ...normalizeObject(normalizedInput.nextActionEdit),
  };

  return {
    editedProposal: {
      ...normalizedProposal,
      proposalId: normalizedProposal.proposalId ?? "editable-proposal:unknown",
      revisionId: `${normalizedProposal.proposalId ?? "editable-proposal:unknown"}:revision-${revisionNumber}`,
      revisionNumber,
      status: normalizedInput.status ?? (annotations.length > 0 ? "revised" : normalizedProposal.status ?? "proposed"),
      sections,
      components,
      copy,
      nextAction,
      annotations,
      summary: {
        ...normalizeObject(normalizedProposal.summary),
        revisionNumber,
        annotationCount: annotations.length,
        hasUserEdits:
          annotations.length > 0
          || normalizeArray(normalizedInput.sectionEdits).length > 0
          || normalizeArray(normalizedInput.componentEdits).length > 0
          || normalizeArray(normalizedInput.copyEdits).length > 0
          || Boolean(normalizedInput.nextActionEdit),
      },
    },
  };
}

function buildProposalEditHistory(editableProposal, editedProposal, userEditInput, annotations) {
  const normalizedProposal = normalizeObject(editableProposal);
  const normalizedEditedProposal = normalizeObject(editedProposal);
  const normalizedInput = normalizeObject(userEditInput);
  const baseProposalId = normalizedProposal.proposalId ?? "editable-proposal:unknown";
  const previousHistory = normalizeArray(normalizedInput.previousHistory);
  const baselineEntry = {
    entryId: `${baseProposalId}:history-0`,
    revisionNumber: 0,
    action: "created",
    proposalId: baseProposalId,
    annotationCount: 0,
  };
  const currentEntry = {
    entryId: `${baseProposalId}:history-${normalizedEditedProposal.revisionNumber ?? 1}`,
    revisionNumber: normalizedEditedProposal.revisionNumber ?? 1,
    action: annotations.length > 0 ? "revised-with-annotations" : "revised",
    proposalId: baseProposalId,
    annotationCount: annotations.length,
  };

  return {
    proposalEditHistory: {
      historyId: `proposal-edit-history:${baseProposalId}`,
      proposalId: baseProposalId,
      entries: previousHistory.length > 0 ? [...previousHistory, currentEntry] : [baselineEntry, currentEntry],
      latestRevisionId: normalizedEditedProposal.revisionId ?? null,
      summary: {
        totalRevisions: previousHistory.length > 0 ? previousHistory.length + 1 : 2,
        annotationCount: annotations.length,
        preservesHistory: true,
      },
    },
  };
}

export function createProposalEditingSystem({
  editableProposal = null,
  userEditInput = null,
} = {}) {
  const normalizedProposal = normalizeObject(editableProposal);
  const normalizedInput = normalizeObject(userEditInput);
  const annotations = buildAnnotations(normalizedInput);
  const { editedProposal } = buildEditedProposal(normalizedProposal, normalizedInput, annotations);
  const { proposalEditHistory } = buildProposalEditHistory(
    normalizedProposal,
    editedProposal,
    normalizedInput,
    annotations,
  );

  return {
    editedProposal,
    proposalEditHistory,
  };
}
