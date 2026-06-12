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

const PREFERRED_V1_PROVIDERS = new Set(["mailchimp", "sendgrid"]);
const LIMITED_V1_PROVIDERS = new Set(["gmail"]);
const OPTIONAL_V1_PROVIDERS = new Set(["convertkit"]);
const REQUIRED_SEND_APPROVALS = ["content", "audience-source", "send"];
const REQUIRED_AUDIENCE_SEND_SCOPES = ["email-draft", "test-send", "send"];
const REQUIRED_TEST_SEND_SCOPES = ["email-draft", "test-send"];
const FORBIDDEN_PROMISES = [
  "guarantee-opens",
  "guarantee-clicks",
  "guarantee-replies",
  "guarantee-leads",
  "guarantee-sales",
  "guarantee-conversions",
  "guarantee-revenue",
  "fabricate-open-rate",
  "fabricate-click-rate",
  "fabricate-replies",
  "send-without-approval",
  "scrape-contacts",
];

const PROVIDER_ALIASES = new Map([
  ["mailchimp", "mailchimp"],
  ["מיילצ'ימפ", "mailchimp"],
  ["מיילצימפ", "mailchimp"],
  ["sendgrid", "sendgrid"],
  ["send grid", "sendgrid"],
  ["סנדגריד", "sendgrid"],
  ["gmail", "gmail"],
  ["ג'ימייל", "gmail"],
  ["גימייל", "gmail"],
  ["convertkit", "convertkit"],
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
      ?? state.releaseWorkspace,
  );
}

function hasMeasurementPlan(measurementTruth) {
  const measurement = normalizeObject(measurementTruth);
  return measurement.taskId === "GROW-MEASURE-001"
    || normalizeArray(measurement.records).length > 0
    || Boolean(normalizeString(measurement.measurementAvailability));
}

function resolveProductBasis(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const runtime = normalizeObject(safeProject.runtimeSkeletonTruth ?? context.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  const growthWorkspace = normalizeObject(safeProject.growthWorkspace ?? context.growthWorkspace ?? state.growthWorkspace);
  return {
    productId: normalizeString(safeProject.id, "email-project"),
    artifactId: normalizeString(runtime.runtimeSkeletonId ?? safeProject.artifactId, "local-product-artifact"),
    showableArtifact: normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "התוצר הראשון"),
    audience: normalizeString(
      growthWorkspace.strategy?.targetAudience
        ?? safeProject.targetAudience
        ?? (/ליד|lead|וואטסאפ|whatsapp/iu.test(normalizeString(safeProject.goal)) ? "בעלי עסקים שכבר ביקשו דרך טובה לטפל בלידים" : ""),
      "אנשים שכבר הראו עניין במוצר",
    ),
    valueProposition: normalizeString(
      safeProject.valueProposition
        ?? safeProject.coreValue
        ?? safeProject.goal,
      "להסביר את הערך בלי להבטיח תוצאות.",
    ),
  };
}

function resolveProvider(userInput, providerConnection) {
  const connection = normalizeObject(providerConnection);
  const explicitProvider = normalizeString(connection.provider ?? connection.providerId).toLowerCase();
  if (explicitProvider) return PROVIDER_ALIASES.get(explicitProvider) ?? explicitProvider;
  const input = normalizeString(userInput).toLowerCase();
  for (const [needle, provider] of PROVIDER_ALIASES.entries()) {
    if (needle && input.includes(needle)) return provider;
  }
  return "mailchimp";
}

function resolveAction(userInput) {
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/result|open|click|reply|תוצאה|תוצאות|פתיחות|קליקים|תגובות/u])) return "read-results";
  if (includesAny(input, [/landing|page|message|copy|דף|עמוד|מסר|טקסט|קופי/u])) return "product-message-change";
  if (includesAny(input, [/send test|test send|בדיקה|שליחת בדיקה|מייל בדיקה/u])) return "test-send";
  if (includesAny(input, [/send|audience|list|שלח|לשלוח|רשימה|קהל/u])) return "audience-send";
  if (includesAny(input, [/sequence|drip|סדרה|רצף|כמה מיילים|קמפיין/u])) return "prepare-sequence";
  return "draft";
}

