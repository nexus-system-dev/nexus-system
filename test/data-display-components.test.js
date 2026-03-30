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
