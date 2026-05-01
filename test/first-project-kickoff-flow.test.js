import test from "node:test";
import assert from "node:assert/strict";

import { createFirstProjectKickoffFlow } from "../src/core/first-project-kickoff-flow.js";

test("first project kickoff flow returns ready kickoff for new users", () => {
  const { firstProjectKickoff } = createFirstProjectKickoffFlow({
    postLoginDestination: {
      postLoginDestinationId: "post-login-destination:new-user",
      status: "ready",
      destination: "first-project-kickoff",
    },
    activationFunnel: {
      status: "ready",
      stages: [{ stageId: "activation-stage:signup" }, { stageId: "activation-stage:first-project" }],
    },
    onboardingSession: {
      sessionId: "session-1",
      status: "in-progress",
      currentStep: "capture-vision",
    },
  });

  assert.equal(firstProjectKickoff.status, "ready");
  assert.equal(firstProjectKickoff.kickoffStage, "resume");
  assert.equal(firstProjectKickoff.destinationRoute, "/app/new-project");
});
