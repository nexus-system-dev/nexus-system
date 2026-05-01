import test from "node:test";
import assert from "node:assert/strict";

import { createCoreMessagingFramework } from "../src/core/core-messaging-framework.js";

test("core messaging framework returns ready messaging from nexus positioning", () => {
  const { messagingFramework } = createCoreMessagingFramework({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:operators",
      status: "ready",
      audience: "product operators",
      problem: "Teams lose momentum between planning and execution",
      promise: "Nexus executes scoped work with governed multi-agent flows",
      differentiation: ["execution-native system", "state-first orchestration"],
      proofPoints: ["governed approvals", "shared project context"],
      competitiveContext: {
        weaknesses: ["new workflow adoption"],
      },
    },
  });

  assert.equal(messagingFramework.messagingFrameworkId, "messaging-framework:nexus-positioning:operators");
  assert.equal(messagingFramework.status, "ready");
  assert.deepEqual(messagingFramework.missingInputs, []);
  assert.equal(messagingFramework.audience, "product operators");
  assert.equal(messagingFramework.headline, "Nexus executes scoped work with governed multi-agent flows");
  assert.equal(messagingFramework.subheadline, "Teams lose momentum between planning and execution");
  assert.deepEqual(
    messagingFramework.valueProps.map((entry) => entry.label),
    [
      "execution-native system",
      "state-first orchestration",
      "governed approvals",
      "shared project context",
    ],
  );
  assert.equal(messagingFramework.objections[0].concern, "new workflow adoption");
  assert.equal(messagingFramework.ctaAngles.length, 2);
});

test("core messaging framework exposes missing-inputs when nexus positioning is not ready", () => {
  const { messagingFramework } = createCoreMessagingFramework({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:operators",
      status: "missing-inputs",
      audience: "product operators",
      problem: "Teams lose momentum",
      promise: "Nexus executes scoped work",
      differentiation: [],
      proofPoints: [],
      competitiveContext: null,
    },
  });

  assert.equal(messagingFramework.status, "missing-inputs");
  assert.deepEqual(messagingFramework.missingInputs, ["nexusPositioning"]);
  assert.deepEqual(messagingFramework.valueProps, []);
  assert.deepEqual(messagingFramework.objections, []);
  assert.deepEqual(messagingFramework.ctaAngles, []);
});
