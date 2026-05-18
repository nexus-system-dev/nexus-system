function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function resolveShellFamily({ productClass, localWorkspaceContract, remoteMacRunner }) {
  const currentMode = normalizeString(localWorkspaceContract?.workspaceMode, "browser-backed-local-workspace");
  if (normalizeObject(remoteMacRunner).summary?.isReady === true || productClass === "mobile-app") {
    return "apple-desktop-shell";
  }
  if (currentMode === "local-bridge-attached-workspace") {
    return "native-bridge-shell";
  }
  return "browser-backed-shell";
}

export function createDesktopShellScopeContract({
  projectId = null,
  productClass = null,
  localWorkspaceContract = null,
  localDevelopmentBridge = null,
  remoteMacRunner = null,
  cloudWorkspaceModel = null,
} = {}) {
  const normalizedLocalWorkspaceContract = normalizeObject(localWorkspaceContract);
  const normalizedLocalDevelopmentBridge = normalizeObject(localDevelopmentBridge);
  const normalizedRemoteMacRunner = normalizeObject(remoteMacRunner);
  const normalizedCloudWorkspaceModel = normalizeObject(cloudWorkspaceModel);
  const shellFamily = resolveShellFamily({
    productClass,
    localWorkspaceContract: normalizedLocalWorkspaceContract,
    remoteMacRunner: normalizedRemoteMacRunner,
  });
  const bridgeReady = normalizedLocalDevelopmentBridge.summary?.isReady === true;
  const remoteAppleReady = normalizedRemoteMacRunner.summary?.isReady === true;
  const cloudReady = normalizedCloudWorkspaceModel.summary?.isReady === true;

  return {
    desktopShellScopeContract: {
      contractId: `desktop-shell-scope:${normalizeString(projectId, "unknown-project")}`,
      productClass: normalizeString(productClass, "generic"),
      shellFamily,
      shellStatus: "scope-defined-not-implemented",
      requiredFrame: {
        shellSurfaceType: shellFamily,
        preservesWorkspaceContinuity: true,
        preservesProjectIdentity: true,
        preservesBuildRouteContinuity: true,
      },
      shellPathDecision: {
        currentWave4Path: normalizeString(normalizedLocalWorkspaceContract.workspaceMode, "browser-backed-local-workspace"),
        preferredFutureShell:
          productClass === "mobile-app"
            ? "remote-apple-shell"
            : bridgeReady
              ? "local-bridge-shell"
              : "desktop-wrapper-shell",
        browserBackedWorkspaceAcceptedNow: true,
      },
      runtimeBindings: {
        localBridgeReady: bridgeReady,
        remoteAppleReady,
        cloudWorkspaceReady: cloudReady,
        releaseWorkflowMode:
          remoteAppleReady
            ? "apple-build-handoff"
            : bridgeReady
              ? "local-command-handoff"
              : "browser-to-cloud-handoff",
      },
      obligations: unique([
        "desktop shell cannot lose workspace continuity",
        "desktop shell cannot detach build progression from project identity",
        "desktop shell must preserve reopen and resume behavior",
        "desktop shell must expose a clear local release path when relevant",
        productClass === "mobile-app" ? "desktop shell must support remote Apple tooling handoff" : null,
      ]),
      boundaries: [
        "W4-MBN-010 defines shell scope only",
        "W4-MBN-010 does not claim Electron implementation exists yet",
        "structural desktop shell design remains subject to W4-MBN-022",
      ],
      summary: {
        shellFamily,
        bridgeReady,
        remoteAppleReady,
        cloudReady,
      },
    },
  };
}
