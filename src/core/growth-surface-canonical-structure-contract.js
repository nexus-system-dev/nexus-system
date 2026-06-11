export const GROWTH_SURFACE_REQUIRED_REGIONS = [
  "growth-readiness-gate",
  "product-connected-growth-insights",
  "bounded-opportunity-list",
  "growth-metric-baseline",
  "experiment-next-move",
  "post-release-continuity-anchor",
];

export const GROWTH_SURFACE_FORBIDDEN_SHAPES = [
  "growth-as-advanced-side-route",
  "generic-marketing-dashboard",
  "analytics-noise-board",
  "fake-autonomous-growth-ops",
  "growth-before-product-truth",
  "qa-placeholder-growth",
  "growth-without-product-connection",
];

export function createGrowthSurfaceCanonicalStructureContract() {
  return {
    contractId: "SURF-005",
    surfaceId: "growth",
    purpose: "bounded-product-evolution-workspace",
    growthLaw: "product-connected-growth-insight-not-analytics-noise",
    dependsOn: ["SURF-001"],
    preserves: [
      "growth-workspace-state",
      "growth-opportunity-surfacing-boundary",
      "post-release-continuation-loop",
      "product-class-aware-opportunity-family",
      "release-connected-growth-readiness",
      "bounded-growth-agent-ownership",
    ],
    requiredRegions: GROWTH_SURFACE_REQUIRED_REGIONS,
    forbiddenShapes: GROWTH_SURFACE_FORBIDDEN_SHAPES,
  };
}
