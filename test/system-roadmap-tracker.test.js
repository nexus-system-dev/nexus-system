import test from "node:test";
import assert from "node:assert/strict";
import { createSystemRoadmapTracker } from "../src/core/system-roadmap-tracker.js";
test("system roadmap tracker emits ready roadmap tracking", () => {
  const { roadmapTracking } = createSystemRoadmapTracker({
    roadmap: [{}, {}],
    taskThroughputSummary: { taskThroughputSummaryId: "throughput-1", status: "ready" },
  });
  assert.equal(roadmapTracking.status, "ready");
});
