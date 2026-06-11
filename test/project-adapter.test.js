import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectCreateViewModel } from "../web/nexus-ui/adapters/project-adapter.js";

test("project adapter presents conversation-first entry copy", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      visionText: "אני רוצה מערכת שמנהלת לידים ומוודאת שלא מפספסים follow-up",
    },
  });

  assert.equal(viewModel.title, "מה אתה רוצה לבנות?");
  assert.equal(viewModel.statusMessage, "כתוב חופשי. נמשיך משם.");
  assert.equal(viewModel.discoveryAgent.agentName, "Project Discovery Agent");
  assert.equal(viewModel.discoveryAgent.hiddenEngine.preserved, true);
  assert.match(viewModel.discoveryAgent.modeLabel, /שיחה חופשית/);
  assert.equal(viewModel.discoveryAgent.currentAgentMessage, "");
  assert.equal(viewModel.discoveryAgent.agentResponseSource, "no-agent-response");
  assert.equal(viewModel.entryHighlights.length, 0);
  assert.equal(viewModel.helperCards.length, 0);
  assert.equal(viewModel.upload.meta, "");
});
