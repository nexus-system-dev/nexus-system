function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const BASE_TEMPLATE = {
  params: ["projectName", "domain", "stack"],
  artifacts: ["project-root", "readme", "config"],
  dependencies: [],
};

const DOMAIN_TEMPLATES = {
  generic: {
    rules: ["create-initial-structure", "define-first-workflow"],
    artifacts: ["app-shell"],
  },
  casino: {
    rules: ["initialize-auth-core", "initialize-wallet-core", "initialize-game-flow"],
    artifacts: ["auth-module", "wallet-module", "game-flow"],
  },
  saas: {
    rules: ["initialize-app-shell", "initialize-auth-core", "initialize-billing-foundation"],
    artifacts: ["app-shell", "auth-module", "billing-module"],
  },
  "mobile-app": {
    rules: ["initialize-mobile-shell", "initialize-navigation", "initialize-mobile-auth"],
    artifacts: ["mobile-shell", "navigation", "mobile-auth"],
  },
  "agency-system": {
    rules: ["initialize-client-intake", "initialize-reporting-core"],
    artifacts: ["client-intake", "reporting-core"],
  },
  book: {
    rules: ["initialize-outline", "initialize-chapter-structure"],
    artifacts: ["outline", "chapter-structure"],
  },
  "content-product": {
    rules: ["initialize-content-outline", "initialize-delivery-structure"],
    artifacts: ["content-outline", "delivery-structure"],
  },
};

const PLATFORM_TEMPLATES = {
  web: {
    artifacts: ["web-entrypoint"],
    params: ["routing"],
  },
  ios: {
    artifacts: ["ios-target"],
    params: ["bundle-id"],
  },
  android: {
    artifacts: ["android-target"],
    params: ["application-id"],
  },
};

export function defineBootstrapTemplateSchema({
  domain = "generic",
  targetPlatform = null,
} = {}) {
  return {
    domain,
    targetPlatform,
    params: unique([...(BASE_TEMPLATE.params ?? [])]),
    artifacts: unique([...(BASE_TEMPLATE.artifacts ?? [])]),
    dependencies: unique([...(BASE_TEMPLATE.dependencies ?? [])]),
    rules: [],
  };
}

export function createBaseBootstrapTemplates(bootstrapTemplateSchema = {}) {
  return {
    ...bootstrapTemplateSchema,
    params: unique([...(bootstrapTemplateSchema.params ?? []), ...(BASE_TEMPLATE.params ?? [])]),
    artifacts: unique([...(bootstrapTemplateSchema.artifacts ?? []), ...(BASE_TEMPLATE.artifacts ?? [])]),
    dependencies: unique([
      ...(bootstrapTemplateSchema.dependencies ?? []),
      ...(BASE_TEMPLATE.dependencies ?? []),
    ]),
    rules: unique([...(bootstrapTemplateSchema.rules ?? [])]),
  };
}

export function createDomainBootstrapTemplates(domain = "generic") {
  const domainTemplate = DOMAIN_TEMPLATES[domain] ?? DOMAIN_TEMPLATES.generic;

  return {
    domain,
    artifacts: unique([...(domainTemplate.artifacts ?? [])]),
    dependencies: unique([...(domainTemplate.dependencies ?? [])]),
    rules: unique([...(domainTemplate.rules ?? [])]),
  };
}

export function createPlatformBootstrapTemplates(targetPlatform = null) {
  const platformTemplate = targetPlatform ? PLATFORM_TEMPLATES[targetPlatform] ?? {} : {};

  return {
    targetPlatform,
    params: unique([...(platformTemplate.params ?? [])]),
    artifacts: unique([...(platformTemplate.artifacts ?? [])]),
    dependencies: unique([...(platformTemplate.dependencies ?? [])]),
  };
}

export function createTemplateParameterResolver({
  template = null,
  recommendedDefaults = null,
  projectIntake = null,
} = {}) {
  const parameterValues = {
    projectName: projectIntake?.projectName ?? projectIntake?.name ?? "New Project",
    domain: template?.domain ?? recommendedDefaults?.domain ?? "generic",
    stack: recommendedDefaults?.stack ?? null,
    routing: recommendedDefaults?.stack?.frontend ? "app-router" : null,
    "bundle-id": projectIntake?.bundleId ?? null,
    "application-id": projectIntake?.applicationId ?? null,
  };

  return {
    ...(template ?? {}),
    parameterValues,
    resolvedParams: (template?.params ?? []).reduce((acc, param) => {
      acc[param] = parameterValues[param] ?? null;
      return acc;
    }, {}),
  };
}

export function createBootstrapTemplateMerger({
  baseTemplates = null,
  domainTemplates = null,
  platformTemplates = null,
} = {}) {
  return {
    ...(baseTemplates ?? {}),
    domain: domainTemplates?.domain ?? baseTemplates?.domain ?? "generic",
    targetPlatform: platformTemplates?.targetPlatform ?? baseTemplates?.targetPlatform ?? null,
    params: unique([
      ...(baseTemplates?.params ?? []),
      ...(platformTemplates?.params ?? []),
    ]),
    artifacts: unique([
      ...(baseTemplates?.artifacts ?? []),
      ...(domainTemplates?.artifacts ?? []),
      ...(platformTemplates?.artifacts ?? []),
    ]),
    dependencies: unique([
      ...(baseTemplates?.dependencies ?? []),
      ...(domainTemplates?.dependencies ?? []),
      ...(platformTemplates?.dependencies ?? []),
    ]),
    rules: unique([
      ...(baseTemplates?.rules ?? []),
      ...(domainTemplates?.rules ?? []),
    ]),
  };
}

export function createBootstrapTaskTemplates({
  domain = "generic",
  targetPlatform = null,
} = {}) {
  const domainTemplates = createDomainBootstrapTemplates(domain);
  const platformTemplates = createPlatformBootstrapTemplates(targetPlatform);
  const bootstrapTemplateSchema = defineBootstrapTemplateSchema({
    domain,
    targetPlatform,
  });
  const baseTemplates = createBaseBootstrapTemplates(bootstrapTemplateSchema);

  return createBootstrapTemplateMerger({
    baseTemplates,
    domainTemplates,
    platformTemplates,
  });
}
