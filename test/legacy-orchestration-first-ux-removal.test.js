import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { LEGACY_FRONTEND_DECOMPOSITION_MAP } from "../web/nexus-ui/routes/legacy-decomposition.js";

function read(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("loop proof and timeline preserve engines while removing orchestration-first visible UX", () => {
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.loop.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.proof.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.timeline.action, "remove visible");

  const loopSource = read("web/nexus-ui/screens/LoopCoreScreen.js");
  const proofSource = read("web/nexus-ui/screens/ProofResultScreen.js");
  const timelineSource = read("web/nexus-ui/screens/TimelineHistoryScreen.js");
  const fallbackSource = read("web/nexus-ui/screens/QaFallbackScreen.js");

  assert.match(loopSource, /data-build-surface-contract="SURF-003"/);
  assert.match(loopSource, /data-build-region="agent-conversation-rail"/);
  assert.match(loopSource, /renderNexusWorkspaceRail/);
  assert.doesNotMatch(loopSource, /title: "לולאה"/);
  assert.doesNotMatch(loopSource, /title: "ציר זמן"/);
  assert.doesNotMatch(loopSource, /label: "הכרת הפרויקט"/);

  assert.match(proofSource, /מה צריך לפני שיתוף/);
  assert.doesNotMatch(proofSource, /<span class="nexus-proof-artifact__type">Handoff step<\/span>/);
  assert.doesNotMatch(proofSource, /<span class="nexus-proof-artifact__type">Open blocker<\/span>/);
  assert.doesNotMatch(proofSource, /<span class="nexus-proof-screen__artifact-label">Release evidence and handoff<\/span>/);
  assert.doesNotMatch(proofSource, /explainableReleasePath/);
  assert.doesNotMatch(proofSource, /visibleChecks\.map\(renderReleaseCheck\)/);

  assert.match(timelineSource, /data-history-surface-contract/);
  assert.match(timelineSource, /מה באמת השתנה/);
  assert.match(timelineSource, /renderNexusWorkspaceRail/);
  assert.doesNotMatch(timelineSource, /renderNexusQaNav/);
  assert.doesNotMatch(timelineSource, /renderNexusStepper/);
  assert.doesNotMatch(timelineSource, /renderWorkspaceLayout/);
  assert.doesNotMatch(timelineSource, /renderProofArtifactSurface/);
  assert.doesNotMatch(timelineSource, /Canonical learning system/);
  assert.doesNotMatch(timelineSource, /Deep learning decision impact/);
  assert.doesNotMatch(timelineSource, /Wave 4 live verification matrix/);
  assert.doesNotMatch(timelineSource, /Cross-surface continuity/);
  assert.doesNotMatch(timelineSource, /verificationLanes/);
  assert.doesNotMatch(timelineSource, /continuitySteps\.map/);

  assert.match(fallbackSource, /title: "בנייה"/);
  assert.match(fallbackSource, /title: "היסטוריה"/);
  assert.match(fallbackSource, /תצוגה בטוחה בלי פרויקט פעיל/);
  assert.doesNotMatch(fallbackSource, /title: "לולאה"/);
  assert.doesNotMatch(fallbackSource, /title: "ציר זמן"/);
  assert.doesNotMatch(fallbackSource, /renderNexusQaNav/);
  assert.doesNotMatch(fallbackSource, /runtime האמיתי/);
  assert.doesNotMatch(fallbackSource, /proof backend/);
});
