function normalizeDesignTokens(designTokens) {
  return designTokens && typeof designTokens === "object" ? designTokens : {};
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
  const typography = normalizedDesignTokens.typography ?? {};

  const typeScale = {
    display: createTypeStyle({
      key: "display",
      fontFamily: typography.familyDisplay ?? "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeDisplay ?? 40,
      lineHeight: 1.05,
      fontWeight: 700,
      letterSpacing: -0.8,
      usage: "hero headlines and critical workspace headings",
    }),
    h1: createTypeStyle({
      key: "h1",
      fontFamily: typography.familyDisplay ?? "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeXl ?? 28,
      lineHeight: 1.1,
      fontWeight: 700,
      letterSpacing: -0.4,
      usage: "page titles",
    }),
    h2: createTypeStyle({
      key: "h2",
      fontFamily: typography.familyDisplay ?? "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeLg ?? 20,
      lineHeight: 1.2,
      fontWeight: 650,
      usage: "section headings",
    }),
    body: createTypeStyle({
      key: "body",
      fontFamily: typography.familyBody ?? "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeMd ?? 16,
      lineHeight: 1.5,
      fontWeight: 400,
      usage: "default body text",
    }),
    bodySmall: createTypeStyle({
      key: "bodySmall",
      fontFamily: typography.familyBody ?? "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeSm ?? 14,
      lineHeight: 1.45,
      fontWeight: 400,
      usage: "supporting text",
    }),
    label: createTypeStyle({
      key: "label",
      fontFamily: typography.familyBody ?? "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeSm ?? 14,
      lineHeight: 1.2,
      fontWeight: 600,
      letterSpacing: 0.2,
      usage: "buttons, inputs, compact controls",
    }),
    meta: createTypeStyle({
      key: "meta",
      fontFamily: typography.familyBody ?? "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      fontSize: typography.sizeXs ?? 12,
      lineHeight: 1.3,
      fontWeight: 500,
      letterSpacing: 0.3,
      usage: "timestamps, chips, annotations",
    }),
  };

  return {
    typographySystem: {
      typographySystemId: `typography-system:${normalizedDesignTokens.tokenSetId ?? "nexus"}`,
      baseFontFamily: typography.familyBody ?? "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      displayFontFamily: typography.familyDisplay ?? "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      typeScale,
      summary: {
        totalStyles: Object.keys(typeScale).length,
        hasDisplayScale: Boolean(typeScale.display),
        optimizedForDesktop: true,
      },
    },
  };
}
