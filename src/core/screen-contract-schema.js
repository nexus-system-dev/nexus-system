function normalizeScreenType(screenType) {
  return typeof screenType === "string" && screenType.trim()
    ? screenType.trim()
    : "detail";
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
