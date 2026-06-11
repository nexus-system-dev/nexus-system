export const SHARE_SURFACE_REQUIRED_REGIONS = [
  "share-experience-preview",
  "share-audience-access-boundary",
  "share-review-demo-link",
  "share-copy-open-actions",
  "share-privacy-scope",
  "share-return-to-build",
];

export const SHARE_SURFACE_FORBIDDEN_SHAPES = [
  "share-as-permissions-admin",
  "fake-public-share-link",
  "generic-social-sharing",
  "qa-placeholder-share",
  "internal-debug-share-state",
  "share-without-release-context",
];

export function createShareSurfaceCanonicalStructureContract() {
  return {
    contractId: "SURF-007",
    surfaceId: "share",
    purpose: "experience-oriented-review-demo-workspace",
    shareLaw: "experience-oriented-share-not-permissions-admin",
    dependsOn: ["SURF-001"],
    preserves: [
      "share-demo-boundary",
      "release-connected-share-readiness",
      "product-experience-preview",
      "audience-aware-review-context",
      "privacy-and-access-scope",
      "return-to-build-continuity",
    ],
    requiredRegions: SHARE_SURFACE_REQUIRED_REGIONS,
    forbiddenShapes: SHARE_SURFACE_FORBIDDEN_SHAPES,
  };
}
