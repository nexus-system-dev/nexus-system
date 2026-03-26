import { createDomainRegistry, resolveDomainProfile } from "./domain-registry.js";

const DOMAIN_CAPABILITY_DEFINITIONS = {
  generic: {
    requiredContextFields: ["vision", "goal", "scope"],
    taskTypes: ["planning", "execution"],
    executionModes: ["agent"],
  },
  casino: {
    requiredContextFields: ["wallet", "payments", "auth", "game-flows"],
    taskTypes: ["backend", "payments", "product", "qa"],
    executionModes: ["agent", "sandbox", "temp-branch"],
  },
  saas: {
    requiredContextFields: ["auth", "billing", "onboarding", "analytics"],
    taskTypes: ["backend", "frontend", "growth", "product"],
    executionModes: ["agent", "local-terminal", "temp-branch"],
  },
  "mobile-app": {
    requiredContextFields: ["screens", "navigation", "mobile-runtime", "release"],
    taskTypes: ["frontend", "mobile", "qa", "release"],
    executionModes: ["agent", "local-terminal", "xcode", "ci-runner"],
  },
  "agency-system": {
    requiredContextFields: ["client-intake", "reporting", "ops-workflows"],
    taskTypes: ["ops", "backend", "reporting"],
    executionModes: ["agent", "local-terminal"],
  },
  book: {
    requiredContextFields: ["outline", "chapters", "delivery-format"],
    taskTypes: ["writing", "editing", "publishing"],
    executionModes: ["agent"],
  },
  "content-product": {
    requiredContextFields: ["modules", "delivery-format", "audience-flow"],
    taskTypes: ["content", "ops", "growth"],
    executionModes: ["agent", "local-terminal"],
  },
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function mapDomainCapabilities(domain, domainRegistry = createDomainRegistry()) {
  const profile = resolveDomainProfile(domain, domainRegistry);
  const definition = DOMAIN_CAPABILITY_DEFINITIONS[domain] ?? DOMAIN_CAPABILITY_DEFINITIONS.generic;

  return {
    domainCapabilities: {
      domain: profile.domain,
      config: profile.config,
      signals: profile.signals,
      taskTypes: unique(definition.taskTypes),
      releaseTargets: unique(profile.releaseTargets),
      bootstrapRules: unique(profile.bootstrapRules),
    },
    requiredContextFields: unique(definition.requiredContextFields),
    executionModes: unique(definition.executionModes),
  };
}
