import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";
import { humanizeApprovalSummary, humanizeMissionStatus, humanizeReleaseSummary, humanizeValidationSummary } from "./review-surface-copy.js";

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

function resolveAssignedTask(roadmap) {
  return roadmap.find((task) => task.status === "assigned") ?? null;
}

function resolveBlockedTask(roadmap) {
  return roadmap.find((task) => task.status === "blocked") ?? null;
}

function resolveArtifactExpectation(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

function resolveRepeatedLoopContinuation(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.repeatedLoopContinuation
      ?? safeProject.state?.repeatedLoopContinuation
      ?? safeProject.context?.repeatedLoopContinuation,
  );
}

function resolvePostReleaseContinuationLoop(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.postReleaseContinuationLoop
      ?? safeProject.context?.postReleaseContinuationLoop
      ?? safeProject.state?.postReleaseContinuationLoop,
  );
}

function resolveNextMission(project) {
  const roadmap = resolveRoadmap(project);
  const assignedTask = resolveAssignedTask(roadmap);
  const blockedTask = resolveBlockedTask(roadmap);
  const developerSummary = normalizeObject(project.developerWorkspace?.contextSummary);
  const artifactExpectation = resolveArtifactExpectation(project);
  const repeatedLoopContinuation = resolveRepeatedLoopContinuation(project);
  if (repeatedLoopContinuation.active) {
    if (repeatedLoopContinuation.requiresClarification === true) {
      const clarification = normalizeObject(repeatedLoopContinuation.clarification);
      const requestedMaterialLabel = escapeText(clarification.requestedMaterialLabel, "חומר תומך");
      return {
        title: escapeText(repeatedLoopContinuation.missionTitle, "צריך עוד הבהרה לפני ההמשך"),
        description: escapeText(
          repeatedLoopContinuation.missionDescription,
          `נדרש ${requestedMaterialLabel} לפני שאפשר לפתוח increment אמיתי בלי למחזר את אותו artifact.`,
        ),
        status: "blocked",
        lane: "clarification",
        estimatedTime: "לפני סבב ההמשך",
        dependencyStatus: `חסר עכשיו: ${requestedMaterialLabel}`,
        upcomingItems: normalizeArray(repeatedLoopContinuation.upcomingItems),
      };
    }
    return {
      title: escapeText(repeatedLoopContinuation.missionTitle, "המשך העבודה על הפרויקט"),
      description: escapeText(repeatedLoopContinuation.missionDescription, "הסבב הבא כבר נפתח על גבי התוצר שאושר."),
      status: "assigned",
      lane: "loop",
      estimatedTime: "נפתח עכשיו",
      dependencyStatus: "סבב ההמשך מוכן לפתיחה",
      upcomingItems: normalizeArray(repeatedLoopContinuation.upcomingItems),
    };
  }
  const fallbackTitle = artifactExpectation.title
    ? `לקדם את ${escapeText(artifactExpectation.title, "התוצר שאושר")}`
    : "להמשיך את התוצר שאושר";
  const nextAction = developerSummary.nextAction ?? assignedTask?.summary ?? blockedTask?.summary ?? fallbackTitle;

  return {
    title: escapeText(assignedTask?.summary ?? developerSummary.nextAction ?? nextAction, "המשך העבודה על הפרויקט"),
    description: blockedTask
      ? `לפני הכול צריך לטפל בחסם: ${escapeText(blockedTask.summary, "חסם פתוח")} כדי לפתוח את ההתקדמות.`
      : assignedTask?.summary
        ? `זה הצעד הבא שנמצא כבר על המסלול: ${escapeText(assignedTask.summary)}.`
        : escapeText(
            artifactExpectation.loopReadyMessage
              ?? artifactExpectation.continuityLine
              ?? "המערכת פותחת עכשיו סבב המשך אמיתי על גבי התוצר שאושר.",
            "זה הצעד הבא שהמערכת ממליצה עליו לפי מצב הפרויקט כרגע.",
          ),
    status: blockedTask ? "blocked" : assignedTask ? "assigned" : "pending",
    lane: assignedTask?.lane ?? blockedTask?.lane ?? "loop",
    estimatedTime: blockedTask ? "לפני ההמשך" : assignedTask ? "השלב הבא" : "נפתח עכשיו",
    dependencyStatus: blockedTask ? "יש חסם אחד פתוח" : assignedTask ? "מוכן לביצוע" : "סבב ההמשך מוכן לפתיחה",
  };
}

function buildWhyNow(project, mission, roadmap) {
  const bottleneck = escapeText(project.overview?.bottleneck, "");
  if (mission.status === "blocked") {
    return `זה הצעד הנכון עכשיו כי החסם המרכזי הוא ${mission.title}, וכל עוד הוא פתוח שאר המסלול יישאר תקוע.`;
  }
  if (bottleneck) {
    return `זה הצעד הנכון עכשיו כי החסם המרכזי בפרויקט הוא ${bottleneck}, והמשימה הזאת פותרת אותו באופן הישיר ביותר.`;
  }
  if (roadmap.length > 1) {
    return "זה הצעד הבא שנמצא בראש התור, אחרי ניתוח התלויות והסדר הנכון של העבודה.";
  }
  return "זה הצעד הישיר ביותר להמשיך ממנו בלי לפצל את הפרויקט למסלולים מיותרים.";
}

