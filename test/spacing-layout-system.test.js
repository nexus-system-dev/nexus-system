import test from "node:test";
import assert from "node:assert/strict";

import { createSpacingAndLayoutSystem } from "../src/core/spacing-layout-system.js";

test("spacing and layout system returns canonical grid and container widths", () => {
  const { layoutSystem } = createSpacingAndLayoutSystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 20,
        xl: 32,
        xxl: 48,
      },
    },
  });

  assert.equal(layoutSystem.grid.columns, 12);
  assert.equal(layoutSystem.grid.gutter, 20);
  assert.equal(layoutSystem.containerWidths.standard, 960);
  assert.equal(layoutSystem.sectionRhythm.sectionGap, 32);
  assert.equal(layoutSystem.summary.supportsWorkbenchDensity, true);
});

test("spacing and layout system falls back safely without tokens", () => {
  const { layoutSystem } = createSpacingAndLayoutSystem({});

  assert.equal(typeof layoutSystem.layoutSystemId, "string");
  assert.equal(typeof layoutSystem.spacingScale.lg, "number");
  assert.equal(layoutSystem.summary.desktopFirst, true);
});

test("spacing and layout system normalizes invalid token identity and spacing source", () => {
  const { layoutSystem } = createSpacingAndLayoutSystem({
    designTokens: {
      tokenSetId: { nested: true },
      spacing: "wide",
    },
  });

  assert.equal(layoutSystem.layoutSystemId, "layout-system:nexus");
  assert.equal(layoutSystem.grid.gutter, 20);
  assert.equal(layoutSystem.spacingScale.xl, 32);
  assert.equal(layoutSystem.sectionRhythm.pageTop, 48);
});

test("spacing and layout system ignores invalid spacing values", () => {
  const { layoutSystem } = createSpacingAndLayoutSystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      spacing: {
        xs: "4",
        sm: 0,
        md: Number.NaN,
        lg: -3,
        xl: null,
        xxl: Infinity,
      },
    },
  });

  assert.equal(layoutSystem.spacingScale.xs, 4);
  assert.equal(layoutSystem.spacingScale.sm, 8);
  assert.equal(layoutSystem.spacingScale.md, 12);
  assert.equal(layoutSystem.spacingScale.lg, 20);
  assert.equal(layoutSystem.spacingScale.xl, 32);
  assert.equal(layoutSystem.spacingScale.xxl, 48);
  assert.equal(layoutSystem.grid.gutter, 20);
  assert.equal(layoutSystem.sectionRhythm.sectionGap, 32);
});
