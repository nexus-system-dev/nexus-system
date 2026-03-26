function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function severityFromType(type) {
  if (["failed-task", "approval-blocker", "policy-blocker"].includes(type)) {
    return "high";
  }

  if (["graph-blocker", "health-blocker"].includes(type)) {
    return "medium";
  }

  return "low";
}

function buildNoBlocker(projectState) {
  return {
    bottleneckId: `bottleneck:${projectState.projectId ?? "unknown"}:none`,
    blockerType: "none",
    severity: "low",
    affectedFlow: "execution",
    owner: "system",
    title: "No active bottleneck detected",
    reason: "Project state and execution graph do not expose a current blocking constraint",
    unblockConditions: [],
    summary: {
      isBlocked: false,
      blockerCount: 0,
    },
  };
}

export function defineBottleneckSchema({
  projectState = null,
  executionGraph = null,
  taskResults = [],
} = {}) {
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedExecutionGraph = normalizeObject(executionGraph);
  const normalizedTaskResults = normalizeArray(taskResults);
  const nodes = normalizeArray(normalizedExecutionGraph.nodes);
  const healthBlockers = normalizeArray(normalizedProjectState.observed?.health?.blockers);

  const failedTask = normalizedTaskResults.find((task) => task?.status === "failed");
  const blockedNode = nodes.find((node) => node?.status === "blocked");
  const policyBlocked = normalizedProjectState.policyTrace?.outcome === "blocked";
  const approvalMissing = normalizedProjectState.gatingDecision?.decision === "requires-approval";

  if (failedTask) {
    return {
      bottleneckState: {
        bottleneckId: `bottleneck:${failedTask.taskId ?? failedTask.id ?? "failed-task"}`,
        blockerType: "failed-task",
        severity: severityFromType("failed-task"),
        affectedFlow: failedTask.lane ?? "execution",
        owner: "dev-agent",
        title: "A failed task is blocking progress",
        reason: failedTask.reason ?? failedTask.summary ?? "Task execution failed and needs recovery",
        unblockConditions: ["retry-or-recover-task", "clear-failed-task-state"],
        summary: {
          isBlocked: true,
          blockerCount: 1,
        },
      },
    };
  }

  if (approvalMissing) {
    return {
      bottleneckState: {
        bottleneckId: `bottleneck:${normalizedProjectState.projectId ?? "unknown"}:approval`,
        blockerType: "approval-blocker",
        severity: severityFromType("approval-blocker"),
        affectedFlow: "approval",
        owner: "user",
        title: "Approval is blocking execution",
        reason: normalizedProjectState.approvalStatus?.reason ?? "Execution requires approval before continuing",
        unblockConditions: ["approve-request", "reduce-scope"],
        summary: {
          isBlocked: true,
          blockerCount: 1,
        },
      },
    };
  }

  if (policyBlocked) {
    return {
      bottleneckState: {
        bottleneckId: `bottleneck:${normalizedProjectState.projectId ?? "unknown"}:policy`,
        blockerType: "policy-blocker",
        severity: severityFromType("policy-blocker"),
        affectedFlow: "policy",
        owner: "workspace-owner",
        title: "Policy is blocking the current path",
        reason: normalizedProjectState.policyTrace?.summary ?? "Current execution path is blocked by policy",
        unblockConditions: ["change-execution-path", "update-policy-or-approval"],
        summary: {
          isBlocked: true,
          blockerCount: 1,
        },
      },
    };
  }

  if (blockedNode) {
    return {
      bottleneckState: {
        bottleneckId: `bottleneck:${blockedNode.id ?? "graph-blocker"}`,
        blockerType: "graph-blocker",
        severity: severityFromType("graph-blocker"),
        affectedFlow: blockedNode.lane ?? "execution",
        owner: "system",
        title: "Execution graph is currently blocked",
        reason: blockedNode.blockedBy?.length
          ? `Task is waiting on: ${blockedNode.blockedBy.join(", ")}`
          : "A blocked task in the execution graph is stopping forward progress",
        unblockConditions: ["complete-upstream-dependencies"],
        summary: {
          isBlocked: true,
          blockerCount: nodes.filter((node) => node?.status === "blocked").length,
        },
      },
    };
  }

  if (healthBlockers.length > 0) {
    return {
      bottleneckState: {
        bottleneckId: `bottleneck:${normalizedProjectState.projectId ?? "unknown"}:health`,
        blockerType: "health-blocker",
        severity: severityFromType("health-blocker"),
        affectedFlow: "runtime",
        owner: "ops",
        title: "Runtime health is blocking progress",
        reason: healthBlockers[0],
        unblockConditions: ["restore-runtime-health", "clear-ci-or-deployment-issues"],
        summary: {
          isBlocked: true,
          blockerCount: healthBlockers.length,
        },
      },
    };
  }

  return {
    bottleneckState: buildNoBlocker(normalizedProjectState),
  };
}
