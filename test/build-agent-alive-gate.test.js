import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appSource = fs.readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
const screenSource = fs.readFileSync(new URL("../web/nexus-ui/screens/LoopCoreScreen.js", import.meta.url), "utf8");

test("BLD-AGT-001 — Build rail submit path has alive gate, server call, and bounded failure", () => {
  assert.match(appSource, /async function submitLoopAgentRailMessage\(\)/);
  assert.match(appSource, /pending: true/);
  assert.match(appSource, /currentProject \?\? \(isQaModeEnabled\(\) \? ensureQaProjectPreviewState\(\) : null\)/);
  assert.match(appSource, /renderLoopCoreScreenView\(renderProject, \{ qaMode: isQaModeEnabled\(\) \}\)/);
  assert.equal(appSource.includes("/api/projects/${currentProjectId}/companion-turn"), true);
  assert.match(appSource, /buildLoopAgentBoundedReply\(message, \{ failed, errorMessage \}\)/);
  assert.match(appSource, /pending: false/);
  assert.match(appSource, /loop-agent-ai-/);
});

test("BLD-AGT-001 — Build rail screen can show loading and disable composer", () => {
  assert.match(screenSource, /data-build-agent-loading="true"/);
  assert.match(screenSource, /אני בודק את הבקשה מול ההקשר של השלד/);
  assert.match(screenSource, /data-agent-rail-send[^`]+disabled/);
  assert.match(screenSource, /data-agent-rail-input[^`]+disabled/);
});
