function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

const FIRST_RELEASE_GROWTH_PLUGIN_REGISTRY = [
  {
    pluginId: "social-campaign-draft",
    taskId: "GROW-AGT-002",
    userIntentLabel: "קמפיין חברתי",
    internalCapability: "social-campaign",
    whenToUse: ["launch-message", "social-learning", "founder-story", "product-update"],
    whenNotToUse: ["paid-boost", "direct-message", "comment-moderation", "unsupported-provider"],
    draftOnlyByDefault: true,
    providerRequiredForExternalAction: true,
    approvalRequiredForExternalAction: true,
    providerRequirements: {
      firstReleaseRealProviders: ["instagram", "facebook"],
      draftOnlyProviders: ["tiktok", "linkedin", "youtube", "x"],
      requiredScopes: ["social-draft", "schedule", "publish"],
    },
    allowedActions: ["prepare-post-drafts", "prepare-creative-brief", "propose-schedule"],
    blockedActions: ["publish", "schedule", "reply", "delete", "direct-message", "spend", "claim-virality"],
    productHistorySummaryShape: "טיוטת קמפיין חברתי עם מסר, נכס מקור, אישור נדרש ומדד קטן.",
    smallSuccessMetric: "לקבל 3 תגובות איכותיות מתוך 10 פניות או חשיפות מאושרות.",
    status: "available-draft",
  },
  {
    pluginId: "seo-page-draft",
    taskId: "GROW-SEO-001",
    userIntentLabel: "חיפוש אורגני",
    internalCapability: "seo",
    whenToUse: ["search-intent", "page-structure", "faq", "message-clarity"],
    whenNotToUse: ["ranking-guarantee", "search-console-results", "public-publish-without-gate"],
    draftOnlyByDefault: true,
    providerRequiredForExternalAction: false,
    approvalRequiredForExternalAction: true,
    providerRequirements: {
      optionalProviders: ["google-search-console"],
      requiredScopes: [],
    },
    allowedActions: ["draft-title", "draft-meta", "draft-faq", "propose-page-structure"],
    blockedActions: ["promise-ranking", "fabricate-search-volume", "publish-public-page"],
    productHistorySummaryShape: "טיוטת חיפוש עם כותרת, תיאור, שאלות ותיקוני מסר לאישור.",
    smallSuccessMetric: "בודק מבין מה העמוד מציע מתוך הכותרת והפתיחה.",
    status: "available-draft",
  },
  {
    pluginId: "paid-test-draft",
    taskId: "GROW-SEM-001",
    userIntentLabel: "פרסום ממומן",
    internalCapability: "sem-paid-test",
    whenToUse: ["paid-search-test", "ad-copy", "budget-hypothesis", "landing-path-exists"],
    whenNotToUse: ["no-landing-or-demo", "no-measurement", "budget-not-approved", "paid-social-boost-without-sem"],
    draftOnlyByDefault: true,
    providerRequiredForExternalAction: true,
    approvalRequiredForExternalAction: true,
    providerRequirements: {
      firstReleaseRealProviders: ["google-ads"],
      draftOnlyProviders: ["meta-ads", "tiktok-ads", "linkedin-ads"],
      requiredScopes: ["ad-draft", "spend-approval"],
    },
    allowedActions: ["draft-ad-copy", "draft-audience", "draft-budget-request"],
    blockedActions: ["spend", "activate-campaign", "raise-budget", "claim-leads"],
    productHistorySummaryShape: "טיוטת ניסוי ממומן עם קהל, מסר, תקציב לאישור ומדד לפני הוצאה.",
    smallSuccessMetric: "לאשר אם המסר ברור לפני שקל אחד של הוצאה.",
    status: "available-draft",
  },
  {
    pluginId: "email-draft",
    taskId: "GROW-EMAIL-001",
    userIntentLabel: "אימייל",
    internalCapability: "email-campaign",
    whenToUse: ["email-draft", "test-send", "sequence-copy", "known-audience"],
    whenNotToUse: ["unknown-audience-source", "scraped-contacts", "bulk-send-by-default", "fabricated-email-results"],
    draftOnlyByDefault: true,
    providerRequiredForExternalAction: true,
    approvalRequiredForExternalAction: true,
    providerRequirements: {
      preferredProviders: ["mailchimp", "sendgrid"],
      limitedProviders: ["gmail"],
      optionalProviders: ["convertkit"],
      requiredScopes: ["email-draft", "test-send", "send"],
    },
    allowedActions: ["draft-subject", "draft-body", "prepare-test-send"],
    blockedActions: ["send-audience", "scrape-contacts", "fabricate-open-rate"],
    productHistorySummaryShape: "טיוטת מייל עם מקור קהל, מצב אישור, ספק נדרש ומדד למידה.",
    smallSuccessMetric: "נמען בדיקה אחד מבין את ההצעה ומשיב אם זה רלוונטי.",
    status: "available-draft",
  },
  {
    pluginId: "landing-experiment-draft",
    taskId: "GROW-LAND-001",
    userIntentLabel: "דף נחיתה",
    internalCapability: "landing-experiment",
    whenToUse: ["message-test", "audience-specific-page", "cta-test", "lead-form-draft"],
    whenNotToUse: ["unclear-audience", "no-product-direction", "public-publish-without-share-or-release", "fake-testimonial"],
    draftOnlyByDefault: true,
    providerRequiredForExternalAction: false,
    approvalRequiredForExternalAction: true,
    providerRequirements: {
      optionalProviders: [],
      requiredScopes: [],
    },
    allowedActions: ["draft-hero", "draft-form", "draft-message-test"],
    blockedActions: ["publish-public-page", "change-product-truth-without-mutation", "claim-conversions"],
    productHistorySummaryShape: "טיוטת ניסוי דף נחיתה עם קהל, מסר, קריאה לפעולה ומדידת בסיס.",
    smallSuccessMetric: "3 מתוך 5 צופים מבינים למי העמוד ומה הערך.",
    status: "available-draft",
  },
  {
    pluginId: "measurement-plan",
    taskId: "GROW-MEASURE-001",
    userIntentLabel: "מדידה",
    internalCapability: "growth-measurement",
    whenToUse: ["define-metric", "manual-observation", "internal-event", "provider-result-intake"],
    whenNotToUse: ["source-less-metric", "fake-result", "success-claim-from-hypothesis"],
    draftOnlyByDefault: false,
    providerRequiredForExternalAction: false,
    approvalRequiredForExternalAction: false,
    providerRequirements: {
      optionalProviders: ["google-analytics", "search-console", "provider-results"],
      requiredScopes: ["read-results"],
    },
    allowedActions: ["define-event", "define-baseline", "mark-data-source"],
    blockedActions: ["fabricate-metrics", "claim-conversion", "change-product-directly"],
    productHistorySummaryShape: "מדידה עם מקור, זמן, מדד, רמת ביטחון וקישור לפעולת צמיחה.",
    smallSuccessMetric: "מדד אחד נאסף ממקור אמיתי ולא מהשערה.",
    status: "available-internal",
  },
];

