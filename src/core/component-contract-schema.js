const SUPPORTED_COMPONENT_TYPES = new Set([
  "panel",
  "button",
  "input",
  "textarea",
  "select",
  "modal",
  "badge",
  "icon-button",
]);

function normalizeComponentType(componentType) {
  if (typeof componentType !== "string" || !componentType.trim()) {
    return "panel";
  }

  const normalizedComponentType = componentType.trim().toLowerCase();
  return SUPPORTED_COMPONENT_TYPES.has(normalizedComponentType)
    ? normalizedComponentType
    : "panel";
}

function buildAnatomy(componentType) {
  if (componentType === "button") {
    return ["container", "label", "icon"];
  }

  if (componentType === "input") {
    return ["label", "field", "helperText", "validationMessage"];
  }

  if (componentType === "textarea") {
    return ["label", "field", "helperText", "validationMessage"];
  }

  if (componentType === "select") {
    return ["label", "trigger", "menu", "optionList"];
  }

  if (componentType === "modal") {
    return ["overlay", "container", "header", "body", "footer"];
  }

  if (componentType === "badge") {
    return ["container", "label"];
  }

  if (componentType === "icon-button") {
    return ["container", "icon", "assistiveLabel"];
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

  if (componentType === "textarea") {
    return {
      interactive: true,
      supportsStates: ["focus", "disabled", "warning", "success"],
      supportsContentSlots: ["label", "helperText", "placeholder"],
    };
  }

  if (componentType === "select") {
    return {
      interactive: true,
      supportsStates: ["focus", "disabled", "warning"],
      supportsContentSlots: ["label", "optionList", "helperText"],
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

  if (componentType === "icon-button") {
    return {
      interactive: true,
      supportsStates: ["hover", "active", "focus", "disabled", "destructive"],
      supportsContentSlots: ["icon", "assistiveLabel"],
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
        requiresLabeling: normalizedComponentType === "button"
          || normalizedComponentType === "input"
          || normalizedComponentType === "textarea"
          || normalizedComponentType === "select"
          || normalizedComponentType === "modal"
          || normalizedComponentType === "icon-button",
      },
      summary: {
        anatomyParts: anatomy.length,
        interactive: behavior.interactive,
        supportedStateCount: behavior.supportsStates.length,
      },
    },
  };
}
