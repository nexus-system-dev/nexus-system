const DEFAULT_ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".json",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".csv",
];

const DEFAULT_REFERENCE_ONLY_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const DEFAULT_MAX_FILE_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_FILES = 8;

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

function resolveExtension(name = "") {
  const normalized = normalizeString(name, "").toLowerCase();
  const index = normalized.lastIndexOf(".");
  return index >= 0 ? normalized.slice(index) : "";
}

function estimateSize(file = {}) {
  const size = normalizeNumber(file.size, 0);
  if (size > 0) return size;
  const content = typeof file.content === "string" ? file.content : "";
  return new TextEncoder().encode(content).length;
}

function normalizeFile(file = {}, index = 0) {
  const normalized = normalizeObject(file);
  const name = normalizeString(normalized.name, `attachment-${index + 1}.txt`);
  return {
    id: normalizeString(normalized.id, `file-${index + 1}`),
    name,
    type: normalizeString(normalized.type, "unknown"),
    content: typeof normalized.content === "string" ? normalized.content : "",
    size: estimateSize(normalized),
    extension: resolveExtension(name),
  };
}

function createRejectedDecision(file, reason, index) {
  return {
    fileId: file.id,
    intakeItemId: `file-intake:item:${index + 1}`,
    name: file.name,
    type: file.type,
    extension: file.extension,
    size: file.size,
    decision: "rejected",
    understandingRole: "not-used",
    storageStatus: "rejected-before-storage",
    reason,
  };
}

function createAcceptedDecision(file, policy, index) {
  const referenceOnly = policy.referenceOnlyExtensions.includes(file.extension);
  const decision = referenceOnly ? "reference-only" : "accepted";
  return {
    fileId: file.id,
    intakeItemId: `file-intake:item:${index + 1}`,
    name: file.name,
    type: file.type,
    extension: file.extension,
    size: file.size,
    decision,
    understandingRole: referenceOnly ? "visual-reference-only" : "product-understanding-input",
    storageStatus: "stored-in-project-intake",
    reason: referenceOnly
      ? "הקובץ נשמר כרפרנס חזותי ולא מחליף אמת מוצרית."
      : "הקובץ התקבל כחומר תומך להבנת המוצר.",
  };
}

export function createFirstReleaseFileIntakeBoundary({
  projectId = null,
  sessionId = null,
  uploadedFiles = [],
  externalLinks = [],
  policyOverrides = {},
} = {}) {
  const policy = {
    acceptedExtensions: normalizeArray(policyOverrides.acceptedExtensions).length
      ? normalizeArray(policyOverrides.acceptedExtensions)
      : DEFAULT_ACCEPTED_EXTENSIONS,
    referenceOnlyExtensions: normalizeArray(policyOverrides.referenceOnlyExtensions).length
      ? normalizeArray(policyOverrides.referenceOnlyExtensions)
      : DEFAULT_REFERENCE_ONLY_EXTENSIONS,
    maxFileBytes: normalizeNumber(policyOverrides.maxFileBytes, DEFAULT_MAX_FILE_BYTES),
    maxFiles: normalizeNumber(policyOverrides.maxFiles, DEFAULT_MAX_FILES),
    retentionPolicy: normalizeString(policyOverrides.retentionPolicy, "project-lifecycle-until-user-delete"),
  };
  const normalizedFiles = normalizeArray(uploadedFiles).map(normalizeFile);
  const acceptedExtensionSet = new Set(policy.acceptedExtensions);
  const decisions = normalizedFiles.map((file, index) => {
    if (index >= policy.maxFiles) {
      return createRejectedDecision(file, "too-many-files", index);
    }
    if (!acceptedExtensionSet.has(file.extension)) {
      return createRejectedDecision(file, "unsupported-file-type", index);
    }
    if (file.size > policy.maxFileBytes) {
      return createRejectedDecision(file, "file-too-large", index);
    }
    return createAcceptedDecision(file, policy, index);
  });
  const acceptedFiles = normalizedFiles.filter((file, index) => decisions[index]?.decision !== "rejected");
  const rejectedFiles = decisions.filter((decision) => decision.decision === "rejected");
  const understandingInputs = decisions.filter((decision) => decision.understandingRole === "product-understanding-input");
  const referenceOnlyInputs = decisions.filter((decision) => decision.understandingRole === "visual-reference-only");
  const links = normalizeArray(externalLinks)
    .filter((link) => typeof link === "string" && link.trim())
    .map((link) => link.trim());

  return {
    taskId: "FILE-001",
    status: rejectedFiles.length > 0 ? "bounded-with-rejections" : acceptedFiles.length > 0 || links.length > 0 ? "ready" : "empty",
    projectId: normalizeString(projectId, ""),
    sessionId: normalizeString(sessionId, ""),
    scope: {
      acceptedInputs: ["image", "pdf", "requirements-document", "text", "markdown", "code-reference", "csv", "json", "external-link"],
      notSupportedYet: ["executable-upload", "remote-drive-sync", "large-binary-ingestion", "background-virus-scan", "public-file-sharing"],
    },
    policy: {
      acceptedExtensions: policy.acceptedExtensions,
      maxFileBytes: policy.maxFileBytes,
      maxFiles: policy.maxFiles,
      retentionPolicy: policy.retentionPolicy,
      deleteBehavior: "user-removes-from-project-intake-before-release",
      replaceBehavior: "new-upload-replaces-prior-file-with-same-name-in-intake",
      storageBoundary: "project-intake-local-durable-state",
    },
    decisions,
    acceptedFiles,
    rejectedFiles,
    understandingInputs,
    referenceOnlyInputs,
    externalLinks: links,
    productUnderstandingRouting: {
      status: understandingInputs.length > 0 || links.length > 0 ? "routed-to-project-understanding" : "reference-only-or-empty",
      acceptedFileNames: understandingInputs.map((decision) => decision.name),
      referenceOnlyFileNames: referenceOnlyInputs.map((decision) => decision.name),
      externalLinks: links,
    },
    userFacing: {
      title: acceptedFiles.length > 0 ? "קבצים ייכנסו כהקשר לפרויקט" : "אפשר לצרף קבצים כהקשר",
      body: acceptedFiles.length > 0
        ? "Nexus שומרת את הקבצים בפרויקט ומסמנת אם הם משמשים להבנה או רק כרפרנס."
        : "בגרסה הראשונה אפשר לצרף מסמכי דרישות, תמונות, טקסט וקישורים. קבצים לא נתמכים ייחסמו לפני שמירה.",
      limits: `עד ${policy.maxFiles} קבצים, עד ${Math.round(policy.maxFileBytes / 1024 / 1024)}MB לקובץ.`,
    },
  };
}