function normalizeProviderConnection(provider, connection) {
  const safeConnection = normalizeObject(connection);
  return {
    provider,
    providerConnected: safeConnection.connected === true || safeConnection.providerConnected === true,
    account: normalizeString(safeConnection.account ?? safeConnection.accountId),
    scopes: normalizeArray(safeConnection.scopes ?? safeConnection.providerScopes)
      .map((scope) => normalizeString(scope))
      .filter(Boolean),
  };
}

function approvalGranted(approvalDecisions, approvalId) {
  const safeDecisions = normalizeObject(approvalDecisions);
  const approvals = normalizeArray(safeDecisions.approvals);
  return approvals.some((approval) => {
    const safeApproval = normalizeObject(approval);
    return safeApproval.approved === true
      && normalizeString(safeApproval.action ?? safeApproval.approvalId) === approvalId;
  }) || safeDecisions[`${approvalId}Approved`] === true;
}

function buildApprovalState(approvalDecisions) {
  const safeDecisions = normalizeObject(approvalDecisions);
  return {
    separateApprovalRequired: true,
    campaignApproved: approvalGranted(safeDecisions, "campaign"),
    contentApproved: approvalGranted(safeDecisions, "content"),
    audienceSourceApproved: approvalGranted(safeDecisions, "audience-source"),
    testSendApproved: approvalGranted(safeDecisions, "test-send"),
    sendApproved: approvalGranted(safeDecisions, "send"),
    campaignApprovalDoesNotSendSequence: true,
    perEmailApprovalRequired: true,
  };
}

function cleanAudienceList(audienceInput) {
  const safeInput = normalizeObject(audienceInput);
  const addresses = normalizeArray(safeInput.addresses ?? safeInput.contacts)
    .map((contact) => (typeof contact === "string" ? { email: contact } : normalizeObject(contact)))
    .map((contact) => ({
      email: normalizeString(contact.email).toLowerCase(),
      name: normalizeString(contact.name),
      fields: normalizeObject(contact.fields),
    }))
    .filter((contact) => contact.email);
  const seen = new Set();
  const invalidAddresses = [];
  const cleaned = [];
  for (const contact of addresses) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
    if (!isValid) {
      invalidAddresses.push(contact.email);
      continue;
    }
    if (seen.has(contact.email)) continue;
    seen.add(contact.email);
    cleaned.push(contact);
  }
  return {
    source: normalizeString(safeInput.source ?? safeInput.audienceSource),
    sourceType: normalizeString(safeInput.sourceType),
    lawfulBasis: normalizeString(safeInput.lawfulBasis),
    ownershipConfirmed: safeInput.ownershipConfirmed === true || safeInput.rightToSendConfirmed === true,
    permissionConfirmed: safeInput.permissionConfirmed === true || safeInput.consentConfirmed === true,
    sourceConfirmed: safeInput.sourceConfirmed === true || Boolean(normalizeString(safeInput.source ?? safeInput.audienceSource)),
    coldList: safeInput.coldList === true || /cold|scrap|scrape|קר|גרד/u.test(normalizeString(safeInput.source ?? safeInput.sourceType)),
    cleanedAddresses: cleaned,
    cleanedCount: cleaned.length,
    duplicateCount: addresses.length - invalidAddresses.length - cleaned.length,
    invalidAddresses,
    invalidCount: invalidAddresses.length,
    fieldsSeparated: true,
  };
}

