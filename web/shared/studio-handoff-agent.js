const TASK_ID = "STD-HANDOFF-AGT-001";
const AGENT_ID = "studio-handoff-agent";
const HANDOFF_PROTOCOL_VERSION = "studio-handoff-v1";

const REQUIRED_ENVELOPE_FIELDS = [
  "handoffId",
  "handoffProtocolVersion",
  "projectId",
  "projectName",
  "workspaceId",
  "cloudRevision",
  "cloudRevisionHash",
  "requestedAction",
  "requiredLocalCapability",
  "entryState",
  "returnToWebUrl",
  "userVisibleReason",
  "boundaryReason",
  "createdAt",
  "expiresAt",
];

const FORBIDDEN_PAYLOAD_FIELDS = [
  "secrets",
  "providerTokens",
  "localCredentials",
  "rawLocalPaths",
  "environmentVariableValues",
  "privateLogs",
  "unrelatedFiles",
  "arbitraryFilesystemContents",
  "rawCommandHistory",
];

const DEEP_LINK_DOES_NOT_PROVE = [
  "studio-installed",
  "studio-opened",
  "studio-accepted-project",
  "local-folder-exists",
  "local-permission-granted",
  "local-action-succeeded",
  "sync-succeeded",
];

const RETURN_STATES = [
  "opened",
  "connected",
  "local-dirty",
  "sync-ready",
  "sync-accepted",
  "sync-rejected",
  "package-candidate-created",
  "evidence-returned",
];

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  if (Number.isNaN(date.getTime())) return new Date(0);
  return date;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function stableHash(value) {
  const input = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${(hash >>> 0).toString(16).padStart(8, "0")}${input.length.toString(16).padStart(4, "0")}`.slice(0, 12);
}

function resolveConnection(studioWorkspace = {}, desktopShellScope = {}, localDevelopmentBridge = {}) {
  const explicitStatus = normalizeString(
    studioWorkspace.connectionStatus
      ?? studioWorkspace.status
      ?? (desktopShellScope.summary?.bridgeReady === true ? "connected" : "")
      ?? (localDevelopmentBridge.summary?.isReady === true ? "connected" : ""),
  );
  const status = explicitStatus || "not-installed";
  const isConnected = status === "connected" || status === "ready";
  return {
    status,
    isConnected,
    kind: isConnected ? "connected" : "unavailable",
  };
}

function resolveCloudRevision(project) {
  return normalizeString(
    project.cloudRevision
      ?? project.revision
      ?? project.version
      ?? project.updatedAt
      ?? project.createdAt,
    "cloud-revision:unknown",
  );
}

function resolveProjectId(project) {
  return normalizeString(project.id ?? project.projectId, "studio-boundary-project");
}

function sanitizeArtifactExpectation(value) {
  const artifactExpectation = normalizeObject(value);
  return {
    projectType: normalizeString(artifactExpectation.projectType),
    deliverableLabel: normalizeString(artifactExpectation.deliverableLabel),
  };
}

export function createStudioHandoffAgentContract() {
  return {
    taskId: TASK_ID,
    agentId: AGENT_ID,
    protocolVersion: HANDOFF_PROTOCOL_VERSION,
    requiredEnvelopeFields: [...REQUIRED_ENVELOPE_FIELDS],
    forbiddenPayloadFields: [...FORBIDDEN_PAYLOAD_FIELDS],
    returnStates: [...RETURN_STATES],
    deepLinkDoesNotProve: [...DEEP_LINK_DOES_NOT_PROVE],
    webMustNotPromise: [
      "local-file-access-without-desktop-confirmation",
      "local-runtime-without-desktop-confirmation",
      "studio-installed-without-connection-proof",
      "sync-accepted-without-return-envelope",
      "package-created-without-studio-evidence",
    ],
  };
}

export function buildStudioHandoffAgentEnvelope({
  project = {},
  requestedAction = "open-project",
  requiredLocalCapability = "local-workspace",
  currentScreen = "studio",
  currentFlow = "web-to-studio",
  returnToWebUrl = "",
  now = new Date(),
} = {}) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  const studioWorkspace = normalizeObject(safeProject.studioWorkspace ?? state.studioWorkspace);
  const desktopShellScope = normalizeObject(safeProject.desktopShellScopeContract ?? context.desktopShellScopeContract ?? state.desktopShellScopeContract);
  const localDevelopmentBridge = normalizeObject(safeProject.localDevelopmentBridge ?? context.localDevelopmentBridge ?? state.localDevelopmentBridge);
  const createdAtDate = normalizeDate(now);
  const projectId = resolveProjectId(safeProject);
  const projectName = normalizeString(safeProject.name, "Nexus Project");
  const workspaceId = normalizeString(safeProject.workspaceId ?? state.workspaceId, `workspace:${projectId}`);
  const cloudRevision = resolveCloudRevision(safeProject);
  const requested = normalizeString(studioWorkspace.requestedAction ?? requestedAction, "open-project");
  const capability = normalizeString(studioWorkspace.requiredLocalCapability ?? requiredLocalCapability, "local-workspace");
  const connection = resolveConnection(studioWorkspace, desktopShellScope, localDevelopmentBridge);
  const entryState = connection.isConnected ? "connected-ready" : "desktop-unavailable";
  const status = connection.isConnected ? "connected-ready" : "unavailable-fallback";
  const decision = connection.isConnected ? "open" : "prepare-with-fallback";
  const userVisibleReason = normalizeString(
    studioWorkspace.userVisibleReason
      ?? studioWorkspace.requiredReason
      ?? "הפעולה הזאת דורשת יכולות מקומיות שצריכות לעבור דרך Nexus Studio Desktop.",
  );
  const boundaryReason = normalizeString(
    studioWorkspace.boundaryReason,
    "Nexus Web אינו מציג סטודיו מקומי מזויף, אלא מעביר בקשה מוגבלת לאפליקציית Desktop.",
  );
  const baseEnvelope = {
    projectId,
    projectName,
    workspaceId,
    cloudRevision,
    requestedAction: requested,
    requiredLocalCapability: capability,
    entryState,
    returnToWebUrl: normalizeString(returnToWebUrl, `/loop?projectId=${encodeURIComponent(projectId)}`),
    userVisibleReason,
    boundaryReason,
    currentScreen: normalizeString(studioWorkspace.currentScreen ?? currentScreen, "studio"),
    currentFlow: normalizeString(studioWorkspace.currentFlow ?? currentFlow, "web-to-studio"),
  };
  const handoffId = `studio-handoff:${projectId}:${stableHash({ ...baseEnvelope, createdAt: createdAtDate.toISOString() })}`;
  const envelope = {
    ...baseEnvelope,
    handoffId,
    handoffProtocolVersion: HANDOFF_PROTOCOL_VERSION,
    cloudRevisionHash: stableHash({ projectId, cloudRevision }),
    createdAt: createdAtDate.toISOString(),
    expiresAt: addMinutes(createdAtDate, 15).toISOString(),
    artifactExpectation: sanitizeArtifactExpectation(safeProject.artifactExpectation ?? state.artifactExpectation),
    preferredLocalAction: normalizeString(studioWorkspace.preferredLocalAction, requested),
  };

  return {
    taskId: TASK_ID,
    agentId: AGENT_ID,
    status,
    decision,
    connection,
    envelope,
    desktopOpenUrl: `nexus-studio://open?handoffId=${encodeURIComponent(handoffId)}`,
    unavailableFallback: connection.isConnected
      ? null
      : {
          label: "אפשר להמשיך ב־Nexus Web",
          body: "בלי Studio מחובר, Nexus לא מבטיח גישה לקבצים, הרצה מקומית או סנכרון מקומי.",
        },
    returnContract: {
      acceptedStates: [...RETURN_STATES],
      requiresEnvelopeId: true,
      acceptedTruthMustReturnToProjectId: projectId,
    },
    requiredEnvelopeFields: [...REQUIRED_ENVELOPE_FIELDS],
    forbiddenPayloadFields: [...FORBIDDEN_PAYLOAD_FIELDS],
    deepLinkDoesNotProve: [...DEEP_LINK_DOES_NOT_PROVE],
  };
}

