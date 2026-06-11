export const CANONICAL_SURFACE_IDS = Object.freeze([
  "home",
  "build",
  "release",
  "growth",
  "history",
  "share",
  "studio",
]);

const BASE_SURFACES = Object.freeze({
  home: {
    label: "Home",
    purpose: "momentum-gateway",
    requiredRegions: ["create-or-continue-entry", "recent-product-continuation", "last-meaningful-action"],
    forbiddenShapes: ["dashboard-first", "workspace-manager", "onboarding-ritual"],
  },
  build: {
    label: "Build",
    purpose: "live-creation-workspace",
    requiredRegions: [
      "agent-conversation-rail",
      "live-artifact-build-canvas",
      "human-progress-state",
      "change-direction-affordance",
      "release-readiness-affordance",
      "continuity-restore-anchor",
    ],
    forbiddenShapes: [
      "only-chat",
      "only-artifact-preview",
      "dashboard-first",
      "detached-preview",
      "internal-loop-screen",
      "classic-ide-primary-metaphor",
    ],
    surfaceLaw: "persistent-agent-rail-plus-live-build-canvas",
  },
  release: {
    label: "Release",
    purpose: "verified-truth-release",
    requiredRegions: ["release-candidate", "verification-state", "blockers", "publish-decision"],
    forbiddenShapes: ["raw-deployment-log", "hidden-runtime-status"],
  },
  growth: {
    label: "Growth",
    purpose: "post-product-learning-and-distribution",
    requiredRegions: ["learning-signals", "audience-channel-experiments", "next-growth-action"],
    forbiddenShapes: ["pre-product-growth-noise", "marketing-dashboard-before-product"],
  },
  history: {
    label: "History",
    purpose: "truth-evolution-and-recovery",
    requiredRegions: ["checkpoints", "product-changes", "rollback-restore-affordance"],
    forbiddenShapes: ["debug-timeline", "internal-event-stream"],
  },
  share: {
    label: "Share",
    purpose: "review-demo-collaboration",
    requiredRegions: ["shareable-product-state", "reviewer-context", "safe-visibility-boundary"],
    forbiddenShapes: ["raw-file-export-list", "permissions-only-screen"],
  },
  studio: {
    label: "Studio",
    purpose: "desktop-local-workspace-boundary",
    requiredRegions: ["web-boundary-explanation", "desktop-connection-status", "open-desktop-handoff", "handoff-back-to-product-truth"],
    forbiddenShapes: ["default-entry", "replacement-for-build", "studio-as-web-workspace", "full-file-editor-in-web"],
  },
});

export function createCanonicalSurfacePassContract() {
  const surfaces = CANONICAL_SURFACE_IDS.map((surfaceId) => ({
    surfaceId,
    ...BASE_SURFACES[surfaceId],
  }));

  return {
    contractId: "SURF-001",
    status: "ready-for-implementation",
    source: "surf-001-canonical-surface-pass-contract-2026-05-29",
    productTruthRule: "all-surfaces-are-views-over-one-product-graph",
    buildSurfaceLaw: {
      statement: "Build surface = persistent agent conversation rail + live artifact/build canvas in the same workspace.",
      userFeeling: "I am talking to Nexus, and Nexus is building the product in front of me.",
      transitionMotion: {
        statement: "Discovery chat does not disappear. It compresses into the persistent right-side agent rail while the live build canvas opens beside it.",
        motionLevel: "gentle-futuristic-respectful",
        maxDurationMs: 900,
        reducedMotionRequired: true,
      },
      primarySurfaceFrom: "first-skeleton",
      primarySurfaceUntil: "release",
      requiredPairing: ["agent-conversation-rail", "live-artifact-build-canvas"],
      mustNotBecome: BASE_SURFACES.build.forbiddenShapes,
    },
    surfaces,
    closureRequirements: [
      "canonical-surface-list-represented-in-code",
      "build-has-paired-workspace-contract",
      "visible-build-route-exposes-agent-rail-and-live-canvas",
      "tests-prevent-only-chat-only-preview-dashboard-or-internal-loop",
      "canonical-docs-and-task-map-agree-on-next-task",
    ],
  };
}

export function getCanonicalSurface(surfaceId) {
  return createCanonicalSurfacePassContract().surfaces.find((surface) => surface.surfaceId === surfaceId) ?? null;
}
