import test from "node:test";
import assert from "node:assert/strict";
import { createNexusContentStrategyProfile } from "../src/core/nexus-content-strategy-profile.js";

test("nexus content strategy profile derives pillars and channel fit", () => {
  const { nexusContentStrategy } = createNexusContentStrategyProfile({
    nexusPositioning: { nexusPositioningId: "positioning-1", status: "ready", problem: "Teams stall", promise: "Nexus keeps them moving", differentiation: ["governed execution"] },
    messagingVariants: { status: "ready", segments: ["product-teams"] },
  });
  assert.equal(nexusContentStrategy.status, "ready");
  assert.equal(nexusContentStrategy.pillars.length >= 2, true);
});
