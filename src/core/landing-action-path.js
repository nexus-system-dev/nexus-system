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
  "fake-customers",
  "fake-testimonials",
  "fake-proof",
  "fake-conversions",
  "guarantee-leads",
  "guarantee-sales",
  "guarantee-revenue",
  "publish-without-approval",
  "release-impersonation",
  "collect-without-consent",
];

const LANDING_EVENTS = [
  "landing.opened",
  "landing.clicked",
  "landing.cta.clicked",
  "landing.form.submitted",
  "landing.time.on.page",
  "landing.manual.feedback",
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
      ?? safeProject.productOwnedBackendSkeleton
      ?? context.productOwnedBackendSkeleton
      ?? state.productOwnedBackendSkeleton
      ?? safeProject.shareDemoAgent
      ?? context.shareDemoAgent
      ?? state.shareDemoAgent
      ?? safeProject.landingPageIa
      ?? context.landingPageIa
      ?? state.landingPageIa
      ?? safeProject.artifactExpectation
      ?? state.artifactExpectation
      ?? safeProject.generationIntent
      ?? state.generationIntent,
  );
}

function readProjectText(project, key) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  return normalizeString(
    safeProject[key]
      ?? context[key]
      ?? state[key]
      ?? safeProject.manualContext?.[key],
  );
}

function resolveProductBasis(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const runtime = normalizeObject(safeProject.runtimeSkeletonTruth ?? context.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  const growthWorkspace = normalizeObject(safeProject.growthWorkspace ?? context.growthWorkspace ?? state.growthWorkspace);
  const goal = normalizeString(safeProject.goal);
  const explicitAudience = normalizeString(growthWorkspace.strategy?.targetAudience) || readProjectText(safeProject, "targetAudience");
  const explicitProblem = readProjectText(safeProject, "problem");
  const explicitCoreValue = readProjectText(safeProject, "coreValue") || readProjectText(safeProject, "valueProposition");
  const explicitDirection = readProjectText(safeProject, "productDirection");
  const audience = normalizeString(
    explicitAudience || (/ליד|lead|וואטסאפ|whatsapp/iu.test(goal) ? "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב" : ""),
    "",
  );
  const problem = normalizeString(
    explicitProblem || (/ליד|lead|וואטסאפ|whatsapp/iu.test(goal) ? "לידים נכנסים משיחות ומוואטסאפ, אבל אין בעלות ותזכורת ברורה." : ""),
    "",
  );
  const coreValue = normalizeString(
    explicitCoreValue || goal,
    "",
  );
  const productDirection = normalizeString(
    explicitDirection || runtime.productClass || state.artifactExpectation?.projectType,
    "",
  );
  const languageContext = `${goal} ${audience} ${problem} ${coreValue}`;
  const isHebrew = /[\u0590-\u05FF]/u.test(languageContext);
  return {
    productId: normalizeString(safeProject.id, "landing-project"),
    assetId: normalizeString(runtime.runtimeSkeletonId ?? safeProject.artifactId, "local-product-artifact"),
    title: normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "התוצר הראשון"),
    audience,
    problem,
    coreValue,
    productDirection,
    language: isHebrew ? "he" : "en",
    direction: isHebrew ? "rtl" : "ltr",
  };
}

function readinessMissing(productBasis, project) {
  const missing = [];
  if (!hasProductTruth(project)) missing.push("product-truth");
  if (!productBasis.audience) missing.push("target-audience");
  if (!productBasis.problem) missing.push("problem");
  if (!productBasis.coreValue) missing.push("core-value");
  if (!productBasis.productDirection) missing.push("product-direction");
  return missing;
}

