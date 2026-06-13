export const SUPABASE_PROVIDER_DECISION_TASK_ID = "SUPABASE-001";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveEntityIds(dataOwnershipBoundary) {
  return normalizeArray(dataOwnershipBoundary.entities)
    .map((entry) => normalizeString(entry.entityId))
    .filter(Boolean);
}

export function buildSupabasePersistenceProviderDecision({
  project = null,
  dataOwnershipBoundary = null,
  environment = process.env,
} = {}) {
  const safeProject = normalizeObject(project);
  const boundary = normalizeObject(dataOwnershipBoundary);
  const env = normalizeObject(environment);
  const entityIds = resolveEntityIds(boundary);
  const hasSupabaseUrl = Boolean(normalizeString(env.SUPABASE_URL));
  const hasServiceRole = Boolean(normalizeString(env.SUPABASE_SERVICE_ROLE_KEY));
  const hasAnonKey = Boolean(normalizeString(env.SUPABASE_ANON_KEY));

  const schemaOwnership = [
    { entityId: "user", target: "users", action: "defer" },
    { entityId: "project", target: "projects", action: "defer" },
    { entityId: "product-graph", target: "product_graphs", action: "defer" },
    { entityId: "conversation", target: "conversation_events", action: "defer" },
    { entityId: "files", target: "storage_objects_and_file_metadata", action: "defer" },
    { entityId: "history", target: "history_events", action: "defer" },
    { entityId: "mutation", target: "mutation_events", action: "defer" },
    { entityId: "provider-metadata", target: "provider_connections", action: "defer" },
    { entityId: "release", target: "release_snapshots", action: "defer" },
    { entityId: "privacy-request", target: "privacy_requests", action: "defer" },
  ];

  return {
    taskId: SUPABASE_PROVIDER_DECISION_TASK_ID,
    status: "ready",
    provider: "Supabase",
    decision: "defer-for-first-release",
    selectedPersistencePath: "project-service-workspace-store",
    projectId: safeProject.id ?? null,
    reason: "DATA-001 made the Product Graph and ProjectService the current source of truth. Supabase is useful later, but adopting it now without schema, RLS, auth mapping, storage, backup, export, and deletion hooks would create a second accidental source of truth.",
    userFacing: {
      title: "ספק אחסון חיצוני",
      status: "לא מחובר עכשיו",
      summary: "נקסוס שומרת כרגע את אמת הפרויקט בשרת המקומי של המוצר, ולא מחברת ספק חיצוני לפני שיש מיפוי מלא של הרשאות, קבצים, פרטיות ושחזור.",
      nextStep: "החיבור ייפתח רק אחרי שנגדיר טבלאות, הרשאות, קבצים, גיבוי, ייצוא ומחיקה בצורה שלא שוברת את אמת הפרויקט.",
    },
    activePathSupports: [
      "authenticated project restore",
      "Product Graph serialization",
      "file intake metadata",
      "history and mutation truth",
      "privacy inventory input",
    ],
    adoptionRequirements: [
      "schema for users, projects, Product Graph, conversation events, file metadata, history, releases, provider metadata, audit records, and privacy requests",
      "row-level-security mapped to Nexus account, team, project, and role truth",
      "server-only service-role usage with no browser exposure",
      "local development migration and rollback path",
      "storage bucket ownership for accepted FILE-001 assets",
      "export, deletion, retention, backup, and audit hooks before PRIVACY-001 claims full rights",
    ],
    environmentReadiness: {
      hasSupabaseUrl,
      hasAnonKey,
      hasServiceRole,
      secretsReachBrowser: false,
      readyForAdoption: false,
      reason: hasSupabaseUrl || hasAnonKey || hasServiceRole
        ? "Some Supabase environment values are present, but SUPABASE-001 still requires schema, RLS, service-role boundaries, and privacy hooks before adoption."
        : "No Supabase runtime credentials were adopted for this release path.",
    },
    schemaOwnership,
    dataOwnershipAlignment: {
      dataTaskId: boundary.taskId ?? "DATA-001",
      coveredEntityCount: entityIds.length,
      coveredEntityIds: entityIds,
      missingRequiredEntityIds: schemaOwnership
        .map((entry) => entry.entityId)
        .filter((entityId) => entityId !== "privacy-request" && !entityIds.includes(entityId)),
    },
    privacyDependency: {
      status: "unblocks-privacy-on-current-persistence-path",
      nextTask: "PRIVACY-001",
      note: "PRIVACY-001 may implement full rights against the selected ProjectService persistence path first; a future Supabase adoption must add provider-backed export/delete/retention hooks before claiming Supabase coverage.",
    },
  };
}
