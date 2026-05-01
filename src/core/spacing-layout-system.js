function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function resolveStringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeSpacing(spacing) {
  return spacing && typeof spacing === "object" ? spacing : {};
}

function resolvePositiveNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createSpacingAndLayoutSystem({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const spacing = normalizeSpacing(normalizedDesignTokens.spacing);
  const layoutSystemIdSuffix = resolveStringValue(normalizedDesignTokens.tokenSetId, "nexus");
  const spacingScale = {
    xs: resolvePositiveNumber(spacing.xs, 4),
    sm: resolvePositiveNumber(spacing.sm, 8),
    md: resolvePositiveNumber(spacing.md, 12),
    lg: resolvePositiveNumber(spacing.lg, 20),
    xl: resolvePositiveNumber(spacing.xl, 32),
    xxl: resolvePositiveNumber(spacing.xxl, 48),
  };

  return {
    layoutSystem: {
      layoutSystemId: `layout-system:${layoutSystemIdSuffix}`,
      grid: {
        columns: 12,
        gutter: spacingScale.lg,
        maxContentWidth: 1280,
        workbenchMinWidth: 1180,
      },
      spacingScale,
      containerWidths: {
        compact: 640,
        standard: 960,
        wide: 1280,
        fullWorkbench: 1440,
      },
      sectionRhythm: {
        pageTop: spacingScale.xxl,
        sectionGap: spacingScale.xl,
        panelGap: spacingScale.lg,
        contentGap: spacingScale.md,
      },
      summary: {
        desktopFirst: true,
        supportsWorkbenchDensity: true,
        totalContainers: 4,
      },
    },
  };
}