function resolveAction(userInput) {
  const input = normalizeString(userInput).toLowerCase();
  if (includesAny(input, [/publish|release|public|go live|פרסם|לפרסם|שחרור|ציבורי|לאוויר/u])) return "external-visibility";
  if (includesAny(input, [/share|demo|send|לשתף|דמו|לשלוח/u])) return "shared-demo";
  if (includesAny(input, [/result|results|conversion|lead|click|תוצאה|תוצאות|מדד|מדידה|המרה|ליד|קליק/u])) return "read-results";
  if (includesAny(input, [/price|pricing|promise|audience|capability|behavior|מחיר|הבטחה|קהל|יכולת|התנהגות/u])) return "product-truth-change";
  if (includesAny(input, [/color|layout|image|hero|spacing|button|צבע|עיצוב|תמונה|כפתור|ריווח|הירו/u])) return "visual-change";
  if (includesAny(input, [/preview|תצוגה מקדימה/u])) return "preview";
  return "draft";
}

function hasApproval(approvalDecisions, action) {
  const safeDecisions = normalizeObject(approvalDecisions);
  return normalizeArray(safeDecisions.approvals).some((approval) => {
    const safeApproval = normalizeObject(approval);
    return safeApproval.approved === true && normalizeString(safeApproval.action ?? safeApproval.approvalId) === action;
  }) || safeDecisions[`${action}Approved`] === true;
}

function resolveShareGate(shareDemoAgent, releaseGate) {
  const share = normalizeObject(shareDemoAgent);
  const release = normalizeObject(releaseGate);
  return {
    shareDemoReady: ["ready", "approved", "share-ready", "active"].includes(normalizeString(share.status)),
    releaseReady: ["ready", "approved", "release-ready", "active"].includes(normalizeString(release.status)),
    shareGateId: normalizeString(share.shareId ?? share.shareDemoId),
    releaseGateId: normalizeString(release.releaseId ?? release.releaseGateId),
  };
}

function resolveLeadCapture(leadCapture = {}) {
  const lead = normalizeObject(leadCapture);
  const storage = normalizeString(lead.storage ?? lead.storageType ?? lead.storageTarget, "nexus-experiment-leads");
  const consentText = normalizeString(lead.consentText, "אני מאשר/ת להשתמש בפרטים שלי לצורך בדיקת התאמה וחזרה אליי.");
  const consentRequired = lead.consentRequired !== false;
  const consentConfigured = consentRequired && Boolean(consentText) && storage !== "undefined";
  return {
    enabled: lead.enabled !== false,
    consentRequired,
    consentText,
    consentConfigured,
    storage,
    fallbackStorage: storage === "nexus-experiment-leads",
    fields: normalizeArray(lead.fields).length ? normalizeArray(lead.fields).map((item) => normalizeString(item)).filter(Boolean) : ["name", "email", "need"],
  };
}

function buildDraft(productBasis) {
  const rtl = productBasis.direction === "rtl";
  return {
    landingDraftId: `landing-draft:${productBasis.productId}`,
    language: productBasis.language,
    direction: productBasis.direction,
    maxVersions: 2,
    statusLabel: rtl ? "טיוטה פנימית" : "Internal draft",
    hypothesis: rtl
      ? `אם ${productBasis.audience} רואה עמוד קצר על ${productBasis.title}, הוא יבין את הערך וישאיר סימן עניין.`
      : `If ${productBasis.audience} sees a short page about ${productBasis.title}, they understand the value and leave an interest signal.`,
    versions: [
      {
        versionId: "landing-version-a",
        headline: rtl ? `${productBasis.title} שמסדר את המעקב אחרי לידים` : `${productBasis.title} for clearer follow-up`,
        subheadline: rtl ? productBasis.coreValue : productBasis.coreValue,
        cta: rtl ? "בדקו אם זה מתאים לי" : "Check if this fits",
      },
      {
        versionId: "landing-version-b",
        headline: rtl ? "לא מאבדים ליד בגלל חוסר מעקב" : "Stop losing leads to unclear follow-up",
        subheadline: rtl ? productBasis.problem : productBasis.problem,
        cta: rtl ? "שלחו לי דמו קצר" : "Send me a short demo",
      },
    ],
    sections: rtl
      ? ["למי זה מיועד", "הבעיה", "איך זה עובד", "טופס השארת פרטים עם הסכמה"]
      : ["Who it is for", "The problem", "How it works", "Lead form with consent"],
    measurementEvents: LANDING_EVENTS,
  };
}

