function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveRemoteMacTopology(executionTopology) {
  const topologies = normalizeArray(executionTopology?.topologies);

  return (
    topologies.find((topology) => topology.mode === "xcode")
    ?? topologies.find((topology) => topology.runnerType === "remote-xcode-runner")
    ?? null
  );
}

export function createRemoteMacRunnerContract({
  executionTopology = null,
  appleBuildConfig = null,
} = {}) {
  const normalizedExecutionTopology = normalizeObject(executionTopology);
  const normalizedAppleBuildConfig = normalizeObject(appleBuildConfig);
  const remoteMacTopology = resolveRemoteMacTopology(normalizedExecutionTopology);

  const signing = normalizeObject(normalizedAppleBuildConfig.signing);
  const archive = normalizeObject(normalizedAppleBuildConfig.archive);

  return {
    remoteMacRunner: {
      runnerId: `remote-mac-runner:${normalizedExecutionTopology.projectId ?? "unknown-project"}`,
      projectId: normalizedExecutionTopology.projectId ?? null,
      topologyId: normalizedExecutionTopology.topologyId ?? null,
      connection: {
        mode: remoteMacTopology?.mode ?? "xcode",
        runnerType: remoteMacTopology?.runnerType ?? "remote-xcode-runner",
        readiness: remoteMacTopology?.readiness ?? "planned",
        host: normalizedAppleBuildConfig.host ?? null,
      },
      appleTooling: {
        platform: normalizedAppleBuildConfig.platform ?? "ios",
        xcodeVersion: normalizedAppleBuildConfig.xcodeVersion ?? null,
        bundleId: normalizedAppleBuildConfig.bundleId ?? null,
        scheme: normalizedAppleBuildConfig.scheme ?? null,
      },
      signing: {
        teamId: signing.teamId ?? null,
        signingStyle: signing.signingStyle ?? null,
        provisioningProfile: signing.provisioningProfile ?? null,
        requiresManualApproval: signing.requiresManualApproval ?? false,
      },
      archive: {
        exportMethod: archive.exportMethod ?? null,
        artifactPath: archive.artifactPath ?? null,
        shouldArchive: archive.shouldArchive ?? true,
      },
      capabilities: {
        supportedActions: normalizeArray(remoteMacTopology?.capabilities),
        supportsSigning: true,
        supportsArchive: true,
        supportsAppleTooling: true,
      },
      summary: {
        isReady: remoteMacTopology?.readiness === "ready" || remoteMacTopology?.readiness === "partial",
        hasSigningConfig: Boolean(signing.teamId || signing.provisioningProfile),
        hasArchiveTarget: Boolean(archive.artifactPath || archive.exportMethod),
      },
    },
  };
}
