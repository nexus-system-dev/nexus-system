function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSource(value) {
  const normalized = normalizeString(value)?.toLowerCase() ?? null;
  if (normalized === "ai-analyst" || normalized === "provider-operation-contract" || normalized === "manual" || normalized === "derived") {
    return normalized;
  }

  return "derived";
}

function normalizeModelInvocation(modelInvocation) {
  const normalized = normalizeObject(modelInvocation);
  const modelName = normalizeString(normalized.modelName);
  const tokenUsage = normalizeFiniteNumber(normalized.tokenUsage);
  const estimatedTokenUsage = normalizeFiniteNumber(normalized.estimatedTokenUsage);

  return {
    modelName,
    tokenUsage,
    estimatedTokenUsage,
    projectId: normalizeString(normalized.projectId) ?? null,
    userId: normalizeString(normalized.userId) ?? null,
    workflowId: normalizeString(normalized.workflowId) ?? null,
    recordedAt: normalizeString(normalized.recordedAt) ?? null,
    invocationCount: normalizeFiniteNumber(normalized.invocationCount) ?? 1,
    source: normalizeSource(normalized.source),
  };
}

function normalizeToolInvocation(toolInvocation) {
  const normalized = normalizeObject(toolInvocation);

  return {
    toolName: normalizeString(normalized.toolName) ?? null,
    providerOperation: normalizeString(normalized.providerOperation)?.toLowerCase() ?? null,
    projectId: normalizeString(normalized.projectId) ?? null,
    userId: normalizeString(normalized.userId) ?? null,
    workflowId: normalizeString(normalized.workflowId) ?? null,
    recordedAt: normalizeString(normalized.recordedAt) ?? null,
    runCount: normalizeFiniteNumber(normalized.runCount) ?? 1,
    source: normalizeSource(normalized.source),
  };
}

function resolveRecordedAt(modelUsage, toolUsage) {
  return modelUsage.recordedAt ?? toolUsage.recordedAt ?? new Date().toISOString();
}

function resolveScopeId(projectId, workflowId, userId) {
  return projectId ?? workflowId ?? userId ?? null;
}

function determinePrimaryUsage(modelUsage, toolUsage) {
  if (modelUsage.modelName) {
    return {
      usageType: "model",
      quantity: modelUsage.tokenUsage,
      unit: "token",
      source: modelUsage.source,
    };
  }

  if (toolUsage.providerOperation || toolUsage.toolName) {
    return {
      usageType: "provider-operation",
      quantity: toolUsage.runCount,
      unit: "operation",
      source: toolUsage.source,
    };
  }

  return {
    usageType: "unknown-usage-type",
    quantity: null,
    unit: "unknown-cost-unit",
    source: "derived",
  };
}

function buildTokenUsage(modelUsage) {
  if (modelUsage.tokenUsage !== null) {
    return {
      tokenUsage: modelUsage.tokenUsage,
      estimatedTokenUsage: null,
      tokenUsageSource: "provided",
    };
  }

  if (modelUsage.estimatedTokenUsage !== null) {
    return {
      tokenUsage: null,
      estimatedTokenUsage: modelUsage.estimatedTokenUsage,
      tokenUsageSource: "derived",
    };
  }

  return {
    tokenUsage: null,
    estimatedTokenUsage: null,
    tokenUsageSource: "unavailable",
  };
}

export function createAiUsageMeter({
  modelInvocation = null,
  toolInvocation = null,
} = {}) {
  const modelUsageInput = normalizeModelInvocation(modelInvocation);
  const toolUsageInput = normalizeToolInvocation(toolInvocation);
  const primaryUsage = determinePrimaryUsage(modelUsageInput, toolUsageInput);
  const projectId = modelUsageInput.projectId ?? toolUsageInput.projectId ?? null;
  const userId = modelUsageInput.userId ?? toolUsageInput.userId ?? null;
  const workflowId = modelUsageInput.workflowId ?? toolUsageInput.workflowId ?? null;
  const scopeType = projectId ? "project" : workflowId ? "workflow" : userId ? "user" : "project";
  const scopeId = resolveScopeId(projectId, workflowId, userId);
  const recordedAt = resolveRecordedAt(modelUsageInput, toolUsageInput);

  return {
    aiUsageMetric: {
      aiUsageMetricId: `ai-usage-metric:${primaryUsage.usageType}:${scopeType}:${scopeId ?? "global"}:${recordedAt}`,
      usageType: primaryUsage.usageType,
      quantity: primaryUsage.quantity,
      unit: primaryUsage.unit,
      scopeType,
      scopeId,
      projectScope: {
        projectId,
      },
      userScope: {
        userId,
      },
      workflowScope: {
        workflowId,
      },
      modelUsage: {
        modelName: modelUsageInput.modelName,
        invocationCount: modelUsageInput.invocationCount,
        source: modelUsageInput.modelName ? modelUsageInput.source : null,
      },
      toolUsage: {
        toolName: toolUsageInput.toolName,
        providerOperation: toolUsageInput.providerOperation,
        runCount: toolUsageInput.runCount,
        source: toolUsageInput.providerOperation || toolUsageInput.toolName ? toolUsageInput.source : null,
      },
      tokenUsage: buildTokenUsage(modelUsageInput),
      source: primaryUsage.source,
      recordedAt,
      summary:
        primaryUsage.usageType === "model"
          ? `AI usage metric captured model invocation for ${modelUsageInput.modelName ?? "unknown-model"}.`
          : primaryUsage.usageType === "provider-operation"
            ? `AI usage metric captured provider operation ${toolUsageInput.providerOperation ?? toolUsageInput.toolName ?? "unknown-operation"}.`
            : "AI usage metric captured no canonical usage source and fell back to unknown usage type.",
    },
  };
}
