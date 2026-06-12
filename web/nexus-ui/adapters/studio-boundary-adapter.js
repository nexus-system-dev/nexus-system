import { buildStudioHandoffAgentEnvelope } from "../../shared/studio-handoff-agent.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function firstNonEmpty(...values) {
  return values.map((value) => normalizeString(value)).find(Boolean) ?? "";
}

function createStudioBoundaryViewContract() {
  return {
    contractId: "SURF-008",
    surfaceId: "studio",
    purpose: "desktop-local-workspace-boundary",
    studioLaw: "nexus-web-identifies-explains-and-hands-off-to-nexus-studio-desktop",
    requiredRegions: [
      "studio-web-boundary-explanation",
      "studio-desktop-connection-status",
      "studio-open-desktop-action",
      "studio-install-fallback",
      "studio-web-vs-desktop-split",
      "studio-return-to-web-product-truth",
    ],
  };
}

function resolveStudioConnection(studioWorkspace, desktopShellScope, localDevelopmentBridge) {
  const explicitStatus = firstNonEmpty(
    studioWorkspace.connectionStatus,
    studioWorkspace.status,
    desktopShellScope.summary?.bridgeReady === true ? "connected" : "",
    localDevelopmentBridge.summary?.isReady === true ? "connected" : "",
  );
  const status = explicitStatus || "not-installed";
  const isConnected = status === "connected" || status === "ready";

  return {
    status,
    isConnected,
    label: isConnected ? "Studio מחובר למחשב הזה" : "Studio עדיין לא מחובר",
    body: isConnected
      ? "אפשר להעביר פעולה שדורשת מחשב מקומי בלי לנתק את אמת הפרויקט מהענן."
      : "Nexus Web יכול להמשיך לבנות ולשחרר בענן. פעולות קבצים, הרצה מקומית או עבודה כבדה דורשות Nexus Studio Desktop.",
  };
}

export function buildStudioBoundaryViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const studioWorkspace = normalizeObject(safeProject.studioWorkspace ?? state.studioWorkspace);
  const desktopShellScope = normalizeObject(safeProject.desktopShellScopeContract ?? safeProject.context?.desktopShellScopeContract ?? state.desktopShellScopeContract);
  const localDevelopmentBridge = normalizeObject(safeProject.localDevelopmentBridge ?? safeProject.context?.localDevelopmentBridge ?? state.localDevelopmentBridge);
  const artifactExpectation = normalizeObject(safeProject.artifactExpectation ?? state.artifactExpectation);
  const projectName = normalizeString(safeProject.name, "Nexus Project");
  const projectGoal = normalizeString(safeProject.goal, "Nexus project");
  const connection = resolveStudioConnection(studioWorkspace, desktopShellScope, localDevelopmentBridge);
  const projectId = normalizeString(safeProject.id, "studio-boundary-project");
  const handoffAgent = buildStudioHandoffAgentEnvelope({
    project: safeProject,
    requestedAction: studioWorkspace.requestedAction ?? "open-project",
    requiredLocalCapability: studioWorkspace.requiredLocalCapability ?? "local-workspace",
    currentScreen: "studio",
    currentFlow: "web-studio-boundary",
    returnToWebUrl: `/loop?projectId=${encodeURIComponent(projectId)}`,
  });
  const desktopOpenUrl = handoffAgent.desktopOpenUrl;
  const installUrl = firstNonEmpty(studioWorkspace.installUrl, studioWorkspace.downloadUrl, "");
  const localRequirements = normalizeArray(studioWorkspace.localRequirements)
    .map((item) => normalizeString(item))
    .filter(Boolean);

  return {
    contract: createStudioBoundaryViewContract(),
    qaMode,
    project: {
      id: projectId,
      name: projectName,
      goal: projectGoal,
      productClass: firstNonEmpty(artifactExpectation.projectType, safeProject.projectType, "generic"),
    },
    studio: {
      connection,
      handoffAgent,
      desktopOpenUrl,
      installUrl,
      primaryActionLabel: connection.isConnected ? "פתח ב-Nexus Studio" : "נסה לפתוח Studio",
      fallbackActionLabel: installUrl ? "הורד Nexus Studio" : "Studio Desktop עדיין לא מותקן",
      boundaryTitle: "Studio הוא אפליקציה מקומית, לא עוד מסך באתר",
      boundaryBody: "האתר נשאר Nexus Web: שיחה, בנייה, שחרור, שיתוף והיסטוריה. Studio Desktop מיועד לקבצים מקומיים, הרצה מקומית, בדיקות כבדות ואריזה.",
      webResponsibilities: [
        "שומר את אמת הפרויקט בענן",
        "מציג את ההקשר והסיבה למעבר",
        "מחזיר אותך לבנייה, שחרור או היסטוריה באותו פרויקט",
      ],
      desktopResponsibilities: localRequirements.length ? localRequirements : [
        "גישה לקבצים מקומיים",
        "הרצה ובדיקה על המחשב",
        "עבודה כבדה שלא שייכת לדפדפן",
        "טיוטות מקומיות עד סנכרון חזרה",
      ],
      requiredReason: firstNonEmpty(
        handoffAgent.envelope?.userVisibleReason,
        studioWorkspace.requiredReason,
        "הפעולה הזאת דורשת יכולות מקומיות שאסור להעמיד פנים שקיימות בתוך הדפדפן.",
      ),
      returnTargets: [
        { label: "חזור לבנייה", target: "loop" },
        { label: "חזור לשחרור", target: "release" },
        { label: "ראה היסטוריה", target: "timeline" },
      ],
    },
  };
}