const FIRST_RELEASE_GROWTH_PLUGIN_IDS = new Set(
  FIRST_RELEASE_GROWTH_PLUGIN_REGISTRY.map((plugin) => plugin.pluginId),
);

function cloneRegistryEntry(entry) {
  return {
    ...entry,
    whenToUse: normalizeArray(entry.whenToUse).map((item) => normalizeString(item)).filter(Boolean),
    whenNotToUse: normalizeArray(entry.whenNotToUse).map((item) => normalizeString(item)).filter(Boolean),
    allowedActions: normalizeArray(entry.allowedActions).map((item) => normalizeString(item)).filter(Boolean),
    blockedActions: normalizeArray(entry.blockedActions).map((item) => normalizeString(item)).filter(Boolean),
    providerRequirements: {
      ...normalizeObject(entry.providerRequirements),
      firstReleaseRealProviders: normalizeArray(entry.providerRequirements?.firstReleaseRealProviders).map((item) => normalizeString(item)).filter(Boolean),
      draftOnlyProviders: normalizeArray(entry.providerRequirements?.draftOnlyProviders).map((item) => normalizeString(item)).filter(Boolean),
      preferredProviders: normalizeArray(entry.providerRequirements?.preferredProviders).map((item) => normalizeString(item)).filter(Boolean),
      limitedProviders: normalizeArray(entry.providerRequirements?.limitedProviders).map((item) => normalizeString(item)).filter(Boolean),
      optionalProviders: normalizeArray(entry.providerRequirements?.optionalProviders).map((item) => normalizeString(item)).filter(Boolean),
      requiredScopes: normalizeArray(entry.providerRequirements?.requiredScopes).map((item) => normalizeString(item)).filter(Boolean),
    },
  };
}

