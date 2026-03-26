export function createPackageFormatResolver({
  releaseTarget = "private-deployment",
  packagingRequirements = null,
} = {}) {
  const explicitHint = packagingRequirements?.packageFormatHint ?? null;

  if (explicitHint) {
    return {
      packageFormat: explicitHint,
    };
  }

  if (releaseTarget === "web-deployment") {
    return {
      packageFormat: "static-bundle",
    };
  }

  if (releaseTarget === "app-store" || releaseTarget === "play-store") {
    return {
      packageFormat: "store-package",
    };
  }

  if (releaseTarget?.includes("publishing")) {
    return {
      packageFormat: "publication-package",
    };
  }

  return {
    packageFormat: "deployment-package",
  };
}
