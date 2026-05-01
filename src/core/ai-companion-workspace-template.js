function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function hasRegion(regions, regionName) {
  return Array.isArray(regions) && regions.includes(regionName);
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
  const companionDockVisible = normalizedCompanionDock.visible === true;
  const companionPanelVisible = normalizedCompanionPanel.visible === true;
  const templateSections = {
    topbar: {
      enabled: hasRegion(regions, "topbar"),
      role: "workspace title, project switching and current AI mode",
    },
    sidebar: {
      enabled: hasRegion(regions, "sidebar"),
      role: "workspace navigation and companion-aware context switching",
    },
    primaryWorkspace: {
      enabled: hasRegion(regions, "workspace-panels"),
      role: "main workspace where the user and the AI companion collaborate",
    },
    companionDockZone: {
      enabled: companionDockVisible,
      role: "persistent AI dock with status, urgency and ambient presence",
    },
    companionPanelZone: {
      enabled: companionPanelVisible,
      role: "expanded AI panel with summary, suggestions and next actions",
    },
    statusStrip: {
      enabled: hasRegion(regions, "status-strip"),
      role: "shared execution status and AI activity strip",
    },
  };

  return {
    aiCompanionTemplate: {
      templateId: `ai-companion-workspace:${normalizedScreenTemplateSchema.templateId ?? "workspace"}`,
      templateType: "ai-companion-workspace",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: templateSections,
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
      companionSurface: {
        dock: {
          visible: companionDockVisible,
          priority: normalizedCompanionDock.priority ?? "advisory",
          headline: normalizedCompanionDock.summary?.headline ?? null,
        },
        panel: {
          visible: companionPanelVisible,
          priority: normalizedCompanionPanel.sections?.summary?.priority ?? normalizedCompanionDock.priority ?? "advisory",
          showsNextActions: normalizedCompanionPanel.summary?.showsNextActions === true,
        },
      },
      summary: {
        enabledSections: Object.values(templateSections).filter((section) => section.enabled === true).length,
        hasPersistentCompanion: companionDockVisible,
        hasExpandedCompanionPanel: companionPanelVisible,
      },
    },
  };
}
