function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function resolveCategory(actionType) {
  const normalized = normalizeString(actionType, "")?.toLowerCase() ?? "";

  if (normalized.startsWith("project.edit") || normalized.includes("diff")) {
    return "edit";
  }

  if (normalized.startsWith("project.approval") || normalized.includes("approval")) {
    return "approval";
  }

  if (normalized.startsWith("project.deploy") || normalized.includes("deploy") || normalized.includes("release")) {
    return "deploy";
  }

  if (normalized.startsWith("project.provider") || normalized.includes("provider")) {
    return "provider";
  }

  if (normalized.startsWith("project.agent-governance") || normalized.includes("governance")) {
    return "governance";
  }

  if (normalized.startsWith("project.state") || normalized.includes("restore") || normalized.includes("rollback")) {
    return "state-change";
  }

  return "project";
}

function resolveResource(projectAction, category) {
  if (projectAction.targetType || projectAction.targetId) {
    return {
      targetType: normalizeString(projectAction.targetType, category),
      targetId: normalizeString(projectAction.targetId, null),
    };
  }

  return {
    targetType: category,
    targetId: null,
  };
}

export function defineProjectAuditEventSchema({
  projectAction = null,
  actorContext = null,
} = {}) {
  const normalizedProjectAction = normalizeObject(projectAction);
  const normalizedActorContext = normalizeObject(actorContext);
  const actionType = normalizeString(normalizedProjectAction.actionType, "project.observed");
  const category = resolveCategory(actionType);
  const resource = resolveResource(normalizedProjectAction, category);
  const impactedAreas = normalizeArray(normalizedProjectAction.impactedAreas)
    .map((area) => normalizeString(area, null))
    .filter(Boolean);
  const attachments = normalizeArray(normalizedProjectAction.attachments);

  return {
    projectAuditEvent: {
      projectAuditEventId: `project-audit:${normalizeString(normalizedProjectAction.projectId ?? normalizedActorContext.projectId, "unknown")}:${Date.now()}`,
      projectId: normalizeString(normalizedProjectAction.projectId ?? normalizedActorContext.projectId, null),
      workspaceId: normalizeString(normalizedActorContext.workspaceId, null),
      actionType,
      category,
      status: normalizeString(normalizedProjectAction.status, "recorded"),
      actor: {
        actorId: normalizeString(normalizedActorContext.actorId ?? normalizedProjectAction.actorId, "system"),
        actorType: normalizeString(normalizedActorContext.actorType, "system"),
        actorRole: normalizeString(normalizedActorContext.actorRole, null),
      },
      resource,
      summary: normalizeString(normalizedProjectAction.summary, actionType),
      reason: normalizeString(normalizedProjectAction.reason, null),
      riskLevel: normalizeString(normalizedProjectAction.riskLevel, "low"),
      source: normalizeString(normalizedProjectAction.source ?? normalizedActorContext.source, "nexus-runtime"),
      traceId: normalizeString(normalizedProjectAction.traceId ?? normalizedActorContext.traceId, null),
      timestamp: normalizeString(normalizedProjectAction.timestamp, new Date().toISOString()),
      impactedAreas,
      attachments,
      metadata: normalizedProjectAction.metadata ?? {},
      summaryFlags: {
        hasAttachments: attachments.length > 0,
        hasImpact: impactedAreas.length > 0,
        isHighRisk: normalizeString(normalizedProjectAction.riskLevel, "low") === "high",
      },
    },
  };
}
