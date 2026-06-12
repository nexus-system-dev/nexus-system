function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function resolveRuntime(project = null, runtimeSkeleton = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    runtimeSkeleton
      ?? safeProject.runtimeSkeletonTruth
      ?? safeProject.runtimeSkeleton
      ?? safeProject.state?.runtimeSkeletonTruth
      ?? safeProject.context?.runtimeSkeletonTruth,
  );
}

function resolveBuildStatus(project = null, buildAgentTurn = null, buildMutationTruth = null) {
  const safeProject = normalizeObject(project);
  const turn = normalizeObject(buildAgentTurn);
  const mutation = normalizeObject(buildMutationTruth);
  const candidate = normalizeString(
    safeProject.buildPreviewState?.buildStatus
      ?? safeProject.state?.buildPreviewState?.buildStatus
      ?? safeProject.runtimeBuildState?.buildStatus
      ?? turn.status
      ?? mutation.status,
    "",
  );
  if (/failed|error|blocked/i.test(candidate)) return "failed";
  if (/timeout|timed-out/i.test(candidate)) return "timed-out";
  if (/pending|loading|working|running|in-progress/i.test(candidate)) return "working";
  if (/applied|ready|completed|created|synced/i.test(candidate)) return "ready";
  return "ready";
}

function hasExplicitFailure(project = null) {
  const safeProject = normalizeObject(project);
  return Boolean(
    safeProject.buildPreviewState?.error
      ?? safeProject.state?.buildPreviewState?.error
      ?? safeProject.runtimeBuildState?.error
      ?? safeProject.lastBuildError
      ?? safeProject.state?.lastBuildError,
  );
}

function resolveErrorMessage(project = null) {
  const safeProject = normalizeObject(project);
  const error = safeProject.buildPreviewState?.error
    ?? safeProject.state?.buildPreviewState?.error
    ?? safeProject.runtimeBuildState?.error
    ?? safeProject.lastBuildError
    ?? safeProject.state?.lastBuildError;
  if (typeof error === "string") return error;
  if (error && typeof error.message === "string") return error.message;
  return "";
}

function resolveElapsedMs(project = null, now = Date.now()) {
  const safeProject = normalizeObject(project);
  const startedAt = safeProject.buildPreviewState?.startedAt
    ?? safeProject.state?.buildPreviewState?.startedAt
    ?? safeProject.runtimeBuildState?.startedAt
    ?? safeProject.updatedAt
    ?? safeProject.createdAt;
  const startedTime = Number.isFinite(Date.parse(startedAt)) ? Date.parse(startedAt) : 0;
  if (!startedTime) return 0;
  return Math.max(0, normalizeNumber(now, Date.now()) - startedTime);
}

export function createBuildPreviewSandboxBoundary({
  project = null,
  runtimeSkeleton = null,
  previewArtifact = null,
  buildMutationTruth = null,
  buildAgentTurn = null,
  now = Date.now(),
  timeoutMs = 45000,
} = {}) {
  const safeProject = normalizeObject(project);
  const runtime = resolveRuntime(safeProject, runtimeSkeleton);
  const artifact = normalizeObject(previewArtifact ?? safeProject.proofArtifact ?? safeProject.previewArtifact);
  const mutation = normalizeObject(buildMutationTruth);
  const turn = normalizeObject(buildAgentTurn);
  const hasRuntime = Boolean(normalizeString(runtime.runtimeSkeletonId, ""));
  const hasArtifact = Boolean(normalizeString(artifact.artifactId ?? artifact.id, ""));
  const elapsedMs = resolveElapsedMs(safeProject, now);
  const baseBuildStatus = resolveBuildStatus(safeProject, turn, mutation);
  const explicitFailure = hasExplicitFailure(safeProject);
  const timedOut = baseBuildStatus === "timed-out" || (baseBuildStatus === "working" && elapsedMs > timeoutMs);
  const status = explicitFailure
    ? "failed"
    : timedOut
      ? "timed-out"
      : hasRuntime || hasArtifact
        ? "ready"
        : "artifact-not-created";
  const buildStatus = status === "ready"
    ? "ready"
    : status === "artifact-not-created"
      ? "not-created"
      : status;
  const previewStatus = status === "ready"
    ? "sandbox-preview-ready"
    : "preview-unavailable";
  const artifactFallback = status === "artifact-not-created"
    ? "show-empty-artifact-recovery"
    : status === "failed" || status === "timed-out"
      ? "show-failure-recovery"
      : "not-needed";
  const titleByStatus = {
    ready: "התצוגה מוכנה לבדיקה בתוך Nexus",
    "artifact-not-created": "התצוגה עדיין לא נוצרה",
    failed: "בניית התצוגה נכשלה",
    "timed-out": "בניית התצוגה נעצרה בגלל זמן המתנה",
  };
  const bodyByStatus = {
    ready: "זו סביבת בדיקה פנימית. היא מציגה מוצר שאפשר להמשיך לבנות, לא פרסום חי ולא גרסת ייצור.",
    "artifact-not-created": "לא נוצר שלד או נכס שאפשר להציג. אפשר לנסות שוב או לחדד את הבקשה לפני שממשיכים.",
    failed: resolveErrorMessage(safeProject) || "הבנייה נכשלה לפני שנוצרה תצוגה אמינה. המוצר הקיים לא השתנה.",
    "timed-out": "הבנייה לקחה יותר מדי זמן ולכן נעצרה בצורה בטוחה. לא מוצגת הצלחה מזויפת.",
  };
  const nextActionByStatus = {
    ready: "אפשר לבדוק, לבקש שינוי, או להמשיך לשלב הבא.",
    "artifact-not-created": "נסה שוב או כתוב מה חייב להופיע במסך הראשון.",
    failed: "נסה שוב אחרי תיקון הבקשה או בדיקת החסם.",
    "timed-out": "נסה שוב. אם זה חוזר, צריך לבדוק את הסוכן או הספק.",
  };

  return {
    taskId: "RUNTIME-001",
    status,
    buildStatus,
    previewStatus,
    sandboxBoundary: "nexus-internal-sandbox-not-production",
    timeoutPolicy: {
      timeoutMs,
      elapsedMs,
      status: timedOut ? "expired" : "bounded",
    },
    retryPolicy: {
      canRetry: status !== "ready",
      retryMode: status === "ready" ? "not-needed" : "user-driven-retry",
      retryAction: "retry-build-preview",
      maxAutomaticRetries: 0,
    },
    artifactFallback,
    noFakeLiveProductClaim: true,
    trace: {
      projectId: normalizeString(safeProject.id, ""),
      runtimeSkeletonId: normalizeString(runtime.runtimeSkeletonId, ""),
      artifactBuildId: normalizeString(runtime.artifactBuildId ?? artifact.artifactBuildId, ""),
      previewArtifactId: normalizeString(artifact.artifactId ?? artifact.id, ""),
      mutationId: normalizeString(mutation.lastMutationId ?? mutation.mutationId, ""),
      operationId: normalizeString(mutation.lastOperationId ?? mutation.operationId, ""),
      buildAgentStatus: normalizeString(turn.status, ""),
      buildAgentIntent: normalizeString(turn.intent, ""),
      blockers: normalizeArray(safeProject.buildPreviewState?.blockers ?? safeProject.state?.buildPreviewState?.blockers),
    },
    userFacing: {
      title: titleByStatus[status],
      body: bodyByStatus[status],
      nextAction: nextActionByStatus[status],
    },
  };
}
