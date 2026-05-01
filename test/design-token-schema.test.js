import test from "node:test";
import assert from "node:assert/strict";

import { defineDesignTokenSchema } from "../src/core/design-token-schema.js";

test("design token schema returns canonical token families for desktop-first web", () => {
  const { designTokens } = defineDesignTokenSchema({
    brandDirection: {
      brandId: "nexus",
      productMode: "desktop-first-web",
      visualTone: "focused",
      palette: {
        accent: "#14532d",
      },
    },
  });

  assert.equal(designTokens.brandDirection.brandId, "nexus");
  assert.equal(designTokens.brandDirection.productMode, "desktop-first-web");
  assert.equal(designTokens.colors.accent, "#14532d");
  assert.equal(typeof designTokens.spacing.lg, "number");
  assert.equal(typeof designTokens.typography.familyBody, "string");
  assert.equal(typeof designTokens.radius.md, "number");
  assert.equal(typeof designTokens.shadows.soft, "string");
});

test("design token schema falls back to nexus defaults", () => {
  const { designTokens } = defineDesignTokenSchema({});

  assert.equal(designTokens.brandDirection.brandId, "nexus");
  assert.equal(designTokens.brandDirection.productMode, "desktop-first-web");
  assert.equal(designTokens.summary.desktopFirst, true);
});

test("design token schema ignores non-string palette overrides", () => {
  const { designTokens } = defineDesignTokenSchema({
    brandDirection: {
      brandId: "nexus",
      palette: {
        accent: 17,
        ink: ["#000"],
        surface: null,
      },
    },
  });

  assert.equal(designTokens.colors.accent, "#0f766e");
  assert.equal(designTokens.colors.ink, "#1f2933");
  assert.equal(designTokens.colors.surface, "#fffaf0");
});

test("design token schema normalizes invalid brand metadata and typography inputs", () => {
  const { designTokens } = defineDesignTokenSchema({
    brandDirection: {
      brandId: { nested: true },
      productMode: "mobile",
      visualTone: 99,
      familyBody: false,
    },
  });

  assert.equal(designTokens.tokenSetId, "design-tokens:nexus");
  assert.equal(designTokens.brandDirection.brandId, "nexus");
  assert.equal(designTokens.brandDirection.productMode, "desktop-first-web");
  assert.equal(designTokens.brandDirection.visualTone, "focused");
  assert.equal(designTokens.typography.familyBody, "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif");
});
