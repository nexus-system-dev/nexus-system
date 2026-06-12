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

const REAL_V1_PROVIDERS = new Set(["instagram", "facebook"]);
const DRAFT_ONLY_V1_PROVIDERS = new Set(["tiktok", "linkedin", "youtube", "x", "twitter"]);
const BLOCKED_FIRST_RELEASE_ACTIONS = ["reply", "moderate", "direct-message", "ad-spend", "account-edit"];
const PROVIDER_ALIASES = new Map([
  ["ig", "instagram"],
  ["instagram", "instagram"],
  ["אינסטגרם", "instagram"],
  ["facebook", "facebook"],
  ["fb", "facebook"],
  ["פייסבוק", "facebook"],
  ["tiktok", "tiktok"],
  ["טיקטוק", "tiktok"],
  ["linkedin", "linkedin"],
  ["לינקדאין", "linkedin"],
  ["youtube", "youtube"],
  ["יוטיוב", "youtube"],
  ["x", "x"],
  ["twitter", "x"],
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
      ?? state.shareDemoAgent,
  );
}

function resolveProductBasis(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const runtime = normalizeObject(safeProject.runtimeSkeletonTruth ?? context.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  const growthWorkspace = normalizeObject(safeProject.growthWorkspace ?? context.growthWorkspace ?? state.growthWorkspace);
  return {
    productId: normalizeString(safeProject.id, "growth-project"),
    artifactId: normalizeString(runtime.runtimeSkeletonId ?? safeProject.artifactId, "local-product-artifact"),
    audience: normalizeString(growthWorkspace.strategy?.targetAudience ?? safeProject.targetAudience, "המשתמשים הראשונים שהמוצר אמור לשרת"),
    valueProposition: normalizeString(
      safeProject.valueProposition
        ?? safeProject.coreValue
        ?? safeProject.goal,
      "להראות ערך מוצרי ברור בלי להבטיח תוצאה עסקית.",
    ),
    sourceAgent: "growth-agent",
    showableArtifact: normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "התוצר הראשון"),
  };
}

function resolveProvider(userInput, providerConnection) {
  const explicitProvider = normalizeString(providerConnection.provider ?? providerConnection.providerId).toLowerCase();
  if (explicitProvider) {
    return PROVIDER_ALIASES.get(explicitProvider) ?? explicitProvider;
  }
  const input = normalizeString(userInput).toLowerCase();
  for (const [needle, provider] of PROVIDER_ALIASES.entries()) {
    if (needle && input.includes(needle)) {
      return provider;
    }
  }
  return "instagram";
}

function resolveAction(userInput) {
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/result|metric|engagement|read .*comments|תוצאות|מדדים|לקרוא תגובות/u])) return "read-results";
  if (includesAny(input, [/delete|hide|moderate|למחוק|להסתיר|מודרציה/u])) return "moderate";
  if (includesAny(input, [/reply|comment|תגובה|תגובות|להגיב/u])) return "reply";
  if (includesAny(input, [/dm|direct.?message|private message|הודעה פרטית/u])) return "direct-message";
  if (includesAny(input, [/ad.?spend|boost|budget|spend|תקציב|לקדם בכסף|ממומן/u])) return "ad-spend";
  if (includesAny(input, [/account|page settings|פרטי עמוד|חשבון/u])) return "account-edit";
  if (includesAny(input, [/publish|post now|פרסם|לפרסם/u])) return "publish";
  if (includesAny(input, [/schedule|תזמן|לתזמן/u])) return "schedule";
  return "draft";
}

function resolveCampaignType(userInput) {
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/feedback|משוב/u])) return "feedback-request";
  if (includesAny(input, [/message|copy|מסר/u])) return "message-test";
  if (includesAny(input, [/demo|דמו|video|וידאו/u])) return "demo-sequence";
  if (includesAny(input, [/launch|השקה/u])) return "launch-sequence";
  return "learning-experiment";
}

