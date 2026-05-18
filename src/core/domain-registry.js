import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "../../web/shared/product-class-model.js";

const DEFAULT_DOMAIN_DEFINITIONS = {
  generic: {
    productClass: "generic",
    config: {
      label: "Generic Project",
      category: "general",
    },
    signals: ["vision", "scope", "execution"],
    releaseTargets: ["private-deployment"],
    bootstrapRules: ["create-initial-structure", "define-first-workflow"],
  },
  casino: {
    productClass: "saas",
    config: {
      label: "Casino",
      category: "product",
    },
    signals: ["wallet", "payments", "auth", "game-flows"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-auth-core", "initialize-wallet-core", "initialize-game-flow"],
  },
  saas: {
    productClass: "saas",
    config: {
      label: "SaaS",
      category: "product",
    },
    signals: ["billing", "onboarding", "activation", "subscription"],
    releaseTargets: ["web-deployment", "private-deployment"],
    bootstrapRules: ["initialize-app-shell", "initialize-auth-core", "initialize-billing-foundation"],
  },
  "internal-tool": {
    productClass: "internal-tool",
    config: {
      label: "Internal Tool",
      category: "operations",
    },
    signals: ["queue", "workflow", "ownership", "handoff", "workspace"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-workspace-shell", "initialize-queue-workflow", "initialize-ownership-model"],
  },
  "commerce-ops": {
    productClass: "commerce-ops",
    config: {
      label: "Commerce Operations",
      category: "commerce",
    },
    signals: ["catalog", "orders", "inventory", "merchant", "fulfillment"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-commerce-ops-shell", "initialize-order-queue", "initialize-catalog-operations"],
  },
  "mobile-app": {
    productClass: "mobile-app",
    config: {
      label: "Mobile App",
      category: "app",
    },
    signals: ["screens", "navigation", "mobile-runtime", "app-release"],
    releaseTargets: ["app-store", "play-store", "internal-distribution"],
    bootstrapRules: ["initialize-mobile-shell", "initialize-navigation", "initialize-mobile-auth"],
  },
  "landing-page": {
    productClass: "landing-page",
    config: {
      label: "Landing Page",
      category: "marketing",
    },
    signals: ["hero", "cta", "conversion", "marketing", "landing-page"],
    releaseTargets: ["web-deployment", "private-deployment"],
    bootstrapRules: ["initialize-landing-shell", "initialize-conversion-structure", "initialize-proof-sections"],
  },
  game: {
    productClass: "game",
    config: {
      label: "Game",
      category: "product",
    },
    signals: ["scenes", "gameplay", "hud", "playable-preview"],
    releaseTargets: ["game-build", "playable-preview"],
    bootstrapRules: ["initialize-game-shell", "initialize-gameplay-loop", "initialize-game-ui"],
  },
  "agency-system": {
    productClass: "internal-tool",
    config: {
      label: "Agency System",
      category: "operations",
    },
    signals: ["client-intake", "reporting", "ops-workflows"],
    releaseTargets: ["private-deployment", "web-deployment"],
    bootstrapRules: ["initialize-client-intake", "initialize-reporting-core"],
  },
  book: {
    productClass: "book",
    config: {
      label: "Book",
      category: "content",
    },
    signals: ["chapters", "outline", "manuscript"],
    releaseTargets: ["pdf-publishing", "epub-publishing"],
    bootstrapRules: ["initialize-outline", "initialize-chapter-structure"],
  },
  "content-product": {
    productClass: "content-product",
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
  const productClass = normalizeCanonicalProductClass(
    definition.productClass ?? domain,
    { fallback: "generic" },
  );
  const productClassProfile = resolveCanonicalProductClassProfile(productClass);

  return {
    domain,
    productClass,
    config: {
      label: definition.config?.label ?? productClassProfile.label ?? domain,
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
