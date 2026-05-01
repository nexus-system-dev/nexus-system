const CANONICAL_SCREEN_TYPES = new Set(["wizard", "dashboard", "tracking", "workspace", "detail"]);

function normalizeScreenType(screenType) {
  if (typeof screenType !== "string") {
    return "detail";
  }

  const normalized = screenType.trim().toLowerCase();
  return CANONICAL_SCREEN_TYPES.has(normalized) ? normalized : "detail";
}

function buildLayout(screenType) {
  if (screenType === "wizard") {
    return {
      layout: "step-flow",
      supportsSidebar: false,
      supportsProgress: true,
    };
  }

  if (screenType === "dashboard") {
    return {
      layout: "overview",
      supportsSidebar: true,
      supportsProgress: true,
    };
  }

  if (screenType === "tracking") {
    return {
      layout: "timeline",
      supportsSidebar: true,
      supportsProgress: true,
    };
  }

  if (screenType === "workspace") {
    return {
      layout: "workspace",
      supportsSidebar: true,
      supportsProgress: false,
    };
  }

  return {
    layout: "detail",
    supportsSidebar: true,
    supportsProgress: false,
  };
}

function buildStateSupport(screenType) {
  return {
    loading: true,
    empty: screenType === "dashboard" || screenType === "workspace" || screenType === "tracking",
    error: true,
    success: screenType === "wizard" || screenType === "workspace" || screenType === "detail",
  };
}

export function defineScreenContractSchema({
  screenType,
} = {}) {
  const normalizedScreenType = normalizeScreenType(screenType);
  const layout = buildLayout(normalizedScreenType);

  return {
    screenContract: {
      screenType: normalizedScreenType,
      layout,
      stateSupport: buildStateSupport(normalizedScreenType),
      interactionModel: {
        primaryActionRequired: true,
        secondaryActionsSupported: true,
        supportsMobile: true,
      },
    },
  };
}
