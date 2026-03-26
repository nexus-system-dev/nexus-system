import test from "node:test";
import assert from "node:assert/strict";

import { createArtifactRegistryModule } from "../src/core/artifact-registry-module.js";

test("artifact registry module stores metadata about artifacts and output paths", () => {
  const { artifactRecord } = createArtifactRegistryModule({
    buildResult: {
      buildTarget: "web-build",
      artifacts: ["build-output", "static-assets"],
      outputPaths: ["dist/build-output", "dist/static-assets"],
      version: "1.2.0",
      status: "ready",
    },
  });

  assert.equal(artifactRecord.buildTarget, "web-build");
  assert.equal(artifactRecord.version, "1.2.0");
  assert.equal(artifactRecord.artifactCount, 2);
  assert.equal(artifactRecord.outputPaths[0], "dist/build-output");
});

test("artifact registry module falls back to empty metadata", () => {
  const { artifactRecord } = createArtifactRegistryModule();

  assert.equal(artifactRecord.buildTarget, "unknown-build");
  assert.equal(artifactRecord.artifactCount, 0);
  assert.equal(Array.isArray(artifactRecord.outputPaths), true);
});