function buildSequence({ provider, productBasis, requestedAction, creativeAssets, userInput }) {
  const hasApprovedAsset = normalizeArray(creativeAssets).some((asset) => {
    const safeAsset = normalizeObject(asset);
    return safeAsset.approved === true && /image|video|demo|asset/i.test(normalizeString(safeAsset.type ?? safeAsset.assetType));
  });
  const wantsMedia = includesAny(normalizeString(userInput).toLowerCase(), [/video|image|וידאו|תמונה/u]);
  const missingAsset = wantsMedia && !hasApprovedAsset ? "approved-demo-or-creative-asset" : "";
  const narrative = [
    ["problem", `הבעיה: ${productBasis.audience} צריכים דרך פשוטה להבין מתי ${productBasis.showableArtifact} עוזר להם.`],
    ["solution", `הפתרון: ${productBasis.valueProposition}`],
    [missingAsset ? "feedback" : "demo", missingAsset
      ? "שאלת משוב: האם המסר ברור גם בלי נכס חזותי מאושר?"
      : `דמו קצר: להראות את ${productBasis.showableArtifact} סביב פעולה אחת ברורה.`],
  ];

  return narrative.map(([purpose, draftText], index) => ({
    postId: `post-${index + 1}`,
    day: index + 1,
    purpose,
    provider,
    draftText,
    assetNeed: index === 2 ? missingAsset : "",
    requiresApproval: true,
    allowedAction: requestedAction === "publish" || requestedAction === "schedule" ? requestedAction : "draft",
    externalActionPerformed: false,
  }));
}

function normalizeProviderConnection(provider, connection) {
  const safeConnection = normalizeObject(connection);
  return {
    provider,
    providerConnected: safeConnection.connected === true || safeConnection.providerConnected === true,
    account: normalizeString(safeConnection.account ?? safeConnection.accountId ?? safeConnection.pageId),
    scopes: normalizeArray(safeConnection.scopes ?? safeConnection.providerScopes)
      .map((scope) => normalizeString(scope))
      .filter(Boolean),
  };
}

function hasExplicitPostApproval(postApprovals, action, provider, postId) {
  return normalizeArray(postApprovals).some((approval) => {
    const safeApproval = normalizeObject(approval);
    return safeApproval.approved === true
      && normalizeString(safeApproval.action) === action
      && normalizeString(safeApproval.provider) === provider
      && normalizeString(safeApproval.postId) === postId;
  });
}

function buildHistoryEvent({ action, status, provider, postId = "", reason = "" }) {
  return {
    eventId: `social-campaign:${Date.now()}:${action}:${status}`,
    taskId: "GROW-AGT-002",
    action,
    status,
    provider,
    postId,
    reason,
    visibleSummary: reason || `${action} -> ${status}`,
    occurredAt: new Date().toISOString(),
  };
}

function summarizeComments(providerResults) {
  const comments = normalizeArray(providerResults.comments);
  if (!comments.length) {
    return {
      available: false,
      summary: "אין תגובות אמיתיות זמינות לקריאה.",
      examplesShown: [],
      sensitiveExamplesHidden: true,
    };
  }
  const safeExamples = comments
    .map((comment) => normalizeString(comment.text ?? comment))
    .filter((comment) => comment && !/@|phone|טלפון|מייל|email|\d{7,}/iu.test(comment))
    .slice(0, 2);
  return {
    available: true,
    summary: `${comments.length} תגובות אמיתיות סוכמו בלי לחשוף תוכן רגיש כברירת מחדל.`,
    examplesShown: safeExamples,
    sensitiveExamplesHidden: safeExamples.length < comments.length,
  };
}