export function buildFirstReleaseGrowthPluginRegistry() {
  return {
    taskId: "GROW-PLUG-002",
    registryId: "first-release-growth-plugin-registry:v1",
    status: "ready",
    userFacingMode: "simple-intents-not-marketplace",
    marketplaceMode: false,
    plugins: FIRST_RELEASE_GROWTH_PLUGIN_REGISTRY.map(cloneRegistryEntry),
    simpleIntentLabels: FIRST_RELEASE_GROWTH_PLUGIN_REGISTRY.map((entry) => ({
      pluginId: entry.pluginId,
      label: entry.userIntentLabel,
    })),
    boundaries: {
      internalRegistryOnly: true,
      draftModeWorksWithoutProvider: true,
      providerConnectionIsNotApproval: true,
      noExternalActionWithoutApprovalAndScope: true,
      noFakeMetricsOrOutcomeClaims: true,
      productHistoryRequired: true,
    },
    unsupportedPluginPolicy: {
      status: "unavailable",
      userMessage: "היכולת הזו לא פתוחה בשחרור הראשון, ולכן Nexus לא תעמיד פנים שהיא ביצעה אותה.",
    },
  };
}

function lookupRegistryPlugin(pluginId) {
  return FIRST_RELEASE_GROWTH_PLUGIN_REGISTRY.find((plugin) => plugin.pluginId === pluginId) ?? null;
}

function hasProductTruth(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  return Boolean(
    safeProject.runtimeSkeletonTruth
      ?? context.runtimeSkeletonTruth
      ?? state.runtimeSkeletonTruth
      ?? safeProject.productDomainSkeleton
      ?? context.productDomainSkeleton
      ?? state.productDomainSkeleton
      ?? safeProject.productOwnedBackendSkeleton
      ?? context.productOwnedBackendSkeleton
      ?? state.productOwnedBackendSkeleton
      ?? safeProject.shareDemoAgent
      ?? context.shareDemoAgent
      ?? state.shareDemoAgent
      ?? safeProject.releaseWorkspace
      ?? context.releaseWorkspace
      ?? state.releaseWorkspace,
  );
}

function resolveRuntime(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  return normalizeObject(
    safeProject.runtimeSkeletonTruth
      ?? context.runtimeSkeletonTruth
      ?? state.runtimeSkeletonTruth,
  );
}

function resolveAudience(project) {
  const safeProject = normalizeObject(project);
  const growthWorkspace = normalizeObject(
    safeProject.growthWorkspace
      ?? safeProject.context?.growthWorkspace
      ?? safeProject.state?.growthWorkspace,
  );
  const strategy = normalizeObject(growthWorkspace.strategy);
  const goal = normalizeString(safeProject.goal, "");
  if (/ליד|lead|וואטסאפ|whatsapp|שיחה/u.test(goal)) {
    return "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ";
  }
  return normalizeString(strategy.targetAudience ?? safeProject.targetAudience);
}

function resolveCoreValue(project) {
  const safeProject = normalizeObject(project);
  const goal = normalizeString(safeProject.goal);
  if (/ליד|lead|וואטסאפ|whatsapp|שיחה/u.test(goal)) {
    return "לעזור לטפל בלידים בלי לפספס אחראי, תזכורת וצעד הבא";
  }
  return normalizeString(safeProject.coreValue ?? safeProject.valueProposition ?? safeProject.summary);
}

