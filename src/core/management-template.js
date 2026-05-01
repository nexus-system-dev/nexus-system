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

export function createManagementTemplate({
  screenTemplateSchema,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const baseTemplateId =
    typeof normalizedScreenTemplateSchema.templateId === "string" && normalizedScreenTemplateSchema.templateId.trim()
      ? normalizedScreenTemplateSchema.templateId.trim()
      : null;
  const regions = normalizeRegions(normalizedScreenTemplateSchema.regions);
  const normalizedTemplateId = normalizeTemplateId(baseTemplateId, "management");

  return {
    managementTemplate: {
      templateId: `management-template:${normalizedTemplateId}`,
      templateType: "management",
      baseTemplateId,
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
