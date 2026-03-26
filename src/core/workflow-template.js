function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

export function createWorkflowTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    workflowTemplate: {
      templateId: `workflow-template:${normalizedScreenTemplateSchema.templateId ?? "wizard"}`,
      templateType: "workflow",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
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
