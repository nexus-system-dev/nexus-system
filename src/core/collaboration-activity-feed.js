function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createCollaborationActivityFeed({
  collaborationActivityHistory = null,
} = {}) {
  const normalizedHistory = normalizeObject(collaborationActivityHistory);
  const items = normalizeArray(normalizedHistory.items);

  return {
    collaborationFeed: {
      feedId: `collaboration-feed:${normalizedHistory.historyId ?? "project"}`,
      items,
      summary: {
        totalItems: normalizedHistory.summary?.totalItems ?? items.length,
        containsThreadActivity: normalizedHistory.summary?.containsThreadActivity
          ?? items.some((item) => item.source === "review-thread"),
        containsPresenceSignals: items.some((item) => item.itemType === "presence"),
        containsWorkspaceTransitions: items.some((item) => item.itemType === "workspace-transition"),
        containsApprovalCoordination: normalizedHistory.summary?.containsApprovalCoordination
          ?? items.some((item) => item.source === "shared-approval-state"),
      },
    },
  };
}
