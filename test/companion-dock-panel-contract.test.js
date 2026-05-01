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

test("companion dock and panel contract surfaces critical state with urgent next actions", () => {
  const { companionDock, companionPanel } = createCompanionDockAndPanelContract({
    companionPresence: {
      presenceId: "companion-presence:nexus",
      visible: true,
      visualMode: "dock",
      tone: "urgent",
      visibilityRules: {
        showAsDockBadge: true,
      },
      summary: {
        canInterrupt: true,
      },
    },
    companionMessagePriority: {
      priority: "critical",
      reasons: ["Execution failed and needs immediate attention."],
    },
  });

  assert.equal(companionDock.priority, "critical");
  assert.match(companionDock.summary.headline, /needs your attention now/i);
  assert.equal(companionPanel.sections.suggestions.enabled, true);
  assert.deepEqual(companionPanel.sections.nextActions.items, ["resolve-critical-state"]);
});

test("companion dock and panel contract normalizes malformed identifiers priorities and reasons", () => {
  const { companionDock, companionPanel } = createCompanionDockAndPanelContract({
    companionPresence: {
      presenceId: "   ",
      visible: true,
      visualMode: "   ",
      tone: "   ",
      visibilityRules: {
        showAsDockBadge: false,
      },
      summary: {
        canInterrupt: false,
      },
    },
    companionMessagePriority: {
      priority: "   ",
      reasons: ["   First reason   ", "   ", null],
    },
  });

  assert.equal(companionDock.dockId, "companion-dock:project");
  assert.equal(companionDock.visualMode, "ambient");
  assert.equal(companionDock.tone, "calm");
  assert.equal(companionDock.priority, "advisory");
  assert.equal(companionPanel.panelId, "companion-panel:project");
  assert.deepEqual(companionPanel.sections.suggestions.items, ["First reason"]);
  assert.equal(companionPanel.summary.visibilityMode, "ambient");
});
