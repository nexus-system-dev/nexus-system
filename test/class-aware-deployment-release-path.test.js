import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwareDeploymentReleasePath } from "../src/core/class-aware-deployment-release-path.js";

test("class-aware deployment release path resolves a bounded mobile release path", () => {
  const { classAwareDeploymentReleasePath } = createClassAwareDeploymentReleasePath({
    productClass: "mobile-app",
    classAwareRuntimeResolver: {
      preferredReleaseTarget: "app-store",
    },
    classAwarePackagingPreviewContract: {
      packageArtifactType: "ipa-or-app-bundle",
      summary: {
        previewPath: "ios-simulator-preview -> mobile-simulator-preview",
        packagePath: "signed-mobile-archive -> artifacts/ios/app.ipa",
      },
    },
    releaseableProductStateContract: {
      status: "active",
      releaseTarget: "app-store",
    },
  });

  assert.equal(classAwareDeploymentReleasePath.pathFamily, "mobile-store-release-path");
  assert.equal(classAwareDeploymentReleasePath.providerType, "app-store-connect");
  assert.equal(classAwareDeploymentReleasePath.primaryTarget, "app-store");
  assert.match(classAwareDeploymentReleasePath.operationalPath, /signed-mobile-archive/);
});