function resolveShowableArtifact(project) {
  const safeProject = normalizeObject(project);
  const runtime = resolveRuntime(safeProject);
  return normalizeString(
    runtime.title
      ?? safeProject.artifactTitle
      ?? safeProject.name,
  );
}

function buildReadiness(project) {
  const audience = resolveAudience(project);
  const coreValue = resolveCoreValue(project);
  const showableArtifact = resolveShowableArtifact(project);
  const productTruthAvailable = hasProductTruth(project);
  const missing = [];

  if (!productTruthAvailable) missing.push("שלד או תוצר מוצרי");
  if (!audience) missing.push("קהל ברור");
  if (!coreValue) missing.push("ערך מרכזי ברור");
  if (!showableArtifact) missing.push("מסך, דמו או תוצר שאפשר להראות");

  return {
    canUseGrowthPlugin: missing.length === 0,
    productTruthAvailable,
    audience: audience || "קהל היעד עדיין לא ברור",
    coreValue: coreValue || "הערך המרכזי עדיין לא חד",
    showableArtifact: showableArtifact || "אין עדיין תוצר שאפשר להראות",
    missing,
  };
}

function pluginDefinition(id, overrides = {}) {
  const registryEntry = lookupRegistryPlugin(id);
  const base = {
    pluginId: id,
    taskId: "GROW-PLUG-001",
    label: "צעד צמיחה מוגבל",
    userIntentLabel: "למידה ממשתמשים",
    channelSecondaryLabel: "ללא ערוץ חיצוני",
    status: "selected",
    draftOnly: true,
    providerRequired: false,
    approvalRequired: false,
    providerScopeRequired: [],
    smallSuccessMetric: "לקבל סימן למידה קטן ואמיתי בלי להבטיח תוצאה.",
    handoffRequired: "none",
    allowedActions: ["prepare-draft", "define-metric"],
    blockedActions: ["publish", "schedule", "send", "spend", "claim-results"],
    whyThisPlugin: "הצעד מחובר לתוצר שאפשר להראות עכשיו.",
    outputEnvelope: {
      includesProductLinkage: true,
      includesApprovalState: true,
      includesProviderBoundary: true,
      includesSmallSuccessMetric: true,
      recordsProductHistory: true,
    },
  };
  const merged = {
    ...base,
    ...(registryEntry ? {
      registryTaskId: "GROW-PLUG-002",
      registryStatus: registryEntry.status,
      registryCapability: registryEntry.internalCapability,
      userIntentLabel: registryEntry.userIntentLabel,
      providerScopeRequired: registryEntry.providerRequirements?.requiredScopes ?? [],
      productHistorySummaryShape: registryEntry.productHistorySummaryShape,
      firstReleaseRegistered: true,
    } : {
      firstReleaseRegistered: false,
    }),
    ...overrides,
  };

  return {
    ...merged,
    firstReleaseRegistered: FIRST_RELEASE_GROWTH_PLUGIN_IDS.has(id) || merged.firstReleaseRegistered === true,
  };
}

function blockedPlugin(readiness) {
  return pluginDefinition("product-readiness-blocker", {
    status: "needs-product-first",
    label: "קודם סוגרים תוצר ברור",
    userIntentLabel: "סגירת אמת מוצר",
    channelSecondaryLabel: "אין ערוץ צמיחה",
    draftOnly: true,
    providerRequired: false,
    approvalRequired: false,
    smallSuccessMetric: "המשתמש מבין בתוך דקה מה המוצר עושה ולמי הוא עוזר.",
    whyThisPlugin: "אי אפשר לבחור יכולת צמיחה בלי תוצר, קהל, ערך ומסך שאפשר להראות.",
    blockedActions: ["campaign", "seo", "email-send", "ad-spend", "publish", "claim-results"],
    readiness,
  });
}

