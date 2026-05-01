function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
}

function normalizeMobileChecklist(mobileChecklist) {
  return mobileChecklist && typeof mobileChecklist === "object" ? mobileChecklist : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeSections(sections) {
  return sections && typeof sections === "object" ? sections : {};
}

function normalizeChecklistItems(checklistItems) {
  if (!Array.isArray(checklistItems)) {
    return [];
  }

  return checklistItems.filter((item) => item && typeof item === "object");
}

function resolveResponsiveZone(sections) {
  if (sections.sidebar?.enabled) {
    return "sidebar";
  }

  if (sections.assistantRail?.enabled) {
    return "assistantRail";
  }

  if (sections.sidePanel?.enabled) {
    return "sidePanel";
  }

  if (sections.filterBar?.enabled) {
    return "filterBar";
  }

  return null;
}

export function createMobileUsabilityValidator({
  screenId,
  screenTemplate,
  mobileChecklist,
} = {}) {
  const normalizedScreenTemplate = normalizeScreenTemplate(screenTemplate);
  const normalizedMobileChecklist = normalizeMobileChecklist(mobileChecklist);
  const normalizedScreenId = normalizeString(screenId);
  const normalizedScreenType = normalizeString(normalizedMobileChecklist.screenType);
  const normalizedTemplateType = normalizeString(normalizedScreenTemplate.templateType);
  const checklistItems = normalizeChecklistItems(normalizedMobileChecklist.checklistItems);
  const requiredItems = checklistItems.filter((item) => item.required);
  const sections = normalizeSections(normalizedScreenTemplate.sections);
  const responsiveZone = resolveResponsiveZone(sections);
  const supportsMobile = normalizedMobileChecklist.supportsMobile !== false;
  const hasRequiredChecklist = requiredItems.length > 0;
  const handlesDenseRegions = responsiveZone !== null || normalizedTemplateType === "detail";
  const isUsable = supportsMobile && hasRequiredChecklist && handlesDenseRegions;

  return {
    mobileValidation: {
      validationId: `mobile-validation:${normalizedScreenId ?? normalizedScreenType ?? "unknown"}`,
      screenId: normalizedScreenId,
      screenType: normalizedScreenType,
      templateType: normalizedTemplateType,
      responsiveZone,
      summary: {
        supportsMobile,
        hasRequiredChecklist,
        handlesDenseRegions,
        isUsable,
      },
      blockingIssues: [
        !supportsMobile ? "mobile-disabled" : null,
        !hasRequiredChecklist ? "missing-mobile-checklist" : null,
        !handlesDenseRegions ? "missing-responsive-zone" : null,
      ].filter(Boolean),
    },
  };
}
