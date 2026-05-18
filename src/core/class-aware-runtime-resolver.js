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

const RUNTIME_VISIBILITY_RULES = {
  "landing-page": "runtime path must stay visible as web deployment from the first marketing surface",
  "mobile-app": "runtime path must stay visible through simulator and Apple distribution direction",
  "internal-tool": "runtime path must stay visible as private workspace execution and release",
  "commerce-ops": "runtime path must stay visible as commerce workspace runtime with operational release direction",
  saas: "runtime path must stay visible as product workspace runtime with web product release",
  game: "runtime path must stay visible as playable runtime and game build path",
  book: "runtime path must stay visible as document runtime and publishing path",
  "content-product": "runtime path must stay visible as content runtime and delivery path",
  generic: "runtime path must stay visible before execution advances",
};

export function createClassAwareRuntimeResolver({
  productClass = null,
  runtimeDirection = null,
  desktopShellScopeContract = null,
  localWorkspaceContract = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const normalizedRuntimeDirection = normalizeObject(runtimeDirection);
  const normalizedDesktopShellScopeContract = normalizeObject(desktopShellScopeContract);
  const normalizedLocalWorkspaceContract = normalizeObject(localWorkspaceContract);

  const runtimeFamily = normalizeString(normalizedRuntimeDirection.runtimeFamily, classProfile.runtimeFamily);
  const packagingFamily = normalizeString(normalizedRuntimeDirection.packagingFamily, classProfile.packagingFamily);
  const releasePathFamily = normalizeString(normalizedRuntimeDirection.releasePathFamily, classProfile.releasePathFamily);
  const previewFamily = normalizeString(normalizedRuntimeDirection.previewFamily, classProfile.previewFamily);
  const buildSurfaceFamily = normalizeString(normalizedRuntimeDirection.buildSurfaceFamily, classProfile.buildSurfaceFamily);

  return {
    classAwareRuntimeResolver: {
      resolverId: `runtime-resolver:${normalizedProductClass}`,
      productClass: normalizedProductClass,
      runtimeFamily,
      packagingFamily,
      releasePathFamily,
      previewFamily,
      buildSurfaceFamily,
      targetPlatform: normalizeString(normalizedRuntimeDirection.targetPlatform, "generic"),
      preferredReleaseTarget: normalizeString(normalizedRuntimeDirection.preferredReleaseTarget, releasePathFamily),
      shellFamily: normalizeString(normalizedDesktopShellScopeContract.shellFamily, "browser-backed-shell"),
      shellPath: normalizeString(
        normalizedDesktopShellScopeContract.shellPathDecision?.currentWave4Path,
        normalizedLocalWorkspaceContract.workspaceMode ?? "browser-backed-local-workspace",
      ),
      visibleRuntimeRule: RUNTIME_VISIBILITY_RULES[normalizedProductClass] ?? RUNTIME_VISIBILITY_RULES.generic,
      summary: {
        runtimeSelectionIsDeterministic: true,
        projectFacingPath: `${runtimeFamily} -> ${releasePathFamily}`,
        packagingPath: `${previewFamily} -> ${packagingFamily}`,
      },
    },
  };
}
