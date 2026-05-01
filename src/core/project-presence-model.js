function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolvePresenceStatus(collaborationEvent, sessionMetric) {
  const sessionStatus = normalizeString(sessionMetric.status);
  if (sessionStatus) {
    return sessionStatus.toLowerCase();
  }

  const actorPresence = normalizeString(collaborationEvent.actor?.presence);
  if (actorPresence) {
    return actorPresence.toLowerCase();
  }

  return "idle";
}

function resolveWorkspaceArea(collaborationEvent, sessionMetric) {
  return normalizeString(sessionMetric.workspaceArea)
    ?? normalizeString(collaborationEvent.target?.workspaceArea)
    ?? "developer-workspace";
}

function normalizeTimestamp(value) {
  const normalizedValue = normalizeString(value);
  if (normalizedValue) {
    return normalizedValue;
  }

  return new Date().toISOString();
}

function isActiveStatus(status) {
  return normalizeString(status, "").toLowerCase() === "active";
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
        const resolvedWorkspaceArea = normalizeString(
          normalizedParticipant.workspaceArea,
          resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
        );
        return {
          participantId: normalizeString(
            normalizedParticipant.userId,
            normalizeString(normalizedParticipant.actorId, `participant-${index + 1}`),
          ),
          displayName: normalizeString(normalizedParticipant.displayName, `Collaborator ${index + 1}`),
          role: normalizeString(normalizedParticipant.role, "viewer"),
          status: normalizeString(normalizedParticipant.status, "active").toLowerCase(),
          workspaceArea: resolvedWorkspaceArea,
          currentSurface: normalizeString(
            normalizedParticipant.currentSurface,
            normalizeString(normalizedParticipant.workspaceArea, resolvedWorkspaceArea),
          ),
          currentTask: normalizeString(normalizedParticipant.currentTask, null),
          lastSeenAt: normalizeTimestamp(normalizedParticipant.lastSeenAt),
          sessionId: normalizeString(normalizedParticipant.sessionId, null),
        };
      })
    : [
        {
          participantId: normalizeString(actor.actorId, "current-user"),
          displayName: normalizeString(actor.displayName, "Current user"),
          role: normalizeString(actor.role, "viewer"),
          status: presenceStatus,
          workspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
          currentSurface: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
          currentTask: normalizeString(normalizedSessionMetric.currentTask, null),
          lastSeenAt: normalizeTimestamp(normalizedSessionMetric.lastSeenAt),
          sessionId: normalizeString(normalizedSessionMetric.sessionId, null),
        },
      ];
  const workspaceSummary = buildWorkspaceSummary(participants, resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric));
  const projectId = normalizeString(target.projectId, normalizeString(normalizedSessionMetric.projectId, null));

  return {
    projectPresenceState: {
      presenceStateId: `project-presence:${projectId ?? "project"}`,
      workspaceId: normalizeString(target.workspaceId, normalizeString(normalizedSessionMetric.workspaceId, null)),
      projectId,
      workspaceArea: resolveWorkspaceArea(normalizedCollaborationEvent, normalizedSessionMetric),
      participants,
      activeParticipantCount: participants.filter((participant) => isActiveStatus(participant.status)).length,
      summary: {
        totalParticipants: participants.length,
        activeParticipantCount: participants.filter((participant) => isActiveStatus(participant.status)).length,
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
