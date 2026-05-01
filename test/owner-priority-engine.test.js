import test from "node:test";
import assert from "node:assert/strict";
import { createOwnerPriorityEngine } from "../src/core/owner-priority-engine.js";

test("owner priority engine emits a top priority", () => {
  const { ownerPriorityQueue } = createOwnerPriorityEngine({
    dailyOwnerOverview: { dailyOwnerOverviewId: "overview-1", status: "ready", openIssues: 1 },
    ownerControlCenter: { healthStatus: "stable" },
  });
  assert.equal(ownerPriorityQueue.status, "ready");
  assert.equal(ownerPriorityQueue.priorities[0].urgency, "high");
});
