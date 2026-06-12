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

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

const REAL_V1_PROVIDERS = new Set(["google-ads"]);
const DRAFT_ONLY_V1_PROVIDERS = new Set(["meta-ads", "facebook-ads", "instagram-ads", "tiktok-ads", "linkedin-ads"]);
const REQUIRED_ACTIVATION_APPROVALS = ["campaign", "ad", "budget", "activation"];
const FORBIDDEN_PROMISES = [
  "guarantee-traffic",
  "guarantee-leads",
  "guarantee-sales",
  "guarantee-conversions",
  "guarantee-revenue",
  "guarantee-roas",
  "guarantee-profitability",
  "fabricate-clicks",
  "fabricate-cpc",
  "fabricate-conversions",
  "spend-without-approval",
];
const SAFE_STOP_TRIGGERS = new Set([
  "budget-exhausted",
  "fast-spend",
  "no-clicks",
  "high-cpc",
  "broken-landing-page",
  "provider-error",
  "budget-cap-breach",
]);

const PROVIDER_ALIASES = new Map([
  ["google", "google-ads"],
  ["google ads", "google-ads"],
  ["גוגל", "google-ads"],
  ["meta", "meta-ads"],
  ["facebook", "facebook-ads"],
  ["פייסבוק", "facebook-ads"],
  ["instagram", "instagram-ads"],
  ["אינסטגרם", "instagram-ads"],
  ["tiktok", "tiktok-ads"],
  ["טיקטוק", "tiktok-ads"],
  ["linkedin", "linkedin-ads"],
  ["לינקדאין", "linkedin-ads"],
]);

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
      ?? state.releaseWorkspace
      ?? safeProject.landingPageIa
      ?? context.landingPageIa
      ?? state.landingPageIa,
  );
}

function hasLandingOrDemoPath(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const runtime = normalizeObject(safeProject.runtimeSkeletonTruth ?? context.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  return Boolean(
    safeProject.landingPageIa
      ?? context.landingPageIa
      ?? state.landingPageIa
      ?? safeProject.shareDemoAgent
      ?? context.shareDemoAgent
      ?? state.shareDemoAgent
      ?? safeProject.releaseWorkspace
      ?? context.releaseWorkspace
      ?? state.releaseWorkspace
      ?? runtime.title
      ?? runtime.runtimeSkeletonId,
  );
}

function hasMeasurementPlan(measurementTruth) {
  const measurement = normalizeObject(measurementTruth);
  if (measurement.taskId === "GROW-MEASURE-001") return true;
  if (normalizeArray(measurement.records).length > 0) return true;
  if (normalizeString(measurement.measurementAvailability)) return true;
  return false;
}

function resolveProductBasis(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const runtime = normalizeObject(safeProject.runtimeSkeletonTruth ?? context.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  const growthWorkspace = normalizeObject(safeProject.growthWorkspace ?? context.growthWorkspace ?? state.growthWorkspace);
  const audience = normalizeString(
    growthWorkspace.strategy?.targetAudience
      ?? safeProject.targetAudience
      ?? (/ליד|lead|וואטסאפ|whatsapp/iu.test(normalizeString(safeProject.goal)) ? "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ" : ""),
    "המשתמשים הראשונים שהמוצר אמור לשרת",
  );
  return {
    productId: normalizeString(safeProject.id, "sem-project"),
    artifactId: normalizeString(runtime.runtimeSkeletonId ?? safeProject.artifactId, "local-product-artifact"),
    landingPathId: normalizeString(safeProject.landingPageIa?.pageId ?? runtime.runtimeSkeletonId ?? safeProject.pageId, "local-demo-or-landing-path"),
    showableArtifact: normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "התוצר הראשון"),
    audience,
    valueProposition: normalizeString(
      safeProject.valueProposition
        ?? safeProject.coreValue
        ?? safeProject.goal,
      "להראות ערך מוצרי ברור בלי להבטיח תוצאה עסקית.",
    ),
  };
}

function resolveProvider(userInput, providerConnection) {
  const connection = normalizeObject(providerConnection);
  const explicitProvider = normalizeString(connection.provider ?? connection.providerId).toLowerCase();
  if (explicitProvider) {
    return PROVIDER_ALIASES.get(explicitProvider) ?? explicitProvider;
  }
  const input = normalizeString(userInput).toLowerCase();
  for (const [needle, provider] of PROVIDER_ALIASES.entries()) {
    if (needle && input.includes(needle)) return provider;
  }
  return "google-ads";
}

function resolveAction(userInput, safeStopSignal) {
  if (normalizeObject(safeStopSignal).trigger) return "safe-stop";
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/stop|pause|halt|עצור|להפסיק|הפסק/u])) return "safe-stop";
  if (includesAny(input, [/raise budget|increase budget|budget change|להגדיל תקציב|שינוי תקציב/u])) return "budget-change";
  if (includesAny(input, [/launch|activate|start spending|spend now|run ads|להפעיל|תפעיל|להוציא כסף|תריץ מודעה/u])) return "activate";
  if (includesAny(input, [/landing|page|message|promise|דף נחיתה|מסר|הבטחה|מיצוב/u])) return "product-message-change";
  if (includesAny(input, [/result|click|cpc|conversion|תוצאה|תוצאות|קליקים|המרות/u])) return "read-results";
  return "draft";
}

