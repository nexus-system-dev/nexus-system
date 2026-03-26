import test from "node:test";
import assert from "node:assert/strict";

import { createArtifactAndBuildLogPanel } from "../src/core/artifact-build-log-panel.js";

test("artifact and build log panel returns canonical build, package and verification state", () => {
  const { artifactBuildPanel } = createArtifactAndBuildLogPanel({
    artifactRecord: {
      buildTarget: "web-build",
      version: "1.2.0",
      status: "registered",
      artifacts: ["build-output", "static-assets"],
      outputPaths: ["dist/build-output", "dist/static-assets"],
    },
    packagedArtifact: {
      packageFormat: "static-bundle",
      files: ["packages/web/app.zip"],
      metadata: {
        verificationStatus: "verified",
      },
    },
    packageVerification: {
      isValid: true,
      packageFormat: "static-bundle",
      requiredPackageArtifacts: ["static-bundle"],
      missingPackageArtifacts: [],
    },
  });

  assert.equal(artifactBuildPanel.build.buildTarget, "web-build");
  assert.equal(artifactBuildPanel.build.artifacts.length, 2);
  assert.equal(artifactBuildPanel.package.files[0].path, "packages/web/app.zip");
  assert.equal(artifactBuildPanel.verification.isValid, true);
  assert.equal(artifactBuildPanel.summary.verificationStatus, "verified");
});

test("artifact and build log panel falls back to canonical defaults", () => {
  const { artifactBuildPanel } = createArtifactAndBuildLogPanel();

  assert.equal(artifactBuildPanel.build.buildTarget, "unknown-build");
  assert.equal(Array.isArray(artifactBuildPanel.build.artifacts), true);
  assert.equal(Array.isArray(artifactBuildPanel.package.files), true);
  assert.equal(artifactBuildPanel.verification.isValid, false);
});
