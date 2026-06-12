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

function clone(value) {
  return structuredClone(value ?? null);
}

function slugify(value = "", fallback = "asset") {
  const cleaned = normalizeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function resolveProductOwnedBackend(project = {}) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.productOwnedBackendSkeleton
      ?? safeProject.context?.productOwnedBackendSkeleton
      ?? safeProject.state?.productOwnedBackendSkeleton
      ?? safeProject.runtimeSkeletonTruth?.productOwnedBackendSkeleton
      ?? safeProject.context?.runtimeSkeletonTruth?.productOwnedBackendSkeleton
      ?? safeProject.state?.runtimeSkeletonTruth?.productOwnedBackendSkeleton,
  );
}

function resolveLandingAction(project = {}, landingActionPath = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    landingActionPath
      ?? safeProject.landingActionPath
      ?? safeProject.context?.landingActionPath
      ?? safeProject.state?.landingActionPath,
  );
}

function resolveLandingDraftId(projectId, landingAction) {
  return normalizeString(landingAction.draft?.landingDraftId, `landing-draft:${projectId}`);
}

function resolveLeadSchema(productOwnedBackendSkeleton = {}, leadCapture = {}) {
  const backend = normalizeObject(productOwnedBackendSkeleton);
  const lead = normalizeObject(leadCapture);
  const requestedFields = normalizeArray(lead.fields).map((field) => normalizeString(field)).filter(Boolean);
  const productFields = normalizeArray(backend.models)
    .flatMap((model) => normalizeArray(model.fields))
    .map((field) => normalizeString(field.name))
    .filter(Boolean);
  const fields = Array.from(new Set([
    ...requestedFields,
    ...productFields.filter((field) => /name|email|phone|need|lead|ליד|שם|מייל|טלפון|צורך|סטטוס|אחראי/u.test(field)).slice(0, 6),
    "consent",
    "source",
    "createdAt",
    "landingDraftId",
    "productId",
  ])).slice(0, 12);
  return fields.length ? fields : ["name", "email", "need", "consent", "source", "createdAt", "landingDraftId", "productId"];
}

function buildPackageContract({ projectId, artifactRoot, landingBackendId, syncContract }) {
  const root = `${artifactRoot}/growth/landing`;
  return {
    taskId: "GROW-LAND-BACKEND-001",
    contractId: `landing-package-contract:${projectId}`,
    status: "package-contract-ready",
    artifactBoundaryStatus: "package-contract-ready",
    frontendEntry: `${root}/frontend/LandingPage.jsx`,
    backendEntry: `${root}/backend/server.js`,
    localStore: `${root}/data/landing-leads.json`,
    environment: {
      runtime: "node-local-mock",
      productionHosting: false,
      requiresStandaloneArtifact: true,
      consumedBy: ["PRODUCT-RUNTIME-PACKAGE-001", "STANDALONE-ARTIFACT-001"],
    },
    landingBackendId,
    syncContract,
  };
}

function normalizeLeadSubmission(leadSubmission = {}, { projectId, landingDraftId, now, leadSchema }) {
  const lead = normalizeObject(leadSubmission);
  const consent = lead.consent === true || lead.consentAccepted === true || lead.agreed === true;
  const record = {};
  for (const field of leadSchema) {
    if (Object.prototype.hasOwnProperty.call(lead, field)) {
      record[field] = lead[field];
    }
  }
  const leadId = normalizeString(lead.leadId, `landing-lead:${projectId}:${Date.parse(now) || Date.now()}`);
  return {
    leadId,
    ...record,
    name: normalizeString(lead.name ?? record.name ?? record["שם"], "Test lead"),
    email: normalizeString(lead.email ?? record.email ?? record["מייל"], "lead@example.test"),
    need: normalizeString(lead.need ?? record.need ?? record["צורך"], "בדיקת התאמה"),
    consent,
    source: normalizeString(lead.source, "landing-page"),
    createdAt: now,
    landingDraftId,
    productId: projectId,
    status: consent ? "accepted" : "rejected",
    rejectionReason: consent ? "" : "missing-consent",
    measurementEventId: `measurement:landing.form.submitted:${leadId}`,
  };
}

