import test from "node:test";
import assert from "node:assert/strict";

import { createPackagingResultEnvelope } from "../src/core/packaging-result-envelope.js";

test("packaging result envelope returns package with manifest and verification metadata", () => {
  const { packagedArtifact } = createPackagingResultEnvelope({
    packagedArtifact: {
      packageFormat: "static-bundle",
      files: ["dist/app.zip"],
    },
    packagingManifest: {
      files: ["dist/app.zip"],
      assets: ["icon.png"],
    },
    packageVerification: {
      isValid: true,
    },
  });

  assert.equal(packagedArtifact.packageFormat, "static-bundle");
  assert.equal(Array.isArray(packagedArtifact.files), true);
  assert.equal(Array.isArray(packagedArtifact.packagingManifest.assets), true);
  assert.equal(packagedArtifact.metadata.verificationStatus, "verified");
});

test("packaging result envelope falls back to pending verification metadata", () => {
  const { packagedArtifact } = createPackagingResultEnvelope({
    packagedArtifact: {
      packageFormat: "deployment-package",
      files: [],
    },
    packagingManifest: null,
    packageVerification: {
      isValid: false,
    },
  });

  assert.equal(packagedArtifact.metadata.verificationStatus, "pending");
  assert.equal(packagedArtifact.metadata.fileCount, 0);
});
