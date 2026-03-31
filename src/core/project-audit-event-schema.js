function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveCategory(actionType) {
  const normalized = String(actionType ?? "").toLowerCase();

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
      targetType: projectAction.targetType ?? category,
      targetId: projectAction.targetId ?? null,
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
  const actionType = normalizedProjectAction.actionType ?? "project.observed";
  const category = resolveCategory(actionType);
  const resource = resolveResource(normalizedProjectAction, category);
  const impactedAreas = normalizeArray(normalizedProjectAction.impactedAreas);
  const attachments = normalizeArray(normalizedProjectAction.attachments);

  return {
    projectAuditEvent: {
      projectAuditEventId: `project-audit:${normalizedProjectAction.projectId ?? normalizedActorContext.projectId ?? "unknown"}:${Date.now()}`,
      projectId: normalizedProjectAction.projectId ?? normalizedActorContext.projectId ?? null,
      workspaceId: normalizedActorContext.workspaceId ?? null,
      actionType,
      category,
      status: normalizedProjectAction.status ?? "recorded",
      actor: {
        actorId: normalizedActorContext.actorId ?? normalizedProjectAction.actorId ?? "system",
        actorType: normalizedActorContext.actorType ?? "system",
        actorRole: normalizedActorContext.actorRole ?? null,
      },
      resource,
      summary: normalizedProjectAction.summary ?? actionType,
      reason: normalizedProjectAction.reason ?? null,
      riskLevel: normalizedProjectAction.riskLevel ?? "low",
      source: normalizedProjectAction.source ?? normalizedActorContext.source ?? "nexus-runtime",
      traceId: normalizedProjectAction.traceId ?? normalizedActorContext.traceId ?? null,
      timestamp: normalizedProjectAction.timestamp ?? new Date().toISOString(),
      impactedAreas,
      attachments,
      metadata: normalizedProjectAction.metadata ?? {},
      summaryFlags: {
        hasAttachments: attachments.length > 0,
        hasImpact: impactedAreas.length > 0,
        isHighRisk: (normalizedProjectAction.riskLevel ?? "low") === "high",
      },
    },
  };
}
