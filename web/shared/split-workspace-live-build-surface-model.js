import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "./product-class-model.js";

const WORKSPACE_SURFACE_FAMILIES = {
  "landing-page": {
    workspaceFamily: "marketing-build-workspace",
    previewFrameFamily: "browser-preview",
    buildRegionEmphasis: "web-canvas",
    orchestrationEmphasis: "promise-trust-cta-progression",
    runtimeRegionEmphasis: "web-release-readiness",
    buildSurfaceTitle: "הדף עצמו נבנה עכשיו",
    buildSurfaceDetail: "ה־hero, ההבטחה, וה־CTA הראשי חייבים להופיע כמוצר חי ולא כרשימת משימות.",
  },
  "mobile-app": {
    workspaceFamily: "mobile-simulator-workspace",
    previewFrameFamily: "simulator-preview",
    buildRegionEmphasis: "mobile-device-frame",
    orchestrationEmphasis: "screen-navigation-first-action",
    runtimeRegionEmphasis: "mobile-package-direction",
    buildSurfaceTitle: "האפליקציה מתקדמת בתוך simulator-like frame",
    buildSurfaceDetail: "מסך ראשון, פעולה ראשונה, וניווט צריכים להתקדם מול המשתמש.",
  },
  "internal-tool": {
    workspaceFamily: "operations-split-workspace",
    previewFrameFamily: "workspace-preview",
    buildRegionEmphasis: "queue-and-ownership-surface",
    orchestrationEmphasis: "assignments-ownership-next-move",
    runtimeRegionEmphasis: "private-workspace-release-direction",
    buildSurfaceTitle: "משטח העבודה הפנימי מתקדם עכשיו",
    buildSurfaceDetail: "תור, בעלות, ופעולה הבאה חייבים להיות legible בתוך אותו surface.",
  },
  "commerce-ops": {
    workspaceFamily: "commerce-operations-workspace",
    previewFrameFamily: "commerce-workspace-preview",
    buildRegionEmphasis: "orders-catalog-operations-surface",
    orchestrationEmphasis: "queue-urgency-and-catalog-state",
    runtimeRegionEmphasis: "commerce-release-direction",
    buildSurfaceTitle: "משטח המסחר והתפעול מתעצב עכשיו",
    buildSurfaceDetail: "הזמנות, קטלוג, והפעולה התפעולית הקרובה צריכים להופיע כחלק מאותו workspace.",
  },
  saas: {
    workspaceFamily: "product-workspace",
    previewFrameFamily: "product-workspace-preview",
    buildRegionEmphasis: "workflow-and-state-surface",
    orchestrationEmphasis: "workflow-activation-and-first-product-move",
    runtimeRegionEmphasis: "web-product-release-direction",
    buildSurfaceTitle: "המוצר עצמו נבנה בתוך workspace חי",
    buildSurfaceDetail: "workflow ראשון, state, והפעולה היצרנית הבאה צריכים להתבהר מול המשתמש.",
  },
  game: {
    workspaceFamily: "playable-workspace",
    previewFrameFamily: "playable-preview",
    buildRegionEmphasis: "play-scene-surface",
    orchestrationEmphasis: "scene-hud-interaction",
    runtimeRegionEmphasis: "playable-release-direction",
    buildSurfaceTitle: "ה־scene וה־HUD מתחילים להופיע",
    buildSurfaceDetail: "המשחק חייב להרגיש כמו playable progression ולא concept summary.",
  },
  book: {
    workspaceFamily: "document-outline-workspace",
    previewFrameFamily: "document-preview",
    buildRegionEmphasis: "outline-preview-surface",
    orchestrationEmphasis: "chapter-shape-and-publishing-direction",
    runtimeRegionEmphasis: "publishing-package-direction",
    buildSurfaceTitle: "המבנה של הספר נבנה מול המשתמש",
    buildSurfaceDetail: "outline, chapter flow, וכיוון publishing צריכים להיות visible as structure.",
  },
  "content-product": {
    workspaceFamily: "content-system-workspace",
    previewFrameFamily: "content-preview",
    buildRegionEmphasis: "module-delivery-surface",
    orchestrationEmphasis: "module-shape-and-delivery-path",
    runtimeRegionEmphasis: "content-release-direction",
    buildSurfaceTitle: "מערכת התוכן מתארגנת עכשיו",
    buildSurfaceDetail: "מודולים, delivery path, וצורת ההרחבה צריכים להופיע כsurface אמיתי.",
  },
  generic: {
    workspaceFamily: "generic-project-workspace",
    previewFrameFamily: "generic-preview",
    buildRegionEmphasis: "generic-preview-surface",
    orchestrationEmphasis: "grounding-and-next-move",
    runtimeRegionEmphasis: "generic-runtime-direction",
    buildSurfaceTitle: "נקודת הפתיחה של המוצר נבנית עכשיו",
    buildSurfaceDetail: "גם fallback צריך להרגיש כמו מוצר שנכנס לצורה ולא כמו center text בלבד.",
  },
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function createSplitWorkspaceAndLiveBuildSurfaceModel({
  productClass = "unknown",
  runtimeDirection = null,
  skeletonContract = null,
  skeletonQualityBaseline = null,
  projectStage = "bootstrap",
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const familyDefinition = WORKSPACE_SURFACE_FAMILIES[normalizedProductClass] ?? WORKSPACE_SURFACE_FAMILIES.generic;

  return {
    modelId: `split-workspace:${normalizedProductClass}:${projectStage}`,
    productClass: normalizedProductClass,
    label: classProfile.label,
    workspaceFamily: familyDefinition.workspaceFamily,
    previewFrameFamily: runtimeDirection?.previewFamily ?? familyDefinition.previewFrameFamily,
    buildSurfaceFamily: runtimeDirection?.buildSurfaceFamily ?? classProfile.buildSurfaceFamily,
    runtimeFamily: runtimeDirection?.runtimeFamily ?? classProfile.runtimeFamily,
    packagingFamily: runtimeDirection?.packagingFamily ?? classProfile.packagingFamily,
    releasePathFamily: runtimeDirection?.releasePathFamily ?? classProfile.releasePathFamily,
    projectStage,
    dominantRegion: "build-region",
    regions: {
      orchestration: {
        regionId: "orchestration-region",
        emphasis: familyDefinition.orchestrationEmphasis,
        visibleSignals: unique([
          "mission",
          "current-stage",
          "next-move",
          ...(skeletonContract?.visibleMilestones ?? []).slice(0, 2),
        ]),
      },
      build: {
        regionId: "build-region",
        emphasis: familyDefinition.buildRegionEmphasis,
        title: familyDefinition.buildSurfaceTitle,
        detail: familyDefinition.buildSurfaceDetail,
        previewFrameFamily: runtimeDirection?.previewFamily ?? familyDefinition.previewFrameFamily,
        requiredSurfaceElements: unique(skeletonQualityBaseline?.requiredSurfaceElements ?? []),
        visibleMilestones: unique(skeletonContract?.visibleMilestones ?? []),
      },
      runtime: {
        regionId: "runtime-region",
        emphasis: familyDefinition.runtimeRegionEmphasis,
        continuationAnchor: `${normalizedProductClass}-continuation-anchor`,
        releasePathFamily: runtimeDirection?.releasePathFamily ?? classProfile.releasePathFamily,
        packagingFamily: runtimeDirection?.packagingFamily ?? classProfile.packagingFamily,
      },
    },
    restoreKeys: [
      "workspaceFamily",
      "previewFrameFamily",
      "buildSurfaceFamily",
      "runtimeFamily",
      "releasePathFamily",
      "projectStage",
    ],
    truthRequirements: [
      "orchestration-context-must-not-dominate-center-surface",
      "build-region-must-be-primary",
      "runtime-direction-must-remain-visible",
      "workspace-model-must-survive-restore",
    ],
    figmaThresholdStatus: "shell-level-structural-pass-still-required-for-major-layout-evolution",
  };
}
