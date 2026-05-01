function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeSections(sections) {
  return sections && typeof sections === "object" ? sections : {};
}

function normalizePrimaryAction(primaryAction) {
  if (!primaryAction || typeof primaryAction !== "object") {
    return null;
  }

  const actionId = normalizeString(primaryAction.actionId);
  const label = normalizeString(primaryAction.label);
  const intent = normalizeString(primaryAction.intent) ?? "primary";

  if (!actionId || !label) {
    return null;
  }

  return { actionId, label, intent };
}

function resolvePrimaryActionZone(templateType, sections) {
  if (templateType === "workflow") {
    return sections.footerActions?.enabled ? "footerActions" : null;
  }

  if (templateType === "detail") {
    if (sections.footerActions?.enabled) {
      return "footerActions";
    }

    return sections.topbar?.enabled ? "topbar" : null;
  }

  if (templateType === "dashboard" || templateType === "management") {
    return sections.topbar?.enabled ? "topbar" : null;
  }

  return sections.topbar?.enabled ? "topbar" : null;
}

export function createPrimaryActionValidator({
  screenId,
  screenContract,
  screenTemplate,
} = {}) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const normalizedScreenTemplate = normalizeScreenTemplate(screenTemplate);
  const normalizedScreenId = normalizeString(screenId);
  const normalizedScreenType = normalizeString(normalizedScreenContract.screenType);
  const normalizedTemplateType = normalizeString(normalizedScreenTemplate.templateType);
  const primaryAction = normalizePrimaryAction(normalizedScreenContract.primaryAction);
  const sections = normalizeSections(normalizedScreenTemplate.sections);
  const actionZone = resolvePrimaryActionZone(
    normalizedTemplateType ?? normalizedScreenType ?? "detail",
    sections,
  );
  const hasPrimaryAction = Boolean(primaryAction);
  const hasActionZone = Boolean(actionZone);
  const isValid = hasPrimaryAction && hasActionZone;

  return {
    primaryActionValidation: {
      validationId: `primary-action-validation:${normalizedScreenId ?? normalizedScreenType ?? "unknown"}`,
      screenId: normalizedScreenId,
      screenType: normalizedScreenType,
      templateType: normalizedTemplateType,
      primaryAction,
      actionZone,
      summary: {
        hasPrimaryAction,
        hasActionZone,
        isValid,
      },
      blockingIssues: [
        !hasPrimaryAction ? "missing-primary-action" : null,
        !hasActionZone ? "missing-primary-action-zone" : null,
      ].filter(Boolean),
    },
  };
}
