function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

export function createInteractionStatesSystem({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const colors = normalizedDesignTokens.colors ?? {};
  const borders = normalizedDesignTokens.borders ?? {};
  const shadows = normalizedDesignTokens.shadows ?? {};

  return {
    interactionStateSystem: {
      interactionStateSystemId: `interaction-states:${normalizedDesignTokens.tokenSetId ?? "nexus"}`,
      states: {
        hover: {
          emphasisColor: colors.accentStrong ?? "#115e59",
          borderWidth: borders.strong ?? 2,
          shadow: shadows.soft ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
          usage: "surface lift and stronger accent feedback on hoverable controls",
        },
        active: {
          emphasisColor: colors.accentStrong ?? "#115e59",
          borderWidth: borders.strong ?? 2,
          shadow: shadows.medium ?? "0 12px 32px rgba(15, 23, 42, 0.12)",
          usage: "pressed buttons, selected tabs and currently engaged actions",
        },
        focus: {
          emphasisColor: colors.accent ?? "#0f766e",
          borderWidth: borders.focus ?? 3,
          shadow: shadows.focus ?? "0 0 0 3px rgba(15, 118, 110, 0.18)",
          usage: "keyboard navigation, focused inputs and accessible interaction rings",
        },
        disabled: {
          emphasisColor: colors.muted ?? "#6b7280",
          borderWidth: borders.subtle ?? 1,
          shadow: "none",
          usage: "inactive controls that remain visible but cannot be triggered",
        },
        destructive: {
          emphasisColor: colors.danger ?? "#b91c1c",
          borderWidth: borders.strong ?? 2,
          shadow: shadows.soft ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
          usage: "delete, revoke or irreversible actions that need strong caution cues",
        },
        success: {
          emphasisColor: colors.success ?? "#15803d",
          borderWidth: borders.subtle ?? 1,
          shadow: shadows.soft ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
          usage: "completed actions, confirmations and healthy state indicators",
        },
        warning: {
          emphasisColor: colors.warning ?? "#b45309",
          borderWidth: borders.strong ?? 2,
          shadow: shadows.soft ?? "0 8px 24px rgba(15, 23, 42, 0.08)",
          usage: "cautionary actions, pending confirmations and elevated risk messaging",
        },
      },
      summary: {
        totalStates: 7,
        accessibleFocusTreatment: true,
        includesSemanticInteractionStates: true,
      },
    },
  };
}
