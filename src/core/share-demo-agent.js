function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function cloneJson(value) {
  if (value === undefined) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function buildProductSummary(project = {}) {
  const artifactExpectation = normalizeObject(project.artifactExpectation ?? project.context?.artifactExpectation ?? project.state?.artifactExpectation);
  const runtimeSkeletonTruth = normalizeObject(project.runtimeSkeletonTruth ?? project.context?.runtimeSkeletonTruth ?? project.state?.runtimeSkeletonTruth);
  const productDomainSkeleton = normalizeObject(project.productDomainSkeleton ?? project.context?.productDomainSkeleton ?? project.state?.productDomainSkeleton);
  const skeletonChoiceTruth = normalizeObject(project.skeletonChoiceTruth ?? project.context?.skeletonChoiceTruth ?? project.state?.skeletonChoiceTruth);
  const selectedCandidate = normalizeObject(skeletonChoiceTruth.selectedCandidate);

  return {
    title: normalizeString(runtimeSkeletonTruth.title, normalizeString(artifactExpectation.title, normalizeString(project.name, "תוצר Nexus"))),
    goal: normalizeString(project.goal, normalizeString(artifactExpectation.summary, "תצוגת מוצר מוגבלת")),
    productClass: normalizeString(runtimeSkeletonTruth.productKind, normalizeString(artifactExpectation.projectType, "product")),
    domainModel: normalizeString(productDomainSkeleton.domainModel?.name, normalizeString(productDomainSkeleton.domainName, "מוצר")),
    selectedDirection: normalizeString(
      selectedCandidate.userFacingLabel,
      normalizeString(skeletonChoiceTruth.selectedProductDirection, "כיוון שלד נבחר"),
    ),
  };
}

function buildDefaultIncludedContent(project = {}) {
  const summary = buildProductSummary(project);
  return [
    `מסך תצוגה של ${summary.title}`,
    `הסבר קצר על ${summary.domainModel}`,
    "פעולות מוצר בסיסיות שמותר להראות",
  ];
}

function buildDefaultExcludedContent() {
  return [
    "שיחה פרטית עם Nexus",
    "שמות סוכנים ומשימות פנימיות",
    "מפת מוצר פנימית",
    "סודות, ספקים, מפתחות או שגיאות מערכת",
    "טיוטות שלא אושרו",
  ];
}

function resolveShareType(input = {}) {
  const text = `${input.requestText ?? ""} ${input.shareType ?? ""} ${input.viewerType ?? ""}`.toLowerCase();
  if (text.includes("public") || text.includes("ציבור")) {
    return "public-link";
  }
  if (text.includes("investor") || text.includes("משקיע")) {
    return "demo";
  }
  if (text.includes("client") || text.includes("לקוח")) {
    return "client-review";
  }
  return normalizeString(input.shareType, "review-demo");
}

function requiresApproval(shareType = "", input = {}) {
  if (shareType === "public-link" || shareType === "client-review" || shareType === "demo") {
    return true;
  }
  return input.external === true || input.liveShare === true || normalizeArray(input.includeScreens).length > 1;
}

export function buildShareDemoAgentEnvelope({ project = {}, input = {}, previous = null } = {}) {
  const safeProject = normalizeObject(project);
  const safeInput = normalizeObject(input);
  const existing = normalizeObject(previous);
  const summary = buildProductSummary(safeProject);
  const shareType = resolveShareType(safeInput);
  const approvalRequired = requiresApproval(shareType, safeInput);
  const createdAt = normalizeString(existing.createdAt, nowIso());
  const requestedAt = nowIso();
  const shareId = normalizeString(existing.shareId, `share-demo:${normalizeString(safeProject.id, "project")}:${Date.now()}`);
  const mode = safeInput.liveShare === true ? "live-share-requested" : "snapshot";
  const status = approvalRequired ? "approval-required" : "snapshot-ready";

  return {
    agentId: "share-demo-agent",
    taskId: "SHARE-AGT-001",
    responseSource: "agent-envelope",
    shareId,
    status,
    shareType,
    mode,
    active: false,
    approvalRequired,
    approvalStatus: approvalRequired ? "waiting" : "not-required",
    productSummary: summary,
    visibilityBoundary: {
      include: normalizeArray(safeInput.includeContent).length
        ? normalizeArray(safeInput.includeContent).map((item) => normalizeString(item)).filter(Boolean)
        : buildDefaultIncludedContent(safeProject),
      exclude: buildDefaultExcludedContent(),
      privacyScope: "הנמען רואה תצוגת מוצר מוגבלת בלבד, לא את מאחורי הקלעים של Nexus.",
    },
    audience: {
      viewerType: normalizeString(safeInput.viewerType, shareType === "public-link" ? "צופה חיצוני" : "בודק מוצר"),
      purpose: normalizeString(safeInput.purpose, "לקבל רושם או משוב בלי גישה מלאה לפרויקט."),
    },
    controls: {
      canApprove: approvalRequired,
      canRevoke: false,
      canExpire: true,
      defaultExpirationHours: 72,
      liveShareRequiresApproval: true,
    },
    userReply: approvalRequired
      ? "הכנתי הצעת שיתוף בטוחה. לפני שזה יוצא החוצה צריך אישור מפורש."
      : "הכנתי תצוגת סקירה פנימית שאפשר לבדוק בלי לפתוח קישור חיצוני.",
    requestedAt,
    createdAt,
    approvedAt: null,
    revokedAt: null,
    shareLink: "",
    localReviewPath: "",
    providerBoundary: "אין פרסום חיצוני, אין קישור ציבורי אמיתי, ואין ספק חיצוני במשימה הזאת.",
    projectId: normalizeString(safeProject.id),
  };
}

export function approveShareDemoAgentEnvelope({ project = {}, envelope = {} } = {}) {
  const safeProject = normalizeObject(project);
  const safeEnvelope = normalizeObject(envelope);
  const shareId = normalizeString(safeEnvelope.shareId, `share-demo:${normalizeString(safeProject.id, "project")}:approved`);
  const token = shareId.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "share-demo";
  const localReviewPath = `/share?projectId=${encodeURIComponent(normalizeString(safeProject.id))}&shareId=${encodeURIComponent(token)}`;

  return {
    ...safeEnvelope,
    shareId,
    status: "approved-snapshot",
    active: true,
    approvalRequired: safeEnvelope.approvalRequired !== false,
    approvalStatus: "approved",
    controls: {
      ...normalizeObject(safeEnvelope.controls),
      canApprove: false,
      canRevoke: true,
      canExpire: true,
      defaultExpirationHours: normalizeObject(safeEnvelope.controls).defaultExpirationHours ?? 72,
    },
    userReply: "אושרה תצוגת סקירה מקומית ומוגבלת. זה עדיין לא פרסום ציבורי.",
    approvedAt: nowIso(),
    revokedAt: null,
    localReviewPath,
    shareLink: localReviewPath,
    approvalRecord: {
      approvedBy: "user",
      approvedAt: nowIso(),
      approvalMeaning: "אישור להציג snapshot מקומי מוגבל, לא שחרור ציבורי.",
    },
    projectId: normalizeString(safeProject.id),
  };
}

export function revokeShareDemoAgentEnvelope({ envelope = {} } = {}) {
  const safeEnvelope = normalizeObject(envelope);
  return {
    ...safeEnvelope,
    status: "revoked",
    active: false,
    approvalStatus: safeEnvelope.approvalStatus === "approved" ? "revoked" : normalizeString(safeEnvelope.approvalStatus, "revoked"),
    controls: {
      ...normalizeObject(safeEnvelope.controls),
      canApprove: false,
      canRevoke: false,
    },
    userReply: "תצוגת השיתוף בוטלה. הקישור המקומי כבר לא פעיל.",
    revokedAt: nowIso(),
  };
}

export function buildShareDemoAgentSnapshot(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  return {
    taskId: "SHARE-AGT-001",
    shareId: normalizeString(safeEnvelope.shareId),
    status: normalizeString(safeEnvelope.status, "not-prepared"),
    active: safeEnvelope.active === true,
    shareType: normalizeString(safeEnvelope.shareType, "review-demo"),
    mode: normalizeString(safeEnvelope.mode, "snapshot"),
    approvalStatus: normalizeString(safeEnvelope.approvalStatus, "not-required"),
    productSummary: cloneJson(safeEnvelope.productSummary ?? null),
    visibilityBoundary: cloneJson(safeEnvelope.visibilityBoundary ?? null),
    shareLink: normalizeString(safeEnvelope.shareLink),
    userReply: normalizeString(safeEnvelope.userReply),
  };
}
