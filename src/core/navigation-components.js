function normalizeScreenFlowMap(screenFlowMap) {
  return screenFlowMap && typeof screenFlowMap === "object"
    ? { mappings: Array.isArray(screenFlowMap.mappings) ? screenFlowMap.mappings : [] }
    : { mappings: [] };
}

function uniqueFlowTypes(mappings) {
  return [...new Set(mappings.map((mapping) => mapping.flowType).filter(Boolean))];
}

function uniqueStepIds(mappings) {
  return [...new Set(mappings.map((mapping) => mapping.stepId).filter(Boolean))];
}

function createNavigationComponent({
  componentType,
  anatomy,
  usage,
  navigationRules,
  responsiveBehavior,
}) {
  return {
    componentId: `navigation:${componentType}`,
    componentType,
    anatomy,
    usage,
    navigationRules,
    responsiveBehavior,
  };
}

export function createNavigationComponents({
  screenFlowMap,
} = {}) {
  const normalizedScreenFlowMap = normalizeScreenFlowMap(screenFlowMap);
  const mappings = normalizedScreenFlowMap.mappings;
  const flowTypes = uniqueFlowTypes(mappings);
  const stepIds = uniqueStepIds(mappings);

  const components = [
    createNavigationComponent({
      componentType: "sidebar",
      anatomy: ["brand", "primaryLinks", "secondaryLinks", "workspaceStatus"],
      usage: "persistent workspace navigation across major Nexus surfaces",
      navigationRules: {
        supportsFlowTypes: flowTypes,
        supportsProjectSwitching: true,
        preferredDensity: "desktop",
      },
      responsiveBehavior: {
        mobile: "collapses into drawer navigation",
        desktop: "remains pinned for project continuity",
      },
    }),
    createNavigationComponent({
      componentType: "tabs",
      anatomy: ["tabList", "tabTrigger", "tabIndicator"],
      usage: "switching between related views inside a single workspace or panel",
      navigationRules: {
        supportsFlowTypes: flowTypes,
        supportsInlineContextSwitching: true,
        maxRecommendedTabs: 6,
      },
      responsiveBehavior: {
        mobile: "becomes horizontally scrollable",
        desktop: "keeps visible tab set with active indicator",
      },
    }),
    createNavigationComponent({
      componentType: "breadcrumb",
      anatomy: ["trail", "currentItem"],
      usage: "showing hierarchical position across project, workspace and screen depth",
      navigationRules: {
        supportsStepIds: stepIds,
        supportsHierarchy: true,
        truncatesLongTrails: true,
      },
      responsiveBehavior: {
        mobile: "compresses middle levels first",
        desktop: "shows the full hierarchy when space allows",
      },
    }),
    createNavigationComponent({
      componentType: "topbar",
      anatomy: ["title", "contextActions", "statusArea", "profileEntry"],
      usage: "global project context, quick actions and current workspace status",
      navigationRules: {
        supportsFlowTypes: flowTypes,
        exposesStatusArea: true,
        supportsQuickActions: true,
      },
      responsiveBehavior: {
        mobile: "prioritizes title and one primary action",
        desktop: "shows quick actions and richer status details inline",
      },
    }),
    createNavigationComponent({
      componentType: "stepper",
      anatomy: ["steps", "activeStep", "completionState"],
      usage: "guides users through onboarding, release, and sequenced project flows",
      navigationRules: {
        supportsStepIds: stepIds,
        supportsLinearProgress: true,
        supportsCompletionSignals: true,
      },
      responsiveBehavior: {
        mobile: "shows compact progress with current and next steps",
        desktop: "shows the full ordered step set with completion markers",
      },
    }),
  ];

  return {
    navigationComponents: {
      navigationComponentLibraryId: `navigation-components:${mappings.length || "nexus"}`,
      components,
      summary: {
        totalComponents: components.length,
        totalFlowTypes: flowTypes.length,
        supportsWorkspaceNavigation: true,
      },
    },
  };
}
