function normalizeInteractionStateSystem(interactionStateSystem) {
  return interactionStateSystem && typeof interactionStateSystem === "object" ? interactionStateSystem : {};
}

function normalizeInteractionStateSystemId(interactionStateSystemId) {
  return typeof interactionStateSystemId === "string" && interactionStateSystemId.trim()
    ? interactionStateSystemId.trim()
    : "nexus";
}

function normalizeStates(states) {
  return states && typeof states === "object" ? states : {};
}

function normalizeStateEntry(stateEntry) {
  return stateEntry && typeof stateEntry === "object" ? stateEntry : {};
}

function normalizeColorToken(colorToken, fallback) {
  return typeof colorToken === "string" && colorToken.trim() ? colorToken : fallback;
}

function normalizeShadowToken(shadowToken, fallback) {
  return typeof shadowToken === "string" && shadowToken.trim() ? shadowToken : fallback;
}

function createFeedbackComponent({
  componentType,
  anatomy,
  supportedStates,
  usage,
  tone,
  tokens,
  preview,
}) {
  return {
    componentId: `feedback:${componentType}`,
    componentType,
    anatomy,
    supportedStates,
    usage,
    tone,
    tokens,
    preview,
  };
}

export function createFeedbackComponents({
  interactionStateSystem,
} = {}) {
  const normalizedInteractionStateSystem = normalizeInteractionStateSystem(interactionStateSystem);
  const normalizedInteractionStateSystemId = normalizeInteractionStateSystemId(
    normalizedInteractionStateSystem.interactionStateSystemId,
  );
  const states = normalizeStates(normalizedInteractionStateSystem.states);
  const hoverState = normalizeStateEntry(states.hover);
  const activeState = normalizeStateEntry(states.active);
  const focusState = normalizeStateEntry(states.focus);
  const disabledState = normalizeStateEntry(states.disabled);
  const destructiveState = normalizeStateEntry(states.destructive);
  const successState = normalizeStateEntry(states.success);
  const warningState = normalizeStateEntry(states.warning);

  const components = [
    createFeedbackComponent({
      componentType: "loading-state",
      anatomy: ["icon", "headline", "description", "progressHint"],
      supportedStates: ["loading"],
      usage: "full-screen or panel-level loading feedback while Nexus prepares data or execution context",
      tone: "informative",
      tokens: {
        emphasisColor: normalizeColorToken(focusState.emphasisColor, "#0f766e"),
        shadow: normalizeShadowToken(focusState.shadow, "0 0 0 3px rgba(15, 118, 110, 0.18)"),
      },
      preview: {
        headline: "טוען את סביבת העבודה",
        description: "Nexus מכינה context, state ו־next actions.",
        progressLabel: "64%",
      },
    }),
    createFeedbackComponent({
      componentType: "empty-state",
      anatomy: ["illustration", "headline", "description", "primaryAction"],
      supportedStates: ["empty"],
      usage: "guides users when a workspace or panel has no content yet",
      tone: "guiding",
      tokens: {
        emphasisColor: normalizeColorToken(disabledState.emphasisColor, "#6b7280"),
        shadow: normalizeShadowToken(disabledState.shadow, "none"),
      },
      preview: {
        headline: "עדיין אין תוצאות",
        description: "אפשר להתחיל מסריקה, import או יצירת פרויקט חדש.",
        actionLabel: "התחל סריקה",
      },
    }),
    createFeedbackComponent({
      componentType: "error-state",
      anatomy: ["icon", "headline", "description", "recoveryAction"],
      supportedStates: ["error", "destructive"],
      usage: "explains blocking or failed conditions and points to the next recovery action",
      tone: "warning",
      tokens: {
        emphasisColor: normalizeColorToken(destructiveState.emphasisColor, "#b91c1c"),
        shadow: normalizeShadowToken(destructiveState.shadow, "0 8px 24px rgba(15, 23, 42, 0.08)"),
      },
      preview: {
        headline: "החיבור נכשל",
        description: "לא ניתן היה לטעון את נתוני הפרויקט. נסה שוב.",
        actionLabel: "נסה שוב",
      },
    }),
    createFeedbackComponent({
      componentType: "toast",
      anatomy: ["icon", "message", "dismissAction"],
      supportedStates: ["success", "warning", "destructive"],
      usage: "short-lived notifications for actions, completions and recoverable issues",
      tone: "ephemeral",
      tokens: {
        successColor: normalizeColorToken(successState.emphasisColor, "#15803d"),
        warningColor: normalizeColorToken(warningState.emphasisColor, "#b45309"),
        dangerColor: normalizeColorToken(destructiveState.emphasisColor, "#b91c1c"),
      },
      preview: {
        items: ["השינויים נשמרו", "Approval חסר", "הפריסה נכשלה"],
      },
    }),
    createFeedbackComponent({
      componentType: "banner",
      anatomy: ["icon", "headline", "description", "actions"],
      supportedStates: ["warning", "destructive", "success"],
      usage: "persistent contextual alerts inside dashboards and workspaces",
      tone: "persistent",
      tokens: {
        warningColor: normalizeColorToken(warningState.emphasisColor, "#b45309"),
        successColor: normalizeColorToken(successState.emphasisColor, "#15803d"),
        dangerColor: normalizeColorToken(destructiveState.emphasisColor, "#b91c1c"),
      },
      preview: {
        headline: "נדרשת פעולה לפני deploy",
        description: "יש approval פתוח שחוסם את השחרור.",
      },
    }),
    createFeedbackComponent({
      componentType: "progress",
      anatomy: ["track", "indicator", "label", "meta"],
      supportedStates: ["loading", "success", "warning"],
      usage: "communicates progress through onboarding, execution and long-running operations",
      tone: "progressive",
      tokens: {
        activeColor: normalizeColorToken(activeState.emphasisColor, "#115e59"),
        successColor: normalizeColorToken(successState.emphasisColor, "#15803d"),
        warningColor: normalizeColorToken(warningState.emphasisColor, "#b45309"),
      },
      preview: {
        label: "Execution progress",
        percent: 72,
        meta: "5/7 tasks completed",
      },
    }),
    createFeedbackComponent({
      componentType: "skeleton",
      anatomy: ["placeholderBlocks"],
      supportedStates: ["loading"],
      usage: "preserves layout while content is still being fetched or generated",
      tone: "neutral",
      tokens: {
        shimmerColor: normalizeColorToken(hoverState.emphasisColor, "#115e59"),
        shadow: normalizeShadowToken(hoverState.shadow, "0 8px 24px rgba(15, 23, 42, 0.08)"),
      },
      preview: {
        rows: 3,
      },
    }),
  ];

  return {
    feedbackComponents: {
      feedbackComponentLibraryId: `feedback-components:${normalizedInteractionStateSystemId}`,
      components,
      summary: {
        totalComponents: components.length,
        coversScreenStates: true,
        coversInlineFeedback: true,
      },
    },
  };
}
