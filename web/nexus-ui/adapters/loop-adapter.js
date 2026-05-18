function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveContinuationGate(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.onboardingStateHandoff?.continuationGate
      ?? safeProject.context?.onboardingStateHandoff?.continuationGate
      ?? safeProject.onboardingCompletionDecision?.continuationGate
      ?? safeProject.context?.onboardingCompletionDecision?.continuationGate,
  );
}

function resolveArtifactExpectation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

function resolveGenerationIntent(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.generationIntent
      ?? safeProject.aiDesignRequest?.generationIntent
      ?? safeProject.context?.generationIntent
      ?? safeProject.context?.aiDesignRequest?.generationIntent,
  );
}

function resolveRepeatedLoopContinuation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.repeatedLoopContinuation
      ?? safeProject.state?.repeatedLoopContinuation
      ?? safeProject.context?.repeatedLoopContinuation,
  );
}

function looksLikeInternalIdentifier(value = "") {
  const text = String(value ?? "").trim();
  return text.includes(":") || text.includes(".preview") || text.startsWith("generated-");
}

function buildHumanProofLabel({ artifactExpectation = {}, repeatedLoopContinuation = {}, previewScreenId = "", fallback = "" } = {}) {
  if (repeatedLoopContinuation.expectedProofLine) {
    return repeatedLoopContinuation.expectedProofLine;
  }
  if (artifactExpectation.title) {
    return `מיד אחרי הצעד הזה תיפתח תצוגה מעודכנת של ${artifactExpectation.title}.`;
  }
  if (previewScreenId && !looksLikeInternalIdentifier(previewScreenId)) {
    return `מיד אחרי הצעד הזה תיפתח תצוגה מעודכנת של ${previewScreenId}.`;
  }
  return fallback || "לאחר הביצוע תיפתח תצוגה ברורה של מה שנבנה.";
}

function buildProductBuildingTitle(rawTitle = "", fallbackTitle = "") {
  const title = String(rawTitle ?? "").trim();
  if (!title) {
    return fallbackTitle || "בונים את החלק הבא";
  }
  if (title.startsWith("לקדם את ")) {
    return `בונים עכשיו את ${title.slice("לקדם את ".length)}`;
  }
  if (title === "כרגע אין משימה פעילה" && fallbackTitle) {
    return fallbackTitle;
  }
  return title;
}

function buildHumanCurrentPhaseLine(currentPhase = "") {
  const phase = String(currentPhase ?? "").trim();
  if (!phase || phase === "understanding-complete") {
    return "מכאן המוצר ממשיך להיבנות מתוך מה שנסגר בהבנה.";
  }
  if (phase === "clarification-needed") {
    return "מכאן המוצר ממתין להשלמה קצרה לפני שהוא ממשיך להיבנות.";
  }
  if (phase.includes("understanding")) {
    return "מכאן המוצר ממשיך להיבנות מתוך ההבנה שנסגרה.";
  }
  return "מכאן המוצר ממשיך להיבנות מאותו כיוון שכבר נסגר.";
}

function buildHumanPreviewSurfaceStatus({ statusLine = "", artifactTitle = "", fallback = "" } = {}) {
  const normalizedStatus = normalizeString(statusLine, "");
  const normalizedTitle = normalizeString(artifactTitle, "");
  if (!normalizedStatus) {
    return fallback || "התוצר הזה ממשיך לקבל צורה עכשיו";
  }
  if (normalizedTitle && normalizedStatus === normalizedTitle) {
    return fallback || "התוצר הזה ממשיך לקבל צורה עכשיו";
  }
  if (/^(להקים|לבנות|לקדם)\s/i.test(normalizedStatus)) {
    return fallback || "התוצר הזה ממשיך לקבל צורה עכשיו";
  }
  return normalizedStatus;
}