function buildDraft(productBasis, action) {
  const sequence = [
    {
      emailId: "email-1",
      purpose: "פתיחת שיחה",
      subjectVariants: [
        `${productBasis.showableArtifact}: דרך קצרה להבין אם זה רלוונטי`,
        `שאלה קצרה על ${productBasis.showableArtifact}`,
      ],
      bodyVariants: [
        `היי, הכנתי דרך קצרה להראות איך ${productBasis.showableArtifact} עוזר ל-${productBasis.audience}. אם זה רלוונטי, אפשר לשלוח דמו קצר ולשאול שאלה אחת.`,
        `היי, רציתי לבדוק אם הכאב הזה מוכר: ${productBasis.valueProposition}. אין כאן הבטחה לתוצאה, רק בדיקת התאמה קצרה.`,
      ],
      requiresSeparateSendApproval: true,
    },
    {
      emailId: "email-2",
      purpose: "מעקב עדין",
      subjectVariants: ["שאלה קצרה נוספת"],
      bodyVariants: ["רק מוודא אם שווה לשלוח דמו קצר. אם לא רלוונטי, לא אמשיך לפנות."],
      requiresSeparateSendApproval: true,
    },
  ];
  return {
    draftId: `email-draft:${productBasis.productId}`,
    mode: action === "prepare-sequence" ? "sequence-draft" : "single-email-draft",
    maxVariants: 2,
    tone: "professional-warm-direct",
    audienceHypothesis: productBasis.audience,
    successMetric: "נמען בדיקה אחד מבין את ההצעה ומשיב אם זה רלוונטי.",
    sequence,
  };
}

function buildHistoryEvent({ action, status, provider, reason = "" }) {
  return {
    eventId: `email:${Date.now()}:${action}:${status}`,
    taskId: "GROW-EMAIL-001",
    action,
    status,
    provider,
    reason,
    visibleSummary: reason || `${action} -> ${status}`,
    occurredAt: new Date().toISOString(),
  };
}

function resolveProviderResults(providerConnection, providerResults, measurementTruth) {
  const connection = normalizeObject(providerConnection);
  const results = normalizeObject(providerResults);
  const scopes = normalizeArray(connection.scopes);
  const canRead = connection.providerConnected === true && scopes.includes("read-results") && hasMeasurementPlan(measurementTruth);
  const hasMetrics = ["sent", "opened", "clicks", "unsubscribes", "sendErrors", "bounce", "replies", "campaignStatus"]
    .some((key) => Object.prototype.hasOwnProperty.call(results, key));
  if (!canRead || !hasMetrics) {
    return {
      providerResultsAvailable: false,
      fabricatedResultsBlocked: true,
      metricsFabricated: false,
      measurementOwner: "GROW-MEASURE-001",
      metrics: {},
    };
  }
  return {
    providerResultsAvailable: true,
    fabricatedResultsBlocked: true,
    metricsFabricated: false,
    measurementOwner: "GROW-MEASURE-001",
    metrics: {
      sent: Number.isFinite(Number(results.sent)) ? Number(results.sent) : 0,
      opened: Number.isFinite(Number(results.opened)) ? Number(results.opened) : 0,
      clicks: Number.isFinite(Number(results.clicks)) ? Number(results.clicks) : 0,
      unsubscribes: Number.isFinite(Number(results.unsubscribes)) ? Number(results.unsubscribes) : 0,
      sendErrors: Number.isFinite(Number(results.sendErrors)) ? Number(results.sendErrors) : 0,
      bounce: Number.isFinite(Number(results.bounce)) ? Number(results.bounce) : 0,
      replies: Number.isFinite(Number(results.replies)) ? Number(results.replies) : 0,
      campaignStatus: normalizeString(results.campaignStatus, "reported"),
    },
  };
}

