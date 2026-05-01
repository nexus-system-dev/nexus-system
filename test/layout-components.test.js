import test from "node:test";
import assert from "node:assert/strict";

import { createLayoutComponents } from "../src/core/layout-components.js";

test("createLayoutComponents builds canonical layout component library", () => {
  const { layoutComponents } = createLayoutComponents({
    layoutSystem: {
      layoutSystemId: "layout-system:design-tokens:nexus",
      grid: {
        columns: 12,
        gutter: 20,
        maxContentWidth: 1280,
        workbenchMinWidth: 1180,
      },
      spacingScale: {
        sm: 8,
        md: 12,
        lg: 20,
      },
      sectionRhythm: {
        pageTop: 48,
        sectionGap: 32,
        panelGap: 20,
        contentGap: 12,
      },
      containerWidths: {
        standard: 960,
        wide: 1280,
      },
    },
  });

  assert.equal(layoutComponents.layoutComponentLibraryId, "layout-components:layout-system:design-tokens:nexus");
  assert.equal(layoutComponents.components.length, 6);
  assert.equal(layoutComponents.components[0].componentType, "container");
  assert.equal(layoutComponents.components[0].preview.items[1], "Inner content");
  assert.equal(layoutComponents.components[3].layoutRules.columns, 12);
  assert.deepEqual(layoutComponents.components[3].preview.columns, [4, 4, 4]);
  assert.equal(layoutComponents.components[4].layoutRules.minWidth, 1180);
  assert.equal(layoutComponents.summary.totalComponents, 6);
  assert.equal(layoutComponents.summary.hasResponsiveCoverage, true);
});

test("createLayoutComponents falls back safely without explicit layout system", () => {
  const { layoutComponents } = createLayoutComponents();

  assert.equal(layoutComponents.components.length, 6);
  assert.equal(layoutComponents.components[5].componentType, "divider");
  assert.equal(layoutComponents.components[5].preview.items[0], "Section A");
  assert.equal(layoutComponents.summary.supportsWorkbenchLayouts, true);
});

test("createLayoutComponents normalizes invalid layout identity and numeric payloads", () => {
  const { layoutComponents } = createLayoutComponents({
    layoutSystem: {
      layoutSystemId: { invalid: true },
      grid: {
        columns: "12",
        gutter: 0,
        maxContentWidth: null,
        workbenchMinWidth: -40,
      },
      spacingScale: {
        sm: Number.NaN,
        md: "12",
        lg: Infinity,
      },
      sectionRhythm: {
        pageTop: false,
        sectionGap: "",
        panelGap: -8,
        contentGap: {},
      },
      containerWidths: {
        standard: 0,
        wide: "wide",
      },
    },
  });

  assert.equal(layoutComponents.layoutComponentLibraryId, "layout-components:nexus");
  assert.equal(layoutComponents.components[0].layoutRules.maxWidth, 960);
  assert.equal(layoutComponents.components[0].layoutRules.wideWidth, 1280);
  assert.equal(layoutComponents.components[1].layoutRules.gap, 32);
  assert.equal(layoutComponents.components[1].layoutRules.contentGap, 12);
  assert.equal(layoutComponents.components[2].layoutRules.gap, 12);
  assert.equal(layoutComponents.components[3].layoutRules.columns, 12);
  assert.equal(layoutComponents.components[3].layoutRules.gutter, 20);
  assert.equal(layoutComponents.components[4].layoutRules.minWidth, 1180);
});

test("createLayoutComponents ignores non-object layout groups and emits safe defaults", () => {
  const { layoutComponents } = createLayoutComponents({
    layoutSystem: {
      layoutSystemId: "layout-system:design-tokens:nexus",
      grid: "invalid",
      spacingScale: 3,
      sectionRhythm: null,
      containerWidths: "wide",
    },
  });

  assert.equal(layoutComponents.layoutComponentLibraryId, "layout-components:layout-system:design-tokens:nexus");
  assert.equal(layoutComponents.components[0].layoutRules.paddingX, 20);
  assert.equal(layoutComponents.components[3].layoutRules.columns, 12);
  assert.equal(layoutComponents.components[4].layoutRules.padding, 20);
  assert.equal(layoutComponents.components[5].layoutRules.spacingBefore, 12);
});
