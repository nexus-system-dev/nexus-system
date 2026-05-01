import test from "node:test";
import assert from "node:assert/strict";

import { createAppEntryTrustAndOrientationPanel } from "../src/core/app-entry-trust-orientation-panel.js";

test("app entry trust orientation panel surfaces trust points", () => {
  const { entryOrientationPanel } = createAppEntryTrustAndOrientationPanel({
    appLandingEntry: { appLandingEntryId: "entry-1", status: "ready", heroTitle: "Request access" },
    trustProofBlocks: {
      status: "ready",
      blocks: [{ title: "Governed execution" }, { title: "Shared context" }],
    },
  });

  assert.equal(entryOrientationPanel.status, "ready");
  assert.deepEqual(entryOrientationPanel.trustPoints, ["Governed execution", "Shared context"]);
});
