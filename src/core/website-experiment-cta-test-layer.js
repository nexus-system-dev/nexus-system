function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(websiteCopyPack, productCtaStrategy) {
  const missingInputs = [];
  if (!websiteCopyPack || normalizeString(websiteCopyPack.status) !== "ready") {
    missingInputs.push("websiteCopyPack");
  }
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }
  return missingInputs;
}

export function createWebsiteExperimentAndCtaTestLayer({
  websiteCopyPack = null,
  productCtaStrategy = null,
  analyticsSummary = null,
} = {}) {
  const normalizedPack = normalizeObject(websiteCopyPack);
  const normalizedStrategy = normalizeObject(productCtaStrategy);
  const normalizedAnalytics = normalizeObject(analyticsSummary);
  const missingInputs = buildMissingInputs(normalizedPack, normalizedStrategy);

  if (missingInputs.length > 0) {
    return {
      websiteExperimentPlan: {
        websiteExperimentPlanId: `website-experiment:${slugify(normalizedPack?.websiteCopyPackId)}`,
        status: "missing-inputs",
        missingInputs,
        experiments: [],
      },
    };
  }

  return {
    websiteExperimentPlan: {
      websiteExperimentPlanId: `website-experiment:${slugify(normalizedPack.websiteCopyPackId)}`,
      status: "ready",
      missingInputs: [],
      experiments: [
        {
          experimentId: "experiment:hero-cta",
          hypothesis: "A request-access CTA converts high-intent visitors better than a generic signup CTA.",
          baselineCta: normalizedStrategy.primaryCta?.label ?? null,
          measurement: normalizedAnalytics?.totalProjectsCreated > 0 ? "activation-rate" : "request-access-rate",
        },
      ],
    },
  };
}