export function buildSocialCampaignExecutionAgentEnvelope({
  project = null,
  userInput = "",
  growthAgent = null,
  providerConnection = {},
  approvalDecisions = {},
  creativeAssets = [],
  providerResults = null,
} = {}) {
  const input = normalizeString(userInput);
  const provider = resolveProvider(input, providerConnection);
  const requestedAction = resolveAction(input);
  const productBasis = resolveProductBasis(project);
  const permissions = normalizeProviderConnection(provider, providerConnection);
  const postApprovals = normalizeArray(approvalDecisions.postApprovals);
  const campaignApproved = approvalDecisions.campaignApproved === true;
  const productTruthAvailable = hasProductTruth(project);
  const sequence = buildSequence({
    provider,
    productBasis,
    requestedAction,
    creativeAssets,
    userInput,
  });
  const missingAsset = sequence.find((post) => post.assetNeed)?.assetNeed ?? "";
  const doNotPromise = [
    "לא להבטיח מכירות, חשיפות, משתמשים, ויראליות או החזר השקעה.",
    "לא לטעון שפורסם, תוזמן או נמדד בלי פעולה וספק אמיתיים.",
    "לא להפוך ספק חיצוני למקור אמת של המוצר.",
  ];
  const base = {
    taskId: "GROW-AGT-002",
    agentId: "social-campaign-execution-agent",
    responseSource: "agent-envelope",
    campaignId: `social-campaign:${productBasis.productId}`,
    campaignType: resolveCampaignType(input),
    productBasis,
    selectedProvider: provider,
    requestedAction,
    sequence,
    permissions: {
      ...permissions,
      approvalRequiredBeforeExternalAction: true,
      firstReleaseRealProviders: [...REAL_V1_PROVIDERS],
      draftOnlyProviders: [...DRAFT_ONLY_V1_PROVIDERS],
    },
    approval: {
      campaignApproved,
      perPostApprovalRequired: true,
      postApprovals,
      campaignApprovalCannotPublishPosts: true,
    },
    fallback: {
      manualCopyAvailable: true,
      draftOnlyBecauseProviderMissing: permissions.providerConnected !== true,
      missingAsset,
    },
    blockedActions: BLOCKED_FIRST_RELEASE_ACTIONS,
    doNotPromise,
    requiresAgent: "none",
    history: [],
    resultIntake: {
      providerResultsAvailable: false,
      fabricatedMetricsBlocked: true,
      metrics: {},
      commentsSummary: summarizeComments({}),
    },
    externalExecutionPerformed: false,
    userMessage: "הקמפיין הוכן כטיוטה קטנה. שום דבר לא פורסם או תוזמן בלי אישור וספק מחובר.",
    status: "ready-for-approval",
  };

  if (!productTruthAvailable) {
    return {
      ...base,
      sequence: [],
      requiresAgent: "growth-agent",
      status: "needs-product-first",
      history: [buildHistoryEvent({ action: "draft", status: "blocked", provider, reason: "חסרה אמת מוצר לפני קמפיין." })],
      userMessage: "אי אפשר להכין קמפיין בלי תוצר ברור שמחובר לאמת הפרויקט.",
    };
  }

  if (DRAFT_ONLY_V1_PROVIDERS.has(provider)) {
    return {
      ...base,
      status: "ready-for-approval",
      fallback: {
        ...base.fallback,
        draftOnlyBecauseProviderMissing: true,
      },
      history: [buildHistoryEvent({ action: "draft", status: "draft-only", provider, reason: "הערוץ הזה נשאר טיוטה בלבד בשחרור הראשון." })],
      userMessage: "הערוץ המבוקש נשאר טיוטה בלבד בשחרור הראשון. אפשר להעתיק ידנית, אבל Nexus לא מפרסם שם עכשיו.",
    };
  }

  if (BLOCKED_FIRST_RELEASE_ACTIONS.includes(requestedAction)) {
    return {
      ...base,
      status: "failed-safely",
      history: [buildHistoryEvent({ action: requestedAction, status: "blocked", provider, reason: "הפעולה חסומה בשחרור הראשון." })],
      userMessage: "הפעולה הזו חסומה בשחרור הראשון. אפשר להכין ניסוח ידני, אבל Nexus לא מגיב, מוחק, שולח הודעות או מוציא כסף בשם המשתמש.",
    };
  }

  if (requestedAction === "read-results") {
    const safeResults = normalizeObject(providerResults);
    const canRead = permissions.providerConnected === true
      && permissions.scopes.includes("read-results")
      && approvalDecisions.readResultsApproved === true
      && Object.keys(safeResults).length > 0;
    return {
      ...base,
      status: canRead ? "results-received" : permissions.providerConnected ? "needs-approval" : "needs-provider",
      resultIntake: {
        providerResultsAvailable: canRead,
        fabricatedMetricsBlocked: true,
        metrics: canRead ? normalizeObject(safeResults.metrics) : {},
        commentsSummary: canRead ? summarizeComments(safeResults) : summarizeComments({}),
      },
      history: [buildHistoryEvent({
        action: "read-results",
        status: canRead ? "results-received" : "blocked",
        provider,
        reason: canRead ? "נקלטו תוצאות מספק מחובר." : "אין לקרוא תוצאות בלי ספק, הרשאה, אישור ונתונים אמיתיים.",
      })],
      userMessage: canRead
        ? "נקלטו תוצאות אמיתיות מהספק, בלי להסיק הצלחה מעבר למדד שנמדד."
        : "אין תוצאות אמיתיות לקריאה עכשיו, ולכן Nexus לא ממציא מדדים.",
    };
  }

  if (requestedAction === "schedule" || requestedAction === "publish") {
    if (!REAL_V1_PROVIDERS.has(provider)) {
      return {
        ...base,
        status: "ready-for-approval",
        history: [buildHistoryEvent({ action: requestedAction, status: "draft-only", provider, reason: "ספק לא מקודם לביצוע אמיתי בשחרור הראשון." })],
        userMessage: "הספק הזה לא פתוח לביצוע אמיתי בשחרור הראשון, לכן נשארים בטיוטה ידנית.",
      };
    }
    if (permissions.providerConnected !== true) {
      return {
        ...base,
        status: "needs-provider",
        history: [buildHistoryEvent({ action: requestedAction, status: "needs-provider", provider, reason: "חסר ספק מחובר והרשאה מצומצמת." })],
        userMessage: "אפשר להכין טיוטה, אבל תזמון או פרסום דורשים ספק מחובר והרשאה מצומצמת.",
      };
    }
    if (!permissions.scopes.includes(requestedAction)) {
      return {
        ...base,
        status: "needs-provider",
        history: [buildHistoryEvent({ action: requestedAction, status: "missing-scope", provider, reason: `חסרה הרשאת ${requestedAction}.` })],
        userMessage: "הספק מחובר, אבל חסרה הרשאה מדויקת לפעולה הזו.",
      };
    }
    const firstPost = sequence[0];
    const postApproved = hasExplicitPostApproval(postApprovals, requestedAction, provider, firstPost.postId);
    if (!postApproved) {
      return {
        ...base,
        status: "needs-approval",
        history: [buildHistoryEvent({
          action: requestedAction,
          status: "needs-approval",
          provider,
          postId: firstPost.postId,
          reason: campaignApproved
            ? "אישור קמפיין כללי לא מספיק לפרסום או תזמון פוסט."
            : "חסר אישור נקודתי לפוסט ולפעולה.",
        })],
        userMessage: "צריך אישור נקודתי לפוסט, לספק ולפעולה. אישור כללי לקמפיין לא מפרסם פוסטים.",
      };
    }
    return {
      ...base,
      status: requestedAction === "schedule" ? "scheduled" : "published",
      sequence: sequence.map((post) => post.postId === firstPost.postId
        ? { ...post, externalActionPerformed: true }
        : post),
      externalExecutionPerformed: true,
      history: [
        buildHistoryEvent({
          action: requestedAction,
          status: requestedAction === "schedule" ? "scheduled" : "published",
          provider,
          postId: firstPost.postId,
          reason: "בוצעה פעולה רק אחרי ספק, הרשאה ואישור נקודתי.",
        }),
      ],
      userMessage: requestedAction === "schedule"
        ? "הפוסט הראשון תוזמן אחרי אישור נקודתי והרשאת ספק מתאימה."
        : "הפוסט הראשון פורסם אחרי אישור נקודתי והרשאת ספק מתאימה.",
    };
  }

  return {
    ...base,
    requiresAgent: missingAsset ? "share-demo-agent" : "none",
    history: [buildHistoryEvent({ action: "draft", status: "ready-for-approval", provider, reason: "נוצרה טיוטת קמפיין קטנה לאישור." })],
    userMessage: missingAsset
      ? "הקמפיין הוכן כטיוטה, אבל נכס חזותי חסר ולכן צריך לעבור לשיתוף או דמו לפני שימוש במדיה."
      : base.userMessage,
  };
}

