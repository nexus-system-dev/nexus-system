import test from "node:test";
import assert from "node:assert/strict";

import { createBuildTargetResolver } from "../src/core/build-target-resolver.js";

test("build target resolver returns web and domain-specific builds for saas", () => {
  const { buildTargets, artifactManifest } = createBuildTargetResolver({
    domain: "saas",
    releaseTarget: "web-deployment",
  });

  assert.equal(buildTargets.includes("web-build"), true);
  assert.equal(buildTargets.includes("auth-build"), true);
  assert.equal(artifactManifest.releaseTarget, "web-deployment");
  assert.equal(artifactManifest.outputs.length >= 2, true);
});

test("build target resolver falls back to private deployment defaults", () => {
  const { buildTargets, artifactManifest } = createBuildTargetResolver({
    domain: "generic",
    releaseTarget: "unknown-target",
  });

  assert.equal(buildTargets.includes("app-build"), true);
  assert.equal(artifactManifest.outputs[0].artifactId, "app-build-artifact");
});
