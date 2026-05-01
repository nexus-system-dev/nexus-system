function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function normalizeTokenSetId(tokenSetId) {
  return typeof tokenSetId === "string" && tokenSetId.trim() ? tokenSetId.trim() : "nexus";
}

function normalizeColorToken(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function createColorUsageRules({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const colors =
    normalizedDesignTokens.colors && typeof normalizedDesignTokens.colors === "object"
      ? normalizedDesignTokens.colors
      : {};
  const tokenSetId = normalizeTokenSetId(normalizedDesignTokens.tokenSetId);

  return {
    colorRules: {
      colorRulesId: `color-rules:${tokenSetId}`,
      roles: {
        canvas: {
          token: normalizeColorToken(colors.canvas, "#f5f1e8"),
          usage: "page backgrounds and broad workspace surfaces",
        },
        surface: {
          token: normalizeColorToken(colors.surface, "#fffaf0"),
          usage: "cards, panels and layered content surfaces",
        },
        textPrimary: {
          token: normalizeColorToken(colors.ink, "#1f2933"),
          usage: "primary headings and body text",
        },
        textMuted: {
          token: normalizeColorToken(colors.muted, "#6b7280"),
          usage: "secondary labels, helper text and metadata",
        },
        accent: {
          token: normalizeColorToken(colors.accent, "#0f766e"),
          usage: "primary actions, active highlights and focused controls",
        },
        accentStrong: {
          token: normalizeColorToken(colors.accentStrong, "#115e59"),
          usage: "hover or pressed state for primary accent actions",
        },
        border: {
          token: normalizeColorToken(colors.border, "#d6d3d1"),
          usage: "subtle separators, panels and control outlines",
        },
      },
      states: {
        success: {
          token: normalizeColorToken(colors.success, "#15803d"),
          usage: "completed actions, healthy status and positive confirmations",
        },
        warning: {
          token: normalizeColorToken(colors.warning, "#b45309"),
          usage: "cautionary messaging, pending review and elevated risk",
        },
        danger: {
          token: normalizeColorToken(colors.danger, "#b91c1c"),
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
