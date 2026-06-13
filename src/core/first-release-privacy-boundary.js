function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

const SECRET_KEYS = new Set([
  "accessToken",
  "refreshToken",
  "token",
  "tokenBundle",
  "password",
  "passwordHash",
  "credentialReference",
  "secret",
  "apiKey",
  "authorization",
]);

function scrubSecrets(value) {
  if (Array.isArray(value)) {
    return value.map((item) => scrubSecrets(item));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (SECRET_KEYS.has(key) || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) {
        return [key, "[redacted]"];
      }
      return [key, scrubSecrets(item)];
    }),
  );
}

function buildDataInventory({ account = null, projects = [] } = {}) {
  const authPayload = normalizeObject(account);
  const projectList = normalizeArray(projects);
  const projectCount = projectList.length;
  const fileCount = projectList.reduce((count, project) => {
    const intakeFiles = normalizeArray(project.projectIntake?.uploadedFiles);
    const contextFiles = normalizeArray(project.context?.fileStorageRecord?.files);
    return count + Math.max(intakeFiles.length, contextFiles.length);
  }, 0);

  return [
    {
      key: "account",
      label: "פרטי חשבון",
      status: authPayload.userIdentity?.userId ? "stored" : "not-found",
      sourceOfTruth: "userAccountStore",
      retentionBoundary: "active-until-deletion-request-then-retained-for-security-audit",
      exportSupported: true,
      deleteState: "request-supported-final-erasure-retention-reviewed",
    },
    {
      key: "project",
      label: "אמת פרויקט",
      status: projectCount > 0 ? "stored" : "none",
      sourceOfTruth: "projectWorkspaceStore",
      recordCount: projectCount,
      retentionBoundary: "active-project-store-with-delete-request-state",
      exportSupported: true,
      deleteState: "project-delete-request-recorded-not-silent-erasure",
    },
    {
      key: "history",
      label: "היסטוריה ושיחות",
      status: projectCount > 0 ? "stored" : "none",
      sourceOfTruth: "project events and project context",
      retentionBoundary: "retained-for-product-continuity-until-project-delete-review",
      exportSupported: true,
      deleteState: "blocked-while-project-history-is-required-for-continuity",
    },
    {
      key: "files",
      label: "קבצים שהועלו",
      status: fileCount > 0 ? "stored" : "none",
      sourceOfTruth: "file intake boundary and project storage records",
      recordCount: fileCount,
      retentionBoundary: "stored-with-project-until-file-or-project-delete-request",
      exportSupported: true,
      deleteState: "request-supported-for-known-project-files",
    },
    {
      key: "generated-product-package",
      label: "חבילת מוצר שנוצרה",
      status: projectList.some((project) => project.context?.productRuntimePackage || project.context?.standaloneArtifact)
        ? "stored"
        : "not-created",
      sourceOfTruth: "project context package records",
      retentionBoundary: "retained-with-project-package-state",
      exportSupported: true,
      deleteState: "blocked-until-package-delete-hook-exists",
    },
    {
      key: "provider-metadata",
      label: "מטא דאטה של ספקים",
      status: projectList.some((project) => project.context?.providerGatewayBoundary || project.context?.providerConnection)
        ? "stored"
        : "none",
      sourceOfTruth: "provider gateway boundary",
      retentionBoundary: "local-provider-metadata-only-provider-side-delete-not-claimed",
      exportSupported: true,
      deleteState: "blocked-provider-side-deletion-requires-provider-proof",
    },
    {
      key: "billing",
      label: "חיוב ושימוש",
      status: projectList.some((project) => normalizeArray(project.manualContext?.normalizedBillingEvents).length > 0)
        ? "stored"
        : "not-enabled",
      sourceOfTruth: "billing event records when enabled",
      retentionBoundary: "billing-legal-retention-when-real-billing-exists",
      exportSupported: true,
      deleteState: "blocked-where-legal-billing-retention-applies",
    },
    {
      key: "logs",
      label: "לוגים טכניים",
      status: "stored-append-only",
      sourceOfTruth: "event logs and observability stores",
      retentionBoundary: "security-and-debug-retention",
      exportSupported: "summary-only",
      deleteState: "blocked-security-retention",
    },
    {
      key: "analytics",
      label: "מדידה וצמיחה",
      status: projectList.some((project) => project.context?.growthMeasurementTruth || project.context?.conversionAnalytics)
        ? "stored"
        : "not-enabled",
      sourceOfTruth: "project growth and measurement context",
      retentionBoundary: "project-scoped-analytics-until-project-delete-review",
      exportSupported: true,
      deleteState: "request-supported-where-project-scoped",
    },
    {
      key: "audit",
      label: "רשומות אבטחה וביקורת",
      status: "stored-append-only",
      sourceOfTruth: "system and security audit stores",
      retentionBoundary: "retained-for-security-integrity",
      exportSupported: "summary-only",
      deleteState: "blocked-security-audit-retention",
    },
  ];
}

