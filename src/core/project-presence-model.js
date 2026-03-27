function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolvePresenceStatus(collaborationEvent, sessionMetric) {
  if (typeof sessionMetric.status === "string" && sessionMetric.status.trim()) {
    return sessionMetric.status.trim();
  }

  if (typeof collaborationEvent.actor?.presence === "string" && collaborationEvent.actor.presence.trim()) {
    return collaborationEvent.actor.presence.trim();
  }

  return "idle";
}

function resolveWorkspaceArea(collaborationEvent, sessionMetric) {
  return sessionMetric.workspaceArea
    ?? collaborationEvent.target?.workspaceArea
    ?? "developer-workspace";
}

export function createProjectPresenceModel({
  collaborationEvent = null,
  userSessionMetric = null,
} = {}) {
  const normalizedCollaborationEvent = normalizeObject(collaborationEvent);
  const normalizedSessionMetric = normalizeObject(userSessionMetric);
  const collaborators = normalizeArray(normalizedSessionMetric.activeUsers);
  const actor = normalizeObject(normalizedCollaborationEvent.actor);
  const target = normalizeObject(normalizedCollaborationEvent.target);
  const presenceStatus = resolvePresenceStatus(normalizedCollaborationEvent, normalizedSessionMetric);

  const participants = collaborators.length > 0
    ? collaborators.map((participant, index) => {
        const normalizedParticipant = normalizeObject(participant);
        return {
          participantId: normalizedParticipant.userId ?? normalizedParticipant.actorId ?? `participant-${index + 1}`,
          displayName: normalizedParticipant.displayName ?? `Collaborator ${index + 1}`,
          role: normalizedParticipant.role ?? "viewer",
          status: normalizedParticipant.status ?? "active",
          workspaceArea: normalizedParticipant.workspaceArea ?? resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
        };
      })
    : [
        {
          participantId: actor.actorId ?? "current-user",
          displayName: actor.displayName ?? "Current user",
          role: actor.role ?? "viewer",
          status: presenceStatus,
          workspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
        },
      ];

  return {
    projectPresenceState: {
      presenceStateId: `project-presence:${target.projectId ?? normalizedSessionMetric.projectId ?? "project"}`,
      workspaceId: target.workspaceId ?? normalizedSessionMetric.workspaceId ?? null,
      projectId: target.projectId ?? normalizedSessionMetric.projectId ?? null,
      workspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
      participants,
      activeParticipantCount: participants.filter((participant) => participant.status === "active").length,
      summary: {
        totalParticipants: participants.length,
        activeParticipantCount: participants.filter((participant) => participant.status === "active").length,
        dominantWorkspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
        hasSharedPresence: participants.length > 1,
      },
    },
  };
}
