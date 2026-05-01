// Task #54 — Define renderable screen model schema
// Canonical schema that aggregates screen contract, template, states, CTA anchors,
// and component boundaries into a single object the runtime can consume.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

const VALID_SCREEN_PHASES = new Set(["loading", "empty", "populated", "error", "success"]);
const VALID_CTA_ANCHORS = new Set(["primary", "secondary", "destructive", "ghost"]);

function resolveScreenPhase(screenStates) {
  const normalized = normalizeObject(screenStates);
  const phase = normalized.phase ?? normalized.currentPhase ?? "populated";
  return VALID_SCREEN_PHASES.has(phase) ? phase : "populated";
}

function buildCtaAnchors(contractCtaDefinitions) {
  return normalizeArray(contractCtaDefinitions)
    .filter((cta) => {
      const norm = normalizeObject(cta);
      return typeof norm.label === "string" && norm.label.trim().length > 0;
    })
    .map((cta, index) => {
      const norm = normalizeObject(cta);
      const anchor = norm.anchor ?? norm.type ?? "secondary";
      return {
        ctaId: norm.ctaId ?? `cta-${index + 1}`,
        label: norm.label.trim(),
        anchor: VALID_CTA_ANCHORS.has(anchor) ? anchor : "secondary",
        actionIntent: norm.actionIntent ?? norm.action ?? null,
        isVisible: norm.isVisible ?? true,
        isDisabled: norm.isDisabled ?? false,
      };
    });
}

function buildComponentBoundaries(componentContract) {
  const normalized = normalizeObject(componentContract);
  const regions = normalizeArray(normalized.regions ?? normalized.componentRegions);
  return regions.map((region, index) => {
    const norm = normalizeObject(region);
    return {
      regionId: norm.regionId ?? `region-${index + 1}`,
      componentType: norm.componentType ?? "panel",
      slotKey: norm.slotKey ?? norm.slot ?? null,
      isRequired: norm.isRequired ?? false,
      constraints: normalizeObject(norm.constraints),
    };
  });
}

function buildTemplateVariantIndex(templateVariants) {
  const variants = normalizeArray(templateVariants);
  const index = {};
  for (const variant of variants) {
    const norm = normalizeObject(variant);
    if (typeof norm.variantKey === "string" && norm.variantKey.trim()) {
      index[norm.variantKey.trim()] = {
        variantKey: norm.variantKey.trim(),
        templateId: norm.templateId ?? null,
        conditions: normalizeArray(norm.conditions),
        overrides: normalizeObject(norm.overrides),
      };
    }
  }
  return index;
}

export function defineRenderableScreenModel({
  screenContract = null,
  screenTemplateSchema = null,
  screenStates = null,
  templateVariants = null,
  designTokens = null,
  componentContract = null,
} = {}) {
  const contract = normalizeObject(screenContract);
  const template = normalizeObject(screenTemplateSchema);
  const tokens = normalizeObject(designTokens);

  const screenId = contract.screenId ?? contract.id ?? "screen:unknown";
  const screenType = contract.screenType ?? contract.type ?? "detail";
  const title = normalizeString(contract.title ?? contract.screenTitle, screenType);

  return {
    renderableScreenModel: {
      modelId: `renderable:${screenId}`,
      screenId,
      screenType,
      title,
      currentPhase: resolveScreenPhase(screenStates),
      template: {
        templateId: template.templateId ?? template.id ?? null,
        layoutKey: template.layoutKey ?? template.layout ?? "default",
        sections: normalizeArray(template.sections),
      },
      ctaAnchors: buildCtaAnchors(contract.ctaDefinitions ?? contract.ctas),
      componentBoundaries: buildComponentBoundaries(componentContract),
      templateVariantIndex: buildTemplateVariantIndex(templateVariants),
      designTokenRef: {
        tokenSetId: tokens.tokenSetId ?? tokens.id ?? null,
        colorScheme: tokens.colorScheme ?? "default",
        typographyScale: tokens.typographyScale ?? "base",
      },
      meta: {
        isRenderable: true,
        requiresStateResolution: normalizeArray(templateVariants).length > 0,
        hasCtaAnchors: (contract.ctaDefinitions ?? contract.ctas ?? []).length > 0,
      },
    },
  };
}
