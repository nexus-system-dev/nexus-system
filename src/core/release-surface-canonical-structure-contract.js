export const RELEASE_SURFACE_REQUIRED_REGIONS = [
  "release-preview-surface",
  "release-gate",
  "verification-evidence",
  "deploy-publish-action",
  "failed-release-recovery",
  "rollback-affordance",
  "share-demo-link",
  "version-history-anchor",
];

export const RELEASE_SURFACE_FORBIDDEN_SHAPES = [
  "release-as-advanced-side-route",
  "generic-workspace-fallback",
  "qa-placeholder-release",
  "proof-dashboard-only",
  "deploy-log-only",
  "release-without-verification-gate",
];

export function createReleaseSurfaceCanonicalStructureContract() {
  return {
    contractId: "SURF-004",
    surfaceId: "release",
    purpose: "human-release-decision-workspace",
    releaseLaw: "preview-plus-gate-plus-deploy-truth",
    dependsOn: ["SURF-001"],
    preserves: [
      "release-workspace-state",
      "release-validation",
      "release-readiness",
      "pre-deploy-quality-gate",
      "deployment-evidence",
      "release-timeline",
      "ownership-aware-release-guard",
    ],
    requiredRegions: RELEASE_SURFACE_REQUIRED_REGIONS,
    forbiddenShapes: RELEASE_SURFACE_FORBIDDEN_SHAPES,
  };
}