function buildRetentionPolicy() {
  return {
    activeData: "נשמר כל עוד החשבון או הפרויקט פעילים.",
    deletedData: "בקשת מחיקה מסמנת את הנתונים לבדיקה ומוחקת רק נתיבים שנתמכים בלי לשבור אבטחה או רציפות.",
    backups: "גיבויים אינם נמחקים מיד ומסומנים למחזור שמירה.",
    auditSecurityRecords: "רשומות אבטחה וביקורת נשמרות כדי למנוע זיוף, דליפה ושימוש לרעה.",
    billingLegalRecords: "רשומות חיוב אמיתיות יישמרו לפי חובה חוקית כשחיוב יופעל.",
    providerSideData: "נקסוס לא מבטיחה מחיקה אצל ספק חיצוני בלי הוכחת ספק וחיבור פעיל.",
  };
}

function buildConsentStates({ account = null, projects = [] } = {}) {
  const authPayload = normalizeObject(account);
  const projectList = normalizeArray(projects);
  const consentEntries = projectList.flatMap((project) =>
    normalizeArray(project.manualContext?.consentEntries)
      .concat(normalizeArray(project.context?.complianceConsentState?.consentEntries)),
  );

  return [
    {
      key: "files",
      label: "קבצים",
      status: projectList.some((project) => project.fileIntakeBoundary || project.context?.fileIntakeBoundary)
        ? "required-before-upload"
        : "not-used-yet",
    },
    {
      key: "growth-experiments",
      label: "ניסויי צמיחה",
      status: consentEntries.some((entry) => entry.processingScope === "growth") ? "recorded" : "not-enabled",
    },
    {
      key: "external-sharing",
      label: "שיתוף חיצוני",
      status: projectList.some((project) => project.shareDemoAgent?.approvalStatus === "approved") ? "recorded" : "approval-required",
    },
    {
      key: "provider-connection",
      label: "חיבור ספקים",
      status: "explicit-approval-required",
    },
    {
      key: "email-audience",
      label: "אימייל וקהל",
      status: authPayload.notificationPreferences?.emailEnabled === false ? "disabled" : "configurable",
    },
    {
      key: "tracking",
      label: "מדידה ומעקב",
      status: projectList.some((project) => project.context?.growthMeasurementTruth) ? "project-scoped" : "not-enabled",
    },
    {
      key: "generated-product-data",
      label: "מידע של מוצר שנוצר",
      status: "project-scoped-before-release",
    },
  ];
}

