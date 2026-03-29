function normalizeComponentContract(componentContract) {
  return componentContract && typeof componentContract === "object" ? componentContract : {};
}

function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
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
  const colors = normalizedDesignTokens.colors ?? {};
  const spacing = normalizedDesignTokens.spacing ?? {};
  const radius = normalizedDesignTokens.radius ?? {};
  const typography = normalizedDesignTokens.typography ?? {};

  const sharedInteractiveStates =
    normalizedComponentContract.behavior?.supportsStates ?? ["hover", "active", "focus", "disabled"];

  const primitives = [
    createPrimitiveComponent({
      componentType: "button",
      anatomy: ["container", "label", "icon"],
      states: sharedInteractiveStates,
      variants: ["primary", "secondary", "destructive"],
      usage: "primary actions across onboarding, execution and approvals",
      tokens: {
        accentColor: colors.accent ?? "#0f766e",
        textColor: colors.surface ?? "#fffaf0",
        spacingX: spacing.md ?? 12,
        spacingY: spacing.sm ?? 8,
        radius: radius.md ?? 12,
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
        borderColor: colors.border ?? "#d6d3d1",
        textColor: colors.ink ?? "#1f2933",
        spacingY: spacing.sm ?? 8,
        radius: radius.sm ?? 6,
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
        borderColor: colors.border ?? "#d6d3d1",
        textColor: colors.ink ?? "#1f2933",
        minHeight: 120,
        radius: radius.md ?? 12,
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
        borderColor: colors.border ?? "#d6d3d1",
        accentColor: colors.accent ?? "#0f766e",
        spacingY: spacing.sm ?? 8,
        radius: radius.sm ?? 6,
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
        textColor: colors.ink ?? "#1f2933",
        spacingX: spacing.sm ?? 8,
        radius: radius.pill ?? 999,
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
        accentColor: colors.accent ?? "#0f766e",
        dangerColor: colors.danger ?? "#b91c1c",
        size: typography.sizeSm ?? 14,
        radius: radius.pill ?? 999,
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
      componentLibraryId: `primitive-components:${normalizedDesignTokens.tokenSetId ?? "nexus"}`,
      baseContractId: normalizedComponentContract.componentContractId ?? "component-contract:panel",
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
