import test from "node:test";
import assert from "node:assert/strict";

import { createInitialTaskSeedingService } from "../src/core/initial-task-seeding-service.js";

test("initial task seeding service generates domain-aware initial tasks", () => {
  const { initialTasks, taskSeedMetadata } = createInitialTaskSeedingService({
    initialProjectState: {
      stateId: "initial-project-state:saas-app",
      identity: {
        projectId: "saas-app",
        name: "SaaS App",
      },
      goals: {
        businessGoal: "Launch a SaaS with onboarding and billing",
        requestedDeliverables: ["auth", "billing", "onboarding", "acquisition"],
      },
      bootstrapMetadata: {
        requestedDeliverables: ["auth", "billing", "onboarding", "acquisition"],
      },
      readiness: {
        status: "ready",
        canBootstrap: true,
      },
    },
    domainDecision: {
      domain: "saas",
      domainCandidates: ["saas", "generic"],
    },
  });

  assert.equal(initialTasks.length >= 3, true);
  assert.equal(initialTasks.some((task) => task.id === "saas-auth"), true);
  assert.equal(initialTasks.some((task) => task.id === "saas-billing"), true);
  assert.equal(taskSeedMetadata.domain, "saas");
  assert.equal(taskSeedMetadata.totalTasks, initialTasks.length);
  assert.equal(taskSeedMetadata.canSeedTasks, true);
});

test("initial task seeding service falls back to generic roadmap when domain is unknown", () => {
  const { initialTasks, taskSeedMetadata } = createInitialTaskSeedingService({
    initialProjectState: {
      stateId: "initial-project-state:generic-app",
      identity: {
        projectId: "generic-app",
      },
      goals: {
        businessGoal: "Launch a first product version",
        requestedDeliverables: ["auth", "payments"],
      },
      bootstrapMetadata: {
        requestedDeliverables: ["auth", "payments"],
      },
      readiness: {
        status: "ready",
        canBootstrap: true,
      },
    },
    domainDecision: {
      domain: "generic",
      domainCandidates: ["generic"],
    },
  });

  assert.equal(initialTasks.some((task) => task.id === "build-auth"), true);
  assert.equal(initialTasks.some((task) => task.id === "payment-integration"), true);
  assert.equal(taskSeedMetadata.seedStrategy, "planner-generated");
});