export function buildFirstReleasePrivacyCenter({
  account = null,
  projects = [],
  latestRequest = null,
} = {}) {
  const authPayload = normalizeObject(account);
  const userId = normalizeString(authPayload.userIdentity?.userId, null);
  const projectList = normalizeArray(projects);
  const request = normalizeObject(latestRequest);
  const inventory = buildDataInventory({ account: authPayload, projects: projectList });

  return {
    privacyCenterId: `privacy-center:${userId ?? "anonymous"}`,
    taskId: "PRIVACY-001",
    status: userId ? "ready" : "blocked-auth-required",
    userFacing: {
      title: "פרטיות ונתונים",
      summary: "כאן אפשר לראות מה נשמר, מה ניתן לייצא, ומה נקסוס לא מוחקת אוטומטית בגלל רציפות, אבטחה או חובה חוקית.",
      deletionPromise: "מחיקה לא מוצגת כמחיקה מיידית אם יש שמירה מוצדקת או ספק חיצוני שלא מחובר.",
    },
    subject: {
      userId,
      email: authPayload.userIdentity?.email ?? null,
      displayName: authPayload.userIdentity?.displayName ?? null,
    },
    dataInventory: inventory,
    retentionPolicy: buildRetentionPolicy(),
    consentStates: buildConsentStates({ account: authPayload, projects: projectList }),
    rights: {
      export: {
        status: "available",
        scope: "account-and-owned-projects",
        excludes: ["secrets", "tokens", "other-users-data", "provider-side-data-without-proof"],
      },
      deletion: {
        status: "request-available-with-retention-review",
        blockedScopes: inventory
          .filter((item) => String(item.deleteState).startsWith("blocked"))
          .map((item) => ({ key: item.key, reason: item.deleteState })),
      },
      consent: {
        status: "visible",
        configurableScopes: ["email-audience", "tracking", "files", "external-sharing", "provider-connection"],
      },
      retention: {
        status: "visible",
      },
      rightsRequest: {
        status: request.status ?? "not-requested",
        latestRequest: Object.keys(request).length > 0 ? request : null,
      },
    },
    deletionPaths: {
      account: "request-recorded-retention-review-required",
      project: "request-recorded-project-remains-visible-until-confirmed-deletion",
      files: "supported-for-known-upload-records-or-blocked-if-file-store-hook-missing",
      generatedPackage: "blocked-until-package-store-delete-hook-exists",
      providerConnection: "blocked-provider-side-delete-requires-provider-proof",
    },
    auditBoundary: {
      status: "recorded-without-secrets",
      store: "event log and account activity history",
    },
  };
}

export function createPrivacyExportPayload({
  account = null,
  projects = [],
  privacyCenter = null,
} = {}) {
  const authPayload = normalizeObject(account);
  const center = normalizeObject(privacyCenter);
  const projectList = normalizeArray(projects);

  return scrubSecrets({
    exportId: `privacy-export:${authPayload.userIdentity?.userId ?? "anonymous"}:${nowIso()}`,
    taskId: "PRIVACY-001",
    exportedAt: nowIso(),
    account: {
      userIdentity: authPayload.userIdentity ?? null,
      workspaceModel: authPayload.workspaceModel ?? null,
      workspaceSettings: authPayload.workspaceSettings ?? null,
      notificationPreferences: authPayload.notificationPreferences ?? null,
      accountDeletionRequest: authPayload.accountDeletionRequest ?? null,
      accountActivityHistory: normalizeArray(authPayload.accountActivityHistory),
    },
    privacyCenter: center,
    projects: projectList.map((project) => ({
      projectId: project.id,
      userId: project.userId ?? null,
      name: project.name,
      goal: project.goal,
      projectDraft: project.projectDraft ?? null,
      projectIntake: project.projectIntake ?? null,
      fileIntakeBoundary: project.fileIntakeBoundary ?? project.context?.fileIntakeBoundary ?? null,
      dataOwnershipBoundary: project.dataOwnershipBoundary ?? project.context?.dataOwnershipBoundary ?? null,
      privacyRightsResult: project.privacyRightsResult ?? project.context?.privacyRightsResult ?? null,
      productDomainSkeleton: project.productDomainSkeleton ?? project.context?.productDomainSkeleton ?? null,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton ?? project.context?.productOwnedBackendSkeleton ?? null,
      runtimeSkeletonTruth: project.runtimeSkeletonTruth ?? project.context?.runtimeSkeletonTruth ?? null,
      generatedProductPackage: project.context?.productRuntimePackage ?? project.context?.standaloneArtifact ?? null,
      providerMetadata: project.context?.providerGatewayBoundary ?? project.context?.providerConnection ?? null,
      billing: {
        normalizedBillingEvents: normalizeArray(project.manualContext?.normalizedBillingEvents),
        billableUsage: project.context?.billableUsage ?? null,
      },
      history: {
        buildMutationHistory: normalizeArray(project.context?.buildMutationHistory ?? project.buildMutationHistory),
        companionConversation: project.context?.companionConversation ?? null,
      },
      analytics: {
        growthMeasurementTruth: project.context?.growthMeasurementTruth ?? null,
        conversionAnalytics: project.context?.conversionAnalytics ?? null,
      },
      auditSummary: {
        securityAuditRecord: project.context?.securityAuditRecord ?? null,
        complianceAuditSummary: project.context?.complianceAuditSummary ?? null,
      },
    })),
  });
}

