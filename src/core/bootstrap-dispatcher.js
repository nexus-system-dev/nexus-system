function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function inferRequiredCapabilities(task = {}) {
  const rule = task.rule ?? "";

  if (rule.includes("billing") || rule.includes("payment")) {
    return ["backend", "payments"];
  }

  if (rule.includes("auth")) {
    return ["backend", "security"];
  }

  if (rule.includes("mobile")) {
    return ["frontend"];
  }

  if (rule.includes("content") || rule.includes("outline")) {
    return ["marketing"];
  }

  return ["backend"];
}

function resolveExecutionTarget({ requiredCapabilities = [], executionCapabilities = [] } = {}) {
  const agentTarget = executionCapabilities.find((candidate) => {
    if (candidate.type !== "agent") {
      return false;
    }

    return requiredCapabilities.every((capability) => candidate.capabilities?.includes(capability));
  });

  if (agentTarget) {
    return {
      targetType: "agent",
      targetId: agentTarget.id,
      dispatchMode: "agent-runtime",
    };
  }

  const surfaceTarget = executionCapabilities.find((candidate) => {
    if (candidate.type !== "surface") {
      return false;
    }

    return requiredCapabilities.every((capability) =>
      (candidate.capabilities ?? []).includes(capability) || (candidate.capabilities ?? []).includes("bootstrap"),
    );
  });

  if (surfaceTarget) {
    return {
      targetType: "surface",
      targetId: surfaceTarget.id,
      dispatchMode: surfaceTarget.mode ?? "execution-surface",
    };
  }

  return {
    targetType: "unresolved",
    targetId: null,
    dispatchMode: null,
  };
}

export function createBootstrapDispatcher({
  bootstrapTasks = [],
  executionCapabilities = [],
} = {}) {
  const bootstrapAssignments = bootstrapTasks.map((task, index) => {
    const requiredCapabilities = inferRequiredCapabilities(task);
    const target = resolveExecutionTarget({
      requiredCapabilities,
      executionCapabilities,
    });

    return {
      assignmentId: `bootstrap-assignment-${index + 1}`,
      taskId: task.id,
      task,
      requiredCapabilities,
      targetType: target.targetType,
      targetId: target.targetId,
      dispatchMode: target.dispatchMode,
      status: target.targetId ? "assigned" : "blocked",
      executionCapabilitiesUsed: unique(
        executionCapabilities
          .filter((candidate) => candidate.id === target.targetId)
          .flatMap((candidate) => candidate.capabilities ?? []),
      ),
    };
  });

  return {
    bootstrapAssignments,
  };
}
