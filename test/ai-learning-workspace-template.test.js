import test from "node:test";
import assert from "node:assert/strict";

import { createAiLearningWorkspaceTemplate } from "../src/core/ai-learning-workspace-template.js";

test("ai learning workspace template returns dedicated sections for learning insights", () => {
  const { aiLearningWorkspaceTemplate } = createAiLearningWorkspaceTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:workspace",
      regions: ["topbar", "sidebar", "workspace-panels", "assistant-rail", "status-strip"],
    },
    learningInsightViewModel: {
      insights: [
        { insightId: "insight-1", title: "Approval-first rollout copy works better" },
      ],
    },
  });

  assert.equal(aiLearningWorkspaceTemplate.templateType, "ai-learning-workspace");
  assert.equal(aiLearningWorkspaceTemplate.sections.workspacePanels.enabled, true);
  assert.equal(aiLearningWorkspaceTemplate.composition.insightCount, 1);
  assert.equal(aiLearningWorkspaceTemplate.summary.supportsLearningInsights, true);
});

test("ai learning workspace template falls back safely without explicit schema", () => {
  const { aiLearningWorkspaceTemplate } = createAiLearningWorkspaceTemplate();

  assert.equal(typeof aiLearningWorkspaceTemplate.templateId, "string");
  assert.equal(typeof aiLearningWorkspaceTemplate.sections.topbar.enabled, "boolean");
  assert.equal(aiLearningWorkspaceTemplate.composition.insightCount, 0);
});
