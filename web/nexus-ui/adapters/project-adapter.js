import { createProjectDiscoveryAgentState } from "../../shared/project-discovery-agent.js";

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

const CREATE_PROJECT_UPLOAD_EMPTY_META = "";
const CREATE_PROJECT_UPLOAD_SELECTED_META = "";

function parseDraftFiles(fileName = "", fileContent = "") {
  if (typeof fileContent === "string" && fileContent.trim()) {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        return parsed.filter((file) => file && typeof file.name === "string" && file.name.trim());
      }
    } catch {
      // Fall back to the legacy single-file representation below.
    }
  }

  if (!fileName) {
    return [];
  }

  return [{ name: fileName }];
}

export function buildProjectCreateViewModel({
  currentProject = null,
  onboardingConversation = null,
  draftInputs = {},
  statusMessage = "כתוב חופשי. נמשיך משם.",
  identity = null,
} = {}) {
  const projectName = normalizeString(draftInputs.projectName, currentProject?.name ?? "");
  const visionText = normalizeString(draftInputs.visionText, currentProject?.goal ?? "");
  const supportingLink = normalizeString(draftInputs.supportingLink, "");
  const fileName = normalizeString(draftInputs.fileName, "");
  const fileContent = normalizeString(draftInputs.fileContent, "");
  const selectedFiles = parseDraftFiles(fileName, fileContent);
  const primaryFileName = selectedFiles[0]?.name ?? "";
  const discoveryAgent = createProjectDiscoveryAgentState({
    projectName,
    visionText,
    selectedFiles,
    conversation: onboardingConversation,
  });

  return {
    title: "מה אתה רוצה לבנות?",
    statusMessage,
    identity: {
      taskId: "ID-001",
      mode: identity?.mode ?? (identity?.userId ? "local-user" : "not-started"),
      status: identity?.status ?? (identity?.userId ? "active" : "needs-local-session"),
      userId: identity?.userId ?? null,
      displayName: identity?.displayName ?? (identity?.userId ? "משתמש מקומי" : "עדיין לא נוצר משתמש מקומי"),
      label: identity?.label ?? (identity?.userId ? "שמירה מקומית פעילה" : "שמירה תתחיל ביצירת הפרויקט"),
      boundary: identity?.boundary ?? (identity?.userId
        ? "הפרויקט יישמר תחת המשתמש המקומי הזה ויישאר זמין אחרי רענון בדפדפן הזה."
        : "לפני שמירת פרויקט Nexus תיצור משתמש מקומי ותשייך אליו את הפרויקט."),
      canLogout: identity?.canLogout === true || Boolean(identity?.userId),
    },
    discoveryAgent,
    fields: {
      projectName,
      visionText,
      supportingLink,
      fileName,
      fileContent,
    },
    upload: {
      title: selectedFiles.length > 1
        ? `${selectedFiles.length} קבצים יעלו עם השיחה`
          : primaryFileName
            ? primaryFileName
          : "",
      meta: selectedFiles.length > 0 ? CREATE_PROJECT_UPLOAD_SELECTED_META : CREATE_PROJECT_UPLOAD_EMPTY_META,
      selectedFiles,
    },
    entryHighlights: [],
    helperCards: [],
  };
}
