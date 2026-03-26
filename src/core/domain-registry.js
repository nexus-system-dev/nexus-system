const DEFAULT_DOMAIN_DEFINITIONS = {
  generic: {
    config: {
      label: "Generic Project",
      category: "general",
    },
    signals: ["vision", "scope", "execution"],
    releaseTargets: ["private-deployment"],
    bootstrapRules: ["create-initial-structure", "define-first-workflow"],
  },
  casino: {
    config: {
      label: "Casino",
      category: "product",
    },
    signals: ["wallet", "payments", "auth", "game-flows"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-auth-core", "initialize-wallet-core", "initialize-game-flow"],
  },
  saas: {
    config: {
      label: "SaaS",
      category: "product",
    },
    signals: ["billing", "onboarding", "activation", "subscription"],
    releaseTargets: ["web-deployment", "private-deployment"],
    bootstrapRules: ["initialize-app-shell", "initialize-auth-core", "initialize-billing-foundation"],
  },
  "mobile-app": {
    config: {
      label: "Mobile App",
      category: "app",
    },
    signals: ["screens", "navigation", "mobile-runtime", "app-release"],
    releaseTargets: ["app-store", "play-store", "internal-distribution"],
    bootstrapRules: ["initialize-mobile-shell", "initialize-navigation", "initialize-mobile-auth"],
  },
  "agency-system": {
    config: {
      label: "Agency System",
      category: "operations",
    },
    signals: ["client-intake", "reporting", "ops-workflows"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-client-intake", "initialize-reporting-core"],
  },
  book: {
    config: {
      label: "Book",
      category: "content",
    },
    signals: ["chapters", "outline", "manuscript"],
    releaseTargets: ["pdf-publishing", "epub-publishing"],
    bootstrapRules: ["initialize-outline", "initialize-chapter-structure"],
  },
  "content-product": {
    config: {
      label: "Content Product",
      category: "content",
    },
    signals: ["modules", "delivery-format", "audience-flow"],
    releaseTargets: ["content-delivery", "private-distribution"],
    bootstrapRules: ["initialize-content-outline", "initialize-delivery-structure"],
  },
};

function normalizeDefinition(domain, definition = {}) {
  return {
    domain,
    config: {
      label: definition.config?.label ?? domain,
      category: definition.config?.category ?? "general",
    },
    signals: Array.isArray(definition.signals) ? [...new Set(definition.signals)] : [],
    releaseTargets: Array.isArray(definition.releaseTargets) ? [...new Set(definition.releaseTargets)] : [],
    bootstrapRules: Array.isArray(definition.bootstrapRules) ? [...new Set(definition.bootstrapRules)] : [],
  };
}

export function createDomainRegistry(domainDefinitions = {}) {
  const mergedDefinitions = {
    ...DEFAULT_DOMAIN_DEFINITIONS,
    ...domainDefinitions,
  };

  const domains = Object.fromEntries(
    Object.entries(mergedDefinitions).map(([domain, definition]) => [domain, normalizeDefinition(domain, definition)]),
  );

  return {
    version: "1.0.0",
    domains,
  };
}

export function resolveDomainProfile(domain, registry = createDomainRegistry()) {
  return registry.domains[domain] ?? registry.domains.generic;
}
