function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

const CLASS_ALLOWED_MOVES = {
  "landing-page": [
    "tighten-hero-promise",
    "strengthen-trust-block",
    "clarify-primary-cta",
  ],
  "mobile-app": [
    "clarify-first-screen",
    "reduce-first-decision",
    "stabilize-next-screen-flow",
  ],
  "internal-tool": [
    "highlight-active-ownership",
    "surface-urgency-clearly",
    "promote-next-operator-action",
  ],
  "commerce-ops": [
    "prioritize-first-order-action",
    "clarify-stock-friction",
    "promote-next-ops-step",
  ],
};

function buildAllowedMoves(productClass) {
  return CLASS_ALLOWED_MOVES[productClass] ?? [
    "tighten-last-approved-surface",
    "clarify-next-product-action",
    "open-one-bounded-improvement-loop",
  ];
}

export function createGrowthOpportunitySurfacingBoundary({
  productClass = null,
  postReleaseContinuationLoop = null,
} = {}) {
  const continuation = normalizeObject(postReleaseContinuationLoop);
  const normalizedProductClass = normalizeString(productClass, "generic");
  const continuationMoves = normalizeArray(continuation.continuationMoves);
  const allowedOpportunityFamilies = buildAllowedMoves(normalizedProductClass);
  const status = continuation.status === "active" || continuation.status === "ready"
    ? "bounded"
    : "not-ready";

  return {
    growthOpportunitySurfacingBoundary: {
      boundaryId: `growth-opportunity-boundary:${normalizedProductClass}`,
      boundaryFamily: "wave4-growth-opportunity-boundary",
      status,
      statusLabel: status === "bounded" ? "הצעות ההמשך נשארות bounded" : "עוד לא אפשרי לפתוח opportunity אמיתי",
      visibleBoundaryRule: "Wave 4 may surface only meaningful next product moves, never fake autonomous company behavior or implied Wave 7 autonomy",
      allowedOpportunityFamilies,
      allowedMoves: continuationMoves.length ? continuationMoves : allowedOpportunityFamilies,
      deferredOpportunityFamilies: [
        "broad-autonomous-growth-ops",
        "portfolio-optimization",
        "self-directed-company-strategy",
      ],
      disallowedMoves: [
        "inventing company goals disconnected from the released product",
        "implying autonomous GTM ownership beyond the current product loop",
        "opening broad experimentation programs without product-connected proof",
      ],
      credibilityRule: "every surfaced next move must stay directly attached to the last approved artifact, release target, and current product bottleneck",
      continuityRule: "opportunity state must survive revisit, route restore, and handoff back into execution without changing scope silently",
    },
  };
}
