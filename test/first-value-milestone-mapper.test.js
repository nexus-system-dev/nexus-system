import test from "node:test";
import assert from "node:assert/strict";
import { createFirstValueMilestoneMapper } from "../src/core/first-value-milestone-mapper.js";

test("first value milestone mapper emits ready milestones from activation funnel", () => {
  const { activationMilestones } = createFirstValueMilestoneMapper({
    activationFunnel: { activationFunnelId: "funnel-1", status: "ready" },
    projectJourneys: { flows: [{ flowId: "journey-1" }] },
    firstValueSummary: { summary: { hasVisibleOutcome: true } },
  });
  assert.equal(activationMilestones.status, "ready");
  assert.equal(activationMilestones.milestones.length, 6);
});
