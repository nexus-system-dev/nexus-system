function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function normalizeTokenSetId(tokenSetId) {
  return typeof tokenSetId === "string" && tokenSetId.trim() ? tokenSetId.trim() : "nexus";
}

function normalizeTokenGroup(tokenGroup) {
  return tokenGroup && typeof tokenGroup === "object" ? tokenGroup : {};
}

function normalizeColorToken(colorToken, fallback) {
  return typeof colorToken === "string" && colorToken.trim() ? colorToken : fallback;
}

function normalizeBorderWidth(borderWidth, fallback) {
  return Number.isFinite(borderWidth) && borderWidth > 0 ? borderWidth : fallback;
}

function normalizeShadowToken(shadowToken, fallback) {
  return typeof shadowToken === "string" && shadowToken.trim() ? shadowToken : fallback;
}

export function createInteractionStatesSystem({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const normalizedTokenSetId = normalizeTokenSetId(normalizedDesignTokens.tokenSetId);
  const colors = normalizeTokenGroup(normalizedDesignTokens.colors);
  const borders = normalizeTokenGroup(normalizedDesignTokens.borders);
  const shadows = normalizeTokenGroup(normalizedDesignTokens.shadows);

  return {
    interactionStateSystem: {
      interactionStateSystemId: `interaction-states:${normalizedTokenSetId}`,
      states: {
        hover: {
          emphasisColor: normalizeColorToken(colors.accentStrong, "#115e59"),
          borderWidth: normalizeBorderWidth(borders.strong, 2),
          shadow: normalizeShadowToken(shadows.soft, "0 8px 24px rgba(15, 23, 42, 0.08)"),
          usage: "surface lift and stronger accent feedback on hoverable controls",
        },
        active: {
          emphasisColor: normalizeColorToken(colors.accentStrong, "#115e59"),
          borderWidth: normalizeBorderWidth(borders.strong, 2),
          shadow: normalizeShadowToken(shadows.medium, "0 12px 32px rgba(15, 23, 42, 0.12)"),
          usage: "pressed buttons, selected tabs and currently engaged actions",
        },
        focus: {
          emphasisColor: normalizeColorToken(colors.accent, "#0f766e"),
          borderWidth: normalizeBorderWidth(borders.focus, 3),
          shadow: normalizeShadowToken(shadows.focus, "0 0 0 3px rgba(15, 118, 110, 0.18)"),
          usage: "keyboard navigation, focused inputs and accessible interaction rings",
        },
        disabled: {
          emphasisColor: normalizeColorToken(colors.muted, "#6b7280"),
          borderWidth: normalizeBorderWidth(borders.subtle, 1),
          shadow: "none",
          usage: "inactive controls that remain visible but cannot be triggered",
        },
        destructive: {
          emphasisColor: normalizeColorToken(colors.danger, "#b91c1c"),
          borderWidth: normalizeBorderWidth(borders.strong, 2),
          shadow: normalizeShadowToken(shadows.soft, "0 8px 24px rgba(15, 23, 42, 0.08)"),
          usage: "delete, revoke or irreversible actions that need strong caution cues",
        },
        success: {
          emphasisColor: normalizeColorToken(colors.success, "#15803d"),
          borderWidth: normalizeBorderWidth(borders.subtle, 1),
          shadow: normalizeShadowToken(shadows.soft, "0 8px 24px rgba(15, 23, 42, 0.08)"),
          usage: "completed actions, confirmations and healthy state indicators",
        },
        warning: {
          emphasisColor: normalizeColorToken(colors.warning, "#b45309"),
          borderWidth: normalizeBorderWidth(borders.strong, 2),
          shadow: normalizeShadowToken(shadows.soft, "0 8px 24px rgba(15, 23, 42, 0.08)"),
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
