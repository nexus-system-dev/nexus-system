function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolveEventType(workspaceAction) {
  const actionType = workspaceAction.actionType ?? workspaceAction.type ?? "presence-signal";
  const normalized = String(actionType).trim().toLowerCase();

  if (normalized.includes("comment")) {
    return "comment";
  }

  if (normalized.includes("mention")) {
    return "mention";
  }

  if (normalized.includes("review")) {
    return "shared-review";
  }

  if (normalized.includes("approval")) {
    return "shared-approval";
  }

  if (normalized.includes("presence")) {
    return "presence-signal";
  }

  return normalized || "presence-signal";
}

function resolveVisibility(workspaceAction, actorContext) {
  if (typeof workspaceAction.visibility === "string" && workspaceAction.visibility.trim()) {
    return workspaceAction.visibility.trim();
  }

  return actorContext.workspaceVisibility ?? "workspace";
}

function buildTarget(workspaceAction, actorContext) {
  return {
    workspaceId: workspaceAction.workspaceId ?? actorContext.workspaceId ?? null,
    projectId: workspaceAction.projectId ?? actorContext.projectId ?? null,
    workspaceArea: workspaceAction.workspaceArea ?? actorContext.workspaceArea ?? "developer-workspace",
    resourceId: workspaceAction.resourceId ?? null,
  };
}

function buildActor(actorContext) {
  return {
    actorId: actorContext.actorId ?? actorContext.userId ?? null,
    displayName: actorContext.displayName ?? "Unknown collaborator",
    role: actorContext.role ?? "viewer",
    presence: actorContext.presence ?? "active",
  };
}

export function defineCollaborationEventSchema({
  workspaceAction = null,
  actorContext = null,
} = {}) {
  const normalizedWorkspaceAction = normalizeObject(workspaceAction);
  const normalizedActorContext = normalizeObject(actorContext);
  const eventType = resolveEventType(normalizedWorkspaceAction);
  const target = buildTarget(normalizedWorkspaceAction, normalizedActorContext);
  const actor = buildActor(normalizedActorContext);
  const visibility = resolveVisibility(normalizedWorkspaceAction, normalizedActorContext);

  return {
    collaborationEvent: {
      eventId: normalizedWorkspaceAction.eventId
        ?? `collaboration-event:${target.projectId ?? "project"}:${eventType}`,
      eventType,
      visibility,
      actor,
      target,
      payload: {
        message: normalizedWorkspaceAction.message ?? null,
        mentions: Array.isArray(normalizedWorkspaceAction.mentions) ? normalizedWorkspaceAction.mentions : [],
        reviewStatus: normalizedWorkspaceAction.reviewStatus ?? null,
        approvalStatus: normalizedWorkspaceAction.approvalStatus ?? null,
      },
      summary: {
        workspaceId: target.workspaceId,
        projectId: target.projectId,
        workspaceArea: target.workspaceArea,
        actorRole: actor.role,
        isSharedEvent: ["comment", "mention", "shared-review", "shared-approval"].includes(eventType),
      },
    },
  };
}
