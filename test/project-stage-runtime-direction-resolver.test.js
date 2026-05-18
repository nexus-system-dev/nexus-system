import test from "node:test";
import assert from "node:assert/strict";

import { resolveProjectStageAndRuntimeDirection } from "../src/core/project-stage-runtime-direction-resolver.js";

test("runtime direction resolver returns bootstrap-stage web runtime for landing-page", () => {
  const result = resolveProjectStageAndRuntimeDirection({
    productClass: "landing-page",
    projectIntake: {
      projectType: "landing-page",
      visionText: "Landing page for a coaching business.",
    },
    domainProfile: {
      productClass: "landing-page",
      releaseTargets: ["web-deployment", "private-deployment"],
    },
    recommendedDefaults: {
      hosting: {
        target: "web-deployment",
      },
    },
  });

  assert.equal(result.projectStage, "bootstrap");
  assert.equal(result.runtimeDirection.runtimeFamily, "web-static");
  assert.equal(result.runtimeDirection.previewFamily, "web-preview");
  assert.equal(result.runtimeDirection.preferredReleaseTarget, "web-deployment");
});

test("runtime direction resolver returns release-prep for mobile app with release target", () => {
  const result = resolveProjectStageAndRuntimeDirection({
    productClass: "mobile-app",
    domainProfile: {
      productClass: "mobile-app",
      releaseTargets: ["app-store", "play-store"],
    },
    projectState: {
      lifecycle: {
        phase: "release",
      },
      releasePlan: {
        releaseTarget: "internal-distribution",
      },
    },
  });

  assert.equal(result.projectStage, "release-prep");
  assert.equal(result.runtimeDirection.targetPlatform, "mobile");
  assert.equal(result.runtimeDirection.preferredReleaseTarget, "internal-distribution");
});