function resolveMeasurement(providerResults, measurementTruth) {
  const measurement = normalizeObject(measurementTruth);
  const results = normalizeObject(providerResults);
  const hasRealMeasurementOwner = measurement.taskId === "GROW-MEASURE-001";
  const hasResult = ["views", "clicks", "ctaClicks", "formSubmissions", "timeOnPageSeconds", "manualFeedbackCount"]
    .some((key) => Object.prototype.hasOwnProperty.call(results, key));
  return {
    measurementOwner: "GROW-MEASURE-001",
    landingEvents: LANDING_EVENTS,
    resultTruthAvailable: hasRealMeasurementOwner && hasResult,
    fabricatedConversionDataBlocked: true,
    successClaimAllowed: hasRealMeasurementOwner && hasResult,
    metrics: hasRealMeasurementOwner && hasResult
      ? {
          views: Number.isFinite(Number(results.views)) ? Number(results.views) : 0,
          clicks: Number.isFinite(Number(results.clicks)) ? Number(results.clicks) : 0,
          ctaClicks: Number.isFinite(Number(results.ctaClicks)) ? Number(results.ctaClicks) : 0,
          formSubmissions: Number.isFinite(Number(results.formSubmissions)) ? Number(results.formSubmissions) : 0,
          timeOnPageSeconds: Number.isFinite(Number(results.timeOnPageSeconds)) ? Number(results.timeOnPageSeconds) : 0,
          manualFeedbackCount: Number.isFinite(Number(results.manualFeedbackCount)) ? Number(results.manualFeedbackCount) : 0,
        }
      : {},
  };
}

function buildHistoryEvent({ action, status, reason }) {
  return {
    eventId: `landing:${Date.now()}:${action}:${status}`,
    taskId: "GROW-LAND-001",
    action,
    status,
    reason,
    visibleSummary: reason,
    occurredAt: new Date().toISOString(),
  };
}

function userMessage(status) {
  const messages = {
    "needs-product-readiness": "אי אפשר להכין דף נחיתה בלי קהל, בעיה, ערך וכיוון מוצר ברורים.",
    "draft-ready": "הוכן דף נחיתה כטיוטה פנימית. הוא עדיין לא ציבורי ולא נשלח.",
    "preview-ready": "התצוגה המקדימה מוכנה לבדיקה פנימית, אבל עדיין לא ציבורית.",
    "needs-share-or-release-gate": "כדי להוציא את הדף החוצה צריך מסלול שיתוף או שחרור ואישור מפורש.",
    "shared-demo-ready": "הדף מוכן לשיתוף דמו מאושר, לא כשחרור ציבורי.",
    "release-handoff-ready": "הדף מוכן למסלול שחרור מאושר, אבל לא מפרסם את עצמו.",
    "handoff-to-mutation": "השינוי המבוקש משנה אמת מוצר ולכן עובר למסלול שינוי.",
    "handoff-to-visual-build": "השינוי המבוקש חזותי ולכן עובר למסלול בנייה חזותית.",
    "results-received": "נקלטו תוצאות דרך מדידה אמיתית. הדף עצמו לא מסיק הצלחה לבד.",
    "draft-mode-results-missing": "אין נתונים אמיתיים ולכן אין טענת הצלחה.",
    "failed-safely": "הפעולה נעצרה בבטחה. הדף לא פורסם ולא נטען כהצלחה.",
  };
  return messages[status] ?? "מסלול דף הנחיתה נשאר פנימי עד שיש שער שיתוף או שחרור.";
}

