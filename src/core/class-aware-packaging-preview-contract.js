import {
  normalizeCanonicalProductClass,
  resolveCanonicalProductClassProfile,
} from "../../web/shared/product-class-model.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const PREVIEW_RULES = {
  "landing-page": {
    previewMode: "live-browser-preview",
    previewSurface: "browser-marketing-preview",
    previewArtifact: "route-visible-landing-page",
    packageMode: "static-web-build",
    packageArtifactType: "deployable-web-bundle",
    packagingExpectation: "single marketing build that can go straight to web deployment",
    visiblePreviewRule: "preview must feel like a live browser-ready landing page, not a generic workspace shell",
    visiblePackagingRule: "packaging must stay visible as a deployable marketing bundle with one release target",
  },
  "mobile-app": {
    previewMode: "mobile-simulator-preview",
    previewSurface: "device-flow-preview",
    previewArtifact: "simulator-visible-mobile-flow",
    packageMode: "signed-mobile-archive",
    packageArtifactType: "ipa-or-app-bundle",
    packagingExpectation: "mobile package stays tied to Apple tooling and archive output",
    visiblePreviewRule: "preview must feel like a device-level flow through simulator-facing surfaces",
    visiblePackagingRule: "packaging must stay visible as a mobile archive path rather than generic web delivery",
  },
  "internal-tool": {
    previewMode: "workspace-preview",
    previewSurface: "private-ops-workspace-preview",
    previewArtifact: "queue-and-ownership-workspace",
    packageMode: "private-workspace-package",
    packageArtifactType: "authenticated-web-workspace-bundle",
    packagingExpectation: "private workspace package stays aligned to authenticated team usage",
    visiblePreviewRule: "preview must feel like a working internal workspace with queue, ownership, and next action",
    visiblePackagingRule: "packaging must stay visible as a private workspace release rather than public web export",
  },
  "commerce-ops": {
    previewMode: "commerce-workspace-preview",
    previewSurface: "operations-commerce-preview",
    previewArtifact: "commerce-queue-workspace",
    packageMode: "commerce-workspace-package",
    packageArtifactType: "authenticated-commerce-workspace-bundle",
    packagingExpectation: "commerce workspace package stays aligned to catalog, order, and inventory operations",
    visiblePreviewRule: "preview must feel like an operations workspace for orders, catalog, and inventory",
    visiblePackagingRule: "packaging must stay visible as commerce workspace delivery and not collapse into generic SaaS packaging",
  },
  saas: {
    previewMode: "product-workspace-preview",
    previewSurface: "customer-facing-product-preview",
    previewArtifact: "product-workflow-preview",
    packageMode: "saas-web-package",
    packageArtifactType: "deployable-product-web-bundle",
    packagingExpectation: "SaaS package stays aligned to product runtime, activation path, and web release",
    visiblePreviewRule: "preview must feel like a product workflow users can move through, not a static artifact",
    visiblePackagingRule: "packaging must stay visible as a product web bundle ready for releaseable runtime",
  },
  game: {
    previewMode: "playable-preview",
    previewSurface: "gameplay-preview-surface",
    previewArtifact: "interactive-playable-loop",
    packageMode: "game-build-package",
    packageArtifactType: "playable-game-build",
    packagingExpectation: "game package stays aligned to playable runtime and build target",
    visiblePreviewRule: "preview must feel playable, not like a document or dashboard snapshot",
    visiblePackagingRule: "packaging must stay visible as a game build path",
  },
  book: {
    previewMode: "document-preview",
    previewSurface: "reading-preview-surface",
    previewArtifact: "narrative-or-structure-preview",
    packageMode: "publishing-export-package",
    packageArtifactType: "publishable-document-export",
    packagingExpectation: "book package stays aligned to reading and publishing output",
    visiblePreviewRule: "preview must feel like a readable document or structured manuscript view",
    visiblePackagingRule: "packaging must stay visible as publishing export rather than app deployment",
  },
  "content-product": {
    previewMode: "content-preview",
    previewSurface: "content-delivery-preview",
    previewArtifact: "lesson-or-module-preview",
    packageMode: "content-delivery-package",
    packageArtifactType: "deliverable-content-bundle",
    packagingExpectation: "content package stays aligned to delivery of lessons, modules, or assets",
    visiblePreviewRule: "preview must feel like content delivery and not generic application chrome",
    visiblePackagingRule: "packaging must stay visible as content delivery packaging rather than runtime-only state",
  },
  generic: {
    previewMode: "generic-preview",
    previewSurface: "generic-preview-surface",
    previewArtifact: "generic-surface-preview",
    packageMode: "generic-package",
    packageArtifactType: "generic-delivery-bundle",
    packagingExpectation: "generic package stays explicit until the project class is upgraded",
    visiblePreviewRule: "preview must stay explicit before execution advances",
    visiblePackagingRule: "packaging must stay explicit before release claims advance",
  },
};

export function createClassAwarePackagingPreviewContract({
  productClass = null,
  classAwareRuntimeResolver = null,
  remoteMacRunner = null,
  desktopShellScopeContract = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const normalizedRuntimeResolver = normalizeObject(classAwareRuntimeResolver);
  const normalizedRemoteMacRunner = normalizeObject(remoteMacRunner);
  const normalizedDesktopShellScopeContract = normalizeObject(desktopShellScopeContract);
  const classRule = PREVIEW_RULES[normalizedProductClass] ?? PREVIEW_RULES.generic;

  const mobileArchivePath = normalizeString(normalizedRemoteMacRunner.archive?.artifactPath, "artifacts/ios/app.ipa");
  const desktopShellPath = normalizeString(
    normalizedDesktopShellScopeContract.shellPathDecision?.currentWave4Path,
    normalizedRuntimeResolver.shellPath ?? "browser-backed-local-workspace",
  );

  const previewPath = `${normalizeString(normalizedRuntimeResolver.previewFamily, classProfile.previewFamily)} -> ${classRule.previewMode}`;
  const packagePath = normalizedProductClass === "mobile-app"
    ? `${normalizeString(normalizedRuntimeResolver.packagingFamily, classProfile.packagingFamily)} -> ${mobileArchivePath}`
    : `${normalizeString(normalizedRuntimeResolver.packagingFamily, classProfile.packagingFamily)} -> ${normalizeString(normalizedRuntimeResolver.preferredReleaseTarget, classProfile.releasePathFamily)}`;

  return {
    classAwarePackagingPreviewContract: {
      contractId: `packaging-preview-contract:${normalizedProductClass}`,
      productClass: normalizedProductClass,
      previewFamily: normalizeString(normalizedRuntimeResolver.previewFamily, classProfile.previewFamily),
      previewMode: classRule.previewMode,
      previewSurface: classRule.previewSurface,
      previewArtifact: classRule.previewArtifact,
      packageMode: classRule.packageMode,
      packagingFamily: normalizeString(normalizedRuntimeResolver.packagingFamily, classProfile.packagingFamily),
      packageArtifactType: classRule.packageArtifactType,
      preferredReleaseTarget: normalizeString(normalizedRuntimeResolver.preferredReleaseTarget, classProfile.releasePathFamily),
      shellPath: desktopShellPath,
      mobileArchivePath: normalizedProductClass === "mobile-app" ? mobileArchivePath : null,
      packagingExpectation: classRule.packagingExpectation,
      visiblePreviewRule: classRule.visiblePreviewRule,
      visiblePackagingRule: classRule.visiblePackagingRule,
      continuityRule: "preview/package mode must persist as project-facing class truth across reopen and return",
      summary: {
        previewPath,
        packagePath,
        feelsAppropriateToClass: true,
      },
    },
  };
}
