import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";
import { humanizeApprovalSummary, humanizeReleaseSummary, humanizeValidationSummary } from "./review-surface-copy.js";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function resolveSummaryItems(project) {
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const aiControlCenterSurface = normalizeObject(project.aiControlCenterSurface);

  return [
    aiControlCenterSurface.generatedSurfacePreview?.screenId
      ? "התוצר כבר נשמר כמשטח עבודה חי בתוך Nexus."
      : "נוצר תוצר שאפשר לבדוק ממש עכשיו בתוך הלולאה.",
    humanizeValidationSummary(project),
    humanizeApprovalSummary(project),
    humanizeReleaseSummary(project),
  ].filter(Boolean);
}

function humanizeDecisionNote(note) {
  const text = escapeText(note);
  if (!text) {
    return "";
  }

  return text
    .replace("Recommended defaults are still provisional", "יש כמה הגדרות שעדיין דורשות את האישור שלך")
    .replace("Business defaults still need confirmation", "צריך לאשר את הגדרות העסק לפני שמתקדמים")
    .replace("Production deploy needs confirmation", "השינוי הזה דורש אישור לפני שנמשיך");
}

function buildArtifactApprovalRequestId(projectId = "") {
  const normalizedProjectId = escapeText(projectId, "");
  return normalizedProjectId
    ? `approval:${normalizedProjectId}:artifact-proof:user-confirmation`
    : "";
}

export function buildConfirmationViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const context = normalizeObject(safeProject.context);
  const approvalRequest = normalizeObject(context.approvalRequest);
  const approvalStatus = normalizeObject(context.approvalStatus);
  const approvalRecords = normalizeArray(context.approvalRecords ?? safeProject.approvalRecords);
  const latestDecision = normalizeObject(approvalRecords[0]);
  const hasArtifactApprovalRequest = approvalRequest.actionType === "artifact-proof-confirmation";
  const artifactApprovalRequestId = buildArtifactApprovalRequestId(safeProject.id);
  const resultName = artifactTruth.title
    || safeProject.aiControlCenterSurface?.generatedSurfacePreview?.screenId
    || "התוצאה הנוכחית";

  return {
    title: "האם זה התוצר שנכון לקדם עכשיו?",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך confirmation גם בלי approval flow מלא."
      : "זה רגע ההחלטה על התוצר עצמו: או שמקבעים אותו וממשיכים, או שמחזירים לסבב חידוד ממוקד.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "נקודת החלטה",
    resultName,
    artifactTruth,
    summaryItems: resolveSummaryItems(safeProject),
    decisionNote: hasArtifactApprovalRequest
      ? (
        humanizeDecisionNote(approvalStatus.reason)
        || humanizeDecisionNote(latestDecision.reason)
        || "האישור יקדם את אותו תוצר למסלול הבא, ובקשת שינוי תחזיר אותנו לשיפור ממוקד בלי לאבד את מה שכבר נבנה."
      )
      : "האישור כאן מתייחס לתוצר עצמו ויפתח את ה־state update של הארטיפקט, בלי לערב בקשות runtime אחרות.",
    approveAction: {
      label: "זה טוב, המשך",
      target: "state-update",
      approvalRequestId: hasArtifactApprovalRequest
        ? (approvalRequest.approvalRequestId ?? approvalStatus.approvalRequestId ?? artifactApprovalRequestId)
        : artifactApprovalRequestId,
      supported: true,
    },
    reviseAction: {
      label: "צריך שינויים",
      target: "loop",
      supported: true,
    },
    artifactAction: {
      label: artifactTruth.openAction.label,
      target: artifactTruth.openAction.target,
      supported: artifactTruth.openAction.supported,
    },
  };
}
