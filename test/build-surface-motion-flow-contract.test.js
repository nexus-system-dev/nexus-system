import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
const screenStyles = readFileSync(new URL("../web/nexus-ui/styles/screens.css", import.meta.url), "utf8");

test("SURF-001 motion proof starts in discovery and moves into the build workspace", () => {
  assert.match(appSource, /qaMotionFlow"\)\s*===\s*"discovery-to-build"/);
  assert.match(appSource, /openQaDiscoveryToBuildMotionFlow/);
  assert.match(appSource, /renderCreateScreenView/);
  assert.match(appSource, /is-product-handoff-ready/);
  assert.match(appSource, /is-handoff-morphing/);
  assert.match(appSource, /renderLoopCoreScreenView/);
  assert.match(appSource, /is-handoff-arriving/);
});

test("SURF-001 motion proof carries product truth from the agent envelope", () => {
  assert.match(appSource, /summarySnapshot/);
  assert.match(appSource, /understanding/);
  assert.match(appSource, /agent-envelope/);
  assert.match(appSource, /advance-to-skeleton/);
  assert.match(appSource, /צוות מכירות/);
  assert.match(appSource, /לידים נאבדים אחרי שיחות/);
  assert.match(appSource, /רשימת לידים עם אחראי, סטטוס וצעד הבא/);
});

test("SURF-001 motion has a respectful reduced-motion-safe transition", () => {
  assert.match(screenStyles, /nexus-discovery-stage-contracts-to-rail/);
  assert.match(screenStyles, /nexus-discovery-handoff-pulse/);
  assert.match(screenStyles, /prefers-reduced-motion: reduce/);
  assert.match(screenStyles, /nexus-build-agent-rail-morph/);
  assert.match(screenStyles, /nexus-build-canvas-open/);
});

test("build agent rail keeps the composer visible while the canvas scrolls", () => {
  const navRule = screenStyles.match(/\.nexus-loop-build-workspace__nav\s*\{[^}]+\}/)?.[0] ?? "";
  const agentRailRule = screenStyles.match(/\.nexus-loop-build-workspace__agent-rail\s*\{[^}]+\}/)?.[0] ?? "";
  const bodyRule = screenStyles.match(/\.nexus-build-agent-rail__body\s*\{[^}]+\}/)?.[0] ?? "";
  const threadRule = screenStyles.match(/\.nexus-build-agent-rail__thread\s*\{[^}]+\}/)?.[0] ?? "";
  const composerRule = screenStyles.match(/\.nexus-build-agent-rail__composer\s*\{[^}]+\}/)?.[0] ?? "";

  assert.match(navRule, /position:\s*relative/);
  assert.doesNotMatch(navRule, /position:\s*sticky/);
  assert.doesNotMatch(navRule, /overflow-y:\s*auto/);
  assert.doesNotMatch(navRule, /height:\s*min\(100%,\s*calc\(100vh - 32px\)\)/);
  assert.doesNotMatch(navRule, /max-height:\s*calc\(100vh - 32px\)/);
  assert.match(agentRailRule, /position:\s*relative/);
  assert.match(agentRailRule, /grid-template-rows:\s*auto auto minmax\(0,\s*1fr\) auto/);
  assert.match(agentRailRule, /overflow:\s*hidden/);
  assert.doesNotMatch(agentRailRule, /position:\s*sticky/);
  assert.doesNotMatch(agentRailRule, /height:\s*min\(100%,\s*calc\(100vh - 32px\)\)/);
  assert.doesNotMatch(agentRailRule, /max-height:\s*calc\(100vh - 32px\)/);
  assert.match(bodyRule, /min-height:\s*0/);
  assert.doesNotMatch(bodyRule, /overflow-y:\s*auto/);
  assert.match(threadRule, /min-height:\s*0/);
  assert.doesNotMatch(threadRule, /overflow-y:\s*auto/);
  assert.match(composerRule, /align-self:\s*end/);
});
