import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { PRIMARY_LOOP_ROUTES } from "../web/nexus-ui/routes/index.js";
import { LEGACY_FRONTEND_DECOMPOSITION_MAP } from "../web/nexus-ui/routes/legacy-decomposition.js";

function read(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("understanding is preserved as hidden interpretation engine, not a standalone visible route", () => {
  assert.equal(PRIMARY_LOOP_ROUTES.includes("understanding"), false);
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.understanding.action, "remove visible");
  assert.equal(
    LEGACY_FRONTEND_DECOMPOSITION_MAP.understanding.enginePreserved,
    "intent interpretation and artifact expectation",
  );

  const appSource = read("web/app.js");
  assert.doesNotMatch(appSource, /understanding:\s*["']\/understanding["']/);
  assert.doesNotMatch(appSource, /syncBrowserShellRoute\(["']understanding["']/);
  assert.doesNotMatch(appSource, /renderShellChrome\(["']understanding["']/);
  assert.doesNotMatch(appSource, /setAppScreen\(["']understanding["']/);
  assert.doesNotMatch(appSource, /persistFlowState\(["']understanding["']/);
  assert.doesNotMatch(appSource, /target === ["']understanding["']/);

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
    assert.doesNotMatch(source, /currentRoute:\s*["']\/understanding["']/, `${sourcePath} still marks /understanding active`);
    assert.doesNotMatch(source, /href:\s*["']\/understanding["']/, `${sourcePath} still links to /understanding`);
    assert.doesNotMatch(source, /target:\s*["']understanding["']/, `${sourcePath} still targets understanding as visible route`);
    assert.doesNotMatch(source, /data-nexus-ui-qa-target=["']understanding["']/, `${sourcePath} still exposes understanding in QA nav`);
    assert.doesNotMatch(source, /renderNexusQaNav\(["']understanding["']\)/, `${sourcePath} still exposes understanding as QA route`);
  }
});