function buildUserMessage(status, provider) {
  const messages = {
    "needs-product-first": "קודם צריך תוצר ברור שאפשר לפנות סביבו.",
    "draft-ready": "הכנתי טיוטת אימייל שמחוברת למוצר. שום דבר לא נשלח.",
    "sequence-draft-ready": "הכנתי רצף אימיילים כטיוטה. אישור קמפיין לא שולח את כל הרצף.",
    "draft-only-provider-missing": "הטיוטה מוכנה, אבל אין ספק אימייל מחובר ולכן אין שליחה.",
    "needs-audience-source": "אפשר לשמור טיוטה, אבל אי אפשר לשלוח בלי מקור קהל ברור וזכות לשלוח.",
    "needs-provider-scope": "הספק מחובר, אבל אין הרשאת שליחה מתאימה.",
    "needs-send-approval": "נדרש אישור נפרד לתוכן, לקהל ולשליחה לפני כל אימייל אמיתי.",
    "test-send-ready": "שליחת בדיקה מוכנה לאישור מול הספק. עדיין לא נשלח אימייל בפועל.",
    "one-email-send-ready": "אימייל אחד מוכן לשליחה מאושרת דרך הספק. הרצף כולו לא נשלח אוטומטית.",
    "audience-send-blocked": "שליחה לקהל הרחב חסומה בשלב הזה.",
    "gmail-broad-campaign-blocked": "ג'ימייל מוגבל לבדיקה או הודעה אישית קטנה, לא לקמפיין רחב.",
    "results-received": "נקלטו תוצאות מספק אימייל ומועברות למדידת אמת.",
    "draft-mode-provider-results-missing": "אין נתוני ספק אמיתיים ולכן אין תוצאות להצגה.",
    "handoff-required": "השינוי המבוקש הוא שינוי מוצר או עמוד, ולכן הוא עובר למסלול שינוי מתאים.",
    "failed-safely": "הפעולה נעצרה בבטחה. שום אימייל לא נשלח ואפשר לנסות שוב.",
  };
  return messages[status] ?? `מסלול אימייל נשאר חסום עד שיש אישור וספק מתאים: ${provider}.`;
}

