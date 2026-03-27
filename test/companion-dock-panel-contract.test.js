import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionDockAndPanelContract } from "../src/core/companion-dock-panel-contract.js";

test("companion dock and panel contract returns visible dock and actionable panel for warnings", () => {
  const { companionDock, companionPanel } = createCompanionDockAndPanelContract({
    companionPresence: {
      presenceId: "companion-presence:nexus",
      visible: true,
      visualMode: "dock",
      tone: "serious",
      visibilityRules: {
        showAsDockBadge: true,
      },
      summary: {
        canInterrupt: true,
      },
    },
    companionMessagePriority: {
      priority: "warning",
      reasons: ["Approval is still required before continuing."],
    },
  });

  assert.equal(companionDock.visible, true);
  assert.equal(companionDock.priority, "warning");
  assert.equal(companionPanel.sections.suggestions.enabled, true);
  assert.equal(companionPanel.sections.nextActions.enabled, true);
});

test("companion dock and panel contract falls back safely for advisory mode", () => {
  const { companionDock, companionPanel } = createCompanionDockAndPanelContract();

  assert.equal(typeof companionDock.dockId, "string");
  assert.equal(typeof companionDock.summary.headline, "string");
  assert.equal(typeof companionPanel.panelId, "string");
  assert.equal(typeof companionPanel.summary.showsNextActions, "boolean");
});
