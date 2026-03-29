function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildBlockerIndex(blockers = []) {
  const normalizedBlockers = normalizeArray(blockers);

  return {
    all: normalizedBlockers,
    approval: normalizedBlockers.filter((blocker) =>
      String(blocker?.type ?? blocker?.blockerType ?? "").includes("approval")
      || String(blocker?.title ?? "").toLowerCase().includes("approval")
    ),
  };
}

function pickReadyTask(roadmap = []) {
  return roadmap.find((task) => task?.status === "ready") ?? null;
}

function pickAssignedTask(roadmap = []) {
  return roadmap.find((task) => task?.status === "assigned") ?? null;
}

function pickBlockedTask(roadmap = []) {
  return roadmap.find((task) => task?.status === "blocked") ?? null;
}

function createApprovalTask(blockedTask, approvalStatus, blockerIndex, schedulerAlternatives) {
  const task = blockedTask ?? {};

  return {
    selectedTask: {
      id: `approval-handoff:${task.id ?? "pending"}`,
      lane: "approval",
      summary: task.summary ?? "נדרש אישור כדי להתקדם",
      status: approvalStatus?.status ?? "missing",
      assigneeType: "user",
      dependencies: normalizeArray(task.dependencies),
      requiredCapabilities: ["approval"],
      alternatives: schedulerAlternatives,
    },
    selectionReason: {
      code: "approval-gate",
      source: "approval-status",
      summary: approvalStatus?.reason ?? "Execution is blocked until approval is resolved",
      blockerCount: blockerIndex.approval.length,
      requiresUserAction: true,
    },
  };
}

function createTaskSelection(task, code, source, summary, schedulerAlternatives = []) {
  return {
    selectedTask: {
      ...task,
      alternatives: schedulerAlternatives,
    },
    selectionReason: {
      code,
      source,
      summary,
      requiresUserAction: false,
    },
  };
}

export function createNextTaskSelectionResolver({
  roadmap = [],
  blockers = [],
  approvalStatus = null,
  schedulerAlternatives = [],
} = {}) {
  const normalizedRoadmap = normalizeArray(roadmap).filter(Boolean);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedSchedulerAlternatives = normalizeArray(schedulerAlternatives);
  const blockerIndex = buildBlockerIndex(blockers);
  const assignedTask = pickAssignedTask(normalizedRoadmap);
  const readyTask = pickReadyTask(normalizedRoadmap);
  const blockedTask = pickBlockedTask(normalizedRoadmap);

  if (
    ["pending", "missing", "rejected", "expired"].includes(normalizedApprovalStatus.status)
    && (blockerIndex.approval.length > 0 || blockedTask)
  ) {
    return createApprovalTask(blockedTask, normalizedApprovalStatus, blockerIndex, normalizedSchedulerAlternatives);
  }

  if (readyTask) {
    return createTaskSelection(
      readyTask,
      "ready-task",
      "roadmap",
      "Selected the first ready task from the roadmap",
      normalizedSchedulerAlternatives,
    );
  }

  if (assignedTask) {
    return createTaskSelection(
      assignedTask,
      "assigned-task",
      "roadmap",
      "Continuing the currently assigned task",
      normalizedSchedulerAlternatives,
    );
  }

  if (blockedTask) {
    return createTaskSelection(
      blockedTask,
      "blocked-task",
      "roadmap",
      "No ready task is available, so the top blocked task was selected",
      normalizedSchedulerAlternatives,
    );
  }

  return {
    selectedTask: null,
    selectionReason: {
      code: "no-task-available",
      source: "roadmap",
      summary: "No roadmap task is available for selection",
      requiresUserAction: false,
    },
  };
}
