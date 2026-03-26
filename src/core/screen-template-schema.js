function normalizeScreenType(screenType) {
  return typeof screenType === "string" && screenType.trim()
    ? screenType.trim()
    : "workspace";
}

function buildRegions(screenType) {
  if (screenType === "dashboard") {
    return ["topbar", "sidebar", "summary-strip", "content-grid", "feedback-zone"];
  }

  if (screenType === "wizard") {
    return ["topbar", "stepper", "primary-content", "assistant-rail", "footer-actions"];
  }

  if (screenType === "tracking") {
    return ["topbar", "breadcrumb", "timeline-rail", "detail-panel", "activity-panel"];
  }

  if (screenType === "detail") {
    return ["topbar", "breadcrumb", "primary-content", "side-panel", "footer-actions"];
  }

  return ["topbar", "sidebar", "workspace-panels", "assistant-rail", "status-strip"];
}

function buildRequiredLibraries(screenType) {
  if (screenType === "dashboard") {
    return ["navigation", "data-display", "feedback", "layout"];
  }

  if (screenType === "wizard") {
    return ["navigation", "primitive", "feedback", "layout"];
  }

  if (screenType === "tracking") {
    return ["navigation", "data-display", "feedback", "layout"];
  }

  if (screenType === "detail") {
    return ["navigation", "data-display", "primitive", "layout"];
  }

  return ["navigation", "primitive", "layout", "feedback", "data-display"];
}

export function defineScreenTemplateSchema({
  screenType,
} = {}) {
  const normalizedScreenType = normalizeScreenType(screenType);
  const regions = buildRegions(normalizedScreenType);
  const requiredLibraries = buildRequiredLibraries(normalizedScreenType);

  return {
    screenTemplateSchema: {
      templateId: `screen-template:${normalizedScreenType}`,
      templateType: normalizedScreenType,
      regions,
      requiredLibraries,
      behavior: {
        supportsAssistant: normalizedScreenType === "workspace" || normalizedScreenType === "wizard",
        supportsPanels: normalizedScreenType !== "wizard",
        supportsBreadcrumb: normalizedScreenType === "detail" || normalizedScreenType === "tracking",
        supportsStatusStrip: normalizedScreenType === "workspace" || normalizedScreenType === "dashboard",
      },
      summary: {
        regionCount: regions.length,
        libraryCount: requiredLibraries.length,
        isWorkbenchCapable: normalizedScreenType === "workspace",
      },
    },
  };
}
