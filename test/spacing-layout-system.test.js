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
