// Task #58 — Create screen composition runtime
// Assembles a real renderable composition from screen model, layout plan,
// component mapping, and active state variant — ready for preview or live runtime.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function assembleRegionCompositions(layoutRegions, componentMappings, activeVariant) {
  const regions = normalizeArray(layoutRegions);
  const mappings = normalizeArray(componentMappings);
  const variantOverrides = normalizeObject(activeVariant.overrides);

  return regions.map((region) => {
    const norm = normalizeObject(region);
    const mapping = mappings.find((m) => {
      const nm = normalizeObject(m);
      return nm.regionId === norm.regionId || nm.slotKey === norm.slot;
    });
    const mappingNorm = normalizeObject(mapping);
    const override = variantOverrides[norm.regionId] ?? {};
    const overrideNorm = normalizeObject(override);

    return {
      regionId: norm.regionId,
      slot: norm.slot,
      order: norm.order ?? 1,
      component: overrideNorm.component ?? mappingNorm.resolvedComponent ?? "panel",
      isApproved: mappingNorm.isApproved ?? true,
      isVisible: overrideNorm.isVisible ?? true,
      isOptional: norm.isOptional ?? false,
      constraints: { ...normalizeObject(mappingNorm.constraints), ...overrideNorm.constraints },
    };
  });
}

export function createScreenCompositionRuntime({
  renderableScreenModel = null,
  layoutCompositionPlan = null,
  screenComponentMapping = null,
  activeScreenVariantPlan = null,
} = {}) {
  const model = normalizeObject(renderableScreenModel);
  const modelInner = normalizeObject(model.renderableScreenModel ?? model);

  const layout = normalizeObject(layoutCompositionPlan);
  const layoutInner = normalizeObject(layout.layoutCompositionPlan ?? layout);

  const mapping = normalizeObject(screenComponentMapping);
  const mappingInner = normalizeObject(mapping.screenComponentMapping ?? mapping);

  const variantPlan = normalizeObject(activeScreenVariantPlan);
  const variantInner = normalizeObject(variantPlan.activeScreenVariantPlan ?? variantPlan);

  const screenId = modelInner.screenId ?? layoutInner.screenId ?? "unknown";
  const compositionId = `composition:${screenId}:${variantInner.activeVariantKey ?? "default"}`;

  const regionCompositions = assembleRegionCompositions(
    layoutInner.regions,
    mappingInner.mappings,
    variantInner.activeVariant ?? {}
  );

  const visibleRegions = regionCompositions.filter((r) => r.isVisible);
  const isFullyApproved = regionCompositions.every((r) => r.isApproved);

  return {
    renderableScreenComposition: {
      compositionId,
      screenId,
      currentPhase: variantInner.currentPhase ?? modelInner.currentPhase ?? "populated",
      activeVariantKey: variantInner.activeVariantKey ?? "default",
      layoutType: layoutInner.layoutType ?? "single-column",
      sectionRhythm: layoutInner.sectionRhythm ?? "comfortable",
      regions: regionCompositions,
      designTokenRef: modelInner.designTokenRef ?? {},
      ctaAnchors: normalizeArray(modelInner.ctaAnchors),
      meta: {
        totalRegions: regionCompositions.length,
        visibleRegions: visibleRegions.length,
        isFullyApproved,
        isRenderable: isFullyApproved && visibleRegions.length > 0,
        hasOptionalRegions: regionCompositions.some((r) => r.isOptional),
      },
    },
  };
}
