import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwareRuntimeResolver } from "../src/core/class-aware-runtime-resolver.js";

test("class-aware runtime resolver keeps landing-page runtime deterministic and visible", () => {
  const { classAwareRuntimeResolver } = createClassAwareRuntimeResolver({
    productClass: "landing-page",
    runtimeDirection: {
      runtimeFamily: "web-static",
      packagingFamily: "web-build",
      releasePathFamily: "web-deployment",
      previewFamily: "web-preview",
      buildSurfaceFamily: "web-marketing-surface",
      targetPlatform: "web",
      preferredReleaseTarget: "web-deployment",
    },
    desktopShellScopeContract: {
      shellFamily: "browser-backed-shell",
      shellPathDecision: {
        currentWave4Path: "browser-backed-local-workspace",
      },
    },
  });

  assert.equal(classAwareRuntimeResolver.runtimeFamily, "web-static");
  assert.equal(classAwareRuntimeResolver.packagingFamily, "web-build");
  assert.equal(classAwareRuntimeResolver.releasePathFamily, "web-deployment");
  assert.equal(classAwareRuntimeResolver.shellPath, "browser-backed-local-workspace");
  assert.equal(classAwareRuntimeResolver.summary.projectFacingPath, "web-static -> web-deployment");
});

test("class-aware runtime resolver routes mobile app through mobile runtime and apple shell path", () => {
  const { classAwareRuntimeResolver } = createClassAwareRuntimeResolver({
    productClass: "mobile-app",
    runtimeDirection: {
      runtimeFamily: "mobile-runtime",
      packagingFamily: "mobile-package",
      releasePathFamily: "app-distribution",
      previewFamily: "mobile-simulator",
      preferredReleaseTarget: "app-store",
      targetPlatform: "mobile",
    },
    desktopShellScopeContract: {
      shellFamily: "apple-desktop-shell",
      shellPathDecision: {
        currentWave4Path: "local-bridge-attached-workspace",
      },
    },
  });

  assert.equal(classAwareRuntimeResolver.runtimeFamily, "mobile-runtime");
  assert.equal(classAwareRuntimeResolver.releasePathFamily, "app-distribution");
  assert.equal(classAwareRuntimeResolver.preferredReleaseTarget, "app-store");
  assert.equal(classAwareRuntimeResolver.shellFamily, "apple-desktop-shell");
});
