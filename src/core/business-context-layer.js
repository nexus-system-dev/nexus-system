const DOMAIN_AUDIENCES = {
  generic: "early users",
  casino: "casino players",
  saas: "product teams",
  "mobile-app": "mobile end users",
  "agency-system": "agency operators",
  book: "readers",
  "content-product": "learners",
};

const DOMAIN_POSITIONING = {
  generic: "Focused digital product",
  casino: "Casino platform with core player flows",
  saas: "SaaS product with activation and retention focus",
  "mobile-app": "Mobile-first product experience",
  "agency-system": "Operations system for client delivery",
  book: "Structured publishing product",
  "content-product": "Content product with delivery and audience flow",
};

const DOMAIN_KPIS = {
  generic: ["activation-rate", "delivery-velocity"],
  casino: ["player-activation", "deposit-conversion", "retention-rate"],
  saas: ["activation-rate", "trial-to-paid", "retention-rate"],
  "mobile-app": ["app-activation", "session-retention", "release-readiness"],
  "agency-system": ["client-throughput", "delivery-cycle-time", "retention-rate"],
  book: ["chapters-completed", "reader-conversion", "distribution-readiness"],
  "content-product": ["completion-rate", "conversion-rate", "audience-retention"],
};

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function inferTargetAudience({ domain, manualBusinessContext, goal }) {
  return (
    normalizeString(manualBusinessContext?.targetAudience) ??
    (goal?.match(/users|לקוחות|שחקנים|readers|teams/i) ? goal.trim() : null) ??
    DOMAIN_AUDIENCES[domain] ??
    DOMAIN_AUDIENCES.generic
  );
}

function inferPositioning({ domain, manualBusinessContext }) {
  return (
    normalizeString(manualBusinessContext?.positioning) ??
    DOMAIN_POSITIONING[domain] ??
    DOMAIN_POSITIONING.generic
  );
}

function inferFunnel({ manualBusinessContext, recommendedDefaults, knowledgeGaps = [] }) {
  if (manualBusinessContext?.funnel && typeof manualBusinessContext.funnel === "object") {
    return manualBusinessContext.funnel;
  }

  const gapText = knowledgeGaps.join(" ").toLowerCase();

  return {
    acquisition: gapText.includes("funnel") || gapText.includes("acquisition") ? "needs-definition" : "baseline-defined",
    activation: recommendedDefaults?.delivery?.strategy ? "baseline-defined" : "unknown",
    conversion: gapText.includes("payment") || gapText.includes("billing") ? "blocked" : "baseline-defined",
    retention: gapText.includes("retention") ? "needs-definition" : "planned",
  };
}

function inferKpis({ domain, manualBusinessContext, runtimeSnapshot }) {
  if (Array.isArray(manualBusinessContext?.kpis) && manualBusinessContext.kpis.length > 0) {
    return unique(manualBusinessContext.kpis);
  }

  const inferred = [...(DOMAIN_KPIS[domain] ?? DOMAIN_KPIS.generic)];
  if (runtimeSnapshot?.analytics?.activeUsers) {
    inferred.push("active-users");
  }
  if (runtimeSnapshot?.productMetrics?.activationRate) {
    inferred.push("activation-rate");
  }

  return unique(inferred);
}

function inferGtmStage({ manualBusinessContext, runtimeSnapshot, gitSnapshot, recommendedDefaults }) {
  const manualStage = normalizeString(manualBusinessContext?.gtmStage);
  if (manualStage) {
    return manualStage;
  }

  if (runtimeSnapshot?.analytics?.activeUsers || runtimeSnapshot?.deployments?.length) {
    return "live";
  }

  if (gitSnapshot?.repo?.fullName || recommendedDefaults?.hosting?.target) {
    return "build";
  }

  return "pre-launch";
}

function inferBusinessConstraints({ manualBusinessContext, stateConstraints, recommendedDefaults }) {
  const manualConstraints = Array.isArray(manualBusinessContext?.constraints)
    ? manualBusinessContext.constraints
    : [];
  const normalizedStateConstraints =
    stateConstraints && typeof stateConstraints === "object" && !Array.isArray(stateConstraints)
      ? Object.entries(stateConstraints)
          .filter(([, value]) => value !== null && value !== undefined && value !== "")
          .map(([key, value]) => `${key}:${value}`)
      : [];
  const inferredConstraints = [];

  if (recommendedDefaults?.provisional) {
    inferredConstraints.push("defaults-need-confirmation");
  }

  return unique([...manualConstraints, ...normalizedStateConstraints, ...inferredConstraints]);
}

export function buildBusinessContextLayer({
  domain = "generic",
  goal = "",
  manualBusinessContext = null,
  knowledgeGaps = [],
  runtimeSnapshot = null,
  gitSnapshot = null,
  stateConstraints = {},
  recommendedDefaults = null,
} = {}) {
  return {
    targetAudience: inferTargetAudience({ domain, manualBusinessContext, goal }),
    positioning: inferPositioning({ domain, manualBusinessContext }),
    funnel: inferFunnel({ manualBusinessContext, recommendedDefaults, knowledgeGaps }),
    kpis: inferKpis({ domain, manualBusinessContext, runtimeSnapshot }),
    gtmStage: inferGtmStage({ manualBusinessContext, runtimeSnapshot, gitSnapshot, recommendedDefaults }),
    constraints: inferBusinessConstraints({ manualBusinessContext, stateConstraints, recommendedDefaults }),
  };
}
