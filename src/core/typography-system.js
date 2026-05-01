function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
}

function resolveStringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolvePositiveNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeTypography(typography) {
  if (!typography || typeof typography !== "object") {
    return {};
  }

  return typography;
}

function createTypeStyle({ key, fontFamily, fontSize, lineHeight, fontWeight, letterSpacing = 0, usage }) {
  return {
    key,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing,
    usage,
  };
}

export function createTypographySystem({
  designTokens,
} = {}) {
  const normalizedDesignTokens = normalizeDesignTokens(designTokens);
  const typography = normalizeTypography(normalizedDesignTokens.typography);
  const displayFontFamily = resolveStringValue(
    typography.familyDisplay,
    "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
  );
  const bodyFontFamily = resolveStringValue(
    typography.familyBody,
    "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
  );
  const typographySystemIdSuffix = resolveStringValue(normalizedDesignTokens.tokenSetId, "nexus");

  const typeScale = {
    display: createTypeStyle({
      key: "display",
      fontFamily: displayFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeDisplay, 40),
      lineHeight: 1.05,
      fontWeight: 700,
      letterSpacing: -0.8,
      usage: "hero headlines and critical workspace headings",
    }),
    h1: createTypeStyle({
      key: "h1",
      fontFamily: displayFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeXl, 28),
      lineHeight: 1.1,
      fontWeight: 700,
      letterSpacing: -0.4,
      usage: "page titles",
    }),
    h2: createTypeStyle({
      key: "h2",
      fontFamily: displayFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeLg, 20),
      lineHeight: 1.2,
      fontWeight: 650,
      usage: "section headings",
    }),
    body: createTypeStyle({
      key: "body",
      fontFamily: bodyFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeMd, 16),
      lineHeight: 1.5,
      fontWeight: 400,
      usage: "default body text",
    }),
    bodySmall: createTypeStyle({
      key: "bodySmall",
      fontFamily: bodyFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeSm, 14),
      lineHeight: 1.45,
      fontWeight: 400,
      usage: "supporting text",
    }),
    label: createTypeStyle({
      key: "label",
      fontFamily: bodyFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeSm, 14),
      lineHeight: 1.2,
      fontWeight: 600,
      letterSpacing: 0.2,
      usage: "buttons, inputs, compact controls",
    }),
    meta: createTypeStyle({
      key: "meta",
      fontFamily: bodyFontFamily,
      fontSize: resolvePositiveNumber(typography.sizeXs, 12),
      lineHeight: 1.3,
      fontWeight: 500,
      letterSpacing: 0.3,
      usage: "timestamps, chips, annotations",
    }),
  };

  return {
    typographySystem: {
      typographySystemId: `typography-system:${typographySystemIdSuffix}`,
      baseFontFamily: bodyFontFamily,
      displayFontFamily: displayFontFamily,
      typeScale,
      summary: {
        totalStyles: Object.keys(typeScale).length,
        hasDisplayScale: Boolean(typeScale.display),
        optimizedForDesktop: true,
      },
    },
  };
}
