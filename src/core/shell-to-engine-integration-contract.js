export const SHELL_TO_ENGINE_REQUIRED_BOUNDARIES = Object.freeze([
  "product-truth",
  "agent-decision",
  "mutation-flow",
  "verification",
  "continuity",
  "release-readiness",
  "history-versioning",
]);

export const SHELL_TO_ENGINE_PRESERVED_ENGINES = Object.freeze([
  {
    engineId: "project-service-truth-engine",
    truthOwner: "project-service",
    surfaceMode: "hidden-engine",
    role: "canonical-product-truth-for-new-shell",
    boundaries: ["product-truth", "mutation-flow"],
  },
  {
    engineId: "onboarding-intake-engine",
    truthOwner: "project-service",
    surfaceMode: "hidden-engine",
    role: "bounded-intake-before-build",
    boundaries: ["product-truth", "continuity"],
  },
  {
    engineId: "artifact-generation-engine",
    truthOwner: "project-service",
    surfaceMode: "hidden-engine",
    role: "artifact-generation-for-new-shell",
    boundaries: ["verification", "release-readiness"],
  },
  {
    engineId: "continuity-memory-refresh-engine",
    truthOwner: "project-service",
    surfaceMode: "hidden-engine",
    role: "continuity-memory-refresh-for-new-shell",
    boundaries: ["continuity", "history-versioning"],
  },
  {
    engineId: "release-readiness-engine",
    truthOwner: "project-service",
    surfaceMode: "hidden-engine",
    role: "release-readiness-for-new-shell",
    boundaries: ["release-readiness", "verification"],
  },
]);

export const SHELL_TO_ENGINE_FORBIDDEN_INHERITANCE = Object.freeze([
  "old-visible-route-owns-product-truth",
  "legacy-orchestration-first-ux",
  "qa-fallback-as-product-surface",
  "debug-timeline-as-history",
  "proof-dashboard-as-release",
  "developer-console-as-studio",
  "shell-mutates-product-without-engine-envelope",
  "surface-claims-agent-action-without-live-agent-or-explicit-open-task",
]);

export const SHELL_TO_ENGINE_SURFACE_BRIDGES = Object.freeze({
  home: {
    surfaceContract: "SURF-002",
    engineAnchors: ["project-service-truth-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "AGT-001D", agentId: "project-discovery-agent", status: "trueGreen" },
    ],
    shellRole: "momentum-gateway-over-product-truth",
  },
  build: {
    surfaceContract: "SURF-003",
    engineAnchors: ["project-service-truth-engine", "onboarding-intake-engine", "artifact-generation-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "SKEL-001", agentId: "product-skeleton-agent", status: "pending-release-blocker" },
      { taskId: "VSKEL-001", agentId: "visual-product-skeleton-agent", status: "pending-release-blocker" },
      { taskId: "BLD-AGT-001", agentId: "build-loop-agent", status: "pending-release-blocker" },
      { taskId: "VBUILD-001", agentId: "visual-build-agent", status: "pending-release-blocker" },
      { taskId: "MUT-001", agentId: "mutation-change-agent", status: "pending-release-blocker" },
    ],
    shellRole: "live-build-workspace-over-preserved-engines",
  },
  release: {
    surfaceContract: "SURF-004",
    engineAnchors: ["project-service-truth-engine", "artifact-generation-engine", "release-readiness-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "VER-AGT-001", agentId: "verification-qa-agent", status: "pending-release-blocker" },
      { taskId: "REL-AGT-001", agentId: "release-agent", status: "pending-release-blocker" },
    ],
    shellRole: "human-release-decision-over-release-engines",
  },
  growth: {
    surfaceContract: "SURF-005",
    engineAnchors: ["project-service-truth-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "GROW-AGT-001", agentId: "growth-agent", status: "pending-release-blocker" },
      { taskId: "GROW-AGT-002", agentId: "social-campaign-execution-agent", status: "pending-release-blocker" },
      { taskId: "GROW-MEASURE-001", agentId: "growth-measurement-agent", status: "pending-release-blocker" },
    ],
    shellRole: "bounded-growth-over-product-truth",
  },
  history: {
    surfaceContract: "SURF-006",
    engineAnchors: ["project-service-truth-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "HIST-AGT-001", agentId: "history-continuity-agent", status: "pending-release-blocker" },
    ],
    shellRole: "product-memory-over-history-engines",
  },
  share: {
    surfaceContract: "SURF-007",
    engineAnchors: ["project-service-truth-engine", "artifact-generation-engine", "release-readiness-engine"],
    agentAnchors: [
      { taskId: "SHARE-AGT-001", agentId: "share-demo-agent", status: "pending-release-blocker" },
    ],
    shellRole: "safe-demo-over-artifact-and-release-truth",
  },
  studio: {
    surfaceContract: "SURF-008",
    engineAnchors: ["project-service-truth-engine", "continuity-memory-refresh-engine"],
    agentAnchors: [
      { taskId: "STD-HANDOFF-AGT-001", agentId: "studio-handoff-agent", status: "pending-release-blocker" },
    ],
    contractAnchors: [
      { taskId: "STD-DOOR-001", contractId: "studio-web-studio-door-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-SYNC-001", contractId: "studio-sync-stale-offline-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-PERM-001", contractId: "studio-permissions-files-secrets-computer-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-RUN-001", contractId: "studio-local-runtime-preview-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-PKG-001", contractId: "studio-packaging-debug-release-handoff-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-DESIGN-001", contractId: "studio-v1-design-tooling-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-AGENT-001", contractId: "studio-local-agents-contract", status: "trueGreen", closureScope: "planning-contract-only" },
      { taskId: "STD-HIST-001", contractId: "studio-history-recovery-contract", status: "trueGreen", closureScope: "planning-contract-only" },
    ],
    localActionPromiseBoundary: [
      "web-may-explain-studio-requirement",
      "web-may-offer-open-or-download-studio",
      "web-must-not-claim-installation-detection-before-desktop-proof",
      "web-must-not-claim-local-run-file-write-sync-package-or-recovery-before-desktop-proof",
      "web-must-route-studio-decisions-through-studio-handoff-agent-when-implemented",
    ],
    shellRole: "web-to-desktop-boundary-over-cloud-truth",
  },
});

