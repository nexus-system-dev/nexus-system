import test from "node:test";
import assert from "node:assert/strict";
import { createActionRecommendationSystem } from "../src/core/action-recommendation-system.js";

test("action recommendation system emits owner action recommendations", () => {
  const { ownerActionRecommendations } = createActionRecommendationSystem({
    ownerPriorityQueue: { ownerPriorityQueueId: "queue-1", status: "ready", priorities: [{ area: "growth" }] },
    ownerControlCenter: { status: "ready", traceId: "trace-1" },
  });
  assert.equal(ownerActionRecommendations.status, "ready");
  assert.equal(ownerActionRecommendations.recommendations[0].actionArea, "growth");
});