export function buildLandingActionPathEnvelope({
  project = null,
  userInput = "",
  growthAgent = null,
  approvalDecisions = {},
  shareDemoAgent = null,
  releaseGate = null,
  leadCapture = {},
  providerResults = null,
  measurementTruth = null,
} = {}) {
  const safeProject = normalizeObject(project);
  const input = normalizeString(userInput);
  const action = resolveAction(input);
  const productBasis = resolveProductBasis(safeProject);
  const missing = readinessMissing(productBasis, safeProject);
  const draft = buildDraft(productBasis);
  const shareGate = resolveShareGate(
    shareDemoAgent ?? safeProject.shareDemoAgent ?? safeProject.context?.shareDemoAgent ?? safeProject.state?.shareDemoAgent,
    releaseGate ?? safeProject.releaseGate ?? safeProject.releaseWorkspace ?? safeProject.context?.releaseWorkspace ?? safeProject.state?.releaseWorkspace,
  );
  const leadCaptureTruth = resolveLeadCapture(leadCapture);
  const measurement = resolveMeasurement(providerResults, measurementTruth);
  const externalApproval = hasApproval(approvalDecisions, "external-visibility");
  const shareApproval = hasApproval(approvalDecisions, "share-demo");
  const releaseApproval = hasApproval(approvalDecisions, "release");
  let status = "draft-ready";

  if (missing.length > 0) {
    status = "needs-product-readiness";
  } else if (action === "product-truth-change") {
    status = "handoff-to-mutation";
  } else if (action === "visual-change") {
    status = "handoff-to-visual-build";
  } else if (action === "read-results") {
    status = measurement.resultTruthAvailable ? "results-received" : "draft-mode-results-missing";
  } else if (action === "preview") {
    status = "preview-ready";
  } else if (action === "shared-demo") {
    status = shareGate.shareDemoReady && shareApproval ? "shared-demo-ready" : "needs-share-or-release-gate";
  } else if (action === "external-visibility") {
    if (shareGate.releaseReady && releaseApproval && externalApproval) {
      status = "release-handoff-ready";
    } else if (shareGate.shareDemoReady && shareApproval && externalApproval) {
      status = "shared-demo-ready";
    } else {
      status = "needs-share-or-release-gate";
    }
  }

  const publicVisible = status === "shared-demo-ready" || status === "release-handoff-ready";
  return {
    taskId: "GROW-LAND-001",
    agentId: "landing-action-path",
    responseSource: "bounded-landing-action-path",
    projectId: productBasis.productId,
    requestedAction: action,
    status,
    productBasis,
    readiness: {
      ready: missing.length === 0,
      missing,
      requiresAudienceProblemCoreValueAndDirection: true,
    },
    draft,
    visibility: {
      defaultMode: "internal-draft",
      draftInternal: !publicVisible,
      previewInspectableNotPublic: status === "preview-ready",
      publicVisible,
      externalApprovalRequired: true,
      externalApprovalGranted: externalApproval,
      shareDemoReady: shareGate.shareDemoReady,
      releaseReady: shareGate.releaseReady,
      shareApprovalGranted: shareApproval,
      releaseApprovalGranted: releaseApproval,
      shareOrReleaseGateRequired: true,
      releaseImpersonationBlocked: status !== "release-handoff-ready",
    },
    handoffs: {
      mutationRequiredForProductTruthChanges: status === "handoff-to-mutation",
      visualBuildRequiredForVisibleChanges: status === "handoff-to-visual-build" || status === "draft-ready" || status === "preview-ready",
      shareDemoRequiredForExternalVisibility: true,
      releaseRequiredForPublicRelease: true,
      measurementOwner: "GROW-MEASURE-001",
    },
    leadCapture: leadCaptureTruth,
    measurement,
    forbiddenClaims: FORBIDDEN_CLAIMS,
    successClaimBlockedWithoutMeasurement: !measurement.successClaimAllowed,
    externalPublicationPerformed: false,
    productTruthOwner: "source-product-not-landing",
    growthAgentTaskId: normalizeString(growthAgent?.taskId, "GROW-AGT-001"),
    userMessage: userMessage(status),
    history: [
      buildHistoryEvent({ action, status, reason: userMessage(status) }),
    ],
  };
}

