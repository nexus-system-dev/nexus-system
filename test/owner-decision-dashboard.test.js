import test from "node:test";
import assert from "node:assert/strict";
import { createOwnerDecisionDashboard } from "../src/core/owner-decision-dashboard.js";

test("owner decision dashboard uses approval chain and recommendations", () => {
  const { ownerDecisionDashboard } = createOwnerDecisionDashboard({
    ownerActionRecommendations: { ownerActionRecommendationsId: "actions-1", status: "ready", recommendations: [{}, {}] },
    approvalChain: { status: "pending", entries: [{}, {}] },
  });
  assert.equal(ownerDecisionDashboard.status, "ready");
  assert.equal(ownerDecisionDashboard.approvalEntries, 2);
});
