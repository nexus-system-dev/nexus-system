function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function buildSections(proposalPayload, proposalType) {
  const explicitSections = normalizeArray(proposalPayload.sections);
  if (explicitSections.length > 0) {
    return explicitSections.map((section, index) => {
      const normalizedSection = normalizeObject(section);

      return {
        sectionId: normalizedSection.sectionId ?? `section-${index + 1}`,
        sectionType: normalizedSection.sectionType ?? "custom",
        label: normalizeString(normalizedSection.label, `Section ${index + 1}`),
        status: normalizedSection.status ?? "proposed",
        isEditable: normalizedSection.isEditable ?? true,
        contentSummary: normalizeString(
          normalizedSection.contentSummary,
          normalizedSection.summary ?? `Editable ${proposalType} section`,
        ),
      };
    });
  }

  const recommendation = normalizeObject(proposalPayload.recommendationDisplay);
  const approval = normalizeObject(proposalPayload.approvalStatus);
  const sections = [
    {
      sectionId: "overview",
      sectionType: "section",
      label: "Overview",
      status: "proposed",
      isEditable: true,
      contentSummary: normalizeString(
        proposalPayload.headline,
        recommendation.headline ?? "Proposal overview",
      ),
    },
    {
      sectionId: "impact",
      sectionType: "section",
      label: "Impact",
      status: "proposed",
      isEditable: true,
      contentSummary: normalizeString(
        proposalPayload.expectedImpact,
        recommendation.expectedImpact ?? "Expected outcome is ready for review",
      ),
    },
  ];

  if (approval.status) {
    sections.push({
      sectionId: "approval",
      sectionType: "section",
      label: "Approval",
      status: approval.status,
      isEditable: true,
      contentSummary: normalizeString(
        approval.reason,
        approval.requiresApproval ? "Approval decision is still required" : "Approval is already satisfied",
      ),
    });
  }

  return sections;
}

function buildComponents(proposalPayload, sections) {
  const explicitComponents = normalizeArray(proposalPayload.components);
  if (explicitComponents.length > 0) {
    return explicitComponents.map((component, index) => {
      const normalizedComponent = normalizeObject(component);

      return {
        componentId: normalizedComponent.componentId ?? `component-${index + 1}`,
        sectionId: normalizedComponent.sectionId ?? sections[0]?.sectionId ?? "overview",
        componentType: normalizedComponent.componentType ?? "panel",
        status: normalizedComponent.status ?? "proposed",
        isEditable: normalizedComponent.isEditable ?? true,
        currentValue: normalizedComponent.currentValue ?? null,
        proposedValue: normalizedComponent.proposedValue ?? normalizedComponent.value ?? null,
      };
    });
  }

  const recommendation = normalizeObject(proposalPayload.recommendationDisplay);
  const nextTask = normalizeObject(proposalPayload.nextTaskPresentation);
  const alternatives = normalizeArray(recommendation.alternatives);

  return [
    {
      componentId: "headline",
      sectionId: "overview",
      componentType: "headline",
      status: "proposed",
      isEditable: true,
      currentValue: null,
      proposedValue: recommendation.headline ?? proposalPayload.headline ?? "Proposal headline",
    },
    {
      componentId: "primary-cta",
      sectionId: "impact",
      componentType: "next-action",
      status: "proposed",
      isEditable: true,
      currentValue: null,
      proposedValue: recommendation.primaryCta?.label ?? nextTask.expectedOutcome?.headline ?? "Review proposal",
    },
    {
      componentId: "alternatives",
      sectionId: "impact",
      componentType: "alternatives",
      status: alternatives.length > 0 ? "proposed" : "empty",
      isEditable: true,
      currentValue: null,
      proposedValue: alternatives,
    },
  ];
}

