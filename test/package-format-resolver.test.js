import test from "node:test";
import assert from "node:assert/strict";

import { createPackageFormatResolver } from "../src/core/package-format-resolver.js";

test("package format resolver returns explicit format hint", () => {
  const { packageFormat } = createPackageFormatResolver({
    releaseTarget: "web-deployment",
    packagingRequirements: {
      packageFormatHint: "static-bundle",
    },
  });

  assert.equal(packageFormat, "static-bundle");
});

test("package format resolver falls back to deployment package", () => {
  const { packageFormat } = createPackageFormatResolver();

  assert.equal(packageFormat, "deployment-package");
});