function resolvePrimaryPlugin({ input, readiness }) {
  if (!readiness.canUseGrowthPlugin) {
    return blockedPlugin(readiness);
  }

  if (includesAny(input, [/follow.?up|מעקב|היום|today/u])) {
    return pluginDefinition("product-improvement-handoff", {
      label: "שיפור מוצר לפני צמיחה",
      userIntentLabel: "שיפור מוצר",
      channelSecondaryLabel: "מוטציית מוצר",
      status: "handoff-required",
      draftOnly: true,
      providerRequired: false,
      approvalRequired: true,
      smallSuccessMetric: "בודק מבין מיד מי צריך טיפול היום.",
      handoffRequired: "mutation-change-agent",
      allowedActions: ["prepare-mutation-brief"],
      blockedActions: ["mutate-without-approval", "publish", "claim-growth-result"],
      whyThisPlugin: "הבקשה משנה את המוצר עצמו ולכן לא רצה כקמפיין.",
    });
  }

  if (includesAny(input, [/seo|search|google|חיפוש|קידום אורגני/u])) {
    return pluginDefinition("seo-page-draft", {
      label: "טיוטת שיפור חיפוש",
      userIntentLabel: "חיפוש אורגני",
      channelSecondaryLabel: "מבנה עמוד ותוכן",
      status: "needs-approval",
      providerRequired: false,
      approvalRequired: true,
      smallSuccessMetric: "בודק מבין מה העמוד מציע מתוך הכותרת והפתיחה.",
      handoffRequired: "visual-build-agent",
      allowedActions: ["draft-title", "draft-meta", "draft-faq", "propose-page-structure"],
      blockedActions: ["promise-ranking", "fabricate-search-volume", "publish-public-page"],
      whyThisPlugin: "הצעד משפר עמוד קיים או דמו, אבל לא מבטיח דירוג או תנועה.",
    });
  }

  if (includesAny(input, [/ad|ads|sem|paid|budget|תקציב|מודעה|ממומן/u])) {
    return pluginDefinition("paid-test-draft", {
      label: "טיוטת ניסוי ממומן",
      userIntentLabel: "פרסום ממומן",
      channelSecondaryLabel: "טיוטה בלבד",
      status: "needs-provider",
      providerRequired: true,
      approvalRequired: true,
      providerScopeRequired: ["ad-draft", "spend-approval"],
      smallSuccessMetric: "לאשר אם המסר ברור לפני שקל אחד של הוצאה.",
      handoffRequired: "none",
      allowedActions: ["draft-ad-copy", "draft-audience", "draft-budget-request"],
      blockedActions: ["spend", "activate-campaign", "raise-budget", "claim-leads"],
      whyThisPlugin: "פרסום ממומן מסוכן בלי אישור, ספק, תקציב ומדידה.",
    });
  }

  if (includesAny(input, [/email|mail|newsletter|מייל|אימייל|ניוזלטר/u])) {
    return pluginDefinition("email-draft", {
      label: "טיוטת פנייה במייל",
      userIntentLabel: "אימייל",
      channelSecondaryLabel: "טיוטה או שליחת בדיקה",
      status: "needs-approval",
      providerRequired: true,
      approvalRequired: true,
      providerScopeRequired: ["email-draft", "test-send"],
      smallSuccessMetric: "נמען בדיקה אחד מבין את ההצעה ומשיב אם זה רלוונטי.",
      allowedActions: ["draft-subject", "draft-body", "prepare-test-send"],
      blockedActions: ["send-audience", "scrape-contacts", "fabricate-open-rate"],
      whyThisPlugin: "מייל יכול להתחיל כטיוטה, אבל שליחה אמיתית דורשת אישור וספק.",
    });
  }

  if (includesAny(input, [/send|client|demo|share|לשלוח|לקוחות|סקירה|דמו/u])) {
    return pluginDefinition("share-demo-handoff", {
      label: "הכנת דמו בטוח לשליחה",
      userIntentLabel: "שיתוף ודמו",
      channelSecondaryLabel: "סקירה פרטית",
      status: "handoff-required",
      draftOnly: true,
      providerRequired: false,
      approvalRequired: true,
      smallSuccessMetric: "3 מתוך 5 צופים מבינים את הערך המרכזי בתוך דקה.",
      handoffRequired: "share-demo-agent",
      allowedActions: ["prepare-safe-demo-brief"],
      blockedActions: ["public-link-without-approval", "expose-private-project", "claim-release"],
      whyThisPlugin: "הכוונה היא לקבל תגובה על תוצר קיים, לא לפרסם צמיחה רחבה.",
    });
  }

  if (includesAny(input, [/landing|page|דף נחיתה|עמוד נחיתה/u])) {
    return pluginDefinition("landing-experiment-draft", {
      label: "ניסוי דף נחיתה",
      userIntentLabel: "דף נחיתה",
      channelSecondaryLabel: "טיוטת מסר",
      status: "needs-approval",
      providerRequired: false,
      approvalRequired: true,
      smallSuccessMetric: "3 מתוך 5 צופים מבינים למי העמוד ומה הערך.",
      handoffRequired: "visual-build-agent",
      allowedActions: ["draft-hero", "draft-form", "draft-message-test"],
      blockedActions: ["publish-public-page", "change-product-truth-without-mutation", "claim-conversions"],
      whyThisPlugin: "דף נחיתה הוא ניסוי מסר שמחובר למוצר, לא אמת מוצר חדשה בפני עצמה.",
    });
  }

  if (includesAny(input, [/measure|analytics|metric|מדידה|אנליטיקה|נתונים/u])) {
    return pluginDefinition("measurement-plan", {
      label: "מדידה מינימלית",
      userIntentLabel: "מדידה",
      channelSecondaryLabel: "מדד קטן",
      status: "selected",
      providerRequired: false,
      approvalRequired: false,
      smallSuccessMetric: "מדד אחד נאסף ממקור אמיתי ולא מהשערה.",
      handoffRequired: "analytics-measurement-plugin",
      allowedActions: ["define-event", "define-baseline", "mark-data-source"],
      blockedActions: ["fabricate-metrics", "claim-conversion", "change-product-directly"],
      whyThisPlugin: "הבקשה עוסקת בלמידה ממדד, לא בשינוי מוצר או פרסום.",
    });
  }

  if (includesAny(input, [/campaign|launch|post|social|קמפיין|השקה|פרסום|פוסט/u])) {
    return pluginDefinition("social-campaign-draft", {
      label: "טיוטת קמפיין קטן",
      userIntentLabel: "קמפיין חברתי",
      channelSecondaryLabel: "טיוטות לפני פרסום",
      status: "needs-approval",
      providerRequired: true,
      approvalRequired: true,
      providerScopeRequired: ["social-draft", "schedule", "publish"],
      smallSuccessMetric: "לקבל 3 תגובות איכותיות מתוך 10 פניות או חשיפות מאושרות.",
      handoffRequired: "social-campaign-execution-agent",
      allowedActions: ["prepare-post-drafts", "prepare-creative-brief", "propose-schedule"],
      blockedActions: ["publish", "schedule", "reply", "delete", "direct-message", "spend", "claim-virality"],
      whyThisPlugin: "אפשר להכין קמפיין קטן, אבל שום פעולה חיצונית לא קורית בלי אישור וספק.",
    });
  }

  return pluginDefinition("audience-understanding-test", {
    label: "בדיקת הבנת קהל",
    userIntentLabel: "למידה ממשתמשים",
    channelSecondaryLabel: "שיחה ידנית או דמו",
    status: "selected",
    providerRequired: false,
    approvalRequired: false,
    smallSuccessMetric: "3 מתוך 5 משתמשים מבינים את הערך בתוך דקה.",
    allowedActions: ["prepare-demo-script", "prepare-feedback-question", "define-small-sample"],
    blockedActions: ["publish", "schedule", "send-bulk", "claim-results"],
    whyThisPlugin: "זה הצעד הקטן ביותר שמלמד משהו אמיתי בלי להפעיל ספק חיצוני.",
  });
}