function buildCopyItems(proposalPayload, sections) {
  const explicitCopy = normalizeArray(proposalPayload.copy);
  if (explicitCopy.length > 0) {
    return explicitCopy.map((copyItem, index) => {
      const normalizedCopy = normalizeObject(copyItem);

      return {
        copyId: normalizedCopy.copyId ?? `copy-${index + 1}`,
        sectionId: normalizedCopy.sectionId ?? sections[0]?.sectionId ?? "overview",
        field: normalizedCopy.field ?? "body",
        label: normalizeString(normalizedCopy.label, "Copy"),
        currentText: normalizedCopy.currentText ?? null,
        proposedText: normalizedCopy.proposedText ?? normalizedCopy.text ?? "",
        isEditable: normalizedCopy.isEditable ?? true,
      };
    });
  }

  const recommendation = normalizeObject(proposalPayload.recommendationDisplay);

  return [
    {
      copyId: "headline-copy",
      sectionId: "overview",
      field: "headline",
      label: "Headline",
      currentText: null,
      proposedText: recommendation.headline ?? proposalPayload.headline ?? "Proposal headline",
      isEditable: true,
    },
    {
      copyId: "why-now-copy",
      sectionId: "overview",
      field: "whyNow",
      label: "Why now",
      currentText: null,
      proposedText: recommendation.whyNow ?? proposalPayload.whyNow ?? "Why this proposal matters now",
      isEditable: true,
    },
    {
      copyId: "impact-copy",
      sectionId: "impact",
      field: "expectedImpact",
      label: "Expected impact",
      currentText: null,
      proposedText: recommendation.expectedImpact ?? proposalPayload.expectedImpact ?? "Expected impact",
      isEditable: true,
    },
  ];
}

function buildNextAction(proposalPayload) {
  const explicitNextAction = normalizeObject(proposalPayload.nextAction);
  if (explicitNextAction.actionId || explicitNextAction.label) {
    return {
      actionId: explicitNextAction.actionId ?? "review-proposal",
      label: normalizeString(explicitNextAction.label, "Review proposal"),
      intent: explicitNextAction.intent ?? "review",
      requiresApproval: explicitNextAction.requiresApproval ?? false,
    };
  }

  const recommendation = normalizeObject(proposalPayload.recommendationDisplay);
  const nextTask = normalizeObject(proposalPayload.nextTaskPresentation);

  return {
    actionId: recommendation.primaryCta?.actionId ?? nextTask.selectedTask?.id ?? "review-proposal",
    label: normalizeString(
      recommendation.primaryCta?.label,
      nextTask.expectedOutcome?.headline ?? "Review proposal",
    ),
    intent: recommendation.primaryCta?.intent ?? "review",
    requiresApproval: nextTask.approvalState?.requiresApproval ?? false,
  };
}

export function defineEditableProposalSchema({
  proposalType = null,
  proposalPayload = null,
} = {}) {
  const normalizedPayload = normalizeObject(proposalPayload);
  const normalizedType = normalizeString(proposalType, normalizedPayload.proposalType ?? "generic-proposal");
  const sections = buildSections(normalizedPayload, normalizedType);
  const components = buildComponents(normalizedPayload, sections);
  const copy = buildCopyItems(normalizedPayload, sections);
  const nextAction = buildNextAction(normalizedPayload);
  const sourceId =
    normalizedPayload.sourceId
    ?? normalizedPayload.recommendationDisplay?.displayId
    ?? normalizedPayload.nextTaskPresentation?.presentationId
    ?? "unknown";

  return {
    editableProposal: {
      proposalId: `editable-proposal:${normalizedType}:${sourceId}`,
      proposalType: normalizedType,
      status: normalizedPayload.status ?? "proposed",
      sourceId,
      sections,
      components,
      copy,
      nextAction,
      editCapabilities: {
        section: true,
        component: true,
        copy: true,
        nextAction: true,
        partialApproval: true,
        rejection: true,
      },
      summary: {
        sectionCount: sections.length,
        componentCount: components.length,
        copyCount: copy.length,
        requiresApproval: nextAction.requiresApproval,
        supportsPartialAcceptance: true,
      },
    },
  };
}