function sanitizeLoopPreviewArtifact(artifact = null, artifactTitle = "", fallbackStatus = "") {
  const normalizedArtifact = normalizeObject(artifact);
  if (!normalizedArtifact.artifactId) {
    return null;
  }
  const payload = normalizeObject(normalizedArtifact.previewPayload);
  const nextAction = normalizeObject(payload.nextAction);
  return {
    ...normalizedArtifact,
    previewPayload: {
      ...payload,
      statusLine: buildHumanPreviewSurfaceStatus({
        statusLine: payload.statusLine,
        artifactTitle,
        fallback: fallbackStatus,
      }),
      nextAction: {
        ...nextAction,
        recommendation: buildHumanPreviewSurfaceStatus({
          statusLine: nextAction.recommendation,
          artifactTitle,
          fallback: artifactTitle ? `מחדדים עכשיו את ${artifactTitle}` : fallbackStatus,
        }),
      },
    },
  };
}

function resolveLoopTaskSignal(project) {
  const approvals = normalizeArray(project.approvals);
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const blockedTask = roadmap.find((task) => task.status === "blocked");
  const assignedTask = roadmap.find((task) => task.status === "assigned");
  const title = approvals[0] ?? assignedTask?.summary ?? blockedTask?.summary ?? "כרגע אין משימה פעילה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : approvals[0]
      ? "יש כאן החלטה אחת שמחזיקה את ההתקדמות."
      : "זה הצעד הכי ישיר להמשיך ממנו עכשיו.";

  return {
    title,
    reason,
    blocker: project.overview?.bottleneck ?? blockedTask?.summary ?? "לא זוהה חסם מרכזי",
    queueCount: roadmap.length,
    activeCount: roadmap.filter((task) => task.status === "assigned").length,
    blockedCount: roadmap.filter((task) => task.status === "blocked").length,
    assignedTask,
    blockedTask,
  };
}