export function applyPrivacyCenterAction({
  account = null,
  projects = [],
  actionType = null,
  payload = null,
  actorUserId = null,
} = {}) {
  const authPayload = normalizeObject(account);
  const userId = normalizeString(authPayload.userIdentity?.userId, null);
  const action = normalizeString(actionType, null);
  const input = normalizeObject(payload);
  const timestamp = nowIso();
  const request = {
    privacyRequestId: `privacy-request:${userId ?? "anonymous"}:${action ?? "unknown"}:${timestamp}`,
    taskId: "PRIVACY-001",
    actionType: action ?? "unknown",
    status: "recorded",
    actorUserId: actorUserId ?? userId,
    subjectUserId: userId,
    projectId: normalizeString(input.projectId, null),
    requestedAt: timestamp,
    retentionReason: null,
    visibleSummary: "בקשת פרטיות נרשמה ותופיע במרכז הפרטיות.",
  };

  if (!userId || (actorUserId && actorUserId !== userId)) {
    return {
      status: "blocked",
      privacyRequest: {
        ...request,
        status: "blocked",
        retentionReason: "actor-not-authorized",
        visibleSummary: "הפעולה נחסמה כי המשתמש לא מורשה לבצע אותה.",
      },
      account,
      projects,
    };
  }

  const nextAccount = {
    ...authPayload,
    privacyRequests: [...normalizeArray(authPayload.privacyRequests), request].slice(-50),
  };
  const projectList = normalizeArray(projects);
  let nextProjects = projectList;

  if (action === "request-account-deletion") {
    request.status = "pending-retention-review";
    request.retentionReason = "security-audit-and-project-continuity-review";
    request.visibleSummary = "בקשת מחיקת חשבון נרשמה. נקסוס תבדוק אילו נתונים אפשר למחוק ואילו חייבים להישמר.";
    nextAccount.accountDeletionRequest = {
      status: request.status,
      requestedAt: timestamp,
      ownerTask: "PRIVACY-001",
      retentionReason: request.retentionReason,
    };
  } else if (action === "request-project-deletion") {
    const targetProjectId = request.projectId;
    const ownsProject = projectList.some((project) => project.id === targetProjectId && project.userId === userId);
    request.status = ownsProject ? "pending-retention-review" : "blocked";
    request.retentionReason = ownsProject ? "project-history-and-audit-review" : "project-not-found-or-not-owned";
    request.visibleSummary = ownsProject
      ? "בקשת מחיקת פרויקט נרשמה. הפרויקט נשאר גלוי עד שמסלול המחיקה יאושר בלי לשבור היסטוריה או אבטחה."
      : "בקשת מחיקת הפרויקט נחסמה כי הפרויקט לא נמצא או לא שייך למשתמש.";
    nextProjects = projectList.map((project) => {
      if (project.id !== targetProjectId || project.userId !== userId) {
        return project;
      }
      return {
        ...project,
        context: {
          ...(project.context ?? {}),
          privacyDeletionRequest: request,
        },
        state: {
          ...(project.state ?? {}),
          privacyDeletionRequest: request,
        },
      };
    });
  } else if (action === "request-provider-deletion") {
    request.status = "blocked";
    request.retentionReason = "provider-side-deletion-requires-connected-provider-proof";
    request.visibleSummary = "מחיקה אצל ספק חיצוני חסומה עד שיש חיבור ספק אמיתי והוכחת מחיקה מצד הספק.";
  } else if (action === "update-consent") {
    request.status = "recorded";
    request.retentionReason = "consent-state-recorded-for-first-release";
    request.visibleSummary = "בחירת ההסכמה נרשמה עבור השלב הראשון.";
    nextAccount.privacyConsentState = {
      ...(nextAccount.privacyConsentState ?? {}),
      [normalizeString(input.scope, "general")]: {
        status: normalizeString(input.status, "recorded"),
        updatedAt: timestamp,
        actorUserId: actorUserId ?? userId,
      },
    };
  } else {
    request.status = "blocked";
    request.retentionReason = "unsupported-privacy-action";
    request.visibleSummary = "פעולת הפרטיות לא נתמכת כרגע ולכן נחסמה במקום להציג הצלחה מזויפת.";
  }

  nextAccount.privacyRequests = [...normalizeArray(authPayload.privacyRequests), request].slice(-50);

  return {
    status: request.status === "blocked" ? "blocked" : "recorded",
    privacyRequest: request,
    account: nextAccount,
    projects: nextProjects,
  };
}
