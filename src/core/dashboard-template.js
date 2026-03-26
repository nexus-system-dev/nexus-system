function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

export function createDashboardTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    dashboardTemplate: {
      templateId: `dashboard-template:${normalizedScreenTemplateSchema.templateId ?? "dashboard"}`,
      templateType: "dashboard",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "global context, title and quick actions",
        },
        sidebar: {
          enabled: regions.includes("sidebar"),
          role: "workspace navigation and project destinations",
        },
        summaryStrip: {
          enabled: regions.includes("summary-strip"),
          role: "headline KPIs and health summaries",
        },
        contentGrid: {
          enabled: regions.includes("content-grid"),
          role: "main cards, tables and operational panels",
        },
        feedbackZone: {
          enabled: regions.includes("feedback-zone"),
          role: "inline alerts, banners and status feedback",
        },
      },
      composition: {
        primaryComponents: ["stat-card", "table", "status-chip", "banner"],
        secondaryComponents: ["activity-log", "progress", "key-value-panel"],
        supportsDenseOverview: true,
      },
      summary: {
        enabledSections: regions.filter((region) =>
          ["topbar", "sidebar", "summary-strip", "content-grid", "feedback-zone"].includes(region),
        ).length,
        supportsOverviewDashboards: true,
        supportsOperationalSummary: true,
      },
    },
  };
}
