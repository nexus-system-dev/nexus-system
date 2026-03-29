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

function normalizeTimestamp(value) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return new Date().toISOString();
}

function buildWorkspaceSummary(participants, fallbackWorkspaceArea) {
  const counts = new Map();

  for (const participant of participants) {
    const key = participant.workspaceArea ?? fallbackWorkspaceArea;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const dominantEntry = [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [fallbackWorkspaceArea, 0];
  return {
    dominantWorkspaceArea: dominantEntry[0],
    workspaceAreas: [...counts.entries()].map(([workspaceArea, totalParticipants]) => ({
      workspaceArea,
      totalParticipants,
    })),
  };
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
          currentSurface: normalizedParticipant.currentSurface ?? normalizedParticipant.workspaceArea ?? resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
          currentTask: normalizedParticipant.currentTask ?? null,
          lastSeenAt: normalizeTimestamp(normalizedParticipant.lastSeenAt),
          sessionId: normalizedParticipant.sessionId ?? null,
        };
      })
    : [
        {
          participantId: actor.actorId ?? "current-user",
          displayName: actor.displayName ?? "Current user",
          role: actor.role ?? "viewer",
          status: presenceStatus,
          workspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
          currentSurface: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
          currentTask: normalizedSessionMetric.currentTask ?? null,
          lastSeenAt: normalizeTimestamp(normalizedSessionMetric.lastSeenAt),
          sessionId: normalizedSessionMetric.sessionId ?? null,
        },
      ];
  const workspaceSummary = buildWorkspaceSummary(participants, resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric));

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
        dominantWorkspaceArea: workspaceSummary.dominantWorkspaceArea,
        workspaceAreas: workspaceSummary.workspaceAreas,
        hasSharedPresence: participants.length > 1,
        latestSeenAt: participants
          .map((participant) => participant.lastSeenAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null,
      },
    },
  };
}
