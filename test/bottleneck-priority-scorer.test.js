import test from "node:test";
import assert from "node:assert/strict";

import { createBottleneckPriorityScorer } from "../src/core/bottleneck-priority-scorer.js";

test("bottleneck priority scorer marks release blocker on critical path as critical", () => {
  const { scoredBottleneck } = createBottleneckPriorityScorer({
    activeBottleneck: {
      bottleneckId: "active-bottleneck:release:1",
      blockerType: "release-blocker",
      severity: "high",
      affectedFlow: "release",
    },
    criticalPath: {
      isBlocked: true,
      blockers: ["active-bottleneck:release:1"],
    },
  });

  assert.equal(scoredBottleneck.priorityScore, 80);
  assert.equal(scoredBottleneck.summary.priorityBand, "critical");
  assert.equal(scoredBottleneck.summary.onCriticalPath, true);
});

test("bottleneck priority scorer falls back to medium/low without critical path", () => {
  const { scoredBottleneck } = createBottleneckPriorityScorer({
    activeBottleneck: {
      bottleneckId: "active-bottleneck:graph:1",
      blockerType: "graph-blocker",
      severity: "medium",
      affectedFlow: "execution",
    },
  });

  assert.equal(scoredBottleneck.priorityScore, 45);
  assert.equal(scoredBottleneck.summary.priorityBand, "high");
  assert.equal(scoredBottleneck.userValueImpact, "low");
});
