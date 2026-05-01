import test from "node:test";
import assert from "node:assert/strict";

import { createWorkflowTemplate } from "../src/core/workflow-template.js";

test("createWorkflowTemplate returns canonical workflow template", () => {
  const { workflowTemplate } = createWorkflowTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:wizard",
      regions: ["topbar", "stepper", "primary-content", "assistant-rail", "footer-actions"],
    },
  });

  assert.equal(workflowTemplate.templateType, "workflow");
  assert.equal(workflowTemplate.sections.stepper.enabled, true);
  assert.equal(workflowTemplate.sections.assistantRail.enabled, true);
  assert.equal(Array.isArray(workflowTemplate.composition.primaryComponents), true);
  assert.equal(workflowTemplate.summary.supportsWizardFlows, true);
});

test("createWorkflowTemplate falls back safely when schema is missing", () => {
  const { workflowTemplate } = createWorkflowTemplate();

  assert.equal(workflowTemplate.baseTemplateId, null);
  assert.equal(workflowTemplate.sections.topbar.enabled, false);
  assert.equal(workflowTemplate.sections.footerActions.enabled, false);
  assert.equal(workflowTemplate.summary.enabledSections, 0);
});

test("createWorkflowTemplate normalizes invalid template identity and regions", () => {
  const { workflowTemplate } = createWorkflowTemplate({
    screenTemplateSchema: {
      templateId: { bad: true },
      regions: [" topbar ", null, "footer-actions", { nope: true }, ""],
    },
  });

  assert.equal(workflowTemplate.templateId, "workflow-template:wizard");
  assert.equal(workflowTemplate.baseTemplateId, null);
  assert.equal(workflowTemplate.sections.topbar.enabled, true);
  assert.equal(workflowTemplate.sections.footerActions.enabled, true);
  assert.equal(workflowTemplate.summary.enabledSections, 2);
});
