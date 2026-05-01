function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

function normalizeTemplateId(templateId, fallbackId) {
  return typeof templateId === "string" && templateId.trim() ? templateId.trim() : fallbackId;
}

function normalizeRegions(regions) {
  if (!Array.isArray(regions)) {
    return [];
  }

  return regions.filter((region) => typeof region === "string" && region.trim()).map((region) => region.trim());
}

export function createWorkflowTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const baseTemplateId =
    typeof normalizedScreenTemplateSchema.templateId === "string" && normalizedScreenTemplateSchema.templateId.trim()
      ? normalizedScreenTemplateSchema.templateId.trim()
      : null;
  const regions = normalizeRegions(normalizedScreenTemplateSchema.regions);
  const normalizedTemplateId = normalizeTemplateId(baseTemplateId, "wizard");

  return {
    workflowTemplate: {
      templateId: `workflow-template:${normalizedTemplateId}`,
      templateType: "workflow",
      baseTemplateId,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "flow title, context and exit path",
        },
        stepper: {
          enabled: regions.includes("stepper"),
          role: "progress across wizard steps and checkpoints",
        },
        primaryContent: {
          enabled: regions.includes("primary-content"),
          role: "main step content, forms and guided decisions",
        },
        assistantRail: {
          enabled: regions.includes("assistant-rail"),
          role: "contextual guidance, hints and AI assistance",
        },
        footerActions: {
          enabled: regions.includes("footer-actions"),
          role: "continue, back, save draft and completion actions",
        },
      },
      composition: {
        primaryComponents: ["stepper", "input", "textarea", "select", "button"],
        secondaryComponents: ["banner", "progress", "key-value-panel"],
        supportsGuidedFlow: true,
      },
      summary: {
        enabledSections: regions.filter((region) =>
          ["topbar", "stepper", "primary-content", "assistant-rail", "footer-actions"].includes(region),
        ).length,
        supportsWizardFlows: true,
        supportsGuidedCompletion: true,
      },
    },
  };
}