export function summarizeLandingActionPath(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  const productBasis = normalizeObject(safeEnvelope.productBasis);
  const readiness = normalizeObject(safeEnvelope.readiness);
  const draft = normalizeObject(safeEnvelope.draft);
  const visibility = normalizeObject(safeEnvelope.visibility);
  const handoffs = normalizeObject(safeEnvelope.handoffs);
  const leadCapture = normalizeObject(safeEnvelope.leadCapture);
  const measurement = normalizeObject(safeEnvelope.measurement);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-LAND-001"),
    agentId: normalizeString(safeEnvelope.agentId, "landing-action-path"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    requestedAction: normalizeString(safeEnvelope.requestedAction, "draft"),
    language: normalizeString(productBasis.language, "he"),
    direction: normalizeString(productBasis.direction, "rtl"),
    audience: normalizeString(productBasis.audience),
    problem: normalizeString(productBasis.problem),
    coreValue: normalizeString(productBasis.coreValue),
    productDirection: normalizeString(productBasis.productDirection),
    ready: readiness.ready === true,
    missing: normalizeArray(readiness.missing).map((item) => normalizeString(item)).filter(Boolean),
    hypothesis: normalizeString(draft.hypothesis),
    versionCount: normalizeArray(draft.versions).length,
    maxVersions: Number.isFinite(Number(draft.maxVersions)) ? Number(draft.maxVersions) : 2,
    ctaVariants: normalizeArray(draft.versions).map((item) => normalizeString(item.cta)).filter(Boolean),
    sections: normalizeArray(draft.sections).map((item) => normalizeString(item)).filter(Boolean),
    draftInternal: visibility.draftInternal !== false,
    previewInspectableNotPublic: visibility.previewInspectableNotPublic === true,
    publicVisible: visibility.publicVisible === true,
    externalApprovalGranted: visibility.externalApprovalGranted === true,
    shareDemoReady: visibility.shareDemoReady === true,
    releaseReady: visibility.releaseReady === true,
    shareApprovalGranted: visibility.shareApprovalGranted === true,
    releaseApprovalGranted: visibility.releaseApprovalGranted === true,
    shareOrReleaseGateRequired: visibility.shareOrReleaseGateRequired !== false,
    releaseImpersonationBlocked: visibility.releaseImpersonationBlocked !== false,
    mutationRequiredForProductTruthChanges: handoffs.mutationRequiredForProductTruthChanges === true,
    visualBuildRequiredForVisibleChanges: handoffs.visualBuildRequiredForVisibleChanges === true,
    measurementOwner: normalizeString(handoffs.measurementOwner, "GROW-MEASURE-001"),
    leadCaptureEnabled: leadCapture.enabled !== false,
    consentConfigured: leadCapture.consentConfigured === true,
    leadStorage: normalizeString(leadCapture.storage, "nexus-experiment-leads"),
    fallbackStorage: leadCapture.fallbackStorage === true,
    landingEvents: normalizeArray(measurement.landingEvents).map((item) => normalizeString(item)).filter(Boolean),
    resultTruthAvailable: measurement.resultTruthAvailable === true,
    fabricatedConversionDataBlocked: measurement.fabricatedConversionDataBlocked !== false,
    successClaimAllowed: measurement.successClaimAllowed === true,
    forbiddenClaims: normalizeArray(safeEnvelope.forbiddenClaims).map((item) => normalizeString(item)).filter(Boolean),
    successClaimBlockedWithoutMeasurement: safeEnvelope.successClaimBlockedWithoutMeasurement !== false,
    externalPublicationPerformed: safeEnvelope.externalPublicationPerformed === true,
    productTruthOwner: normalizeString(safeEnvelope.productTruthOwner, "source-product-not-landing"),
    userMessage: normalizeString(safeEnvelope.userMessage, "מסלול דף נחיתה עדיין לא נוצר."),
    historyCount: normalizeArray(safeEnvelope.history).length,
  };
}
