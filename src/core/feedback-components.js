function normalizeInteractionStateSystem(interactionStateSystem) {
  return interactionStateSystem && typeof interactionStateSystem === "object" ? interactionStateSystem : {};
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
  const states = normalizedInteractionStateSystem.states ?? {};

  const components = [
    createFeedbackComponent({
      componentType: "loading-state",
      anatomy: ["icon", "headline", "description", "progressHint"],
      supportedStates: ["loading"],
      usage: "full-screen or panel-level loading feedback while Nexus prepares data or execution context",
      tone: "informative",
      tokens: {
        emphasisColor: states.focus?.emphasisColor ?? "#0f766e",
        shadow: states.focus?.shadow ?? "0 0 0 3px rgba(15, 118, 110, 0.18)",
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
        emphasisColor: states.disabled?.emphasisColor ?? "#6b7280",
        shadow: states.disabled?.shadow ?? "none",
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
        emphasisColor: states.destructive?.emphasisColor ?? "#b91c1c",
        shadow: states.destructive?.shadow ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
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
        successColor: states.success?.emphasisColor ?? "#15803d",
        warningColor: states.warning?.emphasisColor ?? "#b45309",
        dangerColor: states.destructive?.emphasisColor ?? "#b91c1c",
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
        warningColor: states.warning?.emphasisColor ?? "#b45309",
        successColor: states.success?.emphasisColor ?? "#15803d",
        dangerColor: states.destructive?.emphasisColor ?? "#b91c1c",
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
        activeColor: states.active?.emphasisColor ?? "#115e59",
        successColor: states.success?.emphasisColor ?? "#15803d",
        warningColor: states.warning?.emphasisColor ?? "#b45309",
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
        shimmerColor: states.hover?.emphasisColor ?? "#115e59",
        shadow: states.hover?.shadow ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      preview: {
        rows: 3,
      },
    }),
  ];

  return {
    feedbackComponents: {
      feedbackComponentLibraryId: `feedback-components:${normalizedInteractionStateSystem.interactionStateSystemId ?? "nexus"}`,
      components,
      summary: {
        totalComponents: components.length,
        coversScreenStates: true,
        coversInlineFeedback: true,
      },
    },
  };
}
