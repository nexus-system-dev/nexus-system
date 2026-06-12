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

test("FILE-001 project adapter bounds selected files before discovery uses them", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      visionText: "כלי פנימי לניהול לידים",
      fileName: "ignored",
      fileContent: JSON.stringify([
        { name: "requirements.md", type: "text/markdown", content: "# Leads" },
        { name: "brand.png", type: "image/png", size: 100_000 },
        { name: "installer.exe", type: "application/octet-stream", content: "no" },
      ]),
    },
  });

  assert.equal(viewModel.upload.fileIntakeBoundary.taskId, "FILE-001");
  assert.equal(viewModel.upload.fileIntakeBoundary.status, "bounded-with-rejections");
  assert.equal(viewModel.upload.fileIntakeBoundary.acceptedFiles.length, 2);
  assert.equal(viewModel.upload.fileIntakeBoundary.rejectedFiles.length, 1);
  assert.equal(viewModel.discoveryAgent.understoodItems.some((item) => item.includes("2 קבצים")), true);
  assert.match(viewModel.upload.meta, /עד 8 קבצים/);
});
