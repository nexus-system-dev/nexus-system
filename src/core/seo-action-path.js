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

const FORBIDDEN_CLAIMS = [
  "guarantee-ranking",
  "guarantee-traffic",
  "guarantee-first-page",
  "guarantee-leads",
  "guarantee-sales",
  "guarantee-conversions",
  "fabricate-search-volume",
  "fabricate-rankings",
  "publish-without-approval",
];

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
      ?? safeProject.shareDemoAgent
      ?? context.shareDemoAgent
      ?? state.shareDemoAgent
      ?? safeProject.landingPageIa
      ?? context.landingPageIa
      ?? state.landingPageIa,
  );
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
  const value = normalizeString(
    safeProject.valueProposition
      ?? safeProject.coreValue
      ?? safeProject.goal,
    "להסביר את ערך המוצר בצורה ברורה ולא להבטיח תוצאה.",
  );
  return {
    productId: normalizeString(safeProject.id, "seo-project"),
    pageId: normalizeString(runtime.runtimeSkeletonId ?? safeProject.pageId, "local-product-page"),
    pageTitle: normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "עמוד המוצר"),
    audience,
    valueProposition: value,
    language: /[\u0590-\u05FF]/u.test(`${safeProject.goal ?? ""} ${audience} ${value}`) ? "he" : "en",
    direction: /[\u0590-\u05FF]/u.test(`${safeProject.goal ?? ""} ${audience} ${value}`) ? "rtl" : "ltr",
  };
}

function resolveSeoAction(userInput) {
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/publish|public|index|לפרסם|ציבורי|לאנדקס/u])) return "publish";
  if (includesAny(input, [/apply|update|save|להחיל|לעדכן|לשמור/u])) return "apply";
  if (includesAny(input, [/new page|create page|דף חדש|עמוד חדש/u])) return "new-page";
  if (includesAny(input, [/message|positioning|promise|מסר|הבטחה|מיצוב/u])) return "message-change";
  if (includesAny(input, [/search console|ranking|impression|query|volume|דירוג|נפח חיפוש|שאילת/u])) return "provider-data";
  return "draft";
}

function buildKeywordHypotheses(productBasis) {
  if (productBasis.direction === "rtl") {
    return [
      `ניהול לידים ${productBasis.audience}`,
      "מעקב אחרי לידים",
      "כלי לניהול פניות מוואטסאפ",
    ];
  }
  return [
    `${productBasis.pageTitle} for ${productBasis.audience}`,
    "lead follow up tool",
    "whatsapp lead management",
  ];
}

function buildRecommendations(productBasis) {
  const title = productBasis.direction === "rtl"
    ? `${productBasis.pageTitle} | טיפול ברור בלידים`
    : `${productBasis.pageTitle} | Clear lead follow-up`;
  const metaDescription = productBasis.direction === "rtl"
    ? `${productBasis.pageTitle} עוזר ל${productBasis.audience} להבין מי אחראי, מתי לחזור ומה הצעד הבא.`
    : `${productBasis.pageTitle} helps ${productBasis.audience} understand owner, reminder, and next step.`;
  return {
    title,
    metaDescription,
    headings: productBasis.direction === "rtl"
      ? ["למי זה עוזר", "איזו בעיה זה פותר", "איך נראה הצעד הבא"]
      : ["Who it helps", "What problem it solves", "What the next step looks like"],
    openingCopy: productBasis.direction === "rtl"
      ? `${productBasis.pageTitle} נועד להסביר את הערך המרכזי בלי להבטיח תנועה, דירוג או מכירות.`
      : `${productBasis.pageTitle} explains the core value without promising traffic, rankings, or sales.`,
    faq: productBasis.direction === "rtl"
      ? [
          { question: "מה אפשר לבדוק עכשיו?", answer: "אפשר לבדוק אם הקהל מבין את הערך מתוך הכותרת והפתיחה." },
          { question: "האם זה מבטיח דירוג?", answer: "לא. זו טיוטת הבהרת עמוד, לא הבטחת תוצאה בגוגל." },
        ]
      : [
          { question: "What can be tested now?", answer: "Whether the audience understands the value from the title and opening copy." },
          { question: "Does this promise ranking?", answer: "No. This is a page clarity draft, not a Google outcome claim." },
        ],
    keywordHypotheses: buildKeywordHypotheses(productBasis),
  };
}

function hasApproval(approvalDecisions, action) {
  return normalizeArray(approvalDecisions.approvals).some((approval) => {
    const safeApproval = normalizeObject(approval);
    return safeApproval.approved === true && normalizeString(safeApproval.action) === action;
  }) || approvalDecisions[`${action}Approved`] === true;
}

