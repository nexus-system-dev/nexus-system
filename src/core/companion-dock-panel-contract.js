function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildDock(companionPresence, companionMessagePriority) {
  const normalizedPresence = normalizeObject(companionPresence);
  const normalizedPriority = normalizeObject(companionMessagePriority);
  const priority = normalizeString(normalizedPriority.priority, "advisory");
  const visualMode = normalizeString(normalizedPresence.visualMode, "ambient");
  const tone = normalizeString(normalizedPresence.tone, "calm");

  return {
    dockId: `companion-dock:${normalizeString(normalizedPresence.presenceId, "project")}`,
    visible: normalizedPresence.visible === true,
    visualMode,
    tone,
    priority,
    summary: {
      headline:
        priority === "critical"
          ? "The AI companion needs your attention now."
          : priority === "warning"
            ? "The AI companion is holding a warning for you."
            : priority === "recommendation"
              ? "The AI companion has a recommendation ready."
              : "The AI companion is available if you need help.",
      prefersBadge: normalizedPresence.visibilityRules?.showAsDockBadge === true,
      canStayQuiet: normalizedPresence.summary?.canInterrupt === false,
    },
  };
}

function buildPanel(companionPresence, companionMessagePriority) {
  const normalizedPresence = normalizeObject(companionPresence);
  const normalizedPriority = normalizeObject(companionMessagePriority);
  const priority = normalizeString(normalizedPriority.priority, "advisory");
  const visualMode = normalizeString(normalizedPresence.visualMode, "ambient");
  const reasons = Array.isArray(normalizedPriority.reasons)
    ? normalizedPriority.reasons.map((reason) => normalizeString(reason, null)).filter(Boolean)
    : [];

  return {
    panelId: `companion-panel:${normalizeString(normalizedPresence.presenceId, "project")}`,
    visible: normalizedPresence.visible === true,
    sections: {
      summary: {
        enabled: true,
        priority,
      },
      suggestions: {
        enabled: priority === "recommendation"
          || priority === "warning"
          || priority === "critical",
        items: reasons,
      },
      nextActions: {
        enabled: priority !== "advisory",
        items: [
          priority === "critical"
            ? "resolve-critical-state"
            : priority === "warning"
              ? "review-warning"
              : priority === "recommendation"
                ? "review-recommendation"
                : "open-companion",
        ],
      },
    },
    summary: {
      hasSuggestions: reasons.length > 0,
      showsNextActions: priority !== "advisory",
      visibilityMode: visualMode,
    },
  };
}

export function createCompanionDockAndPanelContract({
  companionPresence = null,
  companionMessagePriority = null,
} = {}) {
  const normalizedPresence = normalizeObject(companionPresence);
  const normalizedPriority = normalizeObject(companionMessagePriority);

  return {
    companionDock: buildDock(normalizedPresence, normalizedPriority),
    companionPanel: buildPanel(normalizedPresence, normalizedPriority),
  };
}
