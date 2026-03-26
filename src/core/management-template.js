function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

export function createManagementTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    managementTemplate: {
      templateId: `management-template:${normalizedScreenTemplateSchema.templateId ?? "management"}`,
      templateType: "management",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "page title, scope switchers and quick actions",
        },
        breadcrumb: {
          enabled: regions.includes("breadcrumb"),
          role: "orientation inside management flows and nested resources",
        },
        filterBar: {
          enabled: regions.includes("filter-bar"),
          role: "search, filters, sorting and saved views",
        },
        dataTable: {
          enabled: regions.includes("data-table"),
          role: "lists, tables and bulk management surfaces",
        },
        sidePanel: {
          enabled: regions.includes("side-panel"),
          role: "record details, actions and inline editing context",
        },
        bulkActions: {
          enabled: regions.includes("bulk-actions"),
          role: "multi-select actions and batch operations",
        },
      },
      composition: {
        primaryComponents: ["table", "status-chip", "button", "badge"],
        secondaryComponents: ["key-value-panel", "activity-log", "banner"],
        supportsBulkManagement: true,
      },
      summary: {
        enabledSections: regions.filter((region) =>
          ["topbar", "breadcrumb", "filter-bar", "data-table", "side-panel", "bulk-actions"].includes(region),
        ).length,
        supportsListOperations: true,
        supportsTableManagement: true,
      },
    },
  };
}
