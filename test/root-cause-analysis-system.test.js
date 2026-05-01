import test from "node:test";
import assert from "node:assert/strict";
import { createRootCauseAnalysisSystem } from "../src/core/root-cause-analysis-system.js";

test("root cause analysis system emits ready summary", () => {
  const { rootCauseSummary } = createRootCauseAnalysisSystem({
    incidentTimeline: { incidentTimelineId: "timeline-1", status: "ready" },
    causalImpactReport: { primaryCause: "queue-saturation", affectedServices: ["worker-queue"] },
  });

  assert.equal(rootCauseSummary.status, "ready");
  assert.equal(rootCauseSummary.suspectedCause, "queue-saturation");
});
