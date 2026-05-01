import test from "node:test";
import assert from "node:assert/strict";

import { createTypographySystem } from "../src/core/typography-system.js";

test("typography system returns canonical scale from design tokens", () => {
  const { typographySystem } = createTypographySystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      typography: {
        familyDisplay: "\"Avenir Next\", sans-serif",
        familyBody: "\"IBM Plex Sans\", sans-serif",
        sizeXs: 12,
        sizeSm: 14,
        sizeMd: 16,
        sizeLg: 20,
        sizeXl: 28,
        sizeDisplay: 40,
      },
    },
  });

  assert.equal(typeof typographySystem.typographySystemId, "string");
  assert.equal(typographySystem.typeScale.h1.fontSize, 28);
  assert.equal(typographySystem.typeScale.body.fontSize, 16);
  assert.equal(typographySystem.typeScale.label.fontWeight, 600);
  assert.equal(typographySystem.summary.hasDisplayScale, true);
});

test("typography system falls back safely without explicit tokens", () => {
  const { typographySystem } = createTypographySystem({});

  assert.equal(typeof typographySystem.baseFontFamily, "string");
  assert.equal(typeof typographySystem.typeScale.meta.fontSize, "number");
  assert.equal(typographySystem.summary.optimizedForDesktop, true);
});

test("typography system normalizes invalid token identity and font families", () => {
  const { typographySystem } = createTypographySystem({
    designTokens: {
      tokenSetId: { nested: true },
      typography: {
        familyDisplay: false,
        familyBody: "",
      },
    },
  });

  assert.equal(typographySystem.typographySystemId, "typography-system:nexus");
  assert.equal(typographySystem.displayFontFamily, "\"Avenir Next\", \"Helvetica Neue\", sans-serif");
  assert.equal(typographySystem.baseFontFamily, "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif");
});

test("typography system ignores invalid size tokens", () => {
  const { typographySystem } = createTypographySystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      typography: {
        sizeDisplay: "40",
        sizeXl: -10,
        sizeLg: null,
        sizeMd: Number.NaN,
        sizeSm: 0,
        sizeXs: Infinity,
      },
    },
  });

  assert.equal(typographySystem.typeScale.display.fontSize, 40);
  assert.equal(typographySystem.typeScale.h1.fontSize, 28);
  assert.equal(typographySystem.typeScale.h2.fontSize, 20);
  assert.equal(typographySystem.typeScale.body.fontSize, 16);
  assert.equal(typographySystem.typeScale.label.fontSize, 14);
  assert.equal(typographySystem.typeScale.meta.fontSize, 12);
});
