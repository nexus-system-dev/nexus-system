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

  return template;
}

function normalizeScreenStates(screenStates) {
  if (!screenStates || typeof screenStates !== "object") {
    return { screens: [], summary: {} };
  }

  return {
    screens: Array.isArray(screenStates.screens) ? screenStates.screens : [],
    summary: screenStates.summary ?? {},
  };
}

function buildVariant(stateKey, stateDefinition, template) {
  return {
    variantId: `${template.templateId}:${stateKey}`,
    stateKey,
    enabled: Boolean(stateDefinition?.enabled),
    headline: stateDefinition?.headline ?? null,
    description: stateDefinition?.description ?? null,
    tone: stateDefinition?.tone ?? "neutral",
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
  const states = screenStateDefinition?.states ?? {};
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
    normalizedScreenStates.screens.map((screenStateDefinition) => [
      screenStateDefinition.screenType,
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