export function buildEmailActionPathEnvelope({
  project = null,
  userInput = "",
  growthAgent = null,
  approvalDecisions = {},
  providerConnection = {},
  audienceInput = {},
  providerResults = null,
  measurementTruth = null,
} = {}) {
  const safeProject = normalizeObject(project);
  const input = normalizeString(userInput);
  const action = resolveAction(input);
  const provider = resolveProvider(input, providerConnection);
  const connection = normalizeProviderConnection(provider, providerConnection);
  const productBasis = resolveProductBasis(safeProject);
  const approval = buildApprovalState(approvalDecisions);
  const audience = cleanAudienceList(audienceInput);
  const providerResultsTruth = resolveProviderResults(connection, providerResults, measurementTruth);
  const productReady = hasProductTruth(safeProject);
  const draft = buildDraft(productBasis, action);
  const providerSupportedForRealSend = PREFERRED_V1_PROVIDERS.has(provider);
  const gmailLimited = LIMITED_V1_PROVIDERS.has(provider);
  const optionalProvider = OPTIONAL_V1_PROVIDERS.has(provider);
  const hasDraftScope = connection.scopes.includes("email-draft");
  const hasTestSendScope = connection.scopes.includes("test-send");
  const hasSendScope = connection.scopes.includes("send");
  const audienceSourceConfirmed = audience.sourceConfirmed && audience.ownershipConfirmed && audience.permissionConfirmed && !audience.coldList;
  const lawfulBasisConfirmed = Boolean(audience.lawfulBasis) && audience.permissionConfirmed && audience.ownershipConfirmed && !audience.coldList;
  let status = "draft-ready";

  if (!productReady) {
    status = "needs-product-first";
  } else if (action === "product-message-change") {
    status = "handoff-required";
  } else if (action === "read-results") {
    status = providerResultsTruth.providerResultsAvailable ? "results-received" : "draft-mode-provider-results-missing";
  } else if (action === "prepare-sequence") {
    status = "sequence-draft-ready";
  } else if (action === "test-send") {
    if (!connection.providerConnected) {
      status = "draft-only-provider-missing";
    } else if (!hasDraftScope || !hasTestSendScope) {
      status = "needs-provider-scope";
    } else if (!approval.testSendApproved) {
      status = "needs-send-approval";
    } else {
      status = "test-send-ready";
    }
  } else if (action === "audience-send") {
    if (gmailLimited) {
      status = "gmail-broad-campaign-blocked";
    } else if (optionalProvider) {
      status = "draft-only-provider-missing";
    } else if (!audienceSourceConfirmed || !lawfulBasisConfirmed) {
      status = "needs-audience-source";
    } else if (!connection.providerConnected) {
      status = "draft-only-provider-missing";
    } else if (!providerSupportedForRealSend || !hasDraftScope || !hasTestSendScope || !hasSendScope) {
      status = "needs-provider-scope";
    } else if (!REQUIRED_SEND_APPROVALS.every((approvalId) => approvalGranted(approvalDecisions, approvalId))) {
      status = "needs-send-approval";
    } else {
      status = "one-email-send-ready";
    }
  }

  const sequenceSendReadyCount = status === "one-email-send-ready" ? 1 : 0;
  const externalSendPerformed = false;
  return {
    taskId: "GROW-EMAIL-001",
    agentId: "email-action-path",
    responseSource: "bounded-email-action-path",
    projectId: productBasis.productId,
    requestedAction: action,
    status,
    productBasis,
    draft,
    providerTruth: {
      selectedProvider: provider,
      providerConnected: connection.providerConnected,
      providerSupportedForRealSend,
      gmailLimited,
      optionalProvider,
      preferredProviders: [...PREFERRED_V1_PROVIDERS],
      limitedProviders: [...LIMITED_V1_PROVIDERS],
      optionalProviders: [...OPTIONAL_V1_PROVIDERS],
      hasEmailDraftScope: hasDraftScope,
      hasTestSendScope,
      hasSendScope,
      providerConnectionIsNotSendPermission: true,
      requiredAudienceSendScopes: REQUIRED_AUDIENCE_SEND_SCOPES,
      requiredTestSendScopes: REQUIRED_TEST_SEND_SCOPES,
    },
    audienceTruth: {
      ...audience,
      audienceSourceConfirmed,
      lawfulBasisConfirmed,
      coldListRejected: audience.coldList === true,
      audienceSendBlockedWhenSourceUnclear: !audienceSourceConfirmed,
    },
    approval,
    sendTruth: {
      defaultMode: "draft-plus-test-send",
      draftOnlyByDefault: true,
      fullAudienceSendDefault: false,
      testSendPrepared: status === "test-send-ready",
      oneEmailSendPrepared: status === "one-email-send-ready",
      sequenceDraftPrepared: status === "sequence-draft-ready",
      sequenceSendReadyCount,
      everyRealEmailRequiresSeparateApproval: true,
      campaignApprovalCanPrepareSequenceOnly: true,
      externalSendPerformed,
    },
    handoffs: {
      mutationRequiredForProductTruthChanges: status === "handoff-required",
      visualBuildRequiredForPageChanges: status === "handoff-required",
      measurementOwner: "GROW-MEASURE-001",
      providerResultsConsumedThroughMeasurement: providerResultsTruth.providerResultsAvailable,
    },
    resultTruth: providerResultsTruth,
    forbiddenPromises: FORBIDDEN_PROMISES,
    safeFailure: {
      noSuccessClaim: status !== "test-send-ready" && status !== "one-email-send-ready" && status !== "results-received",
      retryPreserved: true,
      sentClaimBlocked: externalSendPerformed === false,
    },
    growthAgentTaskId: normalizeString(growthAgent?.taskId, "GROW-AGT-001"),
    userMessage: buildUserMessage(status, provider),
    history: [
      buildHistoryEvent({
        action,
        status,
        provider,
        reason: buildUserMessage(status, provider),
      }),
    ],
  };
}

