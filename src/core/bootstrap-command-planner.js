function createCommand({
  id,
  type,
  command,
  args = [],
  surfaceHint = null,
  produces = [],
} = {}) {
  return {
    id,
    type,
    command,
    args,
    surfaceHint,
    produces,
  };
}

function planRuleCommands(rule, executionRequest) {
  const inputs = executionRequest?.executionInput?.inputs ?? {};
  const domain = inputs.domain ?? "generic";
  const recommendedDefaults = inputs.recommendedDefaults ?? {};
  const stack = recommendedDefaults.stack ?? {};

  switch (rule) {
    case "initialize-auth-core":
      return [
        createCommand({
          id: `${executionRequest.taskId}-auth-module`,
          type: "scaffold",
          command: "create-auth-module",
          args: [domain, stack.backend ?? "node"],
          produces: ["auth-module"],
        }),
      ];
    case "initialize-billing-foundation":
      return [
        createCommand({
          id: `${executionRequest.taskId}-billing-module`,
          type: "scaffold",
          command: "create-billing-module",
          args: [domain, stack.backend ?? "node"],
          produces: ["billing-module"],
        }),
      ];
    case "initialize-app-shell":
    case "create-initial-structure":
      return [
        createCommand({
          id: `${executionRequest.taskId}-app-shell`,
          type: "scaffold",
          command: "create-app-shell",
          args: [domain, stack.frontend ?? "generic"],
          produces: ["app-shell", "project-root"],
        }),
      ];
    case "initialize-mobile-shell":
      return [
        createCommand({
          id: `${executionRequest.taskId}-mobile-shell`,
          type: "scaffold",
          command: "create-mobile-shell",
          args: [domain],
          produces: ["mobile-shell"],
        }),
      ];
    default:
      return [
        createCommand({
          id: `${executionRequest.taskId}-bootstrap-step`,
          type: "bootstrap",
          command: rule ?? "run-bootstrap-step",
          args: [domain],
          produces: executionRequest?.executionInput?.expectedArtifacts ?? [],
        }),
      ];
  }
}

export function createBootstrapCommandPlanner({
  executionRequest = null,
} = {}) {
  const rule = executionRequest?.executionInput?.rule ?? null;
  const dispatchMode = executionRequest?.dispatchMode ?? null;
  const targetType = executionRequest?.targetType ?? null;
  const plannedCommands = planRuleCommands(rule, executionRequest).map((command, index) => ({
    ...command,
    order: index + 1,
    surfaceHint: dispatchMode ?? targetType ?? "execution-surface",
  }));

  return {
    requestId: executionRequest?.requestId ?? null,
    taskId: executionRequest?.taskId ?? null,
    plannedCommands,
  };
}