function normalizeProviderConnection(provider, connection) {
  const safeConnection = normalizeObject(connection);
  return {
    provider,
    providerConnected: safeConnection.connected === true || safeConnection.providerConnected === true,
    account: normalizeString(safeConnection.account ?? safeConnection.accountId ?? safeConnection.customerId),
    scopes: normalizeArray(safeConnection.scopes ?? safeConnection.providerScopes)
      .map((scope) => normalizeString(scope))
      .filter(Boolean),
  };
}

function approvalGranted(approvalDecisions, approvalId) {
  const safeApprovals = normalizeArray(approvalDecisions.approvals);
  return safeApprovals.some((approval) => {
    const safeApproval = normalizeObject(approval);
    return safeApproval.approved === true
      && normalizeString(safeApproval.action ?? safeApproval.approvalId) === approvalId;
  }) || approvalDecisions[`${approvalId}Approved`] === true;
}

function buildApprovalState(approvalDecisions) {
  const safeDecisions = normalizeObject(approvalDecisions);
  return {
    separateApprovalRequired: true,
    campaignApproved: approvalGranted(safeDecisions, "campaign"),
    adApproved: approvalGranted(safeDecisions, "ad"),
    budgetApproved: approvalGranted(safeDecisions, "budget"),
    budgetChangeApproved: approvalGranted(safeDecisions, "budget-change"),
    activationApproved: approvalGranted(safeDecisions, "activation"),
    providerConnectionIsNotSpendPermission: true,
  };
}

function buildDraft(productBasis, provider) {
  return {
    campaignName: `${productBasis.showableArtifact} - small paid test`,
    provider,
    objective: "message-response-test",
    adCopies: [
      {
        adId: "ad-1",
        headline: `${productBasis.showableArtifact}: להבין מי צריך טיפול עכשיו`,
        body: `בדיקה קטנה לקהל: ${productBasis.audience}. אין כאן הבטחת לידים או מכירות.`,
        requiresApproval: true,
      },
    ],
    keywordHypotheses: [
      "ניהול לידים",
      "מעקב אחרי לידים",
      "כלי לניהול פניות",
    ],
    audienceHypothesis: productBasis.audience,
    landingPathId: productBasis.landingPathId,
    measurementMetric: "האם אנשים מבינים את המסר אחרי קליק או דמו קצר",
  };
}

function buildHistoryEvent({ action, status, provider, reason = "" }) {
  return {
    eventId: `sem:${Date.now()}:${action}:${status}`,
    taskId: "GROW-SEM-001",
    action,
    status,
    provider,
    reason,
    visibleSummary: reason || `${action} -> ${status}`,
    occurredAt: new Date().toISOString(),
  };
}

function resolveProviderResults(providerConnection, providerResults) {
  const safeConnection = normalizeObject(providerConnection);
  const safeResults = normalizeObject(providerResults ?? safeConnection.realData);
  const hasRealData = Object.keys(safeResults).length > 0;
  return {
    providerResultsAvailable: hasRealData,
    metrics: hasRealData ? {
      spend: normalizeNumber(safeResults.spend, 0),
      clicks: normalizeNumber(safeResults.clicks, 0),
      impressions: normalizeNumber(safeResults.impressions, 0),
      cpc: normalizeNumber(safeResults.cpc, 0),
      conversions: normalizeNumber(safeResults.conversions, 0),
    } : {},
    fabricatedResultsBlocked: true,
  };
}

