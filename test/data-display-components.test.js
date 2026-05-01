import test from "node:test";
import assert from "node:assert/strict";

import { createDataDisplayComponents } from "../src/core/data-display-components.js";

test("createDataDisplayComponents builds canonical data display library", () => {
  const { dataDisplayComponents } = createDataDisplayComponents({
    screenInventory: {
      screens: [
        { screenType: "dashboard" },
        { screenType: "workspace" },
        { screenType: "tracking" },
      ],
    },
  });

  assert.equal(dataDisplayComponents.components.length, 6);
  assert.equal(dataDisplayComponents.components[0].componentType, "table");
  assert.deepEqual(dataDisplayComponents.components[0].preview.headers, ["Service", "Status", "Owner"]);
  assert.deepEqual(dataDisplayComponents.components[5].supportedScreenTypes, ["dashboard", "workspace", "tracking"]);
  assert.deepEqual(dataDisplayComponents.components[5].preview.items, ["Ready", "Partial", "Blocked"]);
  assert.equal(dataDisplayComponents.summary.totalComponents, 6);
  assert.equal(dataDisplayComponents.summary.totalSupportedScreenTypes, 3);
  assert.equal(dataDisplayComponents.summary.supportsOperationalDashboards, true);
});

test("createDataDisplayComponents falls back safely without explicit screen inventory", () => {
  const { dataDisplayComponents } = createDataDisplayComponents();

  assert.equal(dataDisplayComponents.components.length, 6);
  assert.equal(dataDisplayComponents.components[2].componentType, "activity-log");
  assert.equal(dataDisplayComponents.components[2].preview.items[0], "Owner approved deploy");
  assert.equal(dataDisplayComponents.summary.supportsOperationalDashboards, true);
});

test("createDataDisplayComponents normalizes invalid screen payloads to canonical screen type lists", () => {
  const { dataDisplayComponents } = createDataDisplayComponents({
    screenInventory: {
      screens: [
        { screenType: " dashboard " },
        { screenType: 42 },
        null,
        "bad",
      ],
    },
  });

  assert.equal(dataDisplayComponents.dataDisplayLibraryId, "data-display-components:1");
  assert.deepEqual(dataDisplayComponents.components[0].supportedScreenTypes, ["dashboard"]);
  assert.deepEqual(dataDisplayComponents.components[5].supportedScreenTypes, ["dashboard"]);
  assert.equal(dataDisplayComponents.summary.totalSupportedScreenTypes, 1);
});

test("createDataDisplayComponents ignores non-object screen inventories", () => {
  const { dataDisplayComponents } = createDataDisplayComponents({
    screenInventory: {
      screens: "invalid",
    },
  });

  assert.equal(dataDisplayComponents.dataDisplayLibraryId, "data-display-components:nexus");
  assert.deepEqual(dataDisplayComponents.components[0].supportedScreenTypes, []);
  assert.equal(dataDisplayComponents.summary.totalSupportedScreenTypes, 0);
});