export function summarizeSocialCampaignExecutionAgent(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-AGT-002"),
    agentId: normalizeString(safeEnvelope.agentId, "social-campaign-execution-agent"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    campaignType: normalizeString(safeEnvelope.campaignType, "learning-experiment"),
    selectedProvider: normalizeString(safeEnvelope.selectedProvider, "instagram"),
    requestedAction: normalizeString(safeEnvelope.requestedAction, "draft"),
    sequenceCount: normalizeArray(safeEnvelope.sequence).length,
    firstReleaseRealProviders: normalizeArray(safeEnvelope.permissions?.firstReleaseRealProviders),
    draftOnlyProviders: normalizeArray(safeEnvelope.permissions?.draftOnlyProviders),
    providerConnected: safeEnvelope.permissions?.providerConnected === true,
    scopes: normalizeArray(safeEnvelope.permissions?.scopes),
    perPostApprovalRequired: safeEnvelope.approval?.perPostApprovalRequired !== false,
    campaignApprovalCannotPublishPosts: safeEnvelope.approval?.campaignApprovalCannotPublishPosts !== false,
    manualCopyAvailable: safeEnvelope.fallback?.manualCopyAvailable !== false,
    draftOnlyBecauseProviderMissing: safeEnvelope.fallback?.draftOnlyBecauseProviderMissing === true,
    missingAsset: normalizeString(safeEnvelope.fallback?.missingAsset),
    blockedActions: normalizeArray(safeEnvelope.blockedActions),
    requiresAgent: normalizeString(safeEnvelope.requiresAgent, "none"),
    externalExecutionPerformed: safeEnvelope.externalExecutionPerformed === true,
    fabricatedMetricsBlocked: safeEnvelope.resultIntake?.fabricatedMetricsBlocked !== false,
    commentsSummary: normalizeObject(safeEnvelope.resultIntake?.commentsSummary),
    userMessage: normalizeString(safeEnvelope.userMessage, "קמפיין חברתי עדיין לא נוצר."),
    history: normalizeArray(safeEnvelope.history),
  };
}