export function buildSemActionPathEnvelope({
  project = null,
  userInput = "",
  growthAgent = null,
  approvalDecisions = {},
  providerConnection = {},
  measurementTruth = null,
  providerResults = null,
  safeStopSignal = null,
  requestedBudget = null,
} = {}) {
  const input = normalizeString(userInput);
  const action = resolveAction(input, safeStopSignal);
  const provider = resolveProvider(input, providerConnection);
  const productBasis = resolveProductBasis(project);
  const permissions = normalizeProviderConnection(provider, providerConnection);
  const approval = buildApprovalState(approvalDecisions);
  const productReady = hasProductTruth(project);
  const landingReady = hasLandingOrDemoPath(project);
  const measurementReady = hasMeasurementPlan(measurementTruth);
  const providerSupportedForRealExecution = REAL_V1_PROVIDERS.has(provider);
  const providerDraftOnly = DRAFT_ONLY_V1_PROVIDERS.has(provider);
  const budgetAmount = Math.min(Math.max(normalizeNumber(requestedBudget?.amount, 50), 0), 50);
  const budget = {
    currency: normalizeString(requestedBudget?.currency, "USD"),
    suggestedAmount: budgetAmount || 50,
    hardCapUsd: 50,
    nisRange: "100-200",
    capEnforced: true,
    increaseRequiresNewApproval: true,
  };
  const providerTruth = {
    selectedProvider: provider,
    firstReleaseRealProviders: [...REAL_V1_PROVIDERS],
    draftOnlyProviders: [...DRAFT_ONLY_V1_PROVIDERS],
    providerConnected: permissions.providerConnected === true,
    providerSupportedForRealExecution,
    draftOnlyProvider: providerDraftOnly || !providerSupportedForRealExecution,
    scopes: permissions.scopes,
    hasAdDraftScope: permissions.scopes.includes("ad-draft"),
    hasSpendPermissionScope: permissions.scopes.includes("spend-approval") || permissions.scopes.includes("ad-spend"),
    providerConnectionIsNotSpendPermission: true,
  };
  const resultTruth = resolveProviderResults(providerConnection, providerResults);
  const activationApprovalsComplete = REQUIRED_ACTIVATION_APPROVALS.every((key) => approval[`${key}Approved`] === true);
  const canPrepareActivation = providerTruth.providerConnected
    && providerTruth.providerSupportedForRealExecution
    && providerTruth.hasAdDraftScope
    && providerTruth.hasSpendPermissionScope
    && activationApprovalsComplete
    && landingReady
    && measurementReady;
  const base = {
    taskId: "GROW-SEM-001",
    agentId: "sem-action-path",
    responseSource: "agent-envelope",
    semPathId: `sem-action:${productBasis.productId}`,
    status: "draft-ready",
    requestedAction: action,
    productBasis,
    campaignDraft: productReady ? buildDraft(productBasis, provider) : null,
    budget,
    approval,
    providerTruth,
    readiness: {
      productReady,
      landingOrDemoReady: landingReady,
      measurementPlanReady: measurementReady,
      canPrepareActivation,
      missing: [
        ...(productReady ? [] : ["product-truth"]),
        ...(landingReady ? [] : ["landing-or-demo-path"]),
        ...(measurementReady ? [] : ["measurement-plan"]),
      ],
    },
    handoffs: {
      visualBuildRequiredForLandingChanges: true,
      mutationRequiredForMessageChanges: true,
      measurementOwner: "GROW-MEASURE-001",
      paidSocialRoutedToSem: providerDraftOnly,
    },
    resultTruth,
    safeStop: {
      allowedWithoutChangingAdsOrBudget: true,
      trigger: normalizeString(normalizeObject(safeStopSignal).trigger),
      stopped: false,
      adsModified: false,
      budgetModified: false,
    },
    forbiddenPromises: FORBIDDEN_PROMISES,
    history: [],
    externalSpendPerformed: false,
    activationPrepared: false,
    userMessage: "נוצרה טיוטת ניסוי ממומן קטן. אין הוצאה, הפעלה או הבטחת תוצאות בלי אישור, ספק, תקציב ומדידה.",
  };

  if (!productReady || !landingReady) {
    return {
      ...base,
      status: "needs-landing-or-demo",
      history: [buildHistoryEvent({ action, status: "blocked", provider, reason: "פרסום ממומן מחכה לתוצר ודף או דמו שאפשר למדוד." })],
      userMessage: "אי אפשר להכין ניסוי ממומן בלי תוצר ודף או דמו שאפשר לשלוח אליו אנשים.",
    };
  }

  if (!measurementReady) {
    return {
      ...base,
      status: "needs-measurement",
      history: [buildHistoryEvent({ action, status: "blocked", provider, reason: "חסרה תוכנית מדידה לפני ניסוי ממומן." })],
      userMessage: "ניסוי ממומן דורש מדד קטן לפני שמדברים על הפעלה או תקציב.",
    };
  }

  if (action === "product-message-change") {
    return {
      ...base,
      status: "handoff-required",
      history: [buildHistoryEvent({ action, status: "handoff-required", provider, reason: "שינוי מסר או דף עובר דרך שינוי מוצר או בנייה חזותית." })],
      userMessage: "אפשר להציע שינוי מסר או דף, אבל SEM לא משנה את המוצר לבד.",
    };
  }

  if (action === "read-results") {
    const canReadResults = providerTruth.providerConnected
      && permissions.scopes.includes("read-results")
      && resultTruth.providerResultsAvailable;
    return {
      ...base,
      status: canReadResults ? "results-received" : "draft-mode-provider-results-missing",
      history: [buildHistoryEvent({
        action,
        status: canReadResults ? "results-received" : "blocked",
        provider,
        reason: canReadResults ? "נקלטו נתוני ספק אמיתיים לקריאה בלבד." : "אין נתוני ספק אמיתיים ולכן לא ממציאים תוצאות.",
      })],
      userMessage: canReadResults
        ? "נתוני הספק נקלטו לקריאה בלבד, בלי להסיק הצלחה מעבר למדידה."
        : "אין תוצאות אמיתיות זמינות, ולכן Nexus לא ממציא קליקים, לידים או המרות.",
    };
  }

  if (action === "safe-stop") {
    const trigger = normalizeString(normalizeObject(safeStopSignal).trigger, "provider-error");
    const acceptedTrigger = SAFE_STOP_TRIGGERS.has(trigger) ? trigger : "provider-error";
    return {
      ...base,
      status: "stopped-safely",
      safeStop: {
        allowedWithoutChangingAdsOrBudget: true,
        trigger: acceptedTrigger,
        stopped: true,
        adsModified: false,
        budgetModified: false,
      },
      history: [buildHistoryEvent({ action, status: "stopped-safely", provider, reason: "הקמפיין נעצר בגלל כלל בטיחות בלי לשנות מודעות או תקציב." })],
      userMessage: "הקמפיין נעצר לפי כלל בטיחות. לא שיניתי מודעות, תקציב או מבנה קמפיין.",
    };
  }

  if (action === "budget-change" && !approval.budgetChangeApproved) {
    return {
      ...base,
      status: "needs-budget-change-approval",
      history: [buildHistoryEvent({ action, status: "needs-approval", provider, reason: "כל שינוי תקציב דורש אישור נפרד." })],
      userMessage: "שינוי תקציב דורש אישור נפרד. חיבור ספק או אישור קודם לא מספיקים.",
    };
  }

  if (providerDraftOnly || !providerSupportedForRealExecution) {
    return {
      ...base,
      status: "draft-only-provider",
      history: [buildHistoryEvent({ action, status: "draft-only", provider, reason: "הספק המבוקש נשאר טיוטה בלבד בשחרור הראשון." })],
      userMessage: "הערוץ הזה נשאר טיוטה בלבד בשחרור הראשון. paid social עובר דרך SEM, אבל לא מפעיל הוצאה עכשיו.",
    };
  }

  if (permissions.providerConnected !== true) {
    return {
      ...base,
      status: "draft-only-provider-missing",
      history: [buildHistoryEvent({ action, status: "draft-only", provider, reason: "אין ספק מחובר, לכן נשארים בטיוטה בלי הוצאה." })],
      userMessage: "הטיוטה מוכנה, אבל אין ספק מחובר ולכן אין הפעלה או הוצאה.",
    };
  }

  if (!providerTruth.hasAdDraftScope || !providerTruth.hasSpendPermissionScope) {
    return {
      ...base,
      status: "needs-provider-scope",
      history: [buildHistoryEvent({ action, status: "missing-scope", provider, reason: "חיבור ספק אינו הרשאת הוצאה." })],
      userMessage: "הספק מחובר, אבל חסרה הרשאה מדויקת לטיוטת מודעה או להוצאה.",
    };
  }

  if (action === "activate" && !activationApprovalsComplete) {
    return {
      ...base,
      status: "needs-separate-approvals",
      history: [buildHistoryEvent({ action, status: "needs-approval", provider, reason: "קמפיין, מודעה, תקציב והפעלה דורשים אישורים נפרדים." })],
      userMessage: "אי אפשר להפעיל קמפיין בלי אישור נפרד לקמפיין, למודעה, לתקציב ולהפעלה.",
    };
  }

  if (action === "activate" && canPrepareActivation) {
    return {
      ...base,
      status: "ready-for-provider-activation",
      activationPrepared: true,
      externalSpendPerformed: false,
      history: [
        buildHistoryEvent({ action: "campaign-draft-created", status: "draft-ready", provider, reason: "טיוטת קמפיין נוצרה." }),
        buildHistoryEvent({ action, status: "activation-ready", provider, reason: "כל האישורים וההרשאות קיימים, אך Nexus לא הוציא כסף בבדיקה." }),
      ],
      userMessage: "הניסוי מוכן להפעלה אצל ספק מאושר, אבל לא בוצעה הוצאה מתוך Nexus בבדיקה הזו.",
    };
  }

  return {
    ...base,
    status: "draft-ready",
    history: [
      buildHistoryEvent({ action: "campaign-draft-created", status: "draft-ready", provider, reason: "טיוטת ניסוי ממומן נוצרה." }),
      buildHistoryEvent({ action: "budget-proposed", status: "needs-approval", provider, reason: "הוצע תקציב קטן תחת תקרה קשיחה." }),
    ],
  };
}

