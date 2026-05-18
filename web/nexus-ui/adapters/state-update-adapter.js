import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";
import {
  humanizeApprovalSummary,
  humanizeReleaseSummary,
  humanizeValidationSummary,
  resolveUserFacingApprovalState,
} from "./review-surface-copy.js";

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

function resolveRoadmap(project) {
  return normalizeArray(project.cycle?.roadmap);
}

function resolveCompletionCount(roadmap) {
  return roadmap.filter((task) => task.status === "done").length;
}

function resolveBlockedCount(roadmap) {
  return roadmap.filter((task) => task.status === "blocked").length;
}

function resolveNextTask(project, roadmap) {
  return roadmap.find((task) => task.status === "assigned")
    ?? roadmap.find((task) => task.status === "blocked")
    ?? normalizeObject(project.developerWorkspace?.contextSummary).nextAction
    ?? null;
}

function resolveUpdateCards(project, roadmap) {
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision);
  const approvalState = resolveUserFacingApprovalState(project);
  const releaseValidation = normalizeObject(normalizeObject(project.releaseWorkspace).validation);
  const nextTask = resolveNextTask(project, roadmap);

  const cards = [];

  if (generatedSurfaceProofSchema.proofId || generatedSurfaceProofSchema.summary?.validationStatus) {
    cards.push({
      tone: "success",
      glyph: "✓",
      title: "התוצר אושרר ונשמר בפרויקט",
      description: humanizeValidationSummary(project),
      impact: "עכשיו יש תוצאה גלויה שאפשר להמשיך ממנה בלי לחזור ל־review טכני.",
    });
  }

  if (approvalState.status || proposalApplyDecision.status) {
    const status = approvalState.status || proposalApplyDecision.status;
    cards.push({
      tone: status === "approved" ? "success" : "primary",
      glyph: status === "approved" ? "↑" : "•",
      title: status === "approved" ? "הפרויקט התקדם עם אישור" : "החלטת ההמשך נשמרה בפרויקט",
      description: humanizeApprovalSummary(project),
      impact: status === "approved"
        ? "אפשר לעבור קדימה בלי להישאר בשלב review."
        : "ההחלטה נשמרה והיא כבר מגדירה את הצעד הבא.",
    });
  }

  if (nextTask) {
    cards.push({
      tone: "primary",
      glyph: "→",
      title: "נפתחה פעולה חדשה להמשך",
      description: typeof nextTask === "string"
        ? nextTask
        : escapeText(nextTask.summary ?? nextTask.title, "יש צעד חדש שמוכן להמשך."),
      impact: "הפרויקט לא נשאר תקוע; יש המשך ברור.",
    });
  }

  if (!cards.length) {
    cards.push({
      tone: "success",
      glyph: "✓",
      title: "הפרויקט התקדם",
      description: "המערכת רשמה את תוצאת העבודה ועדכנה את המצב בהתאם.",
      impact: "אפשר להתקדם לצעד הבא בלולאה.",
    });
  }

  return cards.slice(0, 3);
}

function resolveUnlockedItems(project, roadmap) {
  const nextTask = resolveNextTask(project, roadmap);
  const releaseValidation = normalizeObject(normalizeObject(project.releaseWorkspace).validation);
  const items = [];

  if (nextTask) {
    items.push(typeof nextTask === "string" ? nextTask : escapeText(nextTask.summary ?? nextTask.title, "המשימה הבאה"));
  }

  if (releaseValidation.status) {
    items.push(humanizeReleaseSummary(project));
  }

  if (!items.length) {
    items.push("יש עכשיו מסלול ברור למשימה הבאה.");
  }

  return items.slice(0, 3);
}

export function buildStateUpdateViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const roadmap = resolveRoadmap(safeProject);
  const progressState = normalizeObject(safeProject.progressState);
  const reactiveWorkspaceState = normalizeObject(safeProject.reactiveWorkspaceState);
  const developerSummary = normalizeObject(safeProject.developerWorkspace?.contextSummary);
  const completionCount = resolveCompletionCount(roadmap);
  const blockedCount = resolveBlockedCount(roadmap);
  const progressPercent = reactiveWorkspaceState.progressBar?.percent ?? progressState.percent ?? developerSummary.progressPercent ?? 0;
  const unlockedItems = resolveUnlockedItems(safeProject, roadmap);

  return {
    title: "הפרויקט התקדם צעד אמיתי",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך state update גם בלי רצף approval מלא."
      : "האישור לא רק נשמר. הנה מה התקדם בפועל, ומה נפתח עכשיו להמשך הלולאה.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "אבן דרך הושלמה",
    artifactTruth,
    updateCards: resolveUpdateCards(safeProject, roadmap),
    completionItems: [
      generatedSurfaceProofLabel(safeProject),
      approvalLabel(safeProject),
      completionCount ? `הושלמו ${completionCount} משימות מתוך ציר העבודה.` : null,
    ].filter(Boolean),
    unlockedItems,
    progressLabel: "התקדמות לפרסום",
    progressPercent,
    stats: [
      { label: "התקדמות כללית", value: `${progressPercent}%` },
      { label: "משימות הושלמו", value: completionCount ? String(completionCount) : "0" },
      { label: "חסמים פתוחים", value: String(blockedCount) },
    ],
    nextMeaning: blockedCount > 0
      ? "יש עדיין חסמים פתוחים, אבל עכשיו ברור מה לטפל בו קודם."
      : "המצב החדש פותח את המסלול למשימה הבאה בלי לחזור אחורה למסכי review.",
    primaryAction: {
      label: "המשך למשימה הבאה",
      target: "next-task",
    },
    secondaryAction: {
      label: "הצג היסטוריה",
      target: "timeline",
    },
    artifactAction: {
      label: artifactTruth.openAction.label,
      target: artifactTruth.openAction.target,
      supported: artifactTruth.openAction.supported,
    },
  };
}

function generatedSurfaceProofLabel(project) {
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  if (!generatedSurfaceProofSchema.proofId && !generatedSurfaceProofSchema.summary?.proofStatus) {
    return null;
  }

  return "התוצר האחרון נשמר כהוכחה פעילה בתוך הפרויקט.";
}

function approvalLabel(project) {
  const approvalState = resolveUserFacingApprovalState(project);
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision);
  const status = approvalState.status || proposalApplyDecision.status;
  return status ? humanizeApprovalSummary(project) : null;
}
