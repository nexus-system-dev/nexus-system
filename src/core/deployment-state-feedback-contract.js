function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(normalizeArray(values))];
}

function resolveStatus({ deployPolicyDecision, deploymentResultEnvelope, launchConfirmationState }) {
  const policy = normalizeObject(deployPolicyDecision);
  const deployment = normalizeObject(deploymentResultEnvelope);
  const launch = normalizeObject(launchConfirmationState);

  if (policy.isBlocked === true || deployment.status === "blocked" || launch.status === "blocked") {
    return "blocked";
  }
  if (deployment.status === "ready" || launch.status === "ready") {
    return "active";
  }
  return "pending";
}

function resolveStatusLabel(status) {
  if (status === "blocked") {
    return "מצב ה־deploy חסום";
  }
  if (status === "active") {
    return "מצב ה־deploy גלוי ומתקדם";
  }
  return "מצב ה־deploy עדיין בהכנה";
}

export function createDeploymentStateFeedbackContract({
  classAwareDeploymentReleasePath = null,
  deployPolicyDecision = null,
  deploymentResultEnvelope = null,
  launchConfirmationState = null,
  statusEvents = null,
  pollingMetadata = null,
} = {}) {
  const releasePath = normalizeObject(classAwareDeploymentReleasePath);
  const policy = normalizeObject(deployPolicyDecision);
  const deployment = normalizeObject(deploymentResultEnvelope);
  const launch = normalizeObject(launchConfirmationState);
  const latestStatusEvent = normalizeArray(statusEvents).at(-1) ?? {};
  const polling = normalizeObject(pollingMetadata);
  const status = resolveStatus({
    deployPolicyDecision,
    deploymentResultEnvelope,
    launchConfirmationState,
  });
  const blockedReasons = unique([
    ...normalizeArray(policy.checks),
    ...normalizeArray(deployment.blockedReasons),
    ...normalizeArray(launch.blockedReasons),
  ]);

  return {
    deploymentStateFeedbackContract: {
      contractId: `deployment-feedback:${normalizeString(releasePath.modelId, "unknown-path")}`,
      feedbackFamily: "deployment-state-feedback",
      status,
      statusLabel: resolveStatusLabel(status),
      providerType: normalizeString(releasePath.providerType, normalizeString(deployment.provider, "generic")),
      primaryTarget: normalizeString(releasePath.primaryTarget, normalizeString(deployment.target, "private-deployment")),
      environment: normalizeString(deployment.environment, normalizeString(launch.launchEnvironment, "staging")),
      currentStepLabel: normalizeString(releasePath.nextGate, "resolve-deployment-target"),
      policyDecision: normalizeString(policy.decision, "blocked"),
      deploymentOutcome: normalizeString(deployment.outcome, "pending"),
      launchDecision: normalizeString(launch.decision, "blocked"),
      latestProviderStatus: normalizeString(latestStatusEvent.status, "pending"),
      nextPollInSeconds: polling.nextPollInSeconds ?? null,
      visibleFeedbackRule: "deployment/release progress must stay visible on product surfaces rather than hiding in backend events or logs",
      feedbackItems: [
        {
          label: "Policy decision",
          value: normalizeString(policy.decision, "blocked"),
        },
        {
          label: "Deployment outcome",
          value: normalizeString(deployment.outcome, "pending"),
        },
        {
          label: "Launch decision",
          value: normalizeString(launch.decision, "blocked"),
        },
        {
          label: "Provider status",
          value: normalizeString(latestStatusEvent.status, "pending"),
        },
      ],
      blockedReasons,
      continuityRule: "deployment state must survive refresh, route restore, and the handoff from execution into later release feedback",
    },
  };
}
