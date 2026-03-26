import test from "node:test";
import assert from "node:assert/strict";

import { createPackageAssembler } from "../src/core/package-assembler.js";

test("package assembler returns packaged artifact from manifest and artifacts", () => {
  const { packagedArtifact } = createPackageAssembler({
    buildArtifact: ["build-output", "static-assets"],
    packagingManifest: {
      packageFormat: "static-bundle",
      files: ["dist/build-output", "dist/static-assets"],
      assets: [{ name: "build-output", role: "static-bundle", path: "dist/build-output" }],
      metadata: {
        artifactCount: 2,
      },
    },
  });

  assert.equal(packagedArtifact.packageFormat, "static-bundle");
  assert.equal(packagedArtifact.files.length, 2);
  assert.equal(packagedArtifact.sourceArtifacts.length, 2);
  assert.equal(packagedArtifact.metadata.sourceArtifactCount, 2);
});

test("package assembler falls back to empty package", () => {
  const { packagedArtifact } = createPackageAssembler();

  assert.equal(packagedArtifact.packageFormat, "deployment-package");
  assert.equal(Array.isArray(packagedArtifact.files), true);
});
