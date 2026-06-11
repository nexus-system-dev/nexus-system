const PRODUCT_CLASS_DEFINITIONS = {
  "landing-page": {
    label: "דף נחיתה / שיווק",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "web-marketing-surface",
    previewFamily: "web-preview",
    runtimeFamily: "web-static",
    packagingFamily: "web-build",
    releasePathFamily: "web-deployment",
    bootstrapFamily: "landing-page-skeleton",
    aliases: [
      "landing page",
      "landing-page",
      "website",
      "marketing site",
      "marketing page",
      "homepage",
      "web site",
      "site",
      "marketing-site",
      "דף נחיתה",
      "אתר שיווקי",
      "שיווק",
    ],
  },
  "mobile-app": {
    label: "אפליקציה",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "mobile-app-surface",
    previewFamily: "mobile-simulator",
    runtimeFamily: "mobile-runtime",
    packagingFamily: "mobile-package",
    releasePathFamily: "app-distribution",
    bootstrapFamily: "mobile-app-skeleton",
    aliases: [
      "mobile app",
      "react native",
      "expo",
      "ios",
      "android",
      "native app",
      "אפליקציה",
    ],
  },
  "internal-tool": {
    label: "כלי פנימי",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "workspace-surface",
    previewFamily: "workspace-preview",
    runtimeFamily: "web-app-runtime",
    packagingFamily: "workspace-package",
    releasePathFamily: "private-workspace-release",
    bootstrapFamily: "internal-tool-skeleton",
    aliases: [
      "internal tool",
      "ops",
      "operations",
      "backoffice",
      "back office",
      "admin panel",
      "portal",
      "workspace",
      "queue",
      "routing",
      "handoff",
      "ownership",
      "תפעול",
      "צוות פנימי",
      "כלי פנימי",
      "תור עבודה",
    ],
  },
  "commerce-ops": {
    label: "מערכת מסחר ותפעול",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "commerce-workspace-surface",
    previewFamily: "commerce-workspace-preview",
    runtimeFamily: "web-app-runtime",
    packagingFamily: "commerce-workspace-package",
    releasePathFamily: "commerce-web-release",
    bootstrapFamily: "commerce-ops-skeleton",
    aliases: [
      "ecommerce",
      "commerce",
      "shop",
      "store",
      "catalog",
      "checkout",
      "cart",
      "order",
      "orders",
      "inventory",
      "merchant",
      "fulfillment",
      "catalog ops",
      "order queue",
      "מסחר",
      "קטלוג",
      "הזמנות",
      "מלאי",
    ],
  },
  saas: {
    label: "מוצר SaaS / follow-up",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "saas-product-surface",
    previewFamily: "product-workspace-preview",
    runtimeFamily: "web-app-runtime",
    packagingFamily: "saas-package",
    releasePathFamily: "web-product-release",
    bootstrapFamily: "saas-skeleton",
    aliases: [
      "saas",
      "subscription",
      "billing",
      "activation",
      "onboarding",
      "mvp",
      "web app",
      "platform",
      "crm",
      "customer",
      "client",
      "follow-up",
      "follow up",
      "reminder",
      "dashboard",
      "מערכת",
      "כלי",
      "לקוחות",
      "מנוי",
      "small-saas",
    ],
  },
  game: {
    label: "משחק",
    executionMaturity: "wave4-extended",
    buildSurfaceFamily: "game-surface",
    previewFamily: "playable-preview",
    runtimeFamily: "game-runtime",
    packagingFamily: "game-package",
    releasePathFamily: "game-release",
    bootstrapFamily: "game-skeleton",
    aliases: ["game", "unity", "unreal", "gameplay", "hud", "משחק"],
  },
  "software-tool": {
    label: "כלי תוכנה",
    executionMaturity: "wave4-core",
    buildSurfaceFamily: "tool-surface",
    previewFamily: "tool-control-preview",
    runtimeFamily: "tool-runtime",
    packagingFamily: "tool-package",
    releasePathFamily: "private-tool-release",
    bootstrapFamily: "software-tool-skeleton",
    aliases: [
      "software tool",
      "tool",
      "utility",
      "calculator",
      "generator",
      "processor",
      "text cleanup",
      "text tool",
      "כלי תוכנה",
      "כלי",
      "מחולל",
      "מחשבון",
      "מעבד טקסט",
    ],
  },
  book: {
    label: "ספר",
    executionMaturity: "wave4-extended",
    buildSurfaceFamily: "content-outline-surface",
    previewFamily: "document-preview",
    runtimeFamily: "document-runtime",
    packagingFamily: "publishing-package",
    releasePathFamily: "document-publishing",
    bootstrapFamily: "book-outline-skeleton",
    aliases: ["book", "ebook", "chapter", "chapters", "manuscript", "ספר", "פרק"],
  },
  "content-product": {
    label: "מוצר תוכן",
    executionMaturity: "wave4-extended",
    buildSurfaceFamily: "content-delivery-surface",
    previewFamily: "content-preview",
    runtimeFamily: "content-runtime",
    packagingFamily: "content-package",
    releasePathFamily: "content-release",
    bootstrapFamily: "content-product-skeleton",
    aliases: ["course", "workshop", "module", "modules", "lesson", "content product", "קורס", "שיעור"],
  },
  generic: {
    label: "פרויקט",
    executionMaturity: "fallback-only",
    buildSurfaceFamily: "generic-surface",
    previewFamily: "generic-preview",
    runtimeFamily: "generic-runtime",
    packagingFamily: "generic-package",
    releasePathFamily: "private-deployment",
    bootstrapFamily: "generic-skeleton",
    aliases: ["generic", "project", "פרויקט"],
  },
};