function buildAlternatives(primaryPlugin) {
  if (primaryPlugin.status === "needs-product-first") {
    return [];
  }
  if (primaryPlugin.pluginId === "audience-understanding-test") {
    return [
      {
        pluginId: "share-demo-handoff",
        label: "דמו בטוח",
        tradeoff: "מהיר יותר לשליחה, אבל דורש בחירת תוכן ואישור שיתוף.",
      },
    ];
  }
  if (primaryPlugin.pluginId === "social-campaign-draft") {
    return [
      {
        pluginId: "audience-understanding-test",
        label: "בדיקת קהל ידנית",
        tradeoff: "פחות נוצץ, אבל לא דורש ספק חיצוני או אישור פרסום.",
      },
    ];
  }
  return [];
}

export function buildGrowthPluginLayer({ project = null, userInput = "" } = {}) {
  const safeProject = normalizeObject(project);
  const input = normalizeString(userInput).toLowerCase();
  const readiness = buildReadiness(safeProject);
  const primaryPlugin = resolvePrimaryPlugin({ input, readiness });
  const alternatives = buildAlternatives(primaryPlugin);
  const registry = buildFirstReleaseGrowthPluginRegistry();

  return {
    taskId: "GROW-PLUG-001",
    layerId: `growth-plugin-layer:${normalizeString(safeProject.id, "unknown-project")}`,
    status: primaryPlugin.status,
    productGoal: normalizeString(userInput, "למצוא את צעד הצמיחה הקטן הבא"),
    readiness,
    selectionPolicy: {
      onePrimaryRecommendation: true,
      channelIsSecondary: true,
      selectionOrder: ["product-fit", "learning-speed", "risk", "cost", "user-acquisition-potential"],
      alternativesOnlyWhenTradeoffIsReal: true,
    },
    primaryPlugin,
    alternatives,
    registry,
    registrySelection: {
      taskId: "GROW-PLUG-002",
      selectedPluginId: primaryPlugin.pluginId,
      selectedPluginRegistered: primaryPlugin.firstReleaseRegistered === true,
      unsupportedPluginStatus: primaryPlugin.firstReleaseRegistered === true
        ? "registered"
        : primaryPlugin.pluginId === "product-readiness-blocker" || primaryPlugin.handoffRequired !== "none"
          ? "outside-growth-registry-with-explicit-boundary"
          : "unavailable",
      userFacingMode: registry.userFacingMode,
    },
    boundaries: {
      draftOnlyWithoutProvider: true,
      noExternalActionWithoutApproval: true,
      noProviderBecomesProductTruthOwner: true,
      noFabricatedMetrics: true,
      noTrafficRevenueViralityPromise: true,
      productChangesRouteToMutation: true,
      visualChangesRouteToVisualBuild: true,
      shareVisibilityRoutesToShareDemo: true,
      releaseVisibilityRoutesToRelease: true,
      resultTruthRoutesToMeasurement: true,
    },
    historySummary: {
      shouldRecord: readiness.canUseGrowthPlugin,
      summary: readiness.canUseGrowthPlugin
        ? `${primaryPlugin.label}: ${primaryPlugin.smallSuccessMetric}`
        : "צמיחה נחסמה עד שיש תוצר, קהל, ערך ומסך שאפשר להראות.",
    },
  };
}

