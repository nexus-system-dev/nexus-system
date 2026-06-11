export const STUDIO_BOUNDARY_REQUIRED_REGIONS = [
  "studio-web-boundary-explanation",
  "studio-desktop-connection-status",
  "studio-open-desktop-action",
  "studio-install-fallback",
  "studio-web-vs-desktop-split",
  "studio-return-to-web-product-truth",
];

export const STUDIO_BOUNDARY_FORBIDDEN_SHAPES = [
  "studio-as-web-workspace",
  "full-file-editor-in-web",
  "developer-console-as-product",
  "fake-local-filesystem-access",
  "fake-local-runtime-control",
  "studio-replacing-build-surface",
  "studio-as-regular-web-surface",
  "internal-orchestration-language",
];

export function createStudioBoundarySurfaceContract() {
  return {
    contractId: "SURF-008",
    surfaceId: "studio",
    purpose: "desktop-local-workspace-boundary",
    studioLaw: "nexus-web-identifies-explains-and-hands-off-to-nexus-studio-desktop",
    dependsOn: ["SURF-001"],
    preserves: [
      "web-remains-canonical-cloud-product-truth",
      "studio-remains-desktop-local-workspace",
      "project-identity-and-build-continuity",
      "clear-local-capability-boundary",
      "return-to-web-product-truth",
    ],
    requiredRegions: STUDIO_BOUNDARY_REQUIRED_REGIONS,
    forbiddenShapes: STUDIO_BOUNDARY_FORBIDDEN_SHAPES,
  };
}
