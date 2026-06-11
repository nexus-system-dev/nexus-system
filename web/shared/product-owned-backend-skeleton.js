function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clone(value) {
  return structuredClone(value ?? null);
}

function slugify(value = "", fallback = "project") {
  const cleaned = normalizeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function createEndpointForOperation(operation = {}) {
  const id = normalizeString(operation.id, "product.operation");
  const [resource = "product", action = "run"] = id.split(".");
  const method = operation.kind === "create" ? "POST" : operation.kind === "delete" ? "DELETE" : "PATCH";
  return {
    operationId: id,
    method,
    path: `/api/${slugify(resource, "product")}/${slugify(action, "run")}`,
    handlerFile: `backend/operations/${slugify(id, "operation")}.js`,
    input: normalizeObject(operation.input),
    output: normalizeObject(operation.output),
    persistence: "product-owned-local-mock-store",
  };
}

function createSchemaModel(model = {}) {
  const fields = normalizeArray(model.fields).map((field) => ({
    name: normalizeString(field?.name, "field"),
    type: normalizeString(field?.type, "string"),
    required: field?.required !== false,
  }));
  return {
    name: normalizeString(model.name, "ProductRecord"),
    file: `shared/schema/${slugify(model.name, "product-record")}.schema.json`,
    fields,
  };
}

export function buildProductOwnedBackendSkeletonEnvelope({
  project = null,
  projectId = "",
  productClass = "generic",
  runtimeSkeletonId = "",
  artifactBuildId = "",
  productDomainSkeleton = {},
} = {}) {
  const safeProject = normalizeObject(project);
  const safeDomain = normalizeObject(productDomainSkeleton);
  const resolvedProjectId = normalizeString(projectId, normalizeString(safeProject.id, "runtime-preview"));
  const resolvedProductClass = normalizeString(productClass, normalizeString(safeDomain.productClass, "generic"));
  const productDomainSkeletonId = normalizeString(safeDomain.productDomainSkeletonId, `product-domain:${resolvedProjectId}:${resolvedProductClass}`);
  const productOwnedBackendSkeletonId = `product-owned-backend:${resolvedProjectId}:${resolvedProductClass}`;
  const artifactRoot = `nexus-projects/${slugify(safeProject.ownerId ?? safeProject.userId, "local-user")}/${slugify(resolvedProjectId, "project")}/product`;
  const models = normalizeArray(safeDomain.models).map(createSchemaModel);
  const operations = normalizeArray(safeDomain.operations).map((operation) => ({
    id: normalizeString(operation.id, "product.operation"),
    label: normalizeString(operation.label, "פעולת מוצר"),
    kind: normalizeString(operation.kind, "update"),
    input: normalizeObject(operation.input),
    output: normalizeObject(operation.output),
    endpoint: createEndpointForOperation(operation),
  }));

  return {
    taskId: "PRODUCT-BACKEND-SKEL-002",
    truthSource: "generated-product-owned-backend-skeleton",
    truthStatus: "product-owned-local-backend-skeleton",
    canonicalProjectTruth: true,
    productionBackend: false,
    projectId: resolvedProjectId,
    productClass: resolvedProductClass,
    runtimeSkeletonId: normalizeString(runtimeSkeletonId, normalizeString(safeDomain.runtimeSkeletonId, "")),
    artifactBuildId: normalizeString(artifactBuildId, ""),
    productDomainSkeletonId,
    productOwnedBackendSkeletonId,
    artifactRoot,
    directories: {
      frontend: `${artifactRoot}/frontend`,
      backend: `${artifactRoot}/backend`,
      data: `${artifactRoot}/data`,
      shared: `${artifactRoot}/shared`,
      run: `${artifactRoot}/run`,
    },
    files: {
      frontendEntry: `${artifactRoot}/frontend/App.jsx`,
      backendEntry: `${artifactRoot}/backend/server.js`,
      operationIndex: `${artifactRoot}/backend/operations/index.js`,
      localStore: `${artifactRoot}/data/local-store.json`,
      sharedSchemaIndex: `${artifactRoot}/shared/schema/index.json`,
      runManifest: `${artifactRoot}/run/nexus-product-run.json`,
    },
    models,
    operations,
    persistence: {
      kind: "product-owned-local-mock-persistence",
      storeFile: `${artifactRoot}/data/local-store.json`,
      state: clone(safeDomain.state),
      restoresWithProjectTruth: true,
      boundary: "זה צד אחורי מקומי ומדומה ששייך למוצר שנוצר; זה לא הצד האחורי של Nexus ולא פריסת ייצור.",
    },
    apiBoundary: {
      kind: "api-like-product-boundary",
      endpoints: operations.map((operation) => operation.endpoint),
      externalProvidersEnabled: false,
      paymentsEnabled: false,
      publishingEnabled: false,
    },
    frontendBackendPairing: {
      status: "paired-from-first-skeleton",
      frontendReadsFrom: "shared schema and product operations",
      frontendWritesThrough: "product-owned backend operations",
      requiredForBuildContinuation: true,
    },
    growthPolicy: {
      frontendAndBackendMustGrowTogether: true,
      schemaChangesRequireModelUpdate: true,
      uiActionsRequireBackendOperation: true,
      releaseClaimRequiresStandaloneArtifact: true,
    },
    persistenceBoundary: "generated product-owned local/mock persistence; not Nexus project state and not production hosting",
    mutationHistory: [],
  };
}

export function applyProductOwnedBackendMutation({
  productOwnedBackendSkeleton = {},
  productDomainSkeleton = {},
  intent = {},
  operationId = "",
  payload = {},
  status = "applied",
  now = new Date().toISOString(),
} = {}) {
  const skeleton = normalizeObject(productOwnedBackendSkeleton);
  if (!skeleton.productOwnedBackendSkeletonId) {
    return skeleton;
  }
  const safeDomain = normalizeObject(productDomainSkeleton);
  const safePayload = normalizeObject(payload);
  const resolvedOperationId = normalizeString(operationId, normalizeString(intent.operationId, ""));
  const nextModels = normalizeArray(safeDomain.models).map(createSchemaModel);
  const nextOperations = normalizeArray(safeDomain.operations).map((operation) => ({
    id: normalizeString(operation.id, "product.operation"),
    label: normalizeString(operation.label, "פעולת מוצר"),
    kind: normalizeString(operation.kind, "update"),
    input: normalizeObject(operation.input),
    output: normalizeObject(operation.output),
    endpoint: createEndpointForOperation(operation),
  }));

  return {
    ...skeleton,
    models: nextModels,
    operations: nextOperations,
    persistence: {
      ...normalizeObject(skeleton.persistence),
      state: clone(safeDomain.state),
      restoresWithProjectTruth: true,
    },
    apiBoundary: {
      ...normalizeObject(skeleton.apiBoundary),
      endpoints: nextOperations.map((operation) => operation.endpoint),
    },
    lastMutationId: normalizeString(intent.mutationId, normalizeString(skeleton.lastMutationId, "")),
    lastOperationId: resolvedOperationId,
    mutationHistory: [
      ...normalizeArray(skeleton.mutationHistory),
      {
        mutationId: normalizeString(intent.mutationId, `backend-mutation:${Date.parse(now) || Date.now()}`),
        operationId: resolvedOperationId,
        status,
        payload: safePayload,
        changedBackendTruth: status === "applied",
        recordedAt: now,
      },
    ],
  };
}
