import test from "node:test";
import assert from "node:assert/strict";

import { createDashboardTemplate } from "../src/core/dashboard-template.js";

test("createDashboardTemplate builds canonical dashboard template from schema", () => {
  const { dashboardTemplate } = createDashboardTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:dashboard",
      regions: ["topbar", "sidebar", "summary-strip", "content-grid", "feedback-zone"],
    },
  });

  assert.equal(dashboardTemplate.templateType, "dashboard");
  assert.equal(dashboardTemplate.sections.topbar.enabled, true);
  assert.equal(dashboardTemplate.sections.contentGrid.enabled, true);
  assert.deepEqual(dashboardTemplate.composition.primaryComponents, ["stat-card", "table", "status-chip", "banner"]);
  assert.equal(dashboardTemplate.summary.enabledSections, 5);
  assert.equal(dashboardTemplate.summary.supportsOverviewDashboards, true);
});

test("createDashboardTemplate falls back safely without explicit schema", () => {
  const { dashboardTemplate } = createDashboardTemplate();

  assert.equal(dashboardTemplate.templateType, "dashboard");
  assert.equal(dashboardTemplate.sections.sidebar.enabled, false);
  assert.equal(dashboardTemplate.summary.supportsOperationalSummary, true);
});

test("createDashboardTemplate normalizes valid schema identity and string regions", () => {
  const { dashboardTemplate } = createDashboardTemplate({
    screenTemplateSchema: {
      templateId: "  screen-template:dashboard  ",
      regions: ["topbar", "sidebar", 12, null, "content-grid"],
    },
  });

  assert.equal(dashboardTemplate.templateId, "dashboard-template:screen-template:dashboard");
  assert.equal(dashboardTemplate.baseTemplateId, "screen-template:dashboard");
  assert.equal(dashboardTemplate.sections.topbar.enabled, true);
  assert.equal(dashboardTemplate.sections.sidebar.enabled, true);
  assert.equal(dashboardTemplate.sections.feedbackZone.enabled, false);
  assert.equal(dashboardTemplate.summary.enabledSections, 3);
});

test("createDashboardTemplate ignores invalid schema identity and non-array regions", () => {
  const { dashboardTemplate } = createDashboardTemplate({
    screenTemplateSchema: {
      templateId: { invalid: true },
      regions: "bad",
    },
  });

  assert.equal(dashboardTemplate.templateId, "dashboard-template:dashboard");
  assert.equal(dashboardTemplate.baseTemplateId, null);
  assert.equal(dashboardTemplate.sections.contentGrid.enabled, false);
  assert.equal(dashboardTemplate.summary.enabledSections, 0);
});
