function normalizeLayoutSystem(layoutSystem) {
  return layoutSystem && typeof layoutSystem === "object" ? layoutSystem : {};
}

function normalizeLayoutSystemId(layoutSystemId) {
  return typeof layoutSystemId === "string" && layoutSystemId.trim() ? layoutSystemId.trim() : "nexus";
}

function normalizeLayoutGroup(layoutGroup) {
  return layoutGroup && typeof layoutGroup === "object" ? layoutGroup : {};
}

function normalizeMeasurement(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createLayoutComponent({
  componentType,
  anatomy,
  usage,
  layoutRules,
  responsiveBehavior,
  preview,
}) {
  return {
    componentId: `layout:${componentType}`,
    componentType,
    anatomy,
    usage,
    layoutRules,
    responsiveBehavior,
    preview,
  };
}

export function createLayoutComponents({
  layoutSystem,
} = {}) {
  const normalizedLayoutSystem = normalizeLayoutSystem(layoutSystem);
  const normalizedLayoutSystemId = normalizeLayoutSystemId(normalizedLayoutSystem.layoutSystemId);
  const grid = normalizeLayoutGroup(normalizedLayoutSystem.grid);
  const spacingScale = normalizeLayoutGroup(normalizedLayoutSystem.spacingScale);
  const sectionRhythm = normalizeLayoutGroup(normalizedLayoutSystem.sectionRhythm);
  const containerWidths = normalizeLayoutGroup(normalizedLayoutSystem.containerWidths);

  const components = [
    createLayoutComponent({
      componentType: "container",
      anatomy: ["outerFrame", "innerContent"],
      usage: "page-level width control for dashboards, setup flows and workspaces",
      layoutRules: {
        maxWidth: normalizeMeasurement(containerWidths.standard, 960),
        wideWidth: normalizeMeasurement(containerWidths.wide, 1280),
        paddingX: normalizeMeasurement(spacingScale.lg, 20),
      },
      responsiveBehavior: {
        mobile: "fills available width with reduced side padding",
        desktop: "centers content within canonical container widths",
      },
      preview: {
        label: "Page container",
        items: ["Outer frame", "Inner content"],
      },
    }),
    createLayoutComponent({
      componentType: "section",
      anatomy: ["header", "body", "footer"],
      usage: "vertical content grouping with consistent spacing rhythm",
      layoutRules: {
        gap: normalizeMeasurement(sectionRhythm.sectionGap, 32),
        contentGap: normalizeMeasurement(sectionRhythm.contentGap, 12),
        topOffset: normalizeMeasurement(sectionRhythm.pageTop, 48),
      },
      responsiveBehavior: {
        mobile: "compresses vertical rhythm while preserving section separation",
        desktop: "keeps full vertical rhythm for scanning and workbench structure",
      },
      preview: {
        label: "Section rhythm",
        items: ["Header", "Body", "Footer"],
      },
    }),
    createLayoutComponent({
      componentType: "stack",
      anatomy: ["items"],
      usage: "one-dimensional vertical or horizontal grouping of repeated content blocks",
      layoutRules: {
        gap: normalizeMeasurement(spacingScale.md, 12),
        compactGap: normalizeMeasurement(spacingScale.sm, 8),
        spaciousGap: normalizeMeasurement(spacingScale.lg, 20),
      },
      responsiveBehavior: {
        mobile: "defaults to vertical stacking",
        desktop: "supports both vertical and inline dense arrangements",
      },
      preview: {
        label: "Stack flow",
        items: ["Item one", "Item two", "Item three"],
      },
    }),
    createLayoutComponent({
      componentType: "grid",
      anatomy: ["gridFrame", "gridItems"],
      usage: "multi-column content arrangements across dashboards and workbench panels",
      layoutRules: {
        columns: normalizeMeasurement(grid.columns, 12),
        gutter: normalizeMeasurement(grid.gutter, 20),
        maxContentWidth: normalizeMeasurement(grid.maxContentWidth, 1280),
      },
      responsiveBehavior: {
        mobile: "collapses to 1 or 2 columns depending on screen density",
        desktop: "uses the full 12-column system with consistent gutters",
      },
      preview: {
        label: "Grid layout",
        columns: [4, 4, 4],
      },
    }),
    createLayoutComponent({
      componentType: "panel",
      anatomy: ["panelFrame", "panelHeader", "panelBody", "panelFooter"],
      usage: "bounded workspace surfaces for tools, logs, branches and summaries",
      layoutRules: {
        padding: normalizeMeasurement(spacingScale.lg, 20),
        internalGap: normalizeMeasurement(sectionRhythm.panelGap, 20),
        minWidth: normalizeMeasurement(grid.workbenchMinWidth, 1180),
      },
      responsiveBehavior: {
        mobile: "collapses chrome and prioritizes body content",
        desktop: "supports dense panel compositions for multi-pane workbench layouts",
      },
      preview: {
        label: "Panel surface",
        items: ["Header", "Body", "Footer"],
      },
    }),
    createLayoutComponent({
      componentType: "divider",
      anatomy: ["line"],
      usage: "lightweight separation between sections, rows and dense content groups",
      layoutRules: {
        spacingBefore: normalizeMeasurement(spacingScale.md, 12),
        spacingAfter: normalizeMeasurement(spacingScale.md, 12),
        thickness: 1,
      },
      responsiveBehavior: {
        mobile: "keeps short spacing to reduce visual noise",
        desktop: "maintains consistent rhythm between dense workbench regions",
      },
      preview: {
        label: "Divider rule",
        items: ["Section A", "Section B"],
      },
    }),
  ];

  return {
    layoutComponents: {
      layoutComponentLibraryId: `layout-components:${normalizedLayoutSystemId}`,
      components,
      summary: {
        totalComponents: components.length,
        supportsWorkbenchLayouts: true,
        hasResponsiveCoverage: true,
      },
    },
  };
}
