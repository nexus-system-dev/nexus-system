import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapPlanGenerator } from "../src/core/bootstrap-plan-generator.js";

test("bootstrap plan generator builds bootstrap plan and tasks from domain intake and defaults", () => {
  const result = createBootstrapPlanGenerator({
    projectIntake: {
      projectName: "GiftWallet",
      requestedDeliverables: ["auth", "payments"],
    },
    domain: "saas",
    recommendedDefaults: {
      stack: {
        frontend: "nextjs",
        backend: "node",
        database: "postgres",
      },
      execution: {
        mode: "temp-branch",
      },
      hosting: {
        target: "web-deployment",
      },
    },
    domainProfile: {
      bootstrapRules: ["initialize-app-shell", "initialize-auth-core", "initialize-billing-foundation"],
    },
  });

  assert.equal(result.bootstrapPlan.domain, "saas");
  assert.equal(result.bootstrapPlan.targetPlatform, "web");
  assert.equal(result.bootstrapPlan.taskCount, 3);
  assert.equal(result.bootstrapPlan.executionMode, "temp-branch");
  assert.equal(result.bootstrapPlan.bootstrapTemplate.artifacts.includes("web-entrypoint"), true);
  assert.equal(result.bootstrapPlan.parameterizedTemplate.resolvedParams.projectName, "GiftWallet");
  assert.equal(result.bootstrapPlan.parameterizedTemplate.resolvedParams.routing, "app-router");
  assert.equal(result.bootstrapPlan.artifactManifest.hostingTarget, "web-deployment");
  assert.equal(result.bootstrapTasks.length, 3);
  assert.equal(result.bootstrapTasks[0].summary, "Bootstrap: initialize-app-shell");
});
