const DEFAULTS_BASELINE = {
  generic: {
    stack: {
      frontend: "react",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "agent",
    },
    hosting: {
      target: "private-deployment",
    },
    delivery: {
      strategy: "iterative",
    },
  },
  casino: {
    stack: {
      frontend: "react",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "sandbox",
    },
    hosting: {
      target: "web-deployment",
    },
    delivery: {
      strategy: "compliance-first",
    },
  },
  saas: {
    stack: {
      frontend: "nextjs",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "temp-branch",
    },
    hosting: {
      target: "web-deployment",
    },
    delivery: {
      strategy: "mvp-first",
    },
  },
  "mobile-app": {
    stack: {
      frontend: "react-native",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "local-terminal",
    },
    hosting: {
      target: "internal-distribution",
    },
    delivery: {
      strategy: "build-first",
    },
  },
  "agency-system": {
    stack: {
      frontend: "nextjs",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "local-terminal",
    },
    hosting: {
      target: "private-deployment",
    },
    delivery: {
      strategy: "ops-first",
    },
  },
  book: {
    stack: {
      frontend: "markdown",
      backend: "none",
      database: "none",
    },
    execution: {
      mode: "agent",
    },
    hosting: {
      target: "pdf-publishing",
    },
    delivery: {
      strategy: "authoring-first",
    },
  },
  "content-product": {
    stack: {
      frontend: "nextjs",
      backend: "node",
      database: "postgres",
    },
    execution: {
      mode: "agent",
    },
    hosting: {
      target: "content-delivery",
    },
    delivery: {
      strategy: "audience-first",
    },
  },
};

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePlatformTargets(platformTargets = []) {
  if (!Array.isArray(platformTargets)) {
    return [];
  }

  return [...new Set(platformTargets.filter((target) => typeof target === "string" && target.trim()).map((target) => target.trim()))];
}

function inferScope(projectIntake = {}) {
  const deliverables = Array.isArray(projectIntake.requestedDeliverables)
    ? projectIntake.requestedDeliverables
    : [];

  if (deliverables.includes("payments") || deliverables.includes("growth")) {
    return "expanded";
  }

  if (projectIntake.uploadedFiles?.length || projectIntake.externalLinks?.length) {
    return "defined";
  }

  return "lean";
}

function normalizeConstraints(constraints = {}) {
  if (!constraints || typeof constraints !== "object" || Array.isArray(constraints)) {
    return {
      budget: "default",
      maturity: "early",
      scope: "lean",
    };
  }

  return {
    budget: normalizeString(constraints.budget, "default"),
    maturity: normalizeString(constraints.maturity, "early"),
    scope: normalizeString(constraints.scope, "lean"),
  };
}

export function defineDefaultsInputSchema({ projectIntake = null, domain = "generic", constraints = {} }) {
  const normalizedConstraints = normalizeConstraints(constraints);
  const inferredScope = inferScope(projectIntake ?? {});

  return {
    domain: normalizeString(domain, "generic"),
    projectIntake,
    constraints: {
      ...normalizedConstraints,
      scope: normalizedConstraints.scope === "lean" ? inferredScope : normalizedConstraints.scope,
    },
  };
}

function createRule(id, condition, apply, reason) {
  return { id, condition, apply, reason };
}

export function createDefaultsRuleRegistry(input) {
  const baseline = DEFAULTS_BASELINE[input.domain] ?? DEFAULTS_BASELINE.generic;

  return [
    createRule(
      "domain-baseline",
      () => true,
      () => baseline,
      `Domain baseline for ${input.domain}`,
    ),
    createRule(
      "scope-expanded",
      (normalizedInput) => normalizedInput.constraints.scope === "expanded",
      () => ({
        delivery: {
          cadence: "multi-track",
        },
      }),
      "Expanded scope requires broader delivery defaults",
    ),
    createRule(
      "budget-lean",
      (normalizedInput) => normalizedInput.constraints.budget === "lean",
      () => ({
        hosting: {
          costProfile: "low-cost",
        },
        execution: {
          reviewMode: "minimal-human-checkpoints",
        },
      }),
      "Lean budget should prefer low-cost defaults",
    ),
    createRule(
      "budget-premium",
      (normalizedInput) => normalizedInput.constraints.budget === "premium",
      () => ({
        hosting: {
          costProfile: "managed",
        },
        execution: {
          reviewMode: "high-safety",
        },
      }),
      "Premium budget can support managed infrastructure and extra review",
    ),
    createRule(
      "maturity-growth",
      (normalizedInput) => normalizedInput.constraints.maturity === "growth",
      () => ({
        delivery: {
          cadence: "weekly-iteration",
        },
      }),
      "Growth-stage projects need recurring delivery cadence",
    ),
  ];
}

