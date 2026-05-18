import test from "node:test";
import assert from "node:assert/strict";

import { createReleasePlanGenerator } from "../src/core/release-plan-generator.js";

test("release plan generator creates web deployment release plan for saas", () => {
  const { releasePlan, releaseSteps } = createReleasePlanGenerator({
    projectState: {
      lifecycle: {
        currentPhase: "validation",
      },
      recommendedDefaults: {
        hosting: {
          target: "web-deployment",
        },
      },
    },
    domain: "saas",
    productClass: "saas",
    domainProfile: {
      productClass: "saas",
      releaseTargets: ["web-deployment", "private-deployment"],
    },
  });

  assert.equal(releasePlan.productClass, "saas");
  assert.equal(releasePlan.projectStage, "build-validation");
  assert.equal(releasePlan.releaseTarget, "web-deployment");
  assert.equal(releasePlan.releaseTargetTaxonomy.category, "deployment");
  assert.equal(releaseSteps[0].step, "build");
  assert.equal(releaseSteps.some((step) => step.step === "deploy"), true);
});

test("release plan generator falls back to domain release target when not provided", () => {
  const { releasePlan } = createReleasePlanGenerator({
    projectState: {},
    domain: "mobile-app",
    productClass: "mobile-app",
    domainProfile: {
      productClass: "mobile-app",
      releaseTargets: ["app-store", "play-store"],
    },
  });

  assert.equal(releasePlan.releaseTarget, "app-store");
  assert.equal(releasePlan.runtimeDirection.targetPlatform, "mobile");
});