function buildHistory(action, status, reason) {
  return {
    eventId: `seo:${Date.now()}:${action}:${status}`,
    taskId: "GROW-SEO-001",
    action,
    status,
    reason,
    visibleSummary: reason,
    occurredAt: new Date().toISOString(),
  };
}

export function buildSeoActionPathEnvelope({
  project = null,
  userInput = "",
  growthAgent = null,
  approvalDecisions = {},
  searchConsoleConnection = {},
  measurementTruth = null,
} = {}) {
  const input = normalizeString(userInput);
  const action = resolveSeoAction(input);
  const productBasis = resolveProductBasis(project);
  const productReady = hasProductTruth(project);
  const recommendations = productReady ? buildRecommendations(productBasis) : null;
  const searchConsole = normalizeObject(searchConsoleConnection);
  const measurement = normalizeObject(measurementTruth);
  const providerConnected = searchConsole.connected === true || searchConsole.providerConnected === true;
  const providerHasRealData = providerConnected === true
    && searchConsole.readScopeGranted === true
    && Object.keys(normalizeObject(searchConsole.realData)).length > 0;
  const base = {
    taskId: "GROW-SEO-001",
    agentId: "seo-action-path",
    responseSource: "agent-envelope",
    seoPathId: `seo-action:${productBasis.productId}`,
    status: "draft-ready",
    requestedAction: action,
    productBasis,
    recommendations,
    approval: {
      approvalRequiredBeforeApply: true,
      applyApproved: hasApproval(approvalDecisions, "apply-seo"),
      newPageApproved: hasApproval(approvalDecisions, "create-seo-page"),
      publicVisibilityApproved: hasApproval(approvalDecisions, "public-seo-visibility"),
    },
    handoffs: {
      mutationRequired: false,
      visualBuildRequired: true,
      shareOrReleaseRequiredForPublicVisibility: true,
      measurementOwner: "GROW-MEASURE-001",
      searchConsoleOptional: true,
    },
    providerTruth: {
      searchConsoleConnected: providerConnected,
      searchConsoleReadScope: searchConsole.readScopeGranted === true,
      realProviderDataAvailable: providerHasRealData,
      searchVolumeIsHypothesis: !providerHasRealData,
      rankingsAreHypothesis: !providerHasRealData,
      metrics: providerHasRealData ? normalizeObject(searchConsole.realData) : {},
      analyticsConsumedFromMeasurement: measurement.taskId === "GROW-MEASURE-001",
    },
    blockedClaims: FORBIDDEN_CLAIMS,
    history: [],
    externalPublicationPerformed: false,
    visiblePageUpdated: false,
    userMessage: "נוצרה טיוטת שיפור חיפוש שמחוברת לתוצר. אין כאן הבטחת דירוג, תנועה או תוצאות.",
  };

  if (!productReady) {
    return {
      ...base,
      status: "needs-product-first",
      recommendations: null,
      handoffs: {
        ...base.handoffs,
        visualBuildRequired: false,
      },
      history: [buildHistory(action, "blocked", "מוקדם מדי ל-SEO בלי עמוד, דמו, מסך או מסר מוצר ברור.")],
      userMessage: "מוקדם מדי ל-SEO. קודם צריך עמוד, דמו, מסך או מסר מוצר ברור.",
    };
  }

  if (action === "message-change") {
    return {
      ...base,
      status: "handoff-required",
      handoffs: {
        ...base.handoffs,
        mutationRequired: true,
        visualBuildRequired: true,
      },
      history: [buildHistory(action, "handoff-required", "שינוי מסר מוצר עובר דרך סוכן שינוי ולא דרך SEO לבד.")],
      userMessage: "השינוי נוגע למסר המוצר, ולכן הוא חייב לעבור דרך סוכן שינוי לפני עדכון גלוי.",
    };
  }

  if (action === "new-page" && !base.approval.newPageApproved) {
    return {
      ...base,
      status: "needs-approval",
      history: [buildHistory(action, "needs-approval", "יצירת עמוד חדש דורשת אישור וסיבה צמיחתית ברורה.")],
      userMessage: "אפשר להציע עמוד חדש, אבל לא יוצרים אותו בלי אישור וסיבה צמיחתית ברורה.",
    };
  }

  if (action === "publish" && !base.approval.publicVisibilityApproved) {
    return {
      ...base,
      status: "needs-share-or-release",
      history: [buildHistory(action, "needs-share-or-release", "שינוי SEO ציבורי לא עוקף שיתוף או שחרור.")],
      userMessage: "SEO ציבורי חייב לעבור שיתוף או שחרור ואישור לפני שהוא נראה החוצה.",
    };
  }

  if (action === "apply" && !base.approval.applyApproved) {
    return {
      ...base,
      status: "needs-approval",
      history: [buildHistory(action, "needs-approval", "החלת שינויי SEO דורשת אישור לפני עדכון עמוד.")],
      userMessage: "הטיוטה מוכנה, אבל החלת כותרת, תיאור, פתיחה או שאלות דורשת אישור.",
    };
  }

  if (action === "apply" && base.approval.applyApproved) {
    return {
      ...base,
      status: "applied-to-visual-build",
      visiblePageUpdated: true,
      history: [
        buildHistory("keywords-selected", "recorded", "השערות מילות חיפוש נרשמו לאישור ולמדידה."),
        buildHistory(action, "applied-to-visual-build", "שינוי SEO אושר ונשלח למסלול בנייה חזותית."),
      ],
      userMessage: "שינויי SEO אושרו ונשלחו לעדכון חזותי. אין כאן פרסום ציבורי או הבטחת תוצאות.",
    };
  }

  if (action === "provider-data" && !providerHasRealData) {
    return {
      ...base,
      status: "draft-mode-search-console-missing",
      history: [buildHistory(action, "provider-missing", "אין נתוני Search Console אמיתיים, לכן נשארים במצב טיוטה.")],
      userMessage: "אין נתוני Search Console אמיתיים זמינים, ולכן Nexus לא ממציא נפח חיפוש, דירוגים או קליקים.",
    };
  }

  return {
    ...base,
    status: providerHasRealData ? "draft-ready-with-provider-data" : "draft-ready",
    history: [
      buildHistory("seo-experiment-created", "draft-ready", "נוצרה טיוטת SEO מחוברת לתוצר."),
      buildHistory("search-console", providerHasRealData ? "real-data-available" : "missing", providerHasRealData
        ? "נתוני ספק אמיתיים זמינים לקריאה."
        : "Search Console חסר, לכן אין טענות תוצאה."),
    ],
  };
}

