import test from "node:test";
import assert from "node:assert/strict";
import { createFocusAreaSelector } from "../src/core/focus-area-selector.js";
test("focus area selector uses workflow focus theme", () => {
  const { ownerFocusArea } = createFocusAreaSelector({
    ownerDailyWorkflow: { ownerDailyWorkflowId: "workflow-1", status: "ready", focusTheme: "growth" },
    ownerControlCenter: { status: "ready", healthStatus: "stable" },
  });
  assert.equal(ownerFocusArea.status, "ready");
  assert.equal(ownerFocusArea.area, "growth");
});
