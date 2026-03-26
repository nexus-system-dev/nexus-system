function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

export function createColorUsageRules({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const colors = normalizedDesignTokens.colors ?? {};

  return {
    colorRules: {
      colorRulesId: `color-rules:${normalizedDesignTokens.tokenSetId ?? "nexus"}`,
      roles: {
        canvas: {
          token: colors.canvas ?? "#f5f1e8",
          usage: "page backgrounds and broad workspace surfaces",
        },
        surface: {
          token: colors.surface ?? "#fffaf0",
          usage: "cards, panels and layered content surfaces",
        },
        textPrimary: {
          token: colors.ink ?? "#1f2933",
          usage: "primary headings and body text",
        },
        textMuted: {
          token: colors.muted ?? "#6b7280",
          usage: "secondary labels, helper text and metadata",
        },
        accent: {
          token: colors.accent ?? "#0f766e",
          usage: "primary actions, active highlights and focused controls",
        },
        accentStrong: {
          token: colors.accentStrong ?? "#115e59",
          usage: "hover or pressed state for primary accent actions",
        },
        border: {
          token: colors.border ?? "#d6d3d1",
          usage: "subtle separators, panels and control outlines",
        },
      },
      states: {
        success: {
          token: colors.success ?? "#15803d",
          usage: "completed actions, healthy status and positive confirmations",
        },
        warning: {
          token: colors.warning ?? "#b45309",
          usage: "cautionary messaging, pending review and elevated risk",
        },
        danger: {
          token: colors.danger ?? "#b91c1c",
          usage: "destructive actions, blockers and failure states",
        },
      },
      summary: {
        totalRoleRules: 7,
        totalStateRules: 3,
        hasSemanticStates: true,
      },
    },
  };
}
