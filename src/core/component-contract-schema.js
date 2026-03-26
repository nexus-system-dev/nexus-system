function normalizeComponentType(componentType) {
  return typeof componentType === "string" && componentType.trim()
    ? componentType.trim()
    : "panel";
}

function buildAnatomy(componentType) {
  if (componentType === "button") {
    return ["container", "label", "icon"];
  }

  if (componentType === "input") {
    return ["label", "field", "helperText", "validationMessage"];
  }

  if (componentType === "modal") {
    return ["overlay", "container", "header", "body", "footer"];
  }

  if (componentType === "badge") {
    return ["container", "label"];
  }

  return ["container", "header", "body", "footer"];
}

function buildBehavior(componentType) {
  if (componentType === "button") {
    return {
      interactive: true,
      supportsStates: ["hover", "active", "focus", "disabled", "destructive"],
      supportsContentSlots: ["label", "leadingIcon", "trailingIcon"],
    };
  }

  if (componentType === "input") {
    return {
      interactive: true,
      supportsStates: ["focus", "disabled", "warning", "success"],
      supportsContentSlots: ["label", "helperText", "prefix", "suffix"],
    };
  }

  if (componentType === "modal") {
    return {
      interactive: true,
      supportsStates: ["focus", "disabled", "warning"],
      supportsContentSlots: ["header", "body", "footerActions"],
    };
  }

  if (componentType === "badge") {
    return {
      interactive: false,
      supportsStates: ["success", "warning", "destructive"],
      supportsContentSlots: ["label"],
    };
  }

  return {
    interactive: false,
    supportsStates: ["success", "warning"],
    supportsContentSlots: ["header", "body", "footer"],
  };
}

export function defineComponentContractSchema({
  componentType,
} = {}) {
  const normalizedComponentType = normalizeComponentType(componentType);
  const anatomy = buildAnatomy(normalizedComponentType);
  const behavior = buildBehavior(normalizedComponentType);

  return {
    componentContract: {
      componentContractId: `component-contract:${normalizedComponentType}`,
      componentType: normalizedComponentType,
      anatomy,
      behavior,
      accessibility: {
        requiresKeyboardSupport: behavior.interactive,
        requiresFocusTreatment: behavior.supportsStates.includes("focus"),
        requiresLabeling: normalizedComponentType === "button" || normalizedComponentType === "input" || normalizedComponentType === "modal",
      },
      summary: {
        anatomyParts: anatomy.length,
        interactive: behavior.interactive,
        supportedStateCount: behavior.supportsStates.length,
      },
    },
  };
}
