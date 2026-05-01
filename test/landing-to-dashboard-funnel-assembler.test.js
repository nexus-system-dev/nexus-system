import test from "node:test";
import assert from "node:assert/strict";

import { createLandingToDashboardFunnelAssembler } from "../src/core/landing-to-dashboard-funnel-assembler.js";

test("landing to dashboard funnel includes first project stage when kickoff is ready", () => {
  const { landingToDashboardFlow } = createLandingToDashboardFunnelAssembler({
    landingAuthHandoff: { landingAuthHandoffId: "handoff-1", status: "ready", destinationRoute: "/signup" },
    appEntryDecision: { appEntryDecisionId: "entry-1", status: "ready", destination: "/app" },
    postLoginDestination: { postLoginDestinationId: "post-1", status: "ready", destination: "first-project-kickoff" },
    firstProjectKickoff: { status: "ready", destinationRoute: "/app/new-project" },
  });

  assert.equal(landingToDashboardFlow.status, "ready");
  assert.equal(landingToDashboardFlow.stages.at(-1).stageId, "first-project");
});
