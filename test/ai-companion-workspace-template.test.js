import test from "node:test";
import assert from "node:assert/strict";

import { createAiCompanionWorkspaceTemplate } from "../src/core/ai-companion-workspace-template.js";

test("AI companion workspace template returns persistent companion zones", () => {
  const { aiCompanionTemplate } = createAiCompanionWorkspaceTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:workspace",
      regions: ["topbar", "sidebar", "workspace-panels", "status-strip"],
    },
    companionDock: {
      visible: true,
      priority: "warning",
      summary: {
        headline: "Attention needed",
      },
    },
    companionPanel: {
      visible: true,
      sections: {
        summary: {
          priority: "warning",
        },
      },
      summary: {
        showsNextActions: true,
      },
    },
  });

  assert.equal(aiCompanionTemplate.templateType, "ai-companion-workspace");
  assert.equal(aiCompanionTemplate.sections.primaryWorkspace.enabled, true);
  assert.equal(aiCompanionTemplate.sections.companionDockZone.enabled, true);
  assert.equal(aiCompanionTemplate.companionSurface.dock.priority, "warning");
  assert.equal(aiCompanionTemplate.companionSurface.panel.showsNextActions, true);
  assert.equal(aiCompanionTemplate.summary.hasPersistentCompanion, true);
});

test("AI companion workspace template falls back safely without explicit dock or panel", () => {
  const { aiCompanionTemplate } = createAiCompanionWorkspaceTemplate();

  assert.equal(typeof aiCompanionTemplate.templateId, "string");
  assert.equal(typeof aiCompanionTemplate.sections.topbar.enabled, "boolean");
  assert.equal(aiCompanionTemplate.companionSurface.dock.visible, false);
  assert.equal(aiCompanionTemplate.companionSurface.panel.visible, false);
  assert.equal(typeof aiCompanionTemplate.summary.hasExpandedCompanionPanel, "boolean");
});