function cloneAgentAnchors(agentAnchors = []) {
  return agentAnchors.map((agent) => ({ ...agent }));
}

function cloneContractAnchors(contractAnchors = []) {
  return contractAnchors.map((contract) => ({ ...contract }));
}

export function createShellToEngineIntegrationContract() {
  return {
    contractId: "SURF-009",
    status: "ready-for-implementation",
    classification: "bridge task",
    bridgeMode: "new-shell-over-preserved-hidden-engines",
    truthOwner: "project-service",
    dependsOn: ["SURF-002", "SURF-003", "SURF-004", "SURF-005", "SURF-006", "SURF-007", "SURF-008", "ENG-001..007"],
    requiredBoundaries: [...SHELL_TO_ENGINE_REQUIRED_BOUNDARIES],
    preservedEngines: SHELL_TO_ENGINE_PRESERVED_ENGINES.map((engine) => ({ ...engine, boundaries: [...engine.boundaries] })),
    forbiddenInheritance: [...SHELL_TO_ENGINE_FORBIDDEN_INHERITANCE],
    surfaceBridges: Object.entries(SHELL_TO_ENGINE_SURFACE_BRIDGES).map(([surfaceId, bridge]) => ({
      surfaceId,
      ...bridge,
      engineAnchors: [...bridge.engineAnchors],
      agentAnchors: cloneAgentAnchors(bridge.agentAnchors),
      contractAnchors: cloneContractAnchors(bridge.contractAnchors),
      localActionPromiseBoundary: [...(bridge.localActionPromiseBoundary ?? [])],
    })),
    agentRealityRule:
      "Each visible surface must declare both the truth engine behind it and the live agent or explicit open release-blocker responsible for decisions/actions on that surface.",
    openAgentRuntimeDependencies: Object.entries(SHELL_TO_ENGINE_SURFACE_BRIDGES).flatMap(([surfaceId, bridge]) =>
      cloneAgentAnchors(bridge.agentAnchors)
        .filter((agent) => agent.status !== "trueGreen")
        .map((agent) => ({ surfaceId, ...agent })),
    ),
    closureRequirements: [
      "every-canonical-surface-declares-surf-009-bridge",
      "preserved-engines-remain-hidden-engines",
      "every-canonical-surface-declares-live-agent-or-explicit-open-agent-task",
      "visible-shell-does-not-inherit-legacy-orchestration-ux",
      "product-truth-mutation-verification-continuity-release-and-history-boundaries-are-explicit",
      "tests-pin-shell-bridge-contract-and-visible-surface-bridge-marker",
    ],
    notTrueGreenWhen: [
      "any-visible-surface-claims-agent-action-without-live-agent-proof",
      "any-required-surface-agent-is-neither-trueGreen-nor-listed-as-open-release-blocker",
      "engine-bridge-exists-but-agent-decision-bridge-is-missing",
      "studio-web-boundary-claims-desktop-local-action-before-desktop-proof",
    ],
  };
}

export function getShellToEngineSurfaceBridge(surfaceId) {
  const normalizedSurfaceId = String(surfaceId ?? "").trim();
  const bridge = SHELL_TO_ENGINE_SURFACE_BRIDGES[normalizedSurfaceId];
  if (!bridge) {
    return null;
  }

  return {
    surfaceId: normalizedSurfaceId,
    ...bridge,
    engineAnchors: [...bridge.engineAnchors],
    agentAnchors: cloneAgentAnchors(bridge.agentAnchors),
    contractAnchors: cloneContractAnchors(bridge.contractAnchors),
    localActionPromiseBoundary: [...(bridge.localActionPromiseBoundary ?? [])],
  };
}
