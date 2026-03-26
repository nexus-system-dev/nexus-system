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
