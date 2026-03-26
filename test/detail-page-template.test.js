import test from "node:test";
import assert from "node:assert/strict";

import { createDetailPageTemplate } from "../src/core/detail-page-template.js";

test("createDetailPageTemplate returns canonical detail template", () => {
  const { detailPageTemplate } = createDetailPageTemplate({
    screenTemplateSchema: {
      templateId: "screen-template:detail",
      regions: ["topbar", "breadcrumb", "primary-content", "side-panel", "footer-actions"],
    },
  });

  assert.equal(detailPageTemplate.templateType, "detail");
  assert.equal(detailPageTemplate.sections.breadcrumb.enabled, true);
  assert.equal(detailPageTemplate.sections.primaryContent.enabled, true);
  assert.equal(Array.isArray(detailPageTemplate.composition.primaryComponents), true);
  assert.equal(detailPageTemplate.summary.supportsDetailInspection, true);
});

test("createDetailPageTemplate falls back safely when schema is missing", () => {
  const { detailPageTemplate } = createDetailPageTemplate();

  assert.equal(detailPageTemplate.baseTemplateId, null);
  assert.equal(detailPageTemplate.sections.topbar.enabled, false);
  assert.equal(detailPageTemplate.sections.sidePanel.enabled, false);
  assert.equal(detailPageTemplate.summary.enabledSections, 0);
});
