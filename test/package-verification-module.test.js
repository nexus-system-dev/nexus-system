import test from "node:test";
import assert from "node:assert/strict";

import { createPackageVerificationModule } from "../src/core/package-verification-module.js";

test("package verification module validates matching package format", () => {
  const { packageVerification } = createPackageVerificationModule({
    packagedArtifact: {
      packageFormat: "static-bundle",
      files: ["dist/build-output"],
    },
    packagingRequirements: {
      requiredPackageArtifacts: ["static-bundle"],
    },
  });

  assert.equal(packageVerification.isValid, true);
  assert.deepEqual(packageVerification.missingPackageArtifacts, []);
});

test("package verification module reports missing package artifacts", () => {
  const { packageVerification } = createPackageVerificationModule({
    packagedArtifact: {
      packageFormat: "deployment-package",
      files: ["dist/build-output"],
    },
    packagingRequirements: {
      requiredPackageArtifacts: ["store-package"],
    },
  });

  assert.equal(packageVerification.isValid, false);
  assert.equal(packageVerification.missingPackageArtifacts.includes("store-package"), true);
});