function buildReadyNowItems(project, mission, roadmap) {
  const items = [];
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const approvalStatus = normalizeObject(project.context?.approvalStatus ?? project.approvalStatus);
  const releaseValidation = normalizeObject(normalizeObject(project.releaseWorkspace).validation);
  const repeatedLoopContinuation = resolveRepeatedLoopContinuation(project);

  if (repeatedLoopContinuation.proofIncrement?.reason) {
    items.push(repeatedLoopContinuation.proofIncrement.reason);
  }

  if (generatedSurfaceProofSchema.summary?.validationStatus) {
    items.push(humanizeValidationSummary(project));
  }
  if (approvalStatus.status) {
    items.push(humanizeApprovalSummary(project));
  }
  if (releaseValidation.status) {
    items.push(humanizeReleaseSummary(project));
  }
  if (mission.dependencyStatus) {
    items.push(mission.dependencyStatus);
  }
  if (!items.length && roadmap.length) {
    items.push("יש כבר roadmap פעיל עם משימה מסודרת להמשך.");
  }
  if (!items.length) {
    items.push("הפרויקט מוכן לעבור לצעד הבא בלולאה.");
  }

  return items.slice(0, 4);
}

function buildBlockerItems(roadmap) {
  return roadmap
    .filter((task) => task.status === "blocked")
    .slice(0, 3)
    .map((task) => escapeText(task.summary, "חסם פתוח"));
}

function buildUpcomingItems(roadmap, mission) {
  if (Array.isArray(mission.upcomingItems) && mission.upcomingItems.length) {
    return mission.upcomingItems;
  }

  const titles = roadmap
    .filter((task) => task.summary && task.summary !== mission.title)
    .slice(0, 3)
    .map((task) => escapeText(task.summary));

  return titles.length ? titles : ["אחרי הצעד הזה אפשר לחזור ל־Loop ולעדכן priority מחדש."];
}

export function buildNextTaskViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const roadmap = resolveRoadmap(safeProject);
  const mission = resolveNextMission(safeProject);
  const repeatedLoopContinuation = resolveRepeatedLoopContinuation(safeProject);
  const postReleaseContinuationLoop = resolvePostReleaseContinuationLoop(safeProject);
  const repeatedLoopClarification = normalizeObject(repeatedLoopContinuation.clarification);
  const requiresClarification = repeatedLoopContinuation.requiresClarification === true;
  const blockedItems = buildBlockerItems(roadmap);
  const progressPercent = normalizeObject(safeProject.reactiveWorkspaceState).progressBar?.percent
    ?? normalizeObject(safeProject.progressState).percent
    ?? normalizeObject(safeProject.developerWorkspace?.contextSummary).progressPercent
    ?? 0;

  return {
    title: "מאיפה ממשיכים עכשיו",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך next task גם בלי routing מלא של המשך הלולאה."
      : "זאת המשימה הבאה שנפתחת מתוך התוצר שאושר עכשיו, עם כל ההקשר שכבר נצבר בלולאה.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "המלצה מבוססת AI",
    artifactTruth,
    mission: {
      title: mission.title,
      description: mission.description,
      status: humanizeMissionStatus(mission.status),
      icon: "→",
      metadata: [
        { label: "מסלול", value: mission.lane },
        { label: "מתי לפתוח", value: mission.estimatedTime },
        { label: "מוכנות", value: mission.dependencyStatus },
      ],
    },
    whyNow: requiresClarification
      ? escapeText(
          repeatedLoopClarification.detail,
          "המערכת עוצרת כאן truthfully כי בלי עוד הקשר הסבב הבא יהיה replay של אותו artifact ולא שיפור אמיתי.",
        )
      : buildWhyNow(safeProject, mission, roadmap),
    readyNowItems: buildReadyNowItems(safeProject, mission, roadmap),
    blockerItems: requiresClarification
      ? [escapeText(repeatedLoopClarification.requestedMaterialLabel, "חומר תומך שיבהיר את הסבב הבא")]
      : blockedItems,
    upcomingItems: buildUpcomingItems(roadmap, mission),
    progressPercent,
    stats: [
      { label: "התקדמות כללית", value: `${progressPercent}%` },
      { label: "משימות בתור", value: String(roadmap.length) },
      { label: "חסמים פתוחים", value: String(blockedItems.length) },
    ],
    postReleaseContinuation: {
      statusLabel: escapeText(postReleaseContinuationLoop.statusLabel, "עדיין אין סבב המשך אמיתי"),
      originArtifactTitle: escapeText(postReleaseContinuationLoop.originArtifactTitle, safeProject.name ?? "התוצר שאושר"),
      originReleaseTarget: escapeText(postReleaseContinuationLoop.originReleaseTarget, "private-deployment"),
      nextMoveTitle: escapeText(postReleaseContinuationLoop.nextMoveTitle, mission.title),
      nextMoveDescription: escapeText(postReleaseContinuationLoop.nextMoveDescription, mission.description),
      nextMoveFamily: escapeText(postReleaseContinuationLoop.nextMoveFamily, "derived-loop-move"),
      visibleContinuationRule: escapeText(postReleaseContinuationLoop.visibleContinuationRule, "release is not a terminal end state; the next move must appear visibly inside Nexus"),
      continuationMoves: normalizeArray(postReleaseContinuationLoop.continuationMoves).map((item) => escapeText(item)).filter(Boolean).slice(0, 4),
      boundedGrowthRule: escapeText(postReleaseContinuationLoop.boundedGrowthRule, "continuation may surface only product-connected moves"),
      continuityRule: escapeText(postReleaseContinuationLoop.continuityRule, "post-release continuation must survive revisit and route restore"),
    },
    primaryAction: requiresClarification
      ? {
          label: "חזור להבנה והוסף חומר תומך",
          target: "onboarding",
          actionKind: "navigate",
        }
      : {
          label: "התחל משימה",
          target: "execution",
          actionKind: "execute",
        },
    secondaryAction: {
      label: "הצג פירוט",
      target: "timeline",
    },
    artifactAction: {
      label: artifactTruth.openAction.label,
      target: artifactTruth.openAction.target,
      supported: artifactTruth.openAction.supported,
    },
  };
}
