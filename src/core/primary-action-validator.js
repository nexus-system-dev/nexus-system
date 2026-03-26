function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
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
  const primaryAction = normalizedScreenContract.primaryAction ?? null;
  const sections = normalizedScreenTemplate.sections ?? {};
  const actionZone = resolvePrimaryActionZone(
    normalizedScreenTemplate.templateType ?? normalizedScreenContract.screenType ?? "detail",
    sections,
  );
  const hasPrimaryAction = Boolean(primaryAction?.actionId && primaryAction?.label);
  const hasActionZone = Boolean(actionZone);
  const isValid = hasPrimaryAction && hasActionZone;

  return {
    primaryActionValidation: {
      validationId: `primary-action-validation:${screenId ?? normalizedScreenContract.screenType ?? "unknown"}`,
      screenId: screenId ?? null,
      screenType: normalizedScreenContract.screenType ?? null,
      templateType: normalizedScreenTemplate.templateType ?? null,
      primaryAction: primaryAction
        ? {
          actionId: primaryAction.actionId,
          label: primaryAction.label,
          intent: primaryAction.intent ?? "primary",
        }
        : null,
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
