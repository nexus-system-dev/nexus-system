function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

export function createDetailPageTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    detailPageTemplate: {
      templateId: `detail-page-template:${normalizedScreenTemplateSchema.templateId ?? "detail"}`,
      templateType: "detail",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "page title, primary action and global context",
        },
        breadcrumb: {
          enabled: regions.includes("breadcrumb"),
          role: "orientation inside the current project flow",
        },
        primaryContent: {
          enabled: regions.includes("primary-content"),
          role: "main record content, forms and deep details",
        },
        sidePanel: {
          enabled: regions.includes("side-panel"),
          role: "supporting metadata, activity and related insights",
        },
        footerActions: {
          enabled: regions.includes("footer-actions"),
          role: "save, approve, continue or destructive confirmations",
        },
      },
      composition: {
        primaryComponents: ["key-value-panel", "table", "badge", "input"],
        secondaryComponents: ["activity-log", "status-chip", "banner"],
        supportsFocusedReview: true,
      },
      summary: {
        enabledSections: regions.filter((region) =>
          ["topbar", "breadcrumb", "primary-content", "side-panel", "footer-actions"].includes(region),
        ).length,
        supportsDetailInspection: true,
        supportsActionableReview: true,
      },
    },
  };
}