const PRODUCT_CLASS_ALIAS_MAP = new Map(
  Object.entries(PRODUCT_CLASS_DEFINITIONS).flatMap(([productClass, definition]) => [
    [productClass, productClass],
    ...definition.aliases.map((alias) => [alias.toLowerCase(), productClass]),
  ]),
);

const PRODUCT_CLASS_DETECTION_ORDER = [
  "landing-page",
  "mobile-app",
  "commerce-ops",
  "internal-tool",
  "saas",
  "game",
  "software-tool",
  "book",
  "content-product",
];

function normalizeFreeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeTextCollection(values = []) {
  return values
    .flat(Infinity)
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");
}

export function listCanonicalProductClasses({ includeGeneric = true } = {}) {
  const classes = Object.keys(PRODUCT_CLASS_DEFINITIONS);
  return includeGeneric ? classes : classes.filter((productClass) => productClass !== "generic");
}

export function normalizeCanonicalProductClass(value, { fallback = "unknown" } = {}) {
  const normalized = normalizeFreeText(value);
  if (!normalized) {
    return fallback;
  }

  return PRODUCT_CLASS_ALIAS_MAP.get(normalized) ?? fallback;
}

export function resolveCanonicalProductClassLabel(productClass) {
  const normalized = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  return PRODUCT_CLASS_DEFINITIONS[normalized]?.label ?? PRODUCT_CLASS_DEFINITIONS.generic.label;
}

export function resolveCanonicalProductClassProfile(productClass) {
  const normalized = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  return {
    productClass: normalized,
    ...PRODUCT_CLASS_DEFINITIONS[normalized],
  };
}

export function detectCanonicalProductClass(text = "", { fallback = "unknown" } = {}) {
  const normalized = normalizeFreeText(text);
  if (!normalized) {
    return fallback;
  }

  let winningClass = fallback;
  let winningScore = 0;

  for (const productClass of PRODUCT_CLASS_DETECTION_ORDER) {
    const aliases = PRODUCT_CLASS_DEFINITIONS[productClass]?.aliases ?? [];
    const score = aliases.reduce((total, alias) => (normalized.includes(alias.toLowerCase()) ? total + 1 : total), 0);
    if (score > winningScore) {
      winningClass = productClass;
      winningScore = score;
    }
  }

  return winningClass;
}

export function resolveCanonicalProductClass({
  explicitClass = "",
  hintedClass = "",
  texts = [],
  fallback = "unknown",
} = {}) {
  const normalizedExplicitClass = normalizeCanonicalProductClass(explicitClass, { fallback: "unknown" });
  if (normalizedExplicitClass !== "unknown") {
    return {
      productClass: normalizedExplicitClass,
      source: "explicit",
    };
  }

  const normalizedHintedClass = normalizeCanonicalProductClass(hintedClass, { fallback: "unknown" });
  if (normalizedHintedClass !== "unknown") {
    return {
      productClass: normalizedHintedClass,
      source: "hint",
    };
  }

  const detectedProductClass = detectCanonicalProductClass(normalizeTextCollection(texts), { fallback });
  return {
    productClass: detectedProductClass,
    source: detectedProductClass === fallback ? "fallback" : "detected",
  };
}
