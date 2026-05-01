import test from "node:test";
import assert from "node:assert/strict";

import { createStateDrivenTemplateVariants } from "../src/core/state-driven-template-variants.js";

test("createStateDrivenTemplateVariants builds variants for all template families", () => {
  const { templateVariants } = createStateDrivenTemplateVariants({
    screenStates: {
      screens: [
        {
          screenType: "dashboard",
          states: {
            loading: { enabled: true, headline: "טוענים", description: "טוענים overview", tone: "informative" },
            empty: { enabled: true, headline: "ריק", description: "אין נתונים", tone: "guiding" },
            error: { enabled: true, headline: "שגיאה", description: "נכשלה טעינה", tone: "warning" },
            success: { enabled: false, headline: "בוצע", description: "הכול עודכן", tone: "positive" },
          },
        },
      ],
    },
    screenTemplates: {
      dashboardTemplate: {
        templateId: "dashboard-template:screen-template:dashboard",
        templateType: "dashboard",
        sections: { topbar: { enabled: true }, contentGrid: { enabled: true } },
      },
      detailPageTemplate: {
        templateId: "detail-page-template:screen-template:detail",
        templateType: "detail",
        sections: { topbar: { enabled: true }, primaryContent: { enabled: true } },
      },
      workflowTemplate: {
        templateId: "workflow-template:screen-template:wizard",
        templateType: "workflow",
        sections: { stepper: { enabled: true }, primaryContent: { enabled: true } },
      },
      managementTemplate: {
        templateId: "management-template:screen-template:management",
        templateType: "management",
        sections: { filterBar: { enabled: true }, dataTable: { enabled: true } },
      },
    },
  });

  assert.equal(templateVariants.summary.totalTemplates, 4);
  assert.equal(templateVariants.summary.totalVariants, 16);
  assert.equal(Array.isArray(templateVariants.templates[0].variants), true);
  assert.equal(templateVariants.templates[0].variants[0].variantId.includes(":loading"), true);
});

test("createStateDrivenTemplateVariants falls back safely without inputs", () => {
  const { templateVariants } = createStateDrivenTemplateVariants();

  assert.equal(templateVariants.summary.totalTemplates, 4);
  assert.equal(templateVariants.summary.totalVariants, 16);
  assert.equal(typeof templateVariants.variantCollectionId, "string");
});

test("createStateDrivenTemplateVariants normalizes malformed templates and screen states", () => {
  const { templateVariants } = createStateDrivenTemplateVariants({
    screenStates: {
      screens: [
        null,
        {
          screenType: " dashboard ",
          states: {
            loading: { enabled: true, headline: " טוענים ", description: 42, tone: {} },
          },
        },
        {
          screenType: {},
          states: "bad",
        },
      ],
      summary: "bad",
    },
    screenTemplates: {
      dashboardTemplate: {
        templateId: " dashboard-template:main ",
        templateType: " dashboard ",
        sections: { topbar: { enabled: true } },
      },
      detailPageTemplate: {
        templateId: {},
        templateType: [],
        sections: null,
      },
      workflowTemplate: "bad",
      managementTemplate: {
        templateId: "management-template:ops",
        templateType: "management",
        sections: { filterBar: { enabled: true } },
      },
    },
  });

  const dashboardTemplate = templateVariants.templates.find((template) => template.templateType === "dashboard");
  const loadingVariant = dashboardTemplate.variants.find((variant) => variant.stateKey === "loading");
  const detailTemplate = templateVariants.templates.find((template) => template.templateType === "detail");

  assert.equal(dashboardTemplate.templateId, "dashboard-template:main");
  assert.equal(loadingVariant.headline, "טוענים");
  assert.equal(loadingVariant.description, null);
  assert.equal(loadingVariant.tone, "neutral");
  assert.equal(detailTemplate.templateId, "detail-template:unknown");
  assert.equal(detailTemplate.summary.enabledVariantCount, 0);
});
