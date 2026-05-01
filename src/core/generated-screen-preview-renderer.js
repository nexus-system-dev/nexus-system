// Task #60 — Create generated screen preview renderer
// Builds a preview renderer that presents real renderable compositions from the
// runtime inside the frontend before adoption or live activation.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveTokenValues(designTokens) {
  const tokens = normalizeObject(designTokens);
  return {
    primaryColor: tokens.primaryColor ?? tokens.colors?.primary ?? "#0057FF",
    backgroundColor: tokens.backgroundColor ?? tokens.colors?.background ?? "#FFFFFF",
    textColor: tokens.textColor ?? tokens.colors?.text ?? "#1A1A1A",
    fontFamily: tokens.fontFamily ?? tokens.typography?.fontFamily ?? "system-ui",
    baseFontSize: tokens.baseFontSize ?? tokens.typography?.baseSize ?? 16,
    borderRadius: tokens.borderRadius ?? tokens.spacing?.borderRadius ?? 4,
    spacingUnit: tokens.spacingUnit ?? tokens.spacing?.unit ?? 8,
  };
}

function buildPreviewRegions(compositionRegions, layoutSystem, colorRules) {
  const regions = normalizeArray(compositionRegions);
  const layout = normalizeObject(layoutSystem);
  const colors = normalizeObject(colorRules);

  return regions
    .filter((r) => normalizeObject(r).isVisible !== false)
    .sort((a, b) => (normalizeObject(a).order ?? 0) - (normalizeObject(b).order ?? 0))
    .map((region) => {
      const norm = normalizeObject(region);
      const colorRole = colors[norm.component] ?? colors.default ?? {};
      return {
        regionId: norm.regionId,
        slot: norm.slot,
        component: norm.component ?? "panel",
        order: norm.order ?? 1,
        previewStyles: {
          backgroundColor: normalizeObject(colorRole).background ?? "transparent",
          borderColor: normalizeObject(colorRole).border ?? "transparent",
          minHeight: layout.minRegionHeight ?? 40,
          padding: layout.regionPadding ?? 16,
        },
        isApproved: norm.isApproved ?? true,
        constraints: normalizeObject(norm.constraints),
      };
    });
}

export function createGeneratedScreenPreviewRenderer({
  renderableScreenComposition = null,
  designTokens = null,
  layoutSystem = null,
  colorRules = null,
} = {}) {
  const composition = normalizeObject(renderableScreenComposition);
  const compInner = normalizeObject(composition.renderableScreenComposition ?? composition);

  const tokens = resolveTokenValues(normalizeObject(designTokens));
  const layout = normalizeObject(layoutSystem);
  const colors = normalizeObject(colorRules);

  const previewRegions = buildPreviewRegions(compInner.regions, layout, colors);
  const ctaAnchors = normalizeArray(compInner.ctaAnchors);

  const isPreviewable = compInner.meta?.isRenderable ?? previewRegions.length > 0;

  return {
    previewScreenViewModel: {
      viewModelId: `preview:${compInner.compositionId ?? compInner.screenId ?? "unknown"}`,
      screenId: compInner.screenId ?? null,
      compositionId: compInner.compositionId ?? null,
      currentPhase: compInner.currentPhase ?? "populated",
      activeVariantKey: compInner.activeVariantKey ?? "default",
      layoutType: compInner.layoutType ?? "single-column",
      sectionRhythm: compInner.sectionRhythm ?? "comfortable",
      regions: previewRegions,
      tokens,
      ctaAnchors: ctaAnchors.map((cta, index) => ({
        ctaId: normalizeObject(cta).ctaId ?? `cta-${index + 1}`,
        label: normalizeObject(cta).label ?? "Action",
        anchor: normalizeObject(cta).anchor ?? "secondary",
        actionIntent: normalizeObject(cta).actionIntent ?? null,
        isVisible: normalizeObject(cta).isVisible ?? true,
        isDisabled: normalizeObject(cta).isDisabled ?? false,
        previewStyles: {
          backgroundColor: tokens.primaryColor,
          color: tokens.backgroundColor,
        },
      })),
      meta: {
        isPreviewable,
        regionCount: previewRegions.length,
        hasCtaAnchors: ctaAnchors.length > 0,
        isFullyApproved: previewRegions.every((r) => r.isApproved),
        previewMode: "generated",
      },
    },
  };
}
