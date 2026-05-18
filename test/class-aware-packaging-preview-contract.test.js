import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwarePackagingPreviewContract } from "../src/core/class-aware-packaging-preview-contract.js";

test("packaging preview contract keeps landing-page preview and package web-specific", () => {
  const { classAwarePackagingPreviewContract } = createClassAwarePackagingPreviewContract({
    productClass: "landing-page",
    classAwareRuntimeResolver: {
      previewFamily: "web-preview",
      packagingFamily: "web-build",
      preferredReleaseTarget: "web-deployment",
      shellPath: "browser-backed-local-workspace",
    },
  });

  assert.equal(classAwarePackagingPreviewContract.previewMode, "live-browser-preview");
  assert.equal(classAwarePackagingPreviewContract.packageMode, "static-web-build");
  assert.equal(classAwarePackagingPreviewContract.summary.previewPath, "web-preview -> live-browser-preview");
  assert.equal(classAwarePackagingPreviewContract.summary.packagePath, "web-build -> web-deployment");
});

test("packaging preview contract keeps mobile preview and package tied to archive output", () => {
  const { classAwarePackagingPreviewContract } = createClassAwarePackagingPreviewContract({
    productClass: "mobile-app",
    classAwareRuntimeResolver: {
      previewFamily: "mobile-simulator",
      packagingFamily: "mobile-package",
      preferredReleaseTarget: "app-store",
      shellPath: "local-bridge-attached-workspace",
    },
    remoteMacRunner: {
      archive: {
        artifactPath: "artifacts/ios/app.ipa",
      },
    },
  });

  assert.equal(classAwarePackagingPreviewContract.previewMode, "mobile-simulator-preview");
  assert.equal(classAwarePackagingPreviewContract.packageMode, "signed-mobile-archive");
  assert.equal(classAwarePackagingPreviewContract.mobileArchivePath, "artifacts/ios/app.ipa");
  assert.equal(classAwarePackagingPreviewContract.summary.packagePath, "mobile-package -> artifacts/ios/app.ipa");
});
