function normalizeTemplate(template, fallbackType) {
  if (!template || typeof template !== "object") {
    return {
      templateId: `${fallbackType}-template:unknown`,
      templateType: fallbackType,
      sections: {},
      composition: {},
      summary: {},
    };
  }

  return {
    templateId:
      typeof template.templateId === "string" && template.templateId.trim()
        ? template.templateId.trim()
        : `${fallbackType}-template:unknown`,
    templateType:
      typeof template.templateType === "string" && template.templateType.trim()
        ? template.templateType.trim()
        : fallbackType,
    sections: template.sections && typeof template.sections === "object" ? template.sections : {},
    composition: template.composition && typeof template.composition === "object" ? template.composition : {},
    summary: template.summary && typeof template.summary === "object" ? template.summary : {},
  };
}

function normalizeScreenStates(screenStates) {
  if (!screenStates || typeof screenStates !== "object") {
    return { screens: [], summary: {} };
  }

  return {
    screens: Array.isArray(screenStates.screens)
      ? screenStates.screens.filter((screenState) => screenState && typeof screenState === "object")
      : [],
    summary: screenStates.summary && typeof screenStates.summary === "object" ? screenStates.summary : {},
  };
}

function normalizeStateDefinition(stateDefinition) {
  return stateDefinition && typeof stateDefinition === "object" ? stateDefinition : {};
}

function buildVariant(stateKey, stateDefinition, template) {
  const normalizedStateDefinition = normalizeStateDefinition(stateDefinition);

  return {
    variantId: `${template.templateId}:${stateKey}`,
    stateKey,
    enabled: Boolean(normalizedStateDefinition.enabled),
    headline:
      typeof normalizedStateDefinition.headline === "string" && normalizedStateDefinition.headline.trim()
        ? normalizedStateDefinition.headline.trim()
        : null,
    description:
      typeof normalizedStateDefinition.description === "string" && normalizedStateDefinition.description.trim()
        ? normalizedStateDefinition.description.trim()
        : null,
    tone:
      typeof normalizedStateDefinition.tone === "string" && normalizedStateDefinition.tone.trim()
        ? normalizedStateDefinition.tone.trim()
        : "neutral",
    templateId: template.templateId,
    templateType: template.templateType,
    preservesSections: Object.keys(template.sections ?? {}).filter(
      (sectionKey) => template.sections?.[sectionKey]?.enabled,
    ),
    emphasisComponent:
      stateKey === "loading"
        ? "skeleton"
        : stateKey === "empty"
          ? "empty-state"
          : stateKey === "error"
            ? "error-state"
            : "banner",
  };
}

function buildTemplateVariantEntry(template, screenStateDefinition) {
  const states =
    screenStateDefinition?.states && typeof screenStateDefinition.states === "object"
      ? screenStateDefinition.states
      : {};
  const variantStates = ["loading", "empty", "error", "success"];

  return {
    templateId: template.templateId,
    templateType: template.templateType,
    variants: variantStates.map((stateKey) =>
      buildVariant(stateKey, states[stateKey], template),
    ),
    summary: {
      supportedStates: variantStates.filter((stateKey) => Boolean(states[stateKey]?.enabled)),
      enabledVariantCount: variantStates.filter((stateKey) => Boolean(states[stateKey]?.enabled)).length,
    },
  };
}

export function createStateDrivenTemplateVariants({
  screenStates,
  screenTemplates,
} = {}) {
  const normalizedScreenStates = normalizeScreenStates(screenStates);
  const normalizedTemplates = {
    dashboard: normalizeTemplate(screenTemplates?.dashboardTemplate, "dashboard"),
    detail: normalizeTemplate(screenTemplates?.detailPageTemplate, "detail"),
    workflow: normalizeTemplate(screenTemplates?.workflowTemplate, "workflow"),
    management: normalizeTemplate(screenTemplates?.managementTemplate, "management"),
  };

  const stateIndex = new Map(
    normalizedScreenStates.screens
      .filter(
        (screenStateDefinition) =>
          typeof screenStateDefinition.screenType === "string" && screenStateDefinition.screenType.trim(),
      )
      .map((screenStateDefinition) => [
        screenStateDefinition.screenType.trim(),
        screenStateDefinition,
      ]),
  );

  const templates = Object.values(normalizedTemplates).map((template) =>
    buildTemplateVariantEntry(template, stateIndex.get(template.templateType)),
  );

  return {
    templateVariants: {
      variantCollectionId: `template-variants:${templates.length}`,
      templates,
      summary: {
        totalTemplates: templates.length,
        totalVariants: templates.reduce((total, template) => total + template.variants.length, 0),
        enabledVariants: templates.reduce(
          (total, template) => total + template.variants.filter((variant) => variant.enabled).length,
          0,
        ),
      },
    },
  };
}
