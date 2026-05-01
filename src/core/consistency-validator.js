function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
}

function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function normalizeComponentLibrary(componentLibrary) {
  return componentLibrary && typeof componentLibrary === "object" ? componentLibrary : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizePrimaryComponents(primaryComponents) {
  if (!Array.isArray(primaryComponents)) {
    return [];
  }

  return primaryComponents
    .filter((componentType) => typeof componentType === "string" && componentType.trim())
    .map((componentType) => componentType.trim());
}

function hasComponentType(componentLibrary, componentType) {
  const components = Array.isArray(componentLibrary.components) ? componentLibrary.components : [];
  return components.some(
    (component) =>
      component
      && typeof component === "object"
      && normalizeString(component.componentType) === componentType,
  );
}

export function createConsistencyValidator({
  screenId,
  screenTemplate,
  designTokens,
  componentLibrary,
} = {}) {
  const normalizedScreenTemplate = normalizeScreenTemplate(screenTemplate);
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const normalizedComponentLibrary = normalizeComponentLibrary(componentLibrary);
  const normalizedScreenId = normalizeString(screenId);
  const templateType = normalizeString(normalizedScreenTemplate.templateType);
  const requiredComponents = normalizePrimaryComponents(normalizedScreenTemplate.composition?.primaryComponents);
  const missingComponents = requiredComponents.filter((componentType) =>
    !hasComponentType(normalizedComponentLibrary, componentType),
  );
  const hasColorTokens = Boolean(normalizedDesignTokens.colors?.accent && normalizedDesignTokens.colors?.border);
  const hasSpacingTokens = Boolean(normalizedDesignTokens.spacing?.md && normalizedDesignTokens.spacing?.lg);
  const hasTemplateSections = Object.values(normalizedScreenTemplate.sections ?? {}).some((section) => section?.enabled);
  const isConsistent = hasColorTokens && hasSpacingTokens && hasTemplateSections && missingComponents.length === 0;

  return {
    consistencyValidation: {
      validationId: `consistency-validation:${normalizedScreenId ?? templateType ?? "unknown"}`,
      screenId: normalizedScreenId,
      templateType,
      summary: {
        hasColorTokens,
        hasSpacingTokens,
        hasTemplateSections,
        missingComponents,
        isConsistent,
      },
      blockingIssues: [
        !hasColorTokens ? "missing-color-tokens" : null,
        !hasSpacingTokens ? "missing-spacing-tokens" : null,
        !hasTemplateSections ? "missing-template-sections" : null,
        ...missingComponents.map((componentType) => `missing-component:${componentType}`),
      ].filter(Boolean),
    },
  };
}
