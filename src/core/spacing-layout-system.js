function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

export function createSpacingAndLayoutSystem({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const spacing = normalizedDesignTokens.spacing ?? {};

  return {
    layoutSystem: {
      layoutSystemId: `layout-system:${normalizedDesignTokens.tokenSetId ?? "nexus"}`,
      grid: {
        columns: 12,
        gutter: spacing.lg ?? 20,
        maxContentWidth: 1280,
        workbenchMinWidth: 1180,
      },
      spacingScale: {
        xs: spacing.xs ?? 4,
        sm: spacing.sm ?? 8,
        md: spacing.md ?? 12,
        lg: spacing.lg ?? 20,
        xl: spacing.xl ?? 32,
        xxl: spacing.xxl ?? 48,
      },
      containerWidths: {
        compact: 640,
        standard: 960,
        wide: 1280,
        fullWorkbench: 1440,
      },
      sectionRhythm: {
        pageTop: spacing.xxl ?? 48,
        sectionGap: spacing.xl ?? 32,
        panelGap: spacing.lg ?? 20,
        contentGap: spacing.md ?? 12,
      },
      summary: {
        desktopFirst: true,
        supportsWorkbenchDensity: true,
        totalContainers: 4,
      },
    },
  };
}
