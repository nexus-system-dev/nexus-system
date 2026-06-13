export const DATA_OWNERSHIP_BOUNDARY_TASK_ID = "DATA-001";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasObjectKeys(value) {
  return Object.keys(normalizeObject(value)).length > 0;
}

function hasArrayItems(value) {
  return normalizeArray(value).length > 0;
}

function buildEntity({
  entityId,
  label,
  sourceOfTruth,
  persistence,
  restore,
  retention,
  staleStatePolicy,
  evidence = [],
  privacyRelevance = "included-in-privacy-inventory",
}) {
  return {
    entityId,
    label,
    sourceOfTruth,
    persistence,
    restore,
    retention,
    staleStatePolicy,
    privacyRelevance,
    evidence: normalizeArray(evidence).filter(Boolean),
  };
}

export function buildProductShellDataOwnershipBoundary(project = {}) {
  const safeProject = normalizeObject(project);
  const context = normalizeObject(safeProject.context);
  const state = normalizeObject(safeProject.state);
  const runtimeSkeletonTruth = normalizeObject(context.runtimeSkeletonTruth ?? safeProject.runtimeSkeletonTruth ?? state.runtimeSkeletonTruth);
  const productDomainSkeleton = normalizeObject(
    context.productDomainSkeleton
      ?? safeProject.productDomainSkeleton
      ?? state.productDomainSkeleton
      ?? runtimeSkeletonTruth.productDomainSkeleton,
  );
  const fileStorageRecord = normalizeObject(context.fileStorageRecord ?? safeProject.fileStorageRecord ?? state.fileStorageRecord);
  const buildMutationHistory = normalizeArray(context.buildMutationHistory ?? safeProject.buildMutationHistory ?? state.buildMutationHistory);
  const buildMutationIntents = normalizeArray(context.buildMutationIntents ?? safeProject.buildMutationIntents ?? state.buildMutationIntents);
  const historyContinuityAgent = normalizeObject(context.historyContinuityAgent ?? safeProject.historyContinuityAgent ?? state.historyContinuityAgent);
  const companionConversation = normalizeObject(context.companionConversation ?? safeProject.companionConversation ?? state.companionConversation);
  const providerGatewayBoundary = normalizeObject(context.providerGatewayBoundary ?? safeProject.providerGatewayBoundary ?? state.providerGatewayBoundary);
  const landingBackendSync = normalizeObject(context.landingBackendSync ?? safeProject.landingBackendSync ?? state.landingBackendSync);
  const releaseWorkspace = normalizeObject(context.releaseWorkspace ?? safeProject.releaseWorkspace ?? state.releaseWorkspace);
  const events = normalizeArray(safeProject.events);

  const entities = [
    buildEntity({
      entityId: "user",
      label: "משתמש וזהות",
      sourceOfTruth: safeProject.userId ? "server-verified-session-project-owner" : "local-first-user-boundary",
      persistence: "project-service-account-and-session-state",
      restore: "restored-from-session-token-or-local-first-user",
      retention: "account-lifecycle-until-privacy-request",
      staleStatePolicy: "qa/localStorage identity is not production ownership truth",
      evidence: [safeProject.userId ? "project.userId" : "local-user-boundary"],
    }),
    buildEntity({
      entityId: "project",
      label: "פרויקט",
      sourceOfTruth: "ProjectService project record",
      persistence: "projectWorkspaceStore-backed-project-record",
      restore: safeProject.id ? "projectId-backend-restore" : "not-restorable-without-project-id",
      retention: "project-lifecycle-until-delete-request",
      staleStatePolicy: "project-draft cannot masquerade as active project truth",
      evidence: [safeProject.id ? "project.id" : "", safeProject.projectCreationEvent ? "projectCreationEvent" : ""],
    }),
    buildEntity({
      entityId: "product-graph",
      label: "אמת מוצר",
      sourceOfTruth: hasObjectKeys(productDomainSkeleton) ? "generated product-domain skeleton in project truth" : "project context/state shell",
      persistence: hasObjectKeys(productDomainSkeleton) ? "serialized productDomainSkeleton" : "bounded project context",
      restore: hasObjectKeys(runtimeSkeletonTruth) ? "runtimeSkeletonTruth restore path" : "context rebuild required",
      retention: "project-lifecycle-with-history-snapshots",
      staleStatePolicy: "artifact preview is expression, not source of truth",
      evidence: [
        hasObjectKeys(productDomainSkeleton) ? "productDomainSkeleton" : "",
        hasObjectKeys(runtimeSkeletonTruth) ? "runtimeSkeletonTruth" : "",
      ],
    }),
    buildEntity({
      entityId: "artifact",
      label: "תוצר נראה",
      sourceOfTruth: "artifact expression of Product Graph",
      persistence: safeProject.proofArtifact || context.proofArtifact ? "serialized proofArtifact/build artifact" : "derived runtime preview",
      restore: "reconstructed from active Product Graph and runtime skeleton",
      retention: "project-lifecycle-until-replaced-or-deleted",
      staleStatePolicy: "uncommitted preview is candidate state only",
      evidence: [safeProject.proofArtifact || context.proofArtifact ? "proofArtifact" : "runtime-preview"],
    }),
    buildEntity({
      entityId: "conversation",
      label: "שיחת נקסוס",
      sourceOfTruth: hasObjectKeys(companionConversation) ? "project companion conversation record" : "conversation summary/handoff",
      persistence: hasObjectKeys(companionConversation) ? "serialized companionConversation" : "summary-only",
      restore: hasObjectKeys(companionConversation) ? "restored into Build rail" : "restored as summary, not full transcript",
      retention: "project-lifecycle-with-privacy-export-boundary",
      staleStatePolicy: "qaState/nexusState transcripts are excluded from production truth",
      evidence: [hasObjectKeys(companionConversation) ? "companionConversation" : "conversationSummary"],
    }),
    buildEntity({
      entityId: "files",
      label: "קבצים ונכסים",
      sourceOfTruth: hasObjectKeys(fileStorageRecord) ? "FILE-001 fileStorageRecord" : "no accepted file storage yet",
      persistence: hasObjectKeys(fileStorageRecord) ? "project-intake-local-durable-state" : "none",
      restore: hasObjectKeys(fileStorageRecord) ? "serialized fileStorageRecord" : "no file restore needed",
      retention: normalizeString(fileStorageRecord.retentionPolicy, "project-lifecycle-until-user-delete"),
      staleStatePolicy: "rejected/reference-only files cannot become product truth silently",
      evidence: [hasObjectKeys(fileStorageRecord) ? "fileStorageRecord" : ""],
    }),
    buildEntity({
      entityId: "history",
      label: "היסטוריה ושחזור",
      sourceOfTruth: hasObjectKeys(historyContinuityAgent) ? "HIST-AGT-001 history continuity envelope" : "project event history",
      persistence: hasObjectKeys(historyContinuityAgent) ? "serialized historyContinuityAgent" : "project events",
      restore: hasObjectKeys(historyContinuityAgent.restoreDecision) ? "restore decision available" : "restore requires checkpoint decision",
      retention: "project-lifecycle-with-audit-boundary",
      staleStatePolicy: "demo/local events are labeled and cannot imply committed restore",
      evidence: [
        hasObjectKeys(historyContinuityAgent) ? "historyContinuityAgent" : "",
        hasArrayItems(events) ? "events" : "",
      ],
    }),
    buildEntity({
      entityId: "mutation",
      label: "שינויים ומוטציות",
      sourceOfTruth: hasArrayItems(buildMutationHistory) ? "BUILD-MUTATION-TRUTH-001 history" : "no applied mutation history yet",
      persistence: hasArrayItems(buildMutationHistory) ? "serialized buildMutationHistory/intents" : "none",
      restore: hasArrayItems(buildMutationIntents) ? "replayable mutation intents" : "not replayable yet",
      retention: "project-lifecycle-with-history",
      staleStatePolicy: "agent speech cannot claim applied change without mutation id",
      evidence: [
        hasArrayItems(buildMutationHistory) ? "buildMutationHistory" : "",
        hasArrayItems(buildMutationIntents) ? "buildMutationIntents" : "",
      ],
    }),
    buildEntity({
      entityId: "provider-metadata",
      label: "ספקים חיצוניים",
      sourceOfTruth: hasObjectKeys(providerGatewayBoundary) ? "PROV-001 provider gateway boundary" : "not connected",
      persistence: hasObjectKeys(providerGatewayBoundary) ? "provider metadata only, no browser secrets" : "none",
      restore: hasObjectKeys(providerGatewayBoundary) ? "restored from project provider boundary" : "not connected",
      retention: "provider-connection-lifecycle-plus-audit",
      staleStatePolicy: "provider placeholders cannot imply real external action",
      evidence: [hasObjectKeys(providerGatewayBoundary) ? "providerGatewayBoundary" : ""],
    }),
    buildEntity({
      entityId: "release",
      label: "שחרור",
      sourceOfTruth: hasObjectKeys(releaseWorkspace) ? "release workspace snapshot" : "not released",
      persistence: hasObjectKeys(releaseWorkspace) ? "serialized releaseWorkspace" : "none",
      restore: "release snapshot or active project truth",
      retention: "release-snapshot-lifecycle",
      staleStatePolicy: "preview/share is not production release",
      evidence: [hasObjectKeys(releaseWorkspace) ? "releaseWorkspace" : ""],
    }),
    buildEntity({
      entityId: "growth-landing-backend",
      label: "בקאנד נכס צמיחה",
      sourceOfTruth: hasObjectKeys(landingBackendSync) ? "GROW-LAND-BACKEND-001 sync envelope" : "not active",
      persistence: hasObjectKeys(landingBackendSync) ? "growth asset backend sync" : "none",
      restore: hasObjectKeys(landingBackendSync) ? "restored from project growth backend truth" : "not active",
      retention: "growth-asset-lifecycle-with-consent",
      staleStatePolicy: "landing draft cannot imply production backend",
      evidence: [hasObjectKeys(landingBackendSync) ? "landingBackendSync" : ""],
    }),
  ];

  const temporaryOrDemoEntities = [
    {
      key: "qaState",
      status: "excluded-from-production-truth",
      reason: "QA URL state is test input only.",
    },
    {
      key: "nexusState",
      status: "excluded-from-production-truth",
      reason: "Legacy local shell state cannot own project truth.",
    },
    {
      key: "project-draft",
      status: "draft-only-before-project-creation",
      reason: "Drafts can seed a project but cannot masquerade as active project truth.",
    },
    {
      key: "localStorage",
      status: "session/bootstrap-helper-not-product-truth",
      reason: "Browser storage may hold app user bootstrap state but not canonical Product Graph truth.",
    },
  ];

  return {
    taskId: DATA_OWNERSHIP_BOUNDARY_TASK_ID,
    status: "ready",
    boundary: "first-release-product-shell-data-ownership",
    sourceOfTruthLaw: "Product Graph and project service own product truth; browser/QA state only bootstrap or test state.",
    userFacing: {
      sourceOfTruth: "אמת המוצר נשמרת בפרויקט, לא במצב בדיקה או בזיכרון זמני של הדפדפן.",
      storageProvider: "ספק אחסון חיצוני ייבחר רק אחרי שמקור האמת של הנתונים ברור ומסונכרן.",
    },
    projectId: safeProject.id ?? null,
    persistenceProviderDecision: {
      provider: "Supabase",
      decision: "defer-for-first-release",
      reason: "SUPABASE-001 keeps ProjectService as the selected first-release persistence path and defers Supabase adoption until schema, RLS, auth mapping, storage, backup, export, and deletion hooks are ready.",
      userFacingReason: "ספק אחסון חיצוני לא מחובר עכשיו; החיבור ייפתח רק אחרי שמיפוי הרשאות, קבצים, פרטיות ושחזור יהיה מוכן.",
      currentPersistencePath: "ProjectService projectWorkspaceStore plus bounded serialized project records",
    },
    entities,
    temporaryOrDemoEntities,
    restorePolicy: {
      projectRestore: safeProject.id ? "backend-projectId-restore" : "blocked-without-project-id",
      refreshTruth: "serialized project output must carry DATA-001 envelope",
      staleStateMigration: "ignore QA/localStorage project truth unless converted through project service",
    },
    privacyDependency: {
      status: "unblocks-privacy-after-provider-decision",
      requires: ["SUPABASE-001", "PRIVACY-001"],
      note: "Privacy export/delete/retention must consume this inventory and the selected persistence provider path.",
    },
  };
}