export function validateStudioHandoffEnvelope(agentResult = {}) {
  const envelope = normalizeObject(agentResult.envelope);
  const missingFields = REQUIRED_ENVELOPE_FIELDS.filter((field) => !normalizeString(envelope[field]));
  const forbiddenFieldsPresent = FORBIDDEN_PAYLOAD_FIELDS.filter((field) => Object.hasOwn(envelope, field));
  return {
    taskId: TASK_ID,
    isValid: missingFields.length === 0 && forbiddenFieldsPresent.length === 0,
    missingFields,
    forbiddenFieldsPresent,
  };
}

export function acceptStudioHandoffReturn({ agentResult = {}, returnState = "", evidence = {} } = {}) {
  const safeAgent = normalizeObject(agentResult);
  const envelope = normalizeObject(safeAgent.envelope);
  const normalizedReturnState = normalizeString(returnState);
  if (!RETURN_STATES.includes(normalizedReturnState)) {
    return {
      taskId: TASK_ID,
      accepted: false,
      reason: "unsupported-studio-return-state",
    };
  }
  if (!normalizeString(envelope.handoffId) || !normalizeString(envelope.projectId)) {
    return {
      taskId: TASK_ID,
      accepted: false,
      reason: "missing-handoff-envelope",
    };
  }
  return {
    taskId: TASK_ID,
    accepted: true,
    returnState: normalizedReturnState,
    handoffId: envelope.handoffId,
    projectId: envelope.projectId,
    evidence: normalizeObject(evidence),
    acceptedAt: new Date().toISOString(),
  };
}
