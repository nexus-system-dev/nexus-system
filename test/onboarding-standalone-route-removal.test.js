import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { PRIMARY_LOOP_ROUTES } from "../web/nexus-ui/routes/index.js";
import { LEGACY_FRONTEND_DECOMPOSITION_MAP } from "../web/nexus-ui/routes/legacy-decomposition.js";

function read(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("onboarding is preserved as a hidden engine, not a standalone visible route", () => {
  assert.equal(PRIMARY_LOOP_ROUTES.includes("onboarding"), false);
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.onboarding.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.onboarding.enginePreserved, "onboarding intake hidden engine");

  const appSource = read("web/app.js");
  assert.doesNotMatch(appSource, /onboarding:\s*["']\/onboarding["']/);
  assert.doesNotMatch(appSource, /syncBrowserShellRoute\(["']onboarding["']/);
  assert.doesNotMatch(appSource, /renderShellChrome\(["']onboarding["']/);
  assert.doesNotMatch(appSource, /setAppScreen\(["']onboarding["']/);

  const visibleShellSources = [
    "web/nexus-ui/components/NexusQaNav.js",
    "web/nexus-ui/screens/ArtifactPreviewScreen.js",
    "web/nexus-ui/screens/ConfirmationDecisionScreen.js",
    "web/nexus-ui/screens/ExecutionLiveScreen.js",
    "web/nexus-ui/screens/FilesSupportScreen.js",
    "web/nexus-ui/screens/HelpSupportScreen.js",
    "web/nexus-ui/screens/HomeSupportScreen.js",
    "web/nexus-ui/screens/LoopCoreScreen.js",
    "web/nexus-ui/screens/NextTaskScreen.js",
    "web/nexus-ui/screens/ProofResultScreen.js",
    "web/nexus-ui/screens/QaFallbackScreen.js",
    "web/nexus-ui/screens/SettingsScreen.js",
    "web/nexus-ui/screens/SmartOnboardingScreen.js",
    "web/nexus-ui/screens/StateUpdateScreen.js",
    "web/nexus-ui/screens/TimelineHistoryScreen.js",
    "web/nexus-ui/screens/UnderstandingSummaryScreen.js",
  ];

  for (const sourcePath of visibleShellSources) {
    const source = read(sourcePath);
    assert.doesNotMatch(source, /href:\s*["']\/onboarding["']/, `${sourcePath} still links to /onboarding`);
    assert.doesNotMatch(source, /target:\s*["']onboarding["']/, `${sourcePath} still targets onboarding as visible route`);
    assert.doesNotMatch(source, /data-nexus-ui-qa-target=["']onboarding["']/, `${sourcePath} still exposes onboarding in QA nav`);
  }
});
