function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
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
  const normalizedPresenceState = normalizeObject(projectPresenceState);

  return {
    feedItemId: `collaboration-feed:event:${normalizedEvent.eventId ?? "unknown"}`,
    itemType: normalizedEvent.eventType ?? "presence-signal",
    headline: payload.message ?? "Workspace activity updated",
    actorName: actor.displayName ?? "Unknown collaborator",
    workspaceArea: target.workspaceArea ?? normalizedPresenceState.workspaceArea ?? "developer-workspace",
    resourceId: target.resourceId ?? null,
    status: payload.reviewStatus ?? payload.approvalStatus ?? actor.presence ?? "active",
    source: "collaboration-event",
    visibility: normalizedEvent.visibility ?? "workspace",
    metadata: {
      projectId: summary.projectId ?? normalizedPresenceState.projectId ?? null,
      workspaceId: summary.workspaceId ?? normalizedPresenceState.workspaceId ?? null,
      mentions: normalizeArray(payload.mentions),
    },
  };
}

function buildPresenceEvents(projectPresenceState) {
  const normalizedPresenceState = normalizeObject(projectPresenceState);
  return normalizeArray(normalizedPresenceState.participants).map((participant, index) => {
    const normalizedParticipant = normalizeObject(participant);

    return {
      feedItemId: `collaboration-feed:presence:${normalizedParticipant.participantId ?? index + 1}`,
      itemType: "presence",
      headline: `${normalizedParticipant.displayName ?? `Collaborator ${index + 1}`} is ${normalizedParticipant.status ?? "active"}`,
      actorName: normalizedParticipant.displayName ?? `Collaborator ${index + 1}`,
      workspaceArea: normalizedParticipant.workspaceArea ?? normalizedPresenceState.workspaceArea ?? "developer-workspace",
      resourceId: null,
      status: normalizedParticipant.status ?? "active",
      source: "project-presence",
      visibility: "workspace",
      metadata: {
        participantRole: normalizedParticipant.role ?? "viewer",
        projectId: normalizedPresenceState.projectId ?? null,
        workspaceId: normalizedPresenceState.workspaceId ?? null,
      },
    };
  });
}

function buildThreadEvents(reviewThreadState) {
  return normalizeArray(normalizeObject(reviewThreadState).threads).map((thread, index) => {
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

function buildSharedApprovalEvents(sharedApprovalState) {
  const normalizedSharedApprovalState = normalizeObject(sharedApprovalState);
  const participantDecisions = normalizeArray(normalizedSharedApprovalState.participantDecisions);
  const coordinationStatus = normalizeObject(normalizedSharedApprovalState.coordinationStatus);

  const decisionItems = participantDecisions
    .filter((participant) => participant.decision && participant.decision !== "pending")
    .map((participant, index) => ({
      feedItemId: `collaboration-feed:approval-decision:${normalizedSharedApprovalState.approvalRequestId ?? "approval"}:${participant.participantRole ?? index + 1}`,
      itemType: "shared-approval",
      headline: `${participant.participantRole ?? "participant"} marked approval as ${participant.decision}`,
      actorName: participant.actorName ?? participant.actorId ?? participant.participantRole ?? "Collaborator",
      workspaceArea: normalizedSharedApprovalState.workspaceArea ?? "developer-workspace",
      resourceId: normalizedSharedApprovalState.approvalRequestId ?? null,
      status: participant.decision,
      source: "shared-approval-state",
      visibility: normalizedSharedApprovalState.visibility ?? "workspace",
      metadata: {
        participantRole: participant.participantRole ?? null,
        pendingRequiredRoles: coordinationStatus.pendingRequiredRoles ?? [],
        workspaceId: normalizedSharedApprovalState.workspaceId ?? null,
      },
    }));

  const waitingItem = coordinationStatus.pendingRequiredRoles?.length > 0
    ? {
        feedItemId: `collaboration-feed:approval-pending:${normalizedSharedApprovalState.approvalRequestId ?? "approval"}`,
        itemType: "shared-approval",
        headline: `Approval is waiting for ${coordinationStatus.pendingRequiredRoles.join(", ")}`,
        actorName: "Nexus",
        workspaceArea: normalizedSharedApprovalState.workspaceArea ?? "developer-workspace",
        resourceId: normalizedSharedApprovalState.approvalRequestId ?? null,
        status: normalizedSharedApprovalState.decisionState?.status ?? "pending",
        source: "shared-approval-state",
        visibility: normalizedSharedApprovalState.visibility ?? "workspace",
        metadata: {
          pendingRequiredRoles: coordinationStatus.pendingRequiredRoles,
          workspaceId: normalizedSharedApprovalState.workspaceId ?? null,
        },
      }
    : null;

  return [...decisionItems, waitingItem].filter(Boolean);
}

function buildWorkspaceTransitionEvent(projectPresenceState) {
  const normalizedPresenceState = normalizeObject(projectPresenceState);
  const summary = normalizeObject(normalizedPresenceState.summary);

  return {
    feedItemId: `collaboration-feed:transition:${normalizedPresenceState.workspaceId ?? "workspace"}`,
    itemType: "workspace-transition",
    headline: `Team activity is centered in ${summary.dominantWorkspaceArea ?? normalizedPresenceState.workspaceArea ?? "developer-workspace"}`,
    actorName: "Nexus",
    workspaceArea: summary.dominantWorkspaceArea ?? normalizedPresenceState.workspaceArea ?? "developer-workspace",
    resourceId: normalizedPresenceState.workspaceId ?? null,
    status: summary.hasSharedPresence ? "shared" : "solo",
    source: "workspace-transition",
    visibility: "workspace",
    metadata: {
      activeParticipantCount: normalizedPresenceState.activeParticipantCount ?? 0,
      totalParticipants: summary.totalParticipants ?? 0,
      projectId: normalizedPresenceState.projectId ?? null,
    },
  };
}

export function createBaselineCollaborationActivityHistoryAssembler({
  collaborationEvent = null,
  projectPresenceState = null,
  reviewThreadState = null,
  sharedApprovalState = null,
} = {}) {
  const normalizedCollaborationEvent = normalizeObject(collaborationEvent);
  const normalizedPresenceState = normalizeObject(projectPresenceState);
  const normalizedReviewThreadState = normalizeObject(reviewThreadState);
  const normalizedSharedApprovalState = normalizeObject(sharedApprovalState);
  const items = [
    buildPrimaryEvent(normalizedCollaborationEvent, normalizedPresenceState),
    ...buildPresenceEvents(normalizedPresenceState),
    ...buildThreadEvents(normalizedReviewThreadState),
    ...buildSharedApprovalEvents(normalizedSharedApprovalState),
    buildWorkspaceTransitionEvent(normalizedPresenceState),
  ].filter(Boolean);

  return {
    collaborationActivityHistory: {
      historyId: `collaboration-history:${normalizedPresenceState.projectId ?? normalizedCollaborationEvent.summary?.projectId ?? "project"}`,
      items,
      summary: {
        totalItems: items.length,
        containsThreadActivity: items.some((item) => item.source === "review-thread"),
        containsPresenceSignals: items.some((item) => item.itemType === "presence"),
        containsWorkspaceTransitions: items.some((item) => item.itemType === "workspace-transition"),
        containsApprovalCoordination: items.some((item) => item.source === "shared-approval-state"),
      },
    },
  };
}
