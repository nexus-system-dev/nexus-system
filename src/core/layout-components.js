function normalizeLayoutSystem(layoutSystem) {
  return layoutSystem && typeof layoutSystem === "object" ? layoutSystem : {};
}

function createLayoutComponent({
  componentType,
  anatomy,
  usage,
  layoutRules,
  responsiveBehavior,
}) {
  return {
    componentId: `layout:${componentType}`,
    componentType,
    anatomy,
    usage,
    layoutRules,
    responsiveBehavior,
  };
}

export function createLayoutComponents({
  layoutSystem,
} = {}) {
  const normalizedLayoutSystem = normalizeLayoutSystem(layoutSystem);
  const grid = normalizedLayoutSystem.grid ?? {};
  const spacingScale = normalizedLayoutSystem.spacingScale ?? {};
  const sectionRhythm = normalizedLayoutSystem.sectionRhythm ?? {};
  const containerWidths = normalizedLayoutSystem.containerWidths ?? {};

  const components = [
    createLayoutComponent({
      componentType: "container",
      anatomy: ["outerFrame", "innerContent"],
      usage: "page-level width control for dashboards, setup flows and workspaces",
      layoutRules: {
        maxWidth: containerWidths.standard ?? 960,
        wideWidth: containerWidths.wide ?? 1280,
        paddingX: spacingScale.lg ?? 20,
      },
      responsiveBehavior: {
        mobile: "fills available width with reduced side padding",
        desktop: "centers content within canonical container widths",
      },
    }),
    createLayoutComponent({
      componentType: "section",
      anatomy: ["header", "body", "footer"],
      usage: "vertical content grouping with consistent spacing rhythm",
      layoutRules: {
        gap: sectionRhythm.sectionGap ?? 32,
        contentGap: sectionRhythm.contentGap ?? 12,
        topOffset: sectionRhythm.pageTop ?? 48,
      },
      responsiveBehavior: {
        mobile: "compresses vertical rhythm while preserving section separation",
        desktop: "keeps full vertical rhythm for scanning and workbench structure",
      },
    }),
    createLayoutComponent({
      componentType: "stack",
      anatomy: ["items"],
      usage: "one-dimensional vertical or horizontal grouping of repeated content blocks",
      layoutRules: {
        gap: spacingScale.md ?? 12,
        compactGap: spacingScale.sm ?? 8,
        spaciousGap: spacingScale.lg ?? 20,
      },
      responsiveBehavior: {
        mobile: "defaults to vertical stacking",
        desktop: "supports both vertical and inline dense arrangements",
      },
    }),
    createLayoutComponent({
      componentType: "grid",
      anatomy: ["gridFrame", "gridItems"],
      usage: "multi-column content arrangements across dashboards and workbench panels",
      layoutRules: {
        columns: grid.columns ?? 12,
        gutter: grid.gutter ?? 20,
        maxContentWidth: grid.maxContentWidth ?? 1280,
      },
      responsiveBehavior: {
        mobile: "collapses to 1 or 2 columns depending on screen density",
        desktop: "uses the full 12-column system with consistent gutters",
      },
    }),
    createLayoutComponent({
      componentType: "panel",
      anatomy: ["panelFrame", "panelHeader", "panelBody", "panelFooter"],
      usage: "bounded workspace surfaces for tools, logs, branches and summaries",
      layoutRules: {
        padding: spacingScale.lg ?? 20,
        internalGap: sectionRhythm.panelGap ?? 20,
        minWidth: grid.workbenchMinWidth ?? 1180,
      },
      responsiveBehavior: {
        mobile: "collapses chrome and prioritizes body content",
        desktop: "supports dense panel compositions for multi-pane workbench layouts",
      },
    }),
    createLayoutComponent({
      componentType: "divider",
      anatomy: ["line"],
      usage: "lightweight separation between sections, rows and dense content groups",
      layoutRules: {
        spacingBefore: spacingScale.md ?? 12,
        spacingAfter: spacingScale.md ?? 12,
        thickness: 1,
      },
      responsiveBehavior: {
        mobile: "keeps short spacing to reduce visual noise",
        desktop: "maintains consistent rhythm between dense workbench regions",
      },
    }),
  ];

  return {
    layoutComponents: {
      layoutComponentLibraryId: `layout-components:${normalizedLayoutSystem.layoutSystemId ?? "nexus"}`,
      components,
      summary: {
        totalComponents: components.length,
        supportsWorkbenchLayouts: true,
        hasResponsiveCoverage: true,
      },
    },
  };
}
