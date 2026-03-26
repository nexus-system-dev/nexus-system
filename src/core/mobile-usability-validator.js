function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
}

function normalizeMobileChecklist(mobileChecklist) {
  return mobileChecklist && typeof mobileChecklist === "object" ? mobileChecklist : {};
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
  const checklistItems = Array.isArray(normalizedMobileChecklist.checklistItems)
    ? normalizedMobileChecklist.checklistItems
    : [];
  const requiredItems = checklistItems.filter((item) => item.required);
  const sections = normalizedScreenTemplate.sections ?? {};
  const responsiveZone = resolveResponsiveZone(sections);
  const supportsMobile = normalizedMobileChecklist.supportsMobile !== false;
  const hasRequiredChecklist = requiredItems.length > 0;
  const handlesDenseRegions = responsiveZone !== null || normalizedScreenTemplate.templateType === "detail";
  const isUsable = supportsMobile && hasRequiredChecklist && handlesDenseRegions;

  return {
    mobileValidation: {
      validationId: `mobile-validation:${screenId ?? normalizedMobileChecklist.screenType ?? "unknown"}`,
      screenId: screenId ?? null,
      screenType: normalizedMobileChecklist.screenType ?? null,
      templateType: normalizedScreenTemplate.templateType ?? null,
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