export function buildLoopCoreViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const hasContinuationPreview = safeProject.onboardingContinuationPreview === true;
  const artifactExpectation = resolveArtifactExpectation(safeProject);
  const generationIntent = resolveGenerationIntent(safeProject);
  const continuationGate = resolveContinuationGate(safeProject);
  const taskSignal = resolveLoopTaskSignal(safeProject);
  const repeatedLoopContinuation = resolveRepeatedLoopContinuation(safeProject);
  const repeatedLoopClarification = normalizeObject(repeatedLoopContinuation.clarification);
  const projectBrainWorkspace = normalizeObject(safeProject.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const developerWorkspace = normalizeObject(safeProject.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const releaseWorkspace = normalizeObject(safeProject.releaseWorkspace);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const aiControlCenterSurface = normalizeObject(safeProject.aiControlCenterSurface);
  const preview = normalizeObject(aiControlCenterSurface.generatedSurfacePreview);
  const proofArtifact = normalizeObject(safeProject.proofArtifact);
  const currentPhase = projectBrainWorkspace.overview?.currentPhase ?? "understanding-complete";
  const hasProject = Boolean(safeProject.id);
  const needsRepeatedLoopClarification = repeatedLoopContinuation.requiresClarification === true;
  const shouldExecute = hasProject && taskSignal.queueCount > 0 && !needsRepeatedLoopClarification;
  const hasWeakClassGenerationIntent = generationIntent.weakClass === true;
  const missionTitle = repeatedLoopContinuation.missionTitle
    ? repeatedLoopContinuation.missionTitle
    : taskSignal.title === "כרגע אין משימה פעילה" && artifactExpectation.title
    ? `בונים עכשיו את ${artifactExpectation.title}`
    : taskSignal.title;
  const humanMissionTitle = buildProductBuildingTitle(
    missionTitle,
    artifactExpectation.title ? `בונים עכשיו את ${artifactExpectation.title}` : "בונים עכשיו את החלק הבא",
  );
  const missionDescription = repeatedLoopContinuation.missionDescription
    ? repeatedLoopContinuation.missionDescription
    : taskSignal.title === "כרגע אין משימה פעילה" && artifactExpectation.loopReadyMessage
    ? artifactExpectation.loopReadyMessage
    : taskSignal.reason;
  const missionDescriptionWithGate = continuationGate.gateType
    ? `${missionDescription} ${continuationGate.title}.`
    : missionDescription;

  const primaryAction = shouldExecute
    ? {
        label: "בנה עכשיו ⚡",
        actionKind: "execute",
        target: "execution",
      }
    : needsRepeatedLoopClarification
      ? {
          label: "חזור להבנה והוסף חומר תומך",
          actionKind: "navigate",
          target: "onboarding",
        }
    : continuationGate.gateType && hasContinuationPreview
      ? {
          label: "הוסף חומר תומך",
          actionKind: "navigate",
          target: "onboarding",
        }
      : {
          label: "חזור להבנת הפרויקט",
          actionKind: "navigate",
          target: "onboarding",
        };

  const secondaryAction = {
    label: preview.screenId || releaseValidation.status ? "ראה את מה שנבנה 👁" : "פתח הקשר תומך",
    target: preview.screenId || releaseValidation.status ? "proof" : "timeline",
  };

  const stageItems = [
    {
      title: "הבנה הושלמה",
      body: buildHumanCurrentPhaseLine(currentPhase),
      status: "done",
    },
    {
      title: "מה נבנה עכשיו בפועל",
      body: humanMissionTitle,
      status: needsRepeatedLoopClarification ? "blocked" : repeatedLoopContinuation.active ? "active" : (taskSignal.queueCount > 0 ? "active" : "pending"),
    },
    ...(needsRepeatedLoopClarification
      ? [{
          title: "מה צריך כדי לפתוח סבב המשך אמיתי",
          body: repeatedLoopClarification.requestedMaterialLabel ?? repeatedLoopClarification.detail ?? "חסר עכשיו חומר תומך שמדייק את הסבב הבא.",
          status: "blocked",
        }]
      : []),
    ...(continuationGate.gateType
      ? [{
          title: "חומר תומך שאפשר להוסיף תוך כדי תנועה",
          body: continuationGate.requestedMaterialLabel ?? continuationGate.detail ?? continuationGate.title,
          status: "active",
        }]
      : []),
    ...(hasWeakClassGenerationIntent
      ? [{
          title: "איך Nexus יוצר את התוצר",
          body: generationIntent.generationGoal ?? generationIntent.framingLine ?? "הדור הבא אמור להישאר נאמן לכיוון התוצרי שנסגר ב-onboarding.",
          status: "active",
        }]
      : []),
    {
      title: "מה יתחיל להופיע מיד",
      body: artifactExpectation.title
        ? `החלק הקרוב שיתחדד על המסך: ${artifactExpectation.title}`
        : developerSummary.nextAction ?? "המערכת תייצר את התוצר הראשון של המשימה.",
      status: continuationGate.gateType ? "active" : (developerSummary.progressStatus ?? "pending"),
    },
    {
      title: "מה ייפתח מיד אחרי הצעד הזה",
      body: buildHumanProofLabel({
        artifactExpectation,
        repeatedLoopContinuation,
        previewScreenId: preview.screenId,
        fallback: "לאחר הביצוע תיפתח תצוגה ברורה של מה שנבנה.",
      }),
      status: releaseValidation.status ?? "pending",
    },
    ...(artifactExpectation.title
      ? [{
      title: "התוצר שאליו מכוונים",
          body: artifactExpectation.summary ?? artifactExpectation.title,
          status: "active",
        }]
      : []),
  ];

  return {
    title: "מה נבנה עכשיו",
    subtitle: "החלק הבא שנוסיף למוצר שלך",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "תצוגת QA זמנית" : "החלק שנבנה עכשיו",
    detail: qaMode
      ? "זה מצב QA זמני כדי לבדוק את המסך גם בלי פרויקט מלא."
      : needsRepeatedLoopClarification
        ? repeatedLoopClarification.detail ?? "המערכת עוצרת כאן truthfully כי בלי עוד הקשר הסבב הבא יהיה replay של אותו artifact."
      : continuationGate.gateType
        ? continuationGate.detail ?? "ההבנה כבר אושרה, והלופ ממשיך. אפשר עדיין להוסיף חומר תומך בלי לחזור ל־onboarding חלש."
      : hasWeakClassGenerationIntent
        ? `Nexus בחר את הצעד הבא וגם מגדיר מראש איך ${generationIntent.artifactTitle || "התוצר"} צריך להיראות כבר בתצוגה הבאה.`
        : "זה החלק הבא שהכי נכון לבנות עכשיו כדי שהמוצר ירגיש יותר אמיתי.",
    mission: {
      title: humanMissionTitle,
      description: missionDescriptionWithGate,
      status: needsRepeatedLoopClarification ? "blocked" : taskSignal.queueCount > 0 ? "active" : "pending",
      icon: "◉",
      metadata: [
        {
          label: "מה חסר כדי שזה ירגיש מוכן",
          value: taskSignal.blocker === "אין כרגע חסם מרכזי" ? "אין כרגע משהו שחוסם את ההתקדמות" : taskSignal.blocker,
        },
        {
          label: "מה עוד נוסיף אחר כך",
          value: taskSignal.queueCount > 0 ? `${taskSignal.queueCount} חיזוקים שמחכים בהמשך` : "אין כרגע תור המשך פתוח",
        },
      ],
    },
    whyItMatters: needsRepeatedLoopClarification
      ? repeatedLoopClarification.detail ?? "בלי חומר תומך נוסף, הסבב הבא עלול למחזר את אותו artifact במקום להראות התקדמות אמיתית."
      : continuationGate.gateType
      ? continuationGate.detail
      : generationIntent.generationGoal
      || artifactExpectation.loopReadyMessage
      || (taskSignal.blockedTask
      ? `המשימה הזו משחררת את החסם המרכזי: ${taskSignal.blocker}.`
      : `זו הפעולה הישירה ביותר להתקדם ממנה עכשיו. יש כרגע ${brainSummary.blockerCount ?? 0} חסמים פתוחים בפרויקט.`),
    whatHappensNext: shouldExecute
      ? (continuationGate.gateType
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל כדי לקדם את ${artifactExpectation.title || "התוצר"}, והחומר התומך יכול להצטרף בהמשך בלי לעצור את ההתקדמות.`
          : generationIntent.framingLine
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל עם כיוון תוצרי מפורש: ${generationIntent.framingLine}`
          : artifactExpectation.title
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל כדי לקדם את ${artifactExpectation.title}, ואז נעבור למסך הבנייה החי.`
          : "בלחיצה על ביצוע נריץ את המשימה בפועל ונעבור למסך הבנייה החי.")
      : needsRepeatedLoopClarification
        ? `בלחיצה נחזור למסך הבהרה שקשור ל־${artifactExpectation.title || "התוצר שאושר"} כדי לצרף ${repeatedLoopClarification.requestedMaterialLabel ?? "חומר תומך"}, ורק אז לפתוח increment אמיתי.`
      : continuationGate.gateType && hasContinuationPreview
        ? `בלחיצה נחזור ל־Onboarding רק כדי לצרף ${continuationGate.requestedMaterialLabel ?? "חומר תומך"}, בלי לפתוח מחדש handoff חלש או לאבד את כיוון הלופ.`
        : "בלחיצה נחזור ל־Onboarding כדי לדייק את ההקשר לפני שנמשיך.",
    previewArtifact: sanitizeLoopPreviewArtifact(
      proofArtifact,
      normalizeString(proofArtifact.previewPayload?.title, artifactExpectation.title),
      humanMissionTitle,
    ),
    previewSurfaceTitle: normalizeString(
      proofArtifact.previewPayload?.title,
      artifactExpectation.title || "זה התוצר שממשיך לקבל צורה",
    ),
    previewSurfaceSubtitle: normalizeString(
      proofArtifact.previewPayload?.subtitle,
      artifactExpectation.summary || "כאן רואים את אותו תוצר שכבר קיבל כיוון, ועכשיו ממשיך להתחדד.",
    ),
    previewSurfaceStatus: normalizeString(
      buildHumanPreviewSurfaceStatus({
        statusLine: proofArtifact.previewPayload?.statusLine,
        artifactTitle: proofArtifact.previewPayload?.title,
        fallback: humanMissionTitle,
      }),
      humanMissionTitle,
    ),
    contextItems: stageItems,
    primaryAction,
    secondaryAction,
  };
}
