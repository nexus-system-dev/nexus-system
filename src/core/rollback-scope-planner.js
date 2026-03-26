function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueBy(items, keyBuilder) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyBuilder(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildFileTargets(executionMetadata) {
  const storageRecord = normalizeObject(executionMetadata.storageRecord);
  const artifacts = normalizeArray(storageRecord.artifacts);
  const attachments = normalizeArray(storageRecord.attachments);

  return uniqueBy(
    [
      ...artifacts.map((artifact) => ({
        targetId: artifact.artifactId ?? artifact.id ?? artifact.name ?? null,
        targetType: "artifact",
        path: artifact.path ?? artifact.artifactPath ?? null,
        status: artifact.status ?? "stored",
      })),
      ...attachments.map((attachment) => ({
        targetId: attachment.attachmentId ?? attachment.id ?? attachment.name ?? null,
        targetType: "attachment",
        path: attachment.path ?? null,
        status: attachment.status ?? "stored",
      })),
    ],
    (item) => `${item.targetType}:${item.targetId ?? item.path ?? "unknown"}`,
  );
}

function buildStateTargets(failureRecoveryModel, executionMetadata) {
  const rollbackScope = normalizeObject(failureRecoveryModel.rollbackScope);
  const releaseTimeline = normalizeObject(executionMetadata.releaseTimeline);
  const releaseStateUpdate = normalizeObject(executionMetadata.releaseStateUpdate);

  const targets = [];

  if (["workspace", "project-state"].includes(rollbackScope.scope)) {
    targets.push({
      targetId: rollbackScope.target ?? executionMetadata.projectId ?? "project-state",
      targetType: rollbackScope.scope === "workspace" ? "workspace-state" : "project-state",
      status: "pending-restore",
    });
  }

  if (releaseStateUpdate.release?.status) {
    targets.push({
      targetId: releaseStateUpdate.release.releaseId ?? releaseTimeline.releaseRunId ?? "release-state",
      targetType: "release-state",
      status: releaseStateUpdate.release.status,
    });
  }

  return uniqueBy(targets, (item) => `${item.targetType}:${item.targetId}`);
}

function buildDeployTargets(executionMetadata) {
  const deploymentRequest = normalizeObject(executionMetadata.deploymentRequest);
  const releaseTimeline = normalizeObject(executionMetadata.releaseTimeline);
  const currentStage = releaseTimeline.currentStage ?? null;
  const target = deploymentRequest.target ?? null;

  if (!target && !["deploy", "publish"].includes(currentStage)) {
    return [];
  }

  return [
    {
      targetId: deploymentRequest.requestId ?? releaseTimeline.releaseRunId ?? "deployment-target",
      targetType: "deployment",
      provider: deploymentRequest.provider ?? "generic",
      environment: deploymentRequest.environment ?? null,
      status: releaseTimeline.currentStatus ?? "pending",
    },
  ];
}

function buildReleaseTargets(executionMetadata) {
  const releaseTimeline = normalizeObject(executionMetadata.releaseTimeline);

  if (!releaseTimeline.releaseRunId) {
    return [];
  }

  const stage = releaseTimeline.currentStage ?? null;
  const status = releaseTimeline.currentStatus ?? null;

  if (["published", "verified"].includes(status) || stage === "publish") {
    return [
      {
        targetId: releaseTimeline.releaseRunId,
        targetType: "release-draft",
        status: status ?? "pending",
      },
    ];
  }

  return [];
}

function buildProviderTargets(executionMetadata) {
  const explicitSideEffects = normalizeArray(executionMetadata.providerSideEffects);
  if (explicitSideEffects.length > 0) {
    return explicitSideEffects.map((effect, index) => ({
      targetId: effect.targetId ?? effect.providerOperationId ?? `provider-side-effect-${index + 1}`,
      targetType: "provider-side-effect",
      provider: effect.provider ?? null,
      status: effect.status ?? "pending-reversal",
    }));
  }

  const deploymentRequest = normalizeObject(executionMetadata.deploymentRequest);
  if (!deploymentRequest.provider || deploymentRequest.provider === "generic") {
    return [];
  }

  return [
    {
      targetId: deploymentRequest.requestId ?? `provider-side-effect:${deploymentRequest.provider}`,
      targetType: "provider-side-effect",
      provider: deploymentRequest.provider,
      status: "possible-external-side-effect",
    },
  ];
}

export function createRollbackScopePlanner({
  failureRecoveryModel = null,
  executionMetadata = null,
} = {}) {
  const normalizedFailureRecoveryModel = normalizeObject(failureRecoveryModel);
  const normalizedExecutionMetadata = normalizeObject(executionMetadata);
  const rollbackScope = normalizeObject(normalizedFailureRecoveryModel.rollbackScope);

  const fileTargets = buildFileTargets(normalizedExecutionMetadata);
  const stateTargets = buildStateTargets(normalizedFailureRecoveryModel, normalizedExecutionMetadata);
  const deployTargets = buildDeployTargets(normalizedExecutionMetadata);
  const releaseTargets = buildReleaseTargets(normalizedExecutionMetadata);
  const providerTargets = buildProviderTargets(normalizedExecutionMetadata);

  const scope = {
    files: fileTargets,
    state: stateTargets,
    deploy: deployTargets,
    releaseDrafts: releaseTargets,
    providerSideEffects: providerTargets,
  };

  const totalTargets = Object.values(scope).reduce((sum, items) => sum + items.length, 0);
  const requiresConfirmation = rollbackScope.requiresUserConfirmation === true
    || deployTargets.length > 0
    || providerTargets.length > 0;

  return {
    rollbackPlan: {
      rollbackPlanId: `rollback-plan:${normalizedFailureRecoveryModel.recoveryId ?? "unknown"}`,
      failureClass: normalizedFailureRecoveryModel.failureClass ?? "unknown-failure",
      scope,
      requiresConfirmation,
      rollbackMode: totalTargets > 0 ? "targeted" : "none",
      summary: {
        totalTargets,
        hasExternalEffects: deployTargets.length > 0 || providerTargets.length > 0,
        hasStateRollback: stateTargets.length > 0,
        hasFileRollback: fileTargets.length > 0,
      },
    },
  };
}
