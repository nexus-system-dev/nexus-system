import { StrategicPlanner } from "./planner.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasRequestedDeliverable(deliverables, variants) {
  return variants.some((variant) => deliverables.some((item) => item.includes(variant)));
}

function createReliableGap(text, index) {
  return {
    id: `seed-gap-${index + 1}`,
    text,
    metadata: {
      source: "initial-project-state",
      confidence: 0.9,
      status: "verified",
      derivedFrom: "bootstrapMetadata.requestedDeliverables",
    },
  };
}

function buildRequestedDeliverables(initialProjectState) {
  const requested = [
    ...normalizeArray(initialProjectState?.goals?.requestedDeliverables),
    ...normalizeArray(initialProjectState?.bootstrapMetadata?.requestedDeliverables),
  ]
    .map((item) => normalizeText(item).toLowerCase())
    .filter(Boolean);

  return [...new Set(requested)];
}

function buildReliableGaps({ domain, requestedDeliverables }) {
  const gaps = [];

  if (domain === "saas") {
    if (hasRequestedDeliverable(requestedDeliverables, ["auth", "authentication", "login"])) {
      gaps.push("authentication");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["billing", "payments", "subscription"])) {
      gaps.push("subscription billing");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["onboarding", "activation"])) {
      gaps.push("user onboarding flow");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["acquisition", "landing", "marketing"])) {
      gaps.push("go-to-market funnel");
    }
  }

  if (domain === "mobile-app") {
    if (hasRequestedDeliverable(requestedDeliverables, ["auth", "authentication", "login"])) {
      gaps.push("authentication");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["api", "backend", "sync"])) {
      gaps.push("api integration");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["release", "app store", "play store"])) {
      gaps.push("release pipeline");
    }
  }

  if (domain === "agency-system") {
    if (hasRequestedDeliverable(requestedDeliverables, ["intake", "lead", "project intake"])) {
      gaps.push("project intake");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["reporting", "status reports"])) {
      gaps.push("client reporting");
    }
  }

  if (domain === "casino") {
    if (hasRequestedDeliverable(requestedDeliverables, ["auth", "authentication", "login"])) {
      gaps.push("Frontend auth integration");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["wallet", "treasury"])) {
      gaps.push("Wallet and treasury implementation");
    }

    if (hasRequestedDeliverable(requestedDeliverables, ["bonus"])) {
      gaps.push("Bonus implementation");
    }
  }

  return gaps.map(createReliableGap);
}

function buildSeedProjectState({ initialProjectState, domainDecision }) {
  const state = normalizeObject(initialProjectState);
  const normalizedDomainDecision = normalizeObject(domainDecision);
  const domain = normalizedDomainDecision.domain ?? "generic";
  const requestedDeliverables = buildRequestedDeliverables(state);

  return {
    businessGoal: state.goals?.businessGoal ?? state.identity?.vision ?? "",
    stack: normalizeObject(state.bootstrapMetadata?.bootstrapMetadata?.stack),
    knowledge: {
      knownGaps: normalizeArray(state.constraints?.missingClarifications),
    },
    analytics: {
      hasBaselineCampaign: !hasRequestedDeliverable(requestedDeliverables, ["acquisition", "landing", "marketing"]),
    },
    product: {
      hasAuth: !hasRequestedDeliverable(requestedDeliverables, ["auth", "authentication", "login"]),
      hasPaymentIntegration: !hasRequestedDeliverable(requestedDeliverables, ["billing", "payments", "subscription"]),
      hasLandingPage: !hasRequestedDeliverable(requestedDeliverables, ["landing", "acquisition", "marketing"]),
      hasStagingEnvironment: false,
    },
    context: {
      domain,
      gaps: buildReliableGaps({
        domain,
        requestedDeliverables,
      }),
      flows: [],
    },
  };
}

export function createInitialTaskSeedingService({
  initialProjectState = null,
  domainDecision = null,
  planner = new StrategicPlanner(),
} = {}) {
  const normalizedState = normalizeObject(initialProjectState);
  const normalizedDomainDecision = normalizeObject(domainDecision);
  const seedProjectState = buildSeedProjectState({
    initialProjectState: normalizedState,
    domainDecision: normalizedDomainDecision,
  });
  const initialTasks = planner.generateInitialRoadmap(seedProjectState);

  return {
    initialTasks,
    taskSeedMetadata: {
      seedId: `task-seed:${normalizedState.stateId ?? normalizedState.projectId ?? "unknown"}`,
      domain: normalizedDomainDecision.domain ?? "generic",
      domainCandidates: normalizeArray(normalizedDomainDecision.domainCandidates),
      totalTasks: initialTasks.length,
      seedStrategy: initialTasks.length > 0 ? "planner-generated" : "empty",
      requestedDeliverables: buildRequestedDeliverables(normalizedState),
      readinessStatus: normalizedState.readiness?.status ?? "unknown",
      canSeedTasks: normalizedState.readiness?.canBootstrap === true,
    },
  };
}
