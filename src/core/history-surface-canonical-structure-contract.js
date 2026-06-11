export const HISTORY_SURFACE_REQUIRED_REGIONS = [
  "history-current-state-anchor",
  "history-change-log",
  "history-restore-checkpoints",
  "history-continuity-thread",
  "history-version-snapshots",
  "history-return-to-build",
];

export const HISTORY_SURFACE_FORBIDDEN_SHAPES = [
  "technical-timeline-route",
  "debug-event-stream",
  "proof-dashboard-history",
  "orchestration-log",
  "qa-placeholder-history",
  "history-without-restore-anchor",
  "wide-legacy-sidebar",
];

export function createHistorySurfaceCanonicalStructureContract() {
  return {
    contractId: "SURF-006",
    surfaceId: "timeline",
    purpose: "product-continuity-and-change-memory-workspace",
    historyLaw: "product-memory-and-restore-truth-not-debug-timeline",
    dependsOn: ["SURF-001"],
    preserves: [
      "project-event-history-engine",
      "snapshot-rollback-continuity-engine",
      "artifact-truth-engine",
      "cross-surface-continuity-contract",
      "route-restore-continuity",
      "timeline-route-compatibility",
    ],
    requiredRegions: HISTORY_SURFACE_REQUIRED_REGIONS,
    forbiddenShapes: HISTORY_SURFACE_FORBIDDEN_SHAPES,
  };
}