function mergeDefaults(base = {}, patch = {}) {
  const result = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = mergeDefaults(result[key] ?? {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function createDefaultsConflictResolver(scoredDefaults = []) {
  return scoredDefaults
    .slice()
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.id.localeCompare(right.id);
    })
    .reduce((resolved, rule) => mergeDefaults(resolved, rule.defaults ?? {}), {});
}

export function createDefaultsTraceBuilder(resolvedDefaults = {}, applicableRules = []) {
  return applicableRules.map((rule) => ({
    ruleId: rule.id,
    score: rule.score ?? null,
    reason: rule.reason,
    resolvedKeys: Object.keys(rule.defaults ?? {}),
    affectsResolvedDefaults: Object.keys(rule.defaults ?? {}).some((key) => key in resolvedDefaults),
  }));
}

export function createRecommendedDefaultsAssembler(resolvedDefaults = {}, defaultsTrace = []) {
  return {
    ...resolvedDefaults,
    provisional: true,
    defaultsTrace,
  };
}

export function createStackRecommendationModule({
  domain = "generic",
  platformTargets = [],
  constraints = {},
  projectIntake = null,
} = {}) {
  const normalizedPlatformTargets = normalizePlatformTargets(platformTargets);
  const { recommendedDefaults } = createRecommendedDefaults({
    projectIntake,
    domain,
    constraints,
  });

  const stack = {
    ...(recommendedDefaults.stack ?? {}),
  };

  if (normalizedPlatformTargets.includes("ios") || normalizedPlatformTargets.includes("android")) {
    stack.frontend = "react-native";
  }

  if (normalizedPlatformTargets.includes("web")) {
    stack.frontend = stack.frontend === "react-native" ? "react-native-web" : stack.frontend;
  }

  return {
    domain,
    platformTargets: normalizedPlatformTargets,
    constraints,
    frontend: stack.frontend ?? null,
    backend: stack.backend ?? null,
    database: stack.database ?? null,
    basis: "recommended-defaults",
    provisional: true,
  };
}

function scoreRule(rule, input) {
  let score = 0.5;
  if (input.constraints.scope === "expanded") {
    score += 0.1;
  }
  if (input.constraints.maturity === "growth") {
    score += 0.1;
  }
  if (input.constraints.budget !== "default") {
    score += 0.1;
  }
  if (rule.id === "domain-baseline") {
    score += 0.2;
  }

  return Number(score.toFixed(2));
}

export function createDefaultsScoringModule(applicableRules = [], normalizedDefaultsInput = {}) {
  return applicableRules.map((rule) => ({
    ...rule,
    score: scoreRule(rule, normalizedDefaultsInput),
    defaults: typeof rule.apply === "function" ? rule.apply(normalizedDefaultsInput) : rule.defaults ?? {},
  }));
}

export function createRecommendedDefaults({ projectIntake = null, domain = "generic", constraints = {} }) {
  const normalizedInput = defineDefaultsInputSchema({
    projectIntake,
    domain,
    constraints,
  });
  const applicableRules = createDefaultsScoringModule(
    createDefaultsRuleRegistry(normalizedInput).filter((rule) => rule.condition(normalizedInput)),
    normalizedInput,
  );
  const resolvedDefaults = createDefaultsConflictResolver(applicableRules);
  const defaultsTrace = createDefaultsTraceBuilder(resolvedDefaults, applicableRules);
  const recommendedDefaults = createRecommendedDefaultsAssembler(resolvedDefaults, defaultsTrace);

  return {
    normalizedDefaultsInput: normalizedInput,
    applicableRules: applicableRules.map((rule) => ({
      id: rule.id,
      score: rule.score,
      reason: rule.reason,
    })),
    recommendedDefaults,
    defaultsTrace,
  };
}