export function summarizeSeoActionPath(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-SEO-001"),
    agentId: normalizeString(safeEnvelope.agentId, "seo-action-path"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    requestedAction: normalizeString(safeEnvelope.requestedAction, "draft"),
    language: normalizeString(safeEnvelope.productBasis?.language, "he"),
    direction: normalizeString(safeEnvelope.productBasis?.direction, "rtl"),
    title: normalizeString(safeEnvelope.recommendations?.title),
    metaDescription: normalizeString(safeEnvelope.recommendations?.metaDescription),
    headingCount: normalizeArray(safeEnvelope.recommendations?.headings).length,
    faqCount: normalizeArray(safeEnvelope.recommendations?.faq).length,
    keywordHypotheses: normalizeArray(safeEnvelope.recommendations?.keywordHypotheses),
    approvalRequiredBeforeApply: safeEnvelope.approval?.approvalRequiredBeforeApply !== false,
    applyApproved: safeEnvelope.approval?.applyApproved === true,
    mutationRequired: safeEnvelope.handoffs?.mutationRequired === true,
    visualBuildRequired: safeEnvelope.handoffs?.visualBuildRequired === true,
    shareOrReleaseRequiredForPublicVisibility: safeEnvelope.handoffs?.shareOrReleaseRequiredForPublicVisibility !== false,
    searchConsoleConnected: safeEnvelope.providerTruth?.searchConsoleConnected === true,
    realProviderDataAvailable: safeEnvelope.providerTruth?.realProviderDataAvailable === true,
    searchVolumeIsHypothesis: safeEnvelope.providerTruth?.searchVolumeIsHypothesis !== false,
    rankingsAreHypothesis: safeEnvelope.providerTruth?.rankingsAreHypothesis !== false,
    analyticsConsumedFromMeasurement: safeEnvelope.providerTruth?.analyticsConsumedFromMeasurement === true,
    blockedClaims: normalizeArray(safeEnvelope.blockedClaims),
    externalPublicationPerformed: safeEnvelope.externalPublicationPerformed === true,
    visiblePageUpdated: safeEnvelope.visiblePageUpdated === true,
    userMessage: normalizeString(safeEnvelope.userMessage, "SEO עדיין לא נוצר."),
    historyCount: normalizeArray(safeEnvelope.history).length,
  };
}
