import test from "node:test";
import assert from "node:assert/strict";

import { createInstantValueOutputResolver } from "../src/core/instant-value-output-resolver.js";

test("instant value output resolver prefers wireframe when design input exists", () => {
  const { instantValuePlan } = createInstantValueOutputResolver({
    projectIdentity: {
      identityId: "project-identity:giftwallet",
      name: "GiftWallet",
      successDefinition: "Deliver wireframe, bootstrap",
    },
    onboardingSession: {
      projectIntake: {
        requestedDeliverables: ["design-input", "auth"],
      },
    },
    domainCapabilities: {
      taskTypes: ["frontend", "growth"],
    },
  });

  assert.equal(instantValuePlan.outputType, "wireframe");
  assert.equal(instantValuePlan.summary.prefersVisibleOutput, true);
});

test("instant value output resolver falls back to bootstrap for execution-first projects", () => {
  const { instantValuePlan } = createInstantValueOutputResolver({
    projectIdentity: {
      identityId: "project-identity:api-core",
      name: "API Core",
      successDefinition: "Deliver auth and billing foundation",
    },
    domainCapabilities: {
      taskTypes: ["backend"],
    },
  });

  assert.equal(instantValuePlan.outputType, "bootstrap");
  assert.equal(instantValuePlan.summary.isExecutionBacked, true);
});
