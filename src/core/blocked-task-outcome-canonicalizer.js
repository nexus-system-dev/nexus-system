function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeBlockedBy(value) {
  return normalizeArray(value)
    .map((entry) => normalizeString(entry))
    .filter(Boolean);
}

function normalizeTaskResult(result) {
  const normalized = normalizeObject(result);
  const taskId = normalizeString(normalized.taskId);
  if (!taskId) {
    return null;
  }

  return {
    id: normalizeString(normalized.id),
    type: normalizeString(normalized.type),
    projectId: normalizeString(normalized.projectId),
    taskId,
    taskType: normalizeString(normalized.taskType),
    lane: normalizeString(normalized.lane),
    agentId: normalizeString(normalized.agentId),
    assignmentEventId: normalizeString(normalized.assignmentEventId),
    status: normalizeString(normalized.status),
    output: normalized.output ?? null,
    reason: normalizeString(normalized.reason),
    blockedBy: normalizeBlockedBy(normalized.blockedBy),
    timestamp: normalizeString(normalized.timestamp),
  };
}

function buildTaskMetadataLookup({ roadmap = [], executionGraph = null, taskAssignments = [], runtimeResults = [] } = {}) {
  const lookup = new Map();
  const nodes = normalizeArray(normalizeObject(executionGraph).nodes);

  for (const task of normalizeArray(roadmap)) {
    const taskId = normalizeString(task?.id);
    if (!taskId) {
      continue;
    }
    lookup.set(taskId, {
      taskType: normalizeString(task?.taskType),
      lane: normalizeString(task?.lane),
      agentId: null,
      assignmentEventId: null,
      assignmentTimestamp: null,
    });
  }

  for (const node of nodes) {
    const taskId = normalizeString(node?.id);
    if (!taskId) {
      continue;
    }
    const current = lookup.get(taskId) ?? {};
    lookup.set(taskId, {
      ...current,
      taskType: current.taskType ?? normalizeString(node?.taskType),
      lane: current.lane ?? normalizeString(node?.lane),
    });
  }

  for (const assignment of normalizeArray(taskAssignments)) {
    const taskId = normalizeString(assignment?.taskId ?? assignment?.task?.id);
    if (!taskId) {
      continue;
    }
    const current = lookup.get(taskId) ?? {};
    lookup.set(taskId, {
      ...current,
      taskType: current.taskType ?? normalizeString(assignment?.taskType ?? assignment?.task?.taskType),
      lane: current.lane ?? normalizeString(assignment?.lane),
      agentId: normalizeString(assignment?.agentId) ?? current.agentId ?? null,
      assignmentEventId: normalizeString(assignment?.eventId ?? assignment?.assignmentEventId) ?? current.assignmentEventId ?? null,
      assignmentTimestamp: normalizeString(assignment?.timestamp) ?? current.assignmentTimestamp ?? null,
    });
  }

  for (const event of normalizeArray(runtimeResults)) {
    const payload = normalizeObject(event?.payload);
    const taskId = normalizeString(payload.taskId ?? payload.task?.id);
    if (!taskId || normalizeString(event?.type) !== "task.assigned") {
      continue;
    }
    const current = lookup.get(taskId) ?? {};
    lookup.set(taskId, {
      ...current,
      taskType: current.taskType ?? normalizeString(payload.taskType ?? payload.task?.taskType),
      lane: current.lane ?? normalizeString(payload.lane),
      agentId: normalizeString(payload.agentId) ?? current.agentId ?? null,
      assignmentEventId: normalizeString(event?.id) ?? current.assignmentEventId ?? null,
      assignmentTimestamp: normalizeString(event?.timestamp) ?? current.assignmentTimestamp ?? null,
    });
  }

  return lookup;
}

