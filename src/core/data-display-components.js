function normalizeScreenInventory(screenInventory) {
  return screenInventory && typeof screenInventory === "object"
    ? { screens: Array.isArray(screenInventory.screens) ? screenInventory.screens : [] }
    : { screens: [] };
}

function createDisplayComponent({
  componentType,
  anatomy,
  usage,
  supportedScreenTypes,
  dataRules,
}) {
  return {
    componentId: `data-display:${componentType}`,
    componentType,
    anatomy,
    usage,
    supportedScreenTypes,
    dataRules,
  };
}

export function createDataDisplayComponents({
  screenInventory,
} = {}) {
  const normalizedScreenInventory = normalizeScreenInventory(screenInventory);
  const screenTypes = [...new Set(normalizedScreenInventory.screens.map((screen) => screen.screenType).filter(Boolean))];

  const components = [
    createDisplayComponent({
      componentType: "table",
      anatomy: ["headerRow", "bodyRows", "cellValues", "rowActions"],
      usage: "dense tabular views for entities, approvals, releases and operational datasets",
      supportedScreenTypes: screenTypes,
      dataRules: {
        supportsSorting: true,
        supportsEmptyRows: true,
        supportsInlineStatus: true,
      },
    }),
    createDisplayComponent({
      componentType: "stat-card",
      anatomy: ["headline", "value", "delta", "supportingMeta"],
      usage: "single KPI summaries for dashboards, growth views and release overviews",
      supportedScreenTypes: screenTypes,
      dataRules: {
        highlightsSingleMetric: true,
        supportsTrendDelta: true,
        supportsStatusTone: true,
      },
    }),
    createDisplayComponent({
      componentType: "activity-log",
      anatomy: ["entries", "timestamp", "actor", "summary"],
      usage: "chronological operational trails for execution, incidents and approvals",
      supportedScreenTypes: screenTypes,
      dataRules: {
        supportsChronologicalOrdering: true,
        supportsActorMetadata: true,
        supportsFiltering: true,
      },
    }),
    createDisplayComponent({
      componentType: "timeline",
      anatomy: ["milestones", "connector", "currentMarker", "meta"],
      usage: "phase and milestone progression across onboarding, delivery and release",
      supportedScreenTypes: screenTypes,
      dataRules: {
        supportsOrderedMilestones: true,
        supportsCurrentStateMarker: true,
        supportsCompletionFlags: true,
      },
    }),
    createDisplayComponent({
      componentType: "key-value-panel",
      anatomy: ["labelColumn", "valueColumn", "groupHeader"],
      usage: "compact structured summaries for project identity, release metadata and runtime facts",
      supportedScreenTypes: screenTypes,
      dataRules: {
        supportsGroupedFields: true,
        supportsLongValues: true,
        supportsReadOnlySummaries: true,
      },
    }),
    createDisplayComponent({
      componentType: "status-chip",
      anatomy: ["label", "toneIndicator"],
      usage: "inline semantic state display for blockers, releases, health and approvals",
      supportedScreenTypes: screenTypes,
      dataRules: {
        supportsSemanticStates: true,
        supportsCompactDisplay: true,
        supportsInlineUsage: true,
      },
    }),
  ];

  return {
    dataDisplayComponents: {
      dataDisplayLibraryId: `data-display-components:${screenTypes.length || "nexus"}`,
      components,
      summary: {
        totalComponents: components.length,
        totalSupportedScreenTypes: screenTypes.length,
        supportsOperationalDashboards: true,
      },
    },
  };
}