function createSyncEvent({ type, leadRecord, status, reason = "", now }) {
  return {
    eventId: `landing-sync:${Date.parse(now) || Date.now()}:${type}:${leadRecord.leadId}`,
    taskId: "GROW-LAND-BACKEND-001",
    type,
    leadId: leadRecord.leadId,
    status,
    reason,
    occurredAt: now,
  };
}

function createProductBackendWithLandingLead({ productOwnedBackendSkeleton, leadRecord, syncEvent }) {
  const backend = normalizeObject(productOwnedBackendSkeleton);
  if (!backend.productOwnedBackendSkeletonId || leadRecord.status !== "accepted") {
    return backend;
  }
  const persistence = normalizeObject(backend.persistence);
  const state = normalizeObject(persistence.state);
  const existingLeads = normalizeArray(state.landingLeads);
  const duplicate = existingLeads.some((item) => normalizeString(item.leadId) === normalizeString(leadRecord.leadId));
  const landingLeads = duplicate ? existingLeads : [...existingLeads, clone(leadRecord)];
  const existingModels = normalizeArray(backend.models);
  const hasLandingLeadModel = existingModels.some((model) => normalizeString(model.name) === "LandingLead");
  const landingLeadModel = {
    name: "LandingLead",
    file: "shared/schema/landing-lead.schema.json",
    fields: [
      { name: "leadId", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "need", type: "string", required: false },
      { name: "consent", type: "boolean", required: true },
      { name: "source", type: "string", required: true },
      { name: "createdAt", type: "string", required: true },
      { name: "landingDraftId", type: "string", required: true },
      { name: "productId", type: "string", required: true },
      { name: "measurementEventId", type: "string", required: true },
    ],
  };
  const existingEndpoints = normalizeArray(backend.apiBoundary?.endpoints);
  const hasEndpoint = existingEndpoints.some((endpoint) => normalizeString(endpoint.operationId) === "landing.lead.create");
  const endpoint = {
    operationId: "landing.lead.create",
    method: "POST",
    path: "/api/landing/leads",
    handlerFile: "backend/operations/landing-lead-create.js",
    input: { model: "LandingLead" },
    output: { model: "LandingLead" },
    persistence: "product-owned-local-mock-store",
  };
  return {
    ...backend,
    models: hasLandingLeadModel ? existingModels : [...existingModels, landingLeadModel],
    persistence: {
      ...persistence,
      state: {
        ...state,
        landingLeads,
      },
      restoresWithProjectTruth: true,
    },
    apiBoundary: {
      ...normalizeObject(backend.apiBoundary),
      endpoints: hasEndpoint ? existingEndpoints : [...existingEndpoints, endpoint],
    },
    landingBackendSync: {
      taskId: "GROW-LAND-BACKEND-001",
      status: syncEvent.status,
      lastLeadId: leadRecord.leadId,
      lastSyncEventId: syncEvent.eventId,
    },
  };
}

