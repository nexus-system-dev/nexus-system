const ALLOWED_PRODUCT_MODES = new Set(["desktop-first-web"]);

function normalizeBrandDirection(brandDirection) {
  if (brandDirection && typeof brandDirection === "object") {
    return brandDirection;
  }

  return {};
}

function resolveStringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeBrandMetadata(brandDirection) {
  const brandId = resolveStringValue(brandDirection.brandId, "nexus");
  const productMode = resolveStringValue(brandDirection.productMode, "desktop-first-web");
  const visualTone = resolveStringValue(brandDirection.visualTone, "focused");

  return {
    brandId,
    productMode: ALLOWED_PRODUCT_MODES.has(productMode) ? productMode : "desktop-first-web",
    visualTone,
  };
}

function buildColorTokens(brandDirection) {
  const palette = brandDirection.palette ?? {};

  return {
    canvas: resolveStringValue(palette.canvas, "#f5f1e8"),
    surface: resolveStringValue(palette.surface, "#fffaf0"),
    ink: resolveStringValue(palette.ink, "#1f2933"),
    muted: resolveStringValue(palette.muted, "#6b7280"),
    accent: resolveStringValue(palette.accent, "#0f766e"),
    accentStrong: resolveStringValue(palette.accentStrong, "#115e59"),
    success: resolveStringValue(palette.success, "#15803d"),
    warning: resolveStringValue(palette.warning, "#b45309"),
    danger: resolveStringValue(palette.danger, "#b91c1c"),
    border: resolveStringValue(palette.border, "#d6d3d1"),
  };
}

function buildSpacingTokens() {
  return {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
    xxl: 48,
  };
}

function buildTypographyTokens(brandDirection) {
  return {
    familyDisplay: resolveStringValue(brandDirection.familyDisplay, "\"Avenir Next\", \"Helvetica Neue\", sans-serif"),
    familyBody: resolveStringValue(brandDirection.familyBody, "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif"),
    sizeXs: 12,
    sizeSm: 14,
    sizeMd: 16,
    sizeLg: 20,
    sizeXl: 28,
    sizeDisplay: 40,
  };
}

function buildRadiusTokens() {
  return {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  };
}

function buildBorderTokens() {
  return {
    subtle: 1,
    strong: 2,
    focus: 3,
  };
}

function buildShadowTokens() {
  return {
    soft: "0 8px 24px rgba(15, 23, 42, 0.08)",
    medium: "0 12px 32px rgba(15, 23, 42, 0.12)",
    focus: "0 0 0 3px rgba(15, 118, 110, 0.18)",
  };
}

export function defineDesignTokenSchema({
  brandDirection,
} = {}) {
  const normalizedBrandDirection = normalizeBrandDirection(brandDirection);
  const normalizedBrandMetadata = normalizeBrandMetadata(normalizedBrandDirection);

  return {
    designTokens: {
      tokenSetId: `design-tokens:${normalizedBrandMetadata.brandId}`,
      brandDirection: normalizedBrandMetadata,
      colors: buildColorTokens(normalizedBrandDirection),
      spacing: buildSpacingTokens(),
      typography: buildTypographyTokens(normalizedBrandDirection),
      radius: buildRadiusTokens(),
      borders: buildBorderTokens(),
      shadows: buildShadowTokens(),
      summary: {
        tokenFamilies: 6,
        desktopFirst: normalizedBrandMetadata.productMode === "desktop-first-web",
      },
    },
  };
}