export function summarizeEmailActionPath(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  const providerTruth = normalizeObject(safeEnvelope.providerTruth);
  const audienceTruth = normalizeObject(safeEnvelope.audienceTruth);
  const sendTruth = normalizeObject(safeEnvelope.sendTruth);
  const approval = normalizeObject(safeEnvelope.approval);
  const resultTruth = normalizeObject(safeEnvelope.resultTruth);
  const draft = normalizeObject(safeEnvelope.draft);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-EMAIL-001"),
    agentId: normalizeString(safeEnvelope.agentId, "email-action-path"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    requestedAction: normalizeString(safeEnvelope.requestedAction, "draft"),
    selectedProvider: normalizeString(providerTruth.selectedProvider, "mailchimp"),
    providerConnected: providerTruth.providerConnected === true,
    providerSupportedForRealSend: providerTruth.providerSupportedForRealSend === true,
    gmailLimited: providerTruth.gmailLimited === true,
    optionalProvider: providerTruth.optionalProvider === true,
    hasEmailDraftScope: providerTruth.hasEmailDraftScope === true,
    hasTestSendScope: providerTruth.hasTestSendScope === true,
    hasSendScope: providerTruth.hasSendScope === true,
    providerConnectionIsNotSendPermission: providerTruth.providerConnectionIsNotSendPermission !== false,
    preferredProviders: normalizeArray(providerTruth.preferredProviders).map((item) => normalizeString(item)).filter(Boolean),
    limitedProviders: normalizeArray(providerTruth.limitedProviders).map((item) => normalizeString(item)).filter(Boolean),
    optionalProviders: normalizeArray(providerTruth.optionalProviders).map((item) => normalizeString(item)).filter(Boolean),
    audienceSourceConfirmed: audienceTruth.audienceSourceConfirmed === true,
    lawfulBasisConfirmed: audienceTruth.lawfulBasisConfirmed === true,
    coldListRejected: audienceTruth.coldListRejected === true,
    cleanedCount: Number.isFinite(Number(audienceTruth.cleanedCount)) ? Number(audienceTruth.cleanedCount) : 0,
    duplicateCount: Number.isFinite(Number(audienceTruth.duplicateCount)) ? Number(audienceTruth.duplicateCount) : 0,
    invalidCount: Number.isFinite(Number(audienceTruth.invalidCount)) ? Number(audienceTruth.invalidCount) : 0,
    fieldsSeparated: audienceTruth.fieldsSeparated !== false,
    campaignApproved: approval.campaignApproved === true,
    contentApproved: approval.contentApproved === true,
    audienceSourceApproved: approval.audienceSourceApproved === true,
    testSendApproved: approval.testSendApproved === true,
    sendApproved: approval.sendApproved === true,
    campaignApprovalDoesNotSendSequence: approval.campaignApprovalDoesNotSendSequence !== false,
    perEmailApprovalRequired: approval.perEmailApprovalRequired !== false,
    draftOnlyByDefault: sendTruth.draftOnlyByDefault !== false,
    fullAudienceSendDefault: sendTruth.fullAudienceSendDefault === true,
    testSendPrepared: sendTruth.testSendPrepared === true,
    oneEmailSendPrepared: sendTruth.oneEmailSendPrepared === true,
    sequenceDraftPrepared: sendTruth.sequenceDraftPrepared === true,
    sequenceSendReadyCount: Number.isFinite(Number(sendTruth.sequenceSendReadyCount)) ? Number(sendTruth.sequenceSendReadyCount) : 0,
    externalSendPerformed: sendTruth.externalSendPerformed === true,
    providerResultsAvailable: resultTruth.providerResultsAvailable === true,
    fabricatedResultsBlocked: resultTruth.fabricatedResultsBlocked !== false,
    metricsFabricated: resultTruth.metricsFabricated === true,
    measurementOwner: normalizeString(resultTruth.measurementOwner, "GROW-MEASURE-001"),
    subjectVariants: normalizeArray(draft.sequence?.[0]?.subjectVariants).map((item) => normalizeString(item)).filter(Boolean).slice(0, 2),
    bodyVariants: normalizeArray(draft.sequence?.[0]?.bodyVariants).map((item) => normalizeString(item)).filter(Boolean).slice(0, 2),
    forbiddenPromises: normalizeArray(safeEnvelope.forbiddenPromises).map((item) => normalizeString(item)).filter(Boolean),
    userMessage: normalizeString(safeEnvelope.userMessage, "מסלול אימייל עדיין לא נוצר."),
    historyCount: normalizeArray(safeEnvelope.history).length,
  };
}
