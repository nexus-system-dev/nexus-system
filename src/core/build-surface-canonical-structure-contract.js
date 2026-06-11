export const BUILD_SURFACE_REQUIRED_REGIONS = Object.freeze([
  "agent-conversation-rail",
  "live-artifact-build-canvas",
  "human-progress-state",
  "change-direction-affordance",
  "release-readiness-affordance",
  "continuity-restore-anchor",
]);

export const BUILD_SURFACE_FORBIDDEN_SHAPES = Object.freeze([
  "loop-as-visible-product-label",
  "orchestration-first-stepper",
  "detached-details-panel",
  "timeline-dominant-build",
  "proof-dashboard-primary",
  "chat-without-live-canvas",
  "canvas-without-writable-agent-rail",
  "internal-route-status-language",
]);

export function createBuildSurfaceCanonicalStructureContract() {
  return {
    contractId: "SURF-003",
    dependsOn: ["SURF-001", "SURF-002"],
    surfaceId: "build",
    legacyRouteCompatibility: "loop-route-may-render-build-surface",
    purpose: "live-creation-workspace",
    workspaceLaw: "persistent-agent-rail-plus-live-build-canvas",
    primaryRegions: ["agent-conversation-rail", "live-artifact-build-canvas"],
    requiredRegions: [...BUILD_SURFACE_REQUIRED_REGIONS],
    forbiddenShapes: [...BUILD_SURFACE_FORBIDDEN_SHAPES],
    requiredTruth: [
      "agent-rail-persists-from-first-skeleton-through-release",
      "agent-rail-remains-writable",
      "live-build-canvas-is-dominant",
      "build-surface-is-not-visible-loop-or-proof",
      "progress-change-release-continuity-anchors-exist",
      "reduced-motion-safe-discovery-to-build-transition-remains",
    ],
    preservedEngines: [
      "product-graph-artifact-truth",
      "project-discovery-agent-handoff",
      "product-skeleton-agent-output",
      "build-loop-agent-continuation",
      "loop-route-compatibility",
    ],
  };
}
