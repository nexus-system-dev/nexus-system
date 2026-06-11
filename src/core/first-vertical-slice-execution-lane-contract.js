export const FIRST_VERTICAL_SLICE_STEPS = Object.freeze([
  "user-enters",
  "user-writes-idea",
  "nexus-understands-enough-truth",
  "nexus-asks-only-if-needed",
  "first-skeleton-appears",
  "user-changes-direction-through-conversation",
  "artifact-updates",
  "refresh-preserves-continuity",
]);

export const FIRST_VERTICAL_SLICE_PRESERVED_ENGINES = Object.freeze([
  "project-service-truth-engine",
  "onboarding-intake-engine",
  "artifact-generation-engine",
  "continuity-memory-refresh-engine",
]);

export const FIRST_VERTICAL_SLICE_FORBIDDEN_SHORTCUTS = Object.freeze([
  "old-onboarding-route-as-visible-owner",
  "old-loop-route-as-truth-owner",
  "qa-motion-proof-as-live-agent-proof",
  "fallback-copy-as-agent-response",
  "first-skeleton-without-agent-composed-handoff",
  "refresh-continuity-claim-without-persisted-state",
  "user-change-claim-without-artifact-update",
]);

export function createFirstVerticalSliceExecutionLaneContract() {
  return {
    taskId: "SLICE-001",
    classification: "new shell task",
    closureScope: "execution-lane-contract-and-entry-proof",
    dependsOn: ["SURF-002", "SURF-003", "SURF-009A"],
    canonicalSlice: [...FIRST_VERTICAL_SLICE_STEPS],
    closureBoundary: {
      closesNow: [
        "canonical-first-slice-lane-defined",
        "home-create-build-entry-proof-is-explicit",
        "preserve-remove-build-truth-is-explicit",
        "downstream-slice-tasks-remain-open",
      ],
      doesNotCloseNow: [
        "product-skeleton-agent-live-proof",
        "visual-product-skeleton-agent-live-proof",
        "build-loop-agent-live-proof",
        "visual-build-agent-live-proof",
        "user-change-artifact-update",
        "refresh-continuity-proof",
        "SURF-009B-live-agent-gate",
      ],
    },
    preserve: [...FIRST_VERTICAL_SLICE_PRESERVED_ENGINES],
    remove: [
      "visible-onboarding-as-standalone-product-route",
      "visible-loop-as-orchestration-first-route",
      "backend-completion-as-build-authority",
      "fake-green-from-qa-motion-only",
    ],
    build: [
      "first-slice-execution-lane",
      "home-to-create-to-build-entry-contract",
      "agent-composed-discovery-handoff-gate",
      "explicit-downstream-slice-dependencies",
    ],
    releasePathTruth: [
      "the first slice starts in Home/Create and enters Build",
      "Release remains downstream and is not closed by SLICE-001",
      "SURF-009B remains downstream until live agents pass Agent Reality Gate",
    ],
    continuityTruth: [
      "SLICE-001 names refresh continuity as part of the canonical full slice",
      "SLICE-001 does not claim refresh continuity is implemented unless later slice verification proves it",
    ],
    forbiddenShortcuts: [...FIRST_VERTICAL_SLICE_FORBIDDEN_SHORTCUTS],
    nextTasks: ["SLICE-002", "SLICE-003", "SLICE-004", "SKEL-001"],
  };
}
