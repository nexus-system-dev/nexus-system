import test from "node:test";
import assert from "node:assert/strict";

import { createPackagingManifestBuilder } from "../src/core/packaging-manifest-builder.js";

test("packaging manifest builder returns files metadata and assets", () => {
  const { packagingManifest } = createPackagingManifestBuilder({
    buildArtifact: ["build-output", "static-assets"],
    packageFormat: "static-bundle",
  });

  assert.equal(packagingManifest.packageFormat, "static-bundle");
  assert.equal(packagingManifest.files[0], "dist/build-output");
  assert.equal(packagingManifest.metadata.artifactCount, 2);
  assert.equal(packagingManifest.assets[0].role, "static-bundle");
});

test("packaging manifest builder falls back to empty manifest", () => {
  const { packagingManifest } = createPackagingManifestBuilder();

  assert.equal(Array.isArray(packagingManifest.files), true);
  assert.equal(packagingManifest.metadata.artifactCount, 0);
});
