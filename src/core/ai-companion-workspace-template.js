function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function createAiCompanionWorkspaceTemplate({
  screenTemplateSchema = null,
  companionDock = null,
  companionPanel = null,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeObject(screenTemplateSchema);
  const normalizedCompanionDock = normalizeObject(companionDock);
  const normalizedCompanionPanel = normalizeObject(companionPanel);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    aiCompanionTemplate: {
      templateId: `ai-companion-workspace:${normalizedScreenTemplateSchema.templateId ?? "workspace"}`,
      templateType: "ai-companion-workspace",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "workspace title, project switching and current AI mode",
        },
        sidebar: {
          enabled: regions.includes("sidebar"),
          role: "workspace navigation and companion-aware context switching",
        },
        primaryWorkspace: {
          enabled: regions.includes("workspace-panels"),
          role: "main workspace where the user and the AI companion collaborate",
        },
        companionDockZone: {
          enabled: normalizedCompanionDock.visible === true,
          role: "persistent AI dock with status, urgency and ambient presence",
        },
        companionPanelZone: {
          enabled: normalizedCompanionPanel.visible === true,
          role: "expanded AI panel with summary, suggestions and next actions",
        },
        statusStrip: {
          enabled: regions.includes("status-strip"),
          role: "shared execution status and AI activity strip",
        },
      },
      composition: {
        primaryComponents: [
          "sidebar",
          "topbar",
          "panel",
          "activity-log",
        ],
        companionComponents: [
          "companion-dock",
          "companion-panel",
          "status-chip",
          "banner",
        ],
        supportsPersistentCompanion: true,
        supportsSharedWorkspace: true,
      },
      summary: {
        enabledSections: [
          "topbar",
          "sidebar",
          "primaryWorkspace",
          "companionDockZone",
          "companionPanelZone",
          "statusStrip",
        ].filter((section) => {
          const sections = {
            topbar: regions.includes("topbar"),
            sidebar: regions.includes("sidebar"),
            primaryWorkspace: regions.includes("workspace-panels"),
            companionDockZone: normalizedCompanionDock.visible === true,
            companionPanelZone: normalizedCompanionPanel.visible === true,
            statusStrip: regions.includes("status-strip"),
          };

          return sections[section];
        }).length,
        hasPersistentCompanion: normalizedCompanionDock.visible === true,
        hasExpandedCompanionPanel: normalizedCompanionPanel.visible === true,
      },
    },
  };
}
