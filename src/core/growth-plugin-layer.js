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
  return { ...base, ...overrides };
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
    },
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