export function summarizeGrowthPluginLayer(layer = {}) {
  const safeLayer = normalizeObject(layer);
  const primaryPlugin = normalizeObject(safeLayer.primaryPlugin);
  const readiness = normalizeObject(safeLayer.readiness);
  const registry = normalizeObject(safeLayer.registry);
  return {
    taskId: normalizeString(safeLayer.taskId, "GROW-PLUG-001"),
    status: normalizeString(safeLayer.status, "needs-product-first"),
    canUseGrowthPlugin: readiness.canUseGrowthPlugin === true,
    audience: normalizeString(readiness.audience, "קהל היעד עדיין לא ברור"),
    coreValue: normalizeString(readiness.coreValue, "הערך המרכזי עדיין לא חד"),
    showableArtifact: normalizeString(readiness.showableArtifact, "אין עדיין תוצר שאפשר להראות"),
    missing: normalizeArray(readiness.missing).map((item) => normalizeString(item)).filter(Boolean),
    primaryPlugin: {
      pluginId: normalizeString(primaryPlugin.pluginId, "product-readiness-blocker"),
      label: normalizeString(primaryPlugin.label, "קודם סוגרים תוצר ברור"),
      userIntentLabel: normalizeString(primaryPlugin.userIntentLabel, "סגירת אמת מוצר"),
      channelSecondaryLabel: normalizeString(primaryPlugin.channelSecondaryLabel, "אין ערוץ צמיחה"),
      status: normalizeString(primaryPlugin.status, "needs-product-first"),
      draftOnly: primaryPlugin.draftOnly !== false,
      providerRequired: primaryPlugin.providerRequired === true,
      approvalRequired: primaryPlugin.approvalRequired === true,
      handoffRequired: normalizeString(primaryPlugin.handoffRequired, "none"),
      smallSuccessMetric: normalizeString(primaryPlugin.smallSuccessMetric, "מדד הצלחה קטן עוד לא הוגדר"),
      whyThisPlugin: normalizeString(primaryPlugin.whyThisPlugin, "הצעד חייב להיות מחובר לתוצר."),
      allowedActions: normalizeArray(primaryPlugin.allowedActions).map((item) => normalizeString(item)).filter(Boolean),
      blockedActions: normalizeArray(primaryPlugin.blockedActions).map((item) => normalizeString(item)).filter(Boolean),
      firstReleaseRegistered: primaryPlugin.firstReleaseRegistered === true,
      registryTaskId: normalizeString(primaryPlugin.registryTaskId, primaryPlugin.firstReleaseRegistered === true ? "GROW-PLUG-002" : ""),
      registryCapability: normalizeString(primaryPlugin.registryCapability),
      productHistorySummaryShape: normalizeString(primaryPlugin.productHistorySummaryShape),
    },
    registry: {
      taskId: normalizeString(registry.taskId, "GROW-PLUG-002"),
      registryId: normalizeString(registry.registryId, "first-release-growth-plugin-registry:v1"),
      status: normalizeString(registry.status, "ready"),
      userFacingMode: normalizeString(registry.userFacingMode, "simple-intents-not-marketplace"),
      marketplaceMode: registry.marketplaceMode === true,
      plugins: normalizeArray(registry.plugins)
        .map((item) => normalizeObject(item))
        .map((item) => ({
          pluginId: normalizeString(item.pluginId),
          taskId: normalizeString(item.taskId),
          userIntentLabel: normalizeString(item.userIntentLabel),
          internalCapability: normalizeString(item.internalCapability),
          status: normalizeString(item.status),
          draftOnlyByDefault: item.draftOnlyByDefault !== false,
          providerRequiredForExternalAction: item.providerRequiredForExternalAction === true,
          approvalRequiredForExternalAction: item.approvalRequiredForExternalAction === true,
          whenToUse: normalizeArray(item.whenToUse).map((entry) => normalizeString(entry)).filter(Boolean),
          whenNotToUse: normalizeArray(item.whenNotToUse).map((entry) => normalizeString(entry)).filter(Boolean),
          allowedActions: normalizeArray(item.allowedActions).map((entry) => normalizeString(entry)).filter(Boolean),
          blockedActions: normalizeArray(item.blockedActions).map((entry) => normalizeString(entry)).filter(Boolean),
          productHistorySummaryShape: normalizeString(item.productHistorySummaryShape),
          smallSuccessMetric: normalizeString(item.smallSuccessMetric),
        }))
        .filter((item) => item.pluginId),
      boundaries: normalizeObject(registry.boundaries),
      unsupportedPluginPolicy: normalizeObject(registry.unsupportedPluginPolicy),
    },
    registrySelection: normalizeObject(safeLayer.registrySelection),
    alternatives: normalizeArray(safeLayer.alternatives)
      .map((item) => normalizeObject(item))
      .map((item) => ({
        pluginId: normalizeString(item.pluginId),
        label: normalizeString(item.label),
        tradeoff: normalizeString(item.tradeoff),
      }))
      .filter((item) => item.pluginId && item.label),
    boundaries: normalizeObject(safeLayer.boundaries),
    historySummary: normalizeObject(safeLayer.historySummary),
  };
}
