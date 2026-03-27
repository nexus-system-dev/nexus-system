function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildPrimaryEvent(collaborationEvent, projectPresenceState) {
  const normalizedEvent = normalizeObject(collaborationEvent);
  const actor = normalizeObject(normalizedEvent.actor);
  const target = normalizeObject(normalizedEvent.target);
  const payload = normalizeObject(normalizedEvent.payload);
  const summary = normalizeObject(normalizedEvent.summary);

  return {
    feedItemId: `collaboration-feed:event:${normalizedEvent.eventId ?? "unknown"}`,
    itemType: normalizedEvent.eventType ?? "presence-signal",
    headline: payload.message ?? "Workspace activity updated",
    actorName: actor.displayName ?? "Unknown collaborator",
    workspaceArea: target.workspaceArea ?? projectPresenceState.workspaceArea ?? "developer-workspace",
    resourceId: target.resourceId ?? null,
    status: payload.reviewStatus ?? payload.approvalStatus ?? actor.presence ?? "active",
    source: "collaboration-event",
    visibility: normalizedEvent.visibility ?? "workspace",
    metadata: {
      projectId: summary.projectId ?? projectPresenceState.projectId ?? null,
      workspaceId: summary.workspaceId ?? projectPresenceState.workspaceId ?? null,
      mentions: normalizeArray(payload.mentions),
    },
  };
}

function buildPresenceEvents(projectPresenceState) {
  const participants = normalizeArray(projectPresenceState.participants);

  return participants.map((participant, index) => {
    const normalizedParticipant = normalizeObject(participant);

    return {
      feedItemId: `collaboration-feed:presence:${normalizedParticipant.participantId ?? index + 1}`,
      itemType: "presence",
      headline: `${normalizedParticipant.displayName ?? `Collaborator ${index + 1}`} is ${normalizedParticipant.status ?? "active"}`,
      actorName: normalizedParticipant.displayName ?? `Collaborator ${index + 1}`,
      workspaceArea: normalizedParticipant.workspaceArea ?? projectPresenceState.workspaceArea ?? "developer-workspace",
      resourceId: null,
      status: normalizedParticipant.status ?? "active",
      source: "project-presence",
      visibility: "workspace",
      metadata: {
        participantRole: normalizedParticipant.role ?? "viewer",
        projectId: projectPresenceState.projectId ?? null,
        workspaceId: projectPresenceState.workspaceId ?? null,
      },
    };
  });
}

function buildThreadEvents(reviewThreadState) {
  return normalizeArray(reviewThreadState.threads).map((thread, index) => {
    const normalizedThread = normalizeObject(thread);
    const contextTarget = normalizeObject(normalizedThread.contextTarget);

    return {
      feedItemId: `collaboration-feed:thread:${normalizedThread.threadId ?? index + 1}`,
      itemType: normalizedThread.threadType ?? "review-thread",
      headline: normalizedThread.title ?? "Contextual discussion",
      actorName: normalizedThread.participants?.[0]?.displayName ?? "Nexus",
      workspaceArea: contextTarget.workspaceArea ?? "developer-workspace",
      resourceId: contextTarget.resourceId ?? null,
      status: normalizedThread.status ?? "open",
      source: normalizedThread.source ?? "review-thread",
      visibility: "workspace",
      metadata: {
        resourceType: contextTarget.resourceType ?? null,
        messageCount: normalizeArray(normalizedThread.messages).length,
        pullRequestId: contextTarget.pullRequestId ?? null,
      },
    };
  });
}

function buildWorkspaceTransitionEvent(projectPresenceState) {
  const summary = normalizeObject(projectPresenceState.summary);

  return {
    feedItemId: `collaboration-feed:transition:${projectPresenceState.workspaceId ?? "workspace"}`,
    itemType: "workspace-transition",
    headline: `Team activity is centered in ${summary.dominantWorkspaceArea ?? projectPresenceState.workspaceArea ?? "developer-workspace"}`,
    actorName: "Nexus",
    workspaceArea: summary.dominantWorkspaceArea ?? projectPresenceState.workspaceArea ?? "developer-workspace",
    resourceId: projectPresenceState.workspaceId ?? null,
    status: summary.hasSharedPresence ? "shared" : "solo",
    source: "workspace-transition",
    visibility: "workspace",
    metadata: {
      activeParticipantCount: projectPresenceState.activeParticipantCount ?? 0,
      totalParticipants: summary.totalParticipants ?? 0,
      projectId: projectPresenceState.projectId ?? null,
    },
  };
}

export function createCollaborationActivityFeed({
  collaborationEvent = null,
  projectPresenceState = null,
  reviewThreadState = null,
} = {}) {
  const normalizedPresenceState = normalizeObject(projectPresenceState);
  const items = [
    buildPrimaryEvent(collaborationEvent, normalizedPresenceState),
    ...buildPresenceEvents(normalizedPresenceState),
    ...buildThreadEvents(normalizeObject(reviewThreadState)),
    buildWorkspaceTransitionEvent(normalizedPresenceState),
  ].filter(Boolean);

  return {
    collaborationFeed: {
      feedId: `collaboration-feed:${normalizedPresenceState.projectId ?? "project"}`,
      items,
      summary: {
        totalItems: items.length,
        containsThreadActivity: items.some((item) => item.source === "review-thread" || item.source === "approval-record" || item.source === "pull-request"),
        containsPresenceSignals: items.some((item) => item.itemType === "presence"),
        containsWorkspaceTransitions: items.some((item) => item.itemType === "workspace-transition"),
      },
    },
  };
}
