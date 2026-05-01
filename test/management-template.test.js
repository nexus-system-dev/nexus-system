import test from "node:test";
import assert from "node:assert/strict";

import { createManagementTemplate } from "../src/core/management-template.js";

test("createManagementTemplate returns canonical management template", () => {
  const { managementTemplate } = createManagementTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:management",
      regions: ["topbar", "breadcrumb", "filter-bar", "data-table", "side-panel", "bulk-actions"],
    },
  });

  assert.equal(managementTemplate.templateType, "management");
  assert.equal(managementTemplate.sections.filterBar.enabled, true);
  assert.equal(managementTemplate.sections.dataTable.enabled, true);
  assert.equal(Array.isArray(managementTemplate.composition.primaryComponents), true);
  assert.equal(managementTemplate.summary.supportsTableManagement, true);
});

test("createManagementTemplate falls back safely when schema is missing", () => {
  const { managementTemplate } = createManagementTemplate();

  assert.equal(managementTemplate.baseTemplateId, null);
  assert.equal(managementTemplate.sections.topbar.enabled, false);
  assert.equal(managementTemplate.sections.bulkActions.enabled, false);
  assert.equal(managementTemplate.summary.enabledSections, 0);
});

test("createManagementTemplate normalizes invalid template identity and regions", () => {
  const { managementTemplate } = createManagementTemplate({
    screenTemplateSchema: {
      templateId: ["bad"],
      regions: [" topbar ", "data-table", 4, null, ""],
    },
  });

  assert.equal(managementTemplate.templateId, "management-template:management");
  assert.equal(managementTemplate.baseTemplateId, null);
  assert.equal(managementTemplate.sections.topbar.enabled, true);
  assert.equal(managementTemplate.sections.dataTable.enabled, true);
  assert.equal(managementTemplate.summary.enabledSections, 2);
});