export function summarizeSemActionPath(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  const providerTruth = normalizeObject(safeEnvelope.providerTruth);
  const approval = normalizeObject(safeEnvelope.approval);
  const readiness = normalizeObject(safeEnvelope.readiness);
  const safeStop = normalizeObject(safeEnvelope.safeStop);
  const budget = normalizeObject(safeEnvelope.budget);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-SEM-001"),
    agentId: normalizeString(safeEnvelope.agentId, "sem-action-path"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    requestedAction: normalizeString(safeEnvelope.requestedAction, "draft"),
    selectedProvider: normalizeString(providerTruth.selectedProvider, "google-ads"),
    providerConnected: providerTruth.providerConnected === true,
    providerSupportedForRealExecution: providerTruth.providerSupportedForRealExecution === true,
    draftOnlyProvider: providerTruth.draftOnlyProvider === true,
    hasAdDraftScope: providerTruth.hasAdDraftScope === true,
    hasSpendPermissionScope: providerTruth.hasSpendPermissionScope === true,
    providerConnectionIsNotSpendPermission: providerTruth.providerConnectionIsNotSpendPermission !== false,
    firstReleaseRealProviders: normalizeArray(providerTruth.firstReleaseRealProviders),
    draftOnlyProviders: normalizeArray(providerTruth.draftOnlyProviders),
    campaignApproved: approval.campaignApproved === true,
    adApproved: approval.adApproved === true,
    budgetApproved: approval.budgetApproved === true,
    budgetChangeApproved: approval.budgetChangeApproved === true,
    activationApproved: approval.activationApproved === true,
    separateApprovalRequired: approval.separateApprovalRequired !== false,
    productReady: readiness.productReady === true,
    landingOrDemoReady: readiness.landingOrDemoReady === true,
    measurementPlanReady: readiness.measurementPlanReady === true,
    canPrepareActivation: readiness.canPrepareActivation === true,
    budgetCurrency: normalizeString(budget.currency, "USD"),
    suggestedBudget: normalizeNumber(budget.suggestedAmount, 50),
    hardCapUsd: normalizeNumber(budget.hardCapUsd, 50),
    budgetCapEnforced: budget.capEnforced !== false,
    activationPrepared: safeEnvelope.activationPrepared === true,
    externalSpendPerformed: safeEnvelope.externalSpendPerformed === true,
    safeStopAllowed: safeStop.allowedWithoutChangingAdsOrBudget !== false,
    safeStopStopped: safeStop.stopped === true,
    safeStopAdsModified: safeStop.adsModified === true,
    safeStopBudgetModified: safeStop.budgetModified === true,
    visualBuildRequiredForLandingChanges: safeEnvelope.handoffs?.visualBuildRequiredForLandingChanges !== false,
    mutationRequiredForMessageChanges: safeEnvelope.handoffs?.mutationRequiredForMessageChanges !== false,
    measurementOwner: normalizeString(safeEnvelope.handoffs?.measurementOwner, "GROW-MEASURE-001"),
    paidSocialRoutedToSem: safeEnvelope.handoffs?.paidSocialRoutedToSem === true,
    providerResultsAvailable: safeEnvelope.resultTruth?.providerResultsAvailable === true,
    fabricatedResultsBlocked: safeEnvelope.resultTruth?.fabricatedResultsBlocked !== false,
    forbiddenPromises: normalizeArray(safeEnvelope.forbiddenPromises),
    historyCount: normalizeArray(safeEnvelope.history).length,
    userMessage: normalizeString(safeEnvelope.userMessage, "SEM עדיין לא נוצר."),
  };
}