function buildRuntimeBlockedEventLookup(runtimeResults = []) {
  const lookup = new Map();

  for (const event of normalizeArray(runtimeResults)) {
    if (normalizeString(event?.type) !== "task.blocked") {
      continue;
    }

    const payload = normalizeObject(event?.payload);
    const taskId = normalizeString(payload.taskId ?? payload.task?.id);
    if (!taskId) {
      continue;
    }

    lookup.set(taskId, {
      id: normalizeString(event?.id),
      projectId: normalizeString(payload.projectId),
      taskType: normalizeString(payload.taskType ?? payload.task?.taskType),
      lane: normalizeString(payload.lane),
      agentId: normalizeString(payload.agentId),
      assignmentEventId: normalizeString(payload.assignmentEventId),
      reason: normalizeString(payload.reason),
      blockedBy: normalizeBlockedBy(payload.blockedBy),
      timestamp: normalizeString(event?.timestamp),
      output: payload.output ?? null,
    });
  }

  return lookup;
}

function buildBlockedReason(taskId, blockedBy) {
  if (blockedBy.length === 0) {
    return `Task ${taskId} is blocked.`;
  }

  return `Task ${taskId} is blocked by ${blockedBy.join(", ")}.`;
}

export function createBlockedTaskOutcomeCanonicalizer({
  projectId = null,
  executionGraph = null,
  roadmap = [],
  taskAssignments = [],
  runtimeResults = [],
  existingTaskResults = [],
} = {}) {
  const taskMetadataLookup = buildTaskMetadataLookup({
    roadmap,
    executionGraph,
    taskAssignments,
    runtimeResults,
  });
  const runtimeBlockedEvents = buildRuntimeBlockedEventLookup(runtimeResults);
  const existingBlockedResults = new Map(
    normalizeArray(existingTaskResults)
      .map(normalizeTaskResult)
      .filter((result) => result?.status === "blocked")
      .map((result) => [result.taskId, result]),
  );
  const nodes = normalizeArray(normalizeObject(executionGraph).nodes);
  const blockedNodeByTaskId = new Map(
    nodes
      .filter((node) => normalizeString(node?.status) === "blocked")
      .map((node) => [normalizeString(node?.id), node])
      .filter(([taskId]) => Boolean(taskId)),
  );
  const blockedTaskIds = new Set([
    ...blockedNodeByTaskId.keys(),
    ...runtimeBlockedEvents.keys(),
    ...existingBlockedResults.keys(),
  ]);

  const blockedTaskOutcomes = [...blockedTaskIds]
    .map((taskId) => {
      const node = blockedNodeByTaskId.get(taskId) ?? {};
      const runtimeBlocked = runtimeBlockedEvents.get(taskId) ?? {};
      const existingBlocked = existingBlockedResults.get(taskId) ?? {};
      const blockedBy = normalizeBlockedBy(node?.blockedBy).length > 0
        ? normalizeBlockedBy(node?.blockedBy)
        : runtimeBlocked.blockedBy ?? existingBlocked.blockedBy ?? [];
      if (blockedBy.length === 0) {
        return null;
      }

      const metadata = taskMetadataLookup.get(taskId) ?? {};
      const canonicalProjectId
        = normalizeString(projectId)
        ?? runtimeBlocked.projectId
        ?? existingBlocked.projectId
        ?? null;

      return {
        id: runtimeBlocked.id ?? existingBlocked.id ?? `task.blocked:${canonicalProjectId ?? "unknown-project"}:${taskId}`,
        type: "task.blocked",
        projectId: canonicalProjectId,
        taskId,
        taskType: runtimeBlocked.taskType ?? existingBlocked.taskType ?? metadata.taskType ?? null,
        lane: runtimeBlocked.lane ?? existingBlocked.lane ?? metadata.lane ?? null,
        agentId: runtimeBlocked.agentId ?? existingBlocked.agentId ?? metadata.agentId ?? null,
        assignmentEventId: runtimeBlocked.assignmentEventId ?? existingBlocked.assignmentEventId ?? metadata.assignmentEventId ?? null,
        status: "blocked",
        output: runtimeBlocked.output ?? existingBlocked.output ?? null,
        reason: runtimeBlocked.reason ?? existingBlocked.reason ?? buildBlockedReason(taskId, blockedBy),
        blockedBy,
        timestamp: runtimeBlocked.timestamp ?? existingBlocked.timestamp ?? metadata.assignmentTimestamp ?? null,
      };
    })
    .filter(Boolean);

  return {
    blockedTaskOutcomes,
  };
}
