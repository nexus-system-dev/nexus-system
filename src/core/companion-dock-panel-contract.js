function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildDock(companionPresence, companionMessagePriority) {
  const normalizedPresence = normalizeObject(companionPresence);
  const normalizedPriority = normalizeObject(companionMessagePriority);

  return {
    dockId: `companion-dock:${normalizedPresence.presenceId ?? "project"}`,
    visible: normalizedPresence.visible === true,
    visualMode: normalizedPresence.visualMode ?? "ambient",
    tone: normalizedPresence.tone ?? "calm",
    priority: normalizedPriority.priority ?? "advisory",
    summary: {
      headline:
        normalizedPriority.priority === "critical"
          ? "The AI companion needs your attention now."
          : normalizedPriority.priority === "warning"
            ? "The AI companion is holding a warning for you."
            : normalizedPriority.priority === "recommendation"
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

  return {
    panelId: `companion-panel:${normalizedPresence.presenceId ?? "project"}`,
    visible: normalizedPresence.visible === true,
    sections: {
      summary: {
        enabled: true,
        priority: normalizedPriority.priority ?? "advisory",
      },
      suggestions: {
        enabled: normalizedPriority.priority === "recommendation"
          || normalizedPriority.priority === "warning"
          || normalizedPriority.priority === "critical",
        items: normalizedPriority.reasons ?? [],
      },
      nextActions: {
        enabled: normalizedPriority.priority !== "advisory",
        items: [
          normalizedPriority.priority === "critical"
            ? "resolve-critical-state"
            : normalizedPriority.priority === "warning"
              ? "review-warning"
              : normalizedPriority.priority === "recommendation"
                ? "review-recommendation"
                : "open-companion",
        ],
      },
    },
    summary: {
      hasSuggestions: Array.isArray(normalizedPriority.reasons) && normalizedPriority.reasons.length > 0,
      showsNextActions: normalizedPriority.priority !== "advisory",
      visibilityMode: normalizedPresence.visualMode ?? "ambient",
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
