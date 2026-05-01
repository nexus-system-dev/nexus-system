function normalizeComponentContract(componentContract) {
  return componentContract && typeof componentContract === "object" ? componentContract : {};
}

function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function normalizeTokenSetId(tokenSetId) {
  return typeof tokenSetId === "string" && tokenSetId.trim() ? tokenSetId.trim() : "nexus";
}

function normalizeContractId(componentContractId) {
  return typeof componentContractId === "string" && componentContractId.trim()
    ? componentContractId.trim()
    : "component-contract:panel";
}

function normalizeTokenGroup(tokenGroup) {
  return tokenGroup && typeof tokenGroup === "object" ? tokenGroup : {};
}

function normalizeColorToken(colorToken, fallback) {
  return typeof colorToken === "string" && colorToken.trim() ? colorToken : fallback;
}

function normalizeMeasurement(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeStateList(stateList, fallback) {
  const normalizedStateList = Array.isArray(stateList)
    ? stateList.filter((state) => typeof state === "string" && state.trim())
    : [];

  return normalizedStateList.length > 0 ? normalizedStateList : fallback;
}

function createPrimitiveComponent({
  componentType,
  anatomy,
  states,
  variants,
  usage,
  tokens,
  preview,
  interactive = true,
}) {
  return {
    componentId: `primitive:${componentType}`,
    componentType,
    anatomy,
    variants,
    states,
    tokens,
    preview,
    interactive,
    usage,
  };
}

export function createPrimitiveComponents({
  componentContract,
  designTokens,
} = {}) {
  const normalizedComponentContract = normalizeComponentContract(componentContract);
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const normalizedTokenSetId = normalizeTokenSetId(normalizedDesignTokens.tokenSetId);
  const colors = normalizeTokenGroup(normalizedDesignTokens.colors);
  const spacing = normalizeTokenGroup(normalizedDesignTokens.spacing);
  const radius = normalizeTokenGroup(normalizedDesignTokens.radius);
  const typography = normalizeTokenGroup(normalizedDesignTokens.typography);

  const sharedInteractiveStates = normalizeStateList(
    normalizedComponentContract.behavior?.supportsStates,
    ["hover", "active", "focus", "disabled"],
  );

  const primitives = [
    createPrimitiveComponent({
      componentType: "button",
      anatomy: ["container", "label", "icon"],
      states: sharedInteractiveStates,
      variants: ["primary", "secondary", "destructive"],
      usage: "primary actions across onboarding, execution and approvals",
      tokens: {
        accentColor: normalizeColorToken(colors.accent, "#0f766e"),
        textColor: normalizeColorToken(colors.surface, "#fffaf0"),
        spacingX: normalizeMeasurement(spacing.md, 12),
        spacingY: normalizeMeasurement(spacing.sm, 8),
        radius: normalizeMeasurement(radius.md, 12),
      },
      preview: {
        label: "Primary action",
        text: "שלח לאישור",
        secondaryText: "שמור כטיוטה",
      },
    }),
    createPrimitiveComponent({
      componentType: "input",
      anatomy: ["label", "field", "helperText", "validationMessage"],
      states: ["focus", "disabled", "warning", "success"],
      variants: ["default", "inline", "dense"],
      usage: "single-line data entry for project setup and operational updates",
      tokens: {
        borderColor: normalizeColorToken(colors.border, "#d6d3d1"),
        textColor: normalizeColorToken(colors.ink, "#1f2933"),
        spacingY: normalizeMeasurement(spacing.sm, 8),
        radius: normalizeMeasurement(radius.sm, 6),
      },
      preview: {
        label: "Input field",
        placeholder: "שם המסך הראשי",
        value: "Checkout dashboard",
      },
    }),
    createPrimitiveComponent({
      componentType: "textarea",
      anatomy: ["label", "field", "helperText", "validationMessage"],
      states: ["focus", "disabled", "warning", "success"],
      variants: ["default", "autosize"],
      usage: "multi-line product context, notes and explanation editing",
      tokens: {
        borderColor: normalizeColorToken(colors.border, "#d6d3d1"),
        textColor: normalizeColorToken(colors.ink, "#1f2933"),
        minHeight: 120,
        radius: normalizeMeasurement(radius.md, 12),
      },
      preview: {
        label: "Textarea",
        placeholder: "הוסף כאן הסבר על המסך",
        value: "מסך זה מרכז approvals, incidents ופעולות release.",
      },
    }),
    createPrimitiveComponent({
      componentType: "select",
      anatomy: ["label", "trigger", "menu", "optionList"],
      states: ["focus", "disabled", "warning"],
      variants: ["single", "searchable"],
      usage: "choice selection for execution mode, owner decisions and configuration",
      tokens: {
        borderColor: normalizeColorToken(colors.border, "#d6d3d1"),
        accentColor: normalizeColorToken(colors.accent, "#0f766e"),
        spacingY: normalizeMeasurement(spacing.sm, 8),
        radius: normalizeMeasurement(radius.sm, 6),
      },
      preview: {
        label: "Mode selector",
        options: ["Assistive", "Active", "Quiet"],
        selectedOption: "Active",
      },
    }),
    createPrimitiveComponent({
      componentType: "badge",
      anatomy: ["container", "label"],
      states: ["success", "warning", "destructive"],
      variants: ["neutral", "success", "warning", "danger"],
      usage: "status chips for blockers, release state and approvals",
      tokens: {
        textColor: normalizeColorToken(colors.ink, "#1f2933"),
        spacingX: normalizeMeasurement(spacing.sm, 8),
        radius: normalizeMeasurement(radius.pill, 999),
      },
      preview: {
        label: "Status badges",
        items: ["Ready", "Partial", "Blocked"],
      },
      interactive: false,
    }),
    createPrimitiveComponent({
      componentType: "icon-button",
      anatomy: ["container", "icon", "assistiveLabel"],
      states: ["hover", "active", "focus", "disabled", "destructive"],
      variants: ["ghost", "subtle", "danger"],
      usage: "dense actions in workbench panels, navigation and toolbars",
      tokens: {
        accentColor: normalizeColorToken(colors.accent, "#0f766e"),
        dangerColor: normalizeColorToken(colors.danger, "#b91c1c"),
        size: normalizeMeasurement(typography.sizeSm, 14),
        radius: normalizeMeasurement(radius.pill, 999),
      },
      preview: {
        label: "Dense actions",
        icon: "⋯",
        assistiveLabel: "פתח פעולות נוספות",
      },
    }),
  ];

  return {
    primitiveComponents: {
      componentLibraryId: `primitive-components:${normalizedTokenSetId}`,
      baseContractId: normalizeContractId(normalizedComponentContract.componentContractId),
      components: primitives,
      previewSurface: {
        sectionTitle: "Primitive component library",
        supportsLivePreview: true,
      },
      summary: {
        totalComponents: primitives.length,
        interactiveComponents: primitives.filter((component) => component.interactive).length,
        includesFormPrimitives: true,
      },
    },
  };
}
