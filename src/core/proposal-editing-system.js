function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeRevisionNumber(value) {
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : 1;
}

function mergeByKey(items, edits, key) {
  const editMap = new Map(
    normalizeArray(edits)
      .map((item) => {
        const normalizedItem = normalizeObject(item);
        const normalizedKey = normalizeString(normalizedItem[key], null);
        return normalizedKey ? [normalizedKey, normalizedItem] : null;
      })
      .filter(Boolean),
  );

  return normalizeArray(items).map((item) => {
    const normalizedItem = normalizeObject(item);
    const normalizedKey = normalizeString(normalizedItem[key], null);
    const patch = normalizedKey ? editMap.get(normalizedKey) ?? {} : {};

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
      annotationId: normalizeString(normalizedAnnotation.annotationId, `annotation-${index + 1}`),
      targetType: normalizeString(normalizedAnnotation.targetType, "section"),
      targetId: normalizeString(normalizedAnnotation.targetId, "overview"),
      note: normalizeString(
        normalizedAnnotation.note,
        normalizeString(normalizedAnnotation.comment, "User requested a revision"),
      ),
      severity: normalizeString(normalizedAnnotation.severity, "info"),
    };
  });
}

function normalizeSections(sections) {
  return normalizeArray(sections).map((section, index) => {
    const normalizedSection = normalizeObject(section);
    return {
      ...normalizedSection,
      sectionId: normalizeString(normalizedSection.sectionId, `section-${index + 1}`),
      sectionType: normalizeString(normalizedSection.sectionType, "custom"),
      label: normalizeString(normalizedSection.label, `Section ${index + 1}`),
      status: normalizeString(normalizedSection.status, "revised"),
      contentSummary: normalizeString(
        normalizedSection.contentSummary,
        normalizeString(normalizedSection.summary, "Editable proposal section"),
      ),
    };
  });
}

function normalizeComponents(components, sections) {
  const fallbackSectionId = sections[0]?.sectionId ?? "overview";
  return normalizeArray(components).map((component, index) => {
    const normalizedComponent = normalizeObject(component);
    return {
      ...normalizedComponent,
      componentId: normalizeString(normalizedComponent.componentId, `component-${index + 1}`),
      sectionId: normalizeString(normalizedComponent.sectionId, fallbackSectionId),
      componentType: normalizeString(normalizedComponent.componentType, "panel"),
      status: normalizeString(normalizedComponent.status, "proposed"),
    };
  });
}

function normalizeCopyItems(copyItems, sections) {
  const fallbackSectionId = sections[0]?.sectionId ?? "overview";
  return normalizeArray(copyItems).map((copyItem, index) => {
    const normalizedCopyItem = normalizeObject(copyItem);
    return {
      ...normalizedCopyItem,
      copyId: normalizeString(normalizedCopyItem.copyId, `copy-${index + 1}`),
      sectionId: normalizeString(normalizedCopyItem.sectionId, fallbackSectionId),
      field: normalizeString(normalizedCopyItem.field, "body"),
      label: normalizeString(normalizedCopyItem.label, "Copy"),
      proposedText: normalizeString(
        normalizedCopyItem.proposedText,
        normalizeString(normalizedCopyItem.text, ""),
      ),
    };
  });
}

function normalizeNextAction(nextAction) {
  const normalizedNextAction = normalizeObject(nextAction);
  return {
    ...normalizedNextAction,
    actionId: normalizeString(normalizedNextAction.actionId, "review-proposal"),
    label: normalizeString(normalizedNextAction.label, "Review proposal"),
    intent: normalizeString(normalizedNextAction.intent, "review"),
  };
}

function normalizeHistoryEntries(entries, baseProposalId) {
  return normalizeArray(entries).map((entry, index) => {
    const normalizedEntry = normalizeObject(entry);
    const revisionNumber = normalizeRevisionNumber(normalizedEntry.revisionNumber ?? index + 1);
    return {
      ...normalizedEntry,
      entryId: normalizeString(
        normalizedEntry.entryId,
        `${baseProposalId}:history-${revisionNumber}`,
      ),
      revisionNumber,
      action: normalizeString(normalizedEntry.action, "revised"),
      proposalId: normalizeString(normalizedEntry.proposalId, baseProposalId),
      annotationCount: Number.isFinite(normalizedEntry.annotationCount) ? normalizedEntry.annotationCount : 0,
    };
  });
}

function buildEditedProposal(editableProposal, userEditInput, annotations) {
  const normalizedProposal = normalizeObject(editableProposal);
  const normalizedInput = normalizeObject(userEditInput);
  const proposalId = normalizeString(normalizedProposal.proposalId, "editable-proposal:unknown");
  const revisionNumber = normalizeRevisionNumber(normalizedInput.revisionNumber);

  const sections = normalizeSections(
    mergeByKey(normalizedProposal.sections, normalizedInput.sectionEdits, "sectionId").map((section) => ({
      ...section,
      status: section.status ?? "revised",
    })),
  );
  const components = normalizeComponents(
    mergeByKey(normalizedProposal.components, normalizedInput.componentEdits, "componentId"),
    sections,
  );
  const copy = normalizeCopyItems(
    mergeByKey(normalizedProposal.copy, normalizedInput.copyEdits, "copyId"),
    sections,
  );
  const nextAction = normalizeNextAction({
    ...normalizeObject(normalizedProposal.nextAction),
    ...normalizeObject(normalizedInput.nextActionEdit),
  });

  return {
    editedProposal: {
      ...normalizedProposal,
      proposalId,
      revisionId: `${proposalId}:revision-${revisionNumber}`,
      revisionNumber,
      status: normalizeString(
        normalizedInput.status,
        annotations.length > 0 ? "revised" : normalizeString(normalizedProposal.status, "proposed"),
      ),
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
  const baseProposalId = normalizeString(normalizedProposal.proposalId, "editable-proposal:unknown");
  const previousHistory = normalizeHistoryEntries(normalizedInput.previousHistory, baseProposalId);
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
