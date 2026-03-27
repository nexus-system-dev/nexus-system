import test from "node:test";
import assert from "node:assert/strict";

import { defineAiCompanionPresenceSchema } from "../src/core/ai-companion-presence-schema.js";

test("AI companion presence schema returns canonical visual presence for warnings", () => {
  const { companionPresence } = defineAiCompanionPresenceSchema({
    assistantState: {
      state: "warning",
    },
    interactionContext: {
      projectId: "nexus",
      currentSurface: "workspace",
      executionMode: "interactive",
    },
  });

  assert.equal(companionPresence.state, "warning");
  assert.equal(companionPresence.tone, "serious");
  assert.equal(companionPresence.urgency, "high");
  assert.equal(companionPresence.visible, true);
  assert.equal(companionPresence.visibilityRules.showAsDockBadge, true);
});

test("AI companion presence schema falls back safely for passive observation", () => {
  const { companionPresence } = defineAiCompanionPresenceSchema();

  assert.equal(typeof companionPresence.presenceId, "string");
  assert.equal(companionPresence.state, "observing");
  assert.equal(companionPresence.tone, "calm");
  assert.equal(companionPresence.urgency, "low");
  assert.equal(typeof companionPresence.visibilityRules.showInWorkspace, "boolean");
});