export function buildLandingBackendSyncEnvelope({
  project = null,
  landingActionPath = null,
  leadCapture = {},
  leadSubmission = null,
  previousEnvelope = null,
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const projectId = normalizeString(safeProject.id, "landing-project");
  const productOwnedBackendSkeleton = resolveProductOwnedBackend(safeProject);
  const previous = normalizeObject(previousEnvelope);
  const landingAction = resolveLandingAction(safeProject, landingActionPath);
  const landingDraftId = resolveLandingDraftId(projectId, landingAction);
  const artifactRoot = normalizeString(
    productOwnedBackendSkeleton.artifactRoot,
    `nexus-projects/${slugify(safeProject.ownerId ?? safeProject.userId, "local-user")}/${slugify(projectId, "project")}/product`,
  );
  const hasProductOwnedBackend = Boolean(productOwnedBackendSkeleton.productOwnedBackendSkeletonId);
  const leadSchema = resolveLeadSchema(productOwnedBackendSkeleton, leadCapture);
  const storageStatus = hasProductOwnedBackend ? "product-owned-local-mock" : "nexus-experiment-leads";
  const landingBackendId = `landing-backend:${projectId}:${landingDraftId}`;
  const syncContract = {
    syncContractId: `landing-product-sync:${projectId}`,
    direction: "landing-to-product",
    productBackendId: normalizeString(productOwnedBackendSkeleton.productOwnedBackendSkeletonId),
    landingBackendId,
    ownership: "source-product-not-landing",
    fields: leadSchema,
    requiredFields: ["consent", "source", "createdAt", "landingDraftId", "productId", "measurementEventId"],
    conflictPolicy: "reject-duplicate-lead-id-and-surface-failure",
    mutationRequiredForSchemaChange: true,
    measurementOwner: "GROW-MEASURE-001",
  };
  const packageContract = buildPackageContract({
    projectId,
    artifactRoot,
    landingBackendId,
    syncContract,
  });
  const previousLeads = normalizeArray(previous.leads);
  const previousProductLeads = normalizeArray(previous.productBackendLeadMirror);
  const previousEvents = normalizeArray(previous.syncEvents);
  const submission = leadSubmission ? normalizeLeadSubmission(leadSubmission, { projectId, landingDraftId, now, leadSchema }) : null;
  const duplicate = submission
    ? previousLeads.some((lead) => normalizeString(lead.leadId) === normalizeString(submission.leadId))
      || previousProductLeads.some((lead) => normalizeString(lead.leadId) === normalizeString(submission.leadId))
    : false;
  const hasPreviousSyncedLead = previousLeads.length > 0 && previousProductLeads.length > 0;
  const syncStatus = !hasProductOwnedBackend
    ? "fallback-only"
    : submission && !submission.consent
      ? "lead-rejected"
      : submission && duplicate
        ? "sync-failed"
      : submission
        ? "synced"
        : hasPreviousSyncedLead
          ? normalizeString(previous.status, "synced")
          : "package-contract-ready";
  const syncReason = !hasProductOwnedBackend
    ? "אין עדיין שלד בקאנד בבעלות המוצר, לכן נשארים באיסוף ניסיוני של Nexus."
    : submission && !submission.consent
      ? "הליד לא נשמר כי אין הסכמה."
      : submission && duplicate
        ? "הליד לא סונכרן כי מזהה הליד כבר קיים."
        : submission
          ? "הליד נשמר בבקאנד דף הנחיתה וסונכרן לבקאנד המוצר."
          : hasPreviousSyncedLead
            ? normalizeString(previous.lastSyncReason, "הליד האחרון נשמר ומסונכרן לבקאנד המוצר.")
          : "חוזה הבקאנד והסנכרון מוכן, אבל עדיין אין ליד שנשלח.";
  const syncEvent = submission
    ? createSyncEvent({
        type: submission.status === "accepted" && !duplicate ? "lead.synced" : submission.status === "rejected" ? "lead.rejected" : "lead.sync.failed",
        leadRecord: submission,
        status: syncStatus,
        reason: syncReason,
        now,
      })
    : createSyncEvent({
        type: hasProductOwnedBackend ? "lead.sync.contract.ready" : "lead.sync.fallback",
        leadRecord: { leadId: "no-lead-yet" },
        status: syncStatus,
        reason: syncReason,
        now,
      });
  const acceptedSubmission = submission && submission.status === "accepted" && !duplicate;
  const landingLeads = acceptedSubmission ? [...previousLeads, clone(submission)] : previousLeads;
  const productBackendLeadMirror = acceptedSubmission ? [...previousProductLeads, clone(submission)] : previousProductLeads;
  const productOwnedBackendSkeletonAfterSync = acceptedSubmission
    ? createProductBackendWithLandingLead({
        productOwnedBackendSkeleton,
        leadRecord: submission,
        syncEvent,
      })
    : productOwnedBackendSkeleton;
  const productionBackend = productOwnedBackendSkeleton.productionBackend === true;
  const standaloneReady = false;
  const externalCaptureAllowed = productionBackend && standaloneReady;

  return {
    taskId: "GROW-LAND-BACKEND-001",
    status: syncStatus,
    projectId,
    landingDraftId,
    landingBackendId,
    productBackendId: normalizeString(productOwnedBackendSkeleton.productOwnedBackendSkeletonId),
    storageStatus,
    productionBackend,
    standaloneReady,
    externalCaptureAllowed,
    artifactBoundaryStatus: packageContract.artifactBoundaryStatus,
    packageContract,
    syncContract,
    leadSchema,
    leads: landingLeads,
    productBackendLeadMirror,
    lastLead: submission ? clone(submission) : null,
    lastSyncReason: syncReason,
    syncEvents: [...previousEvents, syncEvent],
    productOwnedBackendSkeletonAfterSync,
    nexusExperimentFallbackUsed: !hasProductOwnedBackend,
    productTruthOwner: "source-product-not-landing",
    measurementEvents: submission ? [
      {
        eventId: submission.measurementEventId,
        taskId: "GROW-MEASURE-001",
        eventName: "landing.form.submitted",
        source: "landing-backend",
        leadId: submission.leadId,
        occurredAt: now,
      },
      ...(acceptedSubmission ? [{
        eventId: `measurement:lead.created:${submission.leadId}`,
        taskId: "GROW-MEASURE-001",
        eventName: "lead.created",
        source: "product-owned-landing-backend",
        leadId: submission.leadId,
        occurredAt: now,
      }] : []),
    ] : [],
    releaseGate: {
      externalCaptureBlocked: !externalCaptureAllowed,
      reason: externalCaptureAllowed
        ? "פרסום חיצוני יכול לעבור לשער שחרור."
        : "איסוף חיצוני חסום עד שיש בקאנד עצמאי, חבילת מוצר עצמאית, פרטיות ושער שחרור.",
      requires: ["production-backend", "standalone-artifact", "privacy-approval", "release-gate"],
    },
    userMessage: syncReason,
  };
}

export function summarizeLandingBackendSync(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  const packageContract = normalizeObject(safeEnvelope.packageContract);
  const syncContract = normalizeObject(safeEnvelope.syncContract);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-LAND-BACKEND-001"),
    status: normalizeString(safeEnvelope.status, "not-created"),
    projectId: normalizeString(safeEnvelope.projectId),
    landingDraftId: normalizeString(safeEnvelope.landingDraftId),
    landingBackendId: normalizeString(safeEnvelope.landingBackendId),
    productBackendId: normalizeString(safeEnvelope.productBackendId),
    storageStatus: normalizeString(safeEnvelope.storageStatus, "nexus-experiment-leads"),
    productionBackend: safeEnvelope.productionBackend === true,
    standaloneReady: safeEnvelope.standaloneReady === true,
    externalCaptureAllowed: safeEnvelope.externalCaptureAllowed === true,
    artifactBoundaryStatus: normalizeString(safeEnvelope.artifactBoundaryStatus, "draft-only"),
    packageContractReady: packageContract.status === "package-contract-ready",
    packageConsumedBy: normalizeArray(packageContract.environment?.consumedBy).map((item) => normalizeString(item)).filter(Boolean),
    syncDirection: normalizeString(syncContract.direction, "landing-to-product"),
    syncFieldCount: normalizeArray(syncContract.fields).length,
    leadCount: normalizeArray(safeEnvelope.leads).length,
    productBackendLeadCount: normalizeArray(safeEnvelope.productBackendLeadMirror).length,
    syncEventCount: normalizeArray(safeEnvelope.syncEvents).length,
    lastLeadStatus: normalizeString(safeEnvelope.lastLead?.status, "none"),
    lastSyncReason: normalizeString(safeEnvelope.lastSyncReason),
    nexusExperimentFallbackUsed: safeEnvelope.nexusExperimentFallbackUsed === true,
    productTruthOwner: normalizeString(safeEnvelope.productTruthOwner, "source-product-not-landing"),
    measurementEventCount: normalizeArray(safeEnvelope.measurementEvents).length,
    externalCaptureBlocked: safeEnvelope.releaseGate?.externalCaptureBlocked !== false,
    releaseBlockReason: normalizeString(safeEnvelope.releaseGate?.reason),
    userMessage: normalizeString(safeEnvelope.userMessage),
  };
}
