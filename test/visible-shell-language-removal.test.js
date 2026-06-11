import test from "node:test";
import assert from "node:assert/strict";

import { renderNexusQaNav } from "../web/nexus-ui/components/NexusQaNav.js";
import { buildExecutionLiveViewModel } from "../web/nexus-ui/adapters/execution-adapter.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { buildNextTaskViewModel } from "../web/nexus-ui/adapters/next-task-adapter.js";
import { buildProofResultViewModel } from "../web/nexus-ui/adapters/proof-adapter.js";
import { buildStateUpdateViewModel } from "../web/nexus-ui/adapters/state-update-adapter.js";
import { buildTimelineViewModel } from "../web/nexus-ui/adapters/timeline-adapter.js";
import { renderExecutionLiveScreen } from "../web/nexus-ui/screens/ExecutionLiveScreen.js";
import { renderLoopCoreScreen } from "../web/nexus-ui/screens/LoopCoreScreen.js";
import { renderNextTaskScreen } from "../web/nexus-ui/screens/NextTaskScreen.js";
import { renderProofResultScreen } from "../web/nexus-ui/screens/ProofResultScreen.js";
import { renderStateUpdateScreen } from "../web/nexus-ui/screens/StateUpdateScreen.js";
import { renderTimelineHistoryScreen } from "../web/nexus-ui/screens/TimelineHistoryScreen.js";

function visibleText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("visible shell does not expose orchestration-first language", () => {
  const html = [
    renderNexusQaNav("execution"),
    renderLoopCoreScreen(buildLoopCoreViewModel({ qaMode: true })),
    renderExecutionLiveScreen(buildExecutionLiveViewModel({ qaMode: true })),
    renderProofResultScreen(buildProofResultViewModel({ qaMode: true })),
    renderStateUpdateScreen(buildStateUpdateViewModel({ qaMode: true })),
    renderNextTaskScreen(buildNextTaskViewModel({ qaMode: true })),
    renderTimelineHistoryScreen(buildTimelineViewModel({ qaMode: true })),
  ].join("\n");
  const text = visibleText(html);

  assert.doesNotMatch(text, /\bQA mode\b/i);
  assert.doesNotMatch(text, /\bLoop\b/);
  assert.doesNotMatch(text, /\bProof\b/i);
  assert.doesNotMatch(text, /\bTimeline\b/);
  assert.doesNotMatch(text, /\borchestration\b/i);
  assert.doesNotMatch(text, /\bruntime\b/i);
  assert.doesNotMatch(text, /\bhandoff\b/i);
  assert.doesNotMatch(text, /verification matrix/i);
  assert.match(text, /תצוגת בדיקה/);
  assert.match(text, /בנייה/);
  assert.match(text, /היסטוריה/);
});
