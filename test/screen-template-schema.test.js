import test from "node:test";
import assert from "node:assert/strict";

import { defineScreenTemplateSchema } from "../src/core/screen-template-schema.js";

test("defineScreenTemplateSchema returns canonical workspace template", () => {
  const { screenTemplateSchema } = defineScreenTemplateSchema({
    screenType: "workspace",
  });

  assert.equal(screenTemplateSchema.templateId, "screen-template:workspace");
  assert.deepEqual(screenTemplateSchema.regions, ["topbar", "sidebar", "workspace-panels", "assistant-rail", "status-strip"]);
  assert.deepEqual(screenTemplateSchema.requiredLibraries, ["navigation", "primitive", "layout", "feedback", "data-display"]);
  assert.equal(screenTemplateSchema.behavior.supportsAssistant, true);
  assert.equal(screenTemplateSchema.summary.isWorkbenchCapable, true);
});

test("defineScreenTemplateSchema falls back safely to workspace template", () => {
  const { screenTemplateSchema } = defineScreenTemplateSchema();

  assert.equal(screenTemplateSchema.templateType, "workspace");
  assert.equal(screenTemplateSchema.summary.regionCount, 5);
  assert.equal(screenTemplateSchema.summary.libraryCount, 5);
});
