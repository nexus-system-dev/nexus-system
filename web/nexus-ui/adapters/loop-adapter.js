import { createSplitWorkspaceAndLiveBuildSurfaceModel } from "../../shared/split-workspace-live-build-surface-model.js";
import { resolveDesignPluginForVisualSkeletonRequest } from "../../shared/design-plugin-registry-contract.js";
import { resolveCanonicalProductClass } from "../../shared/product-class-model.js";
import {
  buildRuntimeSkeletonTruthEnvelope,
  resolveRuntimeSkeletonTruth,
} from "../../shared/runtime-skeleton-truth.js";
import { buildSkeletonChoiceTruthEnvelope } from "../../shared/skeleton-choice-candidates.js";
import { createBuildPreviewSandboxBoundary } from "../../shared/build-preview-sandbox-boundary.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function humanTeamRole(role = "") {
  const normalizedRole = normalizeString(role, "viewer").toLowerCase();
  if (normalizedRole === "owner") return "בעלים";
  if (normalizedRole === "admin") return "מנהל";
  if (normalizedRole === "editor" || normalizedRole === "member") return "עורך";
  if (normalizedRole === "guest") return "אורח";
  return "צופה";
}

function buildTeamMembershipViewModel(project = null) {
  const safeProject = normalizeObject(project);
  const workspaceModel = normalizeObject(safeProject.state?.workspaceModel ?? safeProject.context?.workspaceModel);
  const teamMembershipBoundary = normalizeObject(
    safeProject.state?.teamMembershipBoundary
      ?? safeProject.context?.teamMembershipBoundary,
  );
  const members = normalizeArray(workspaceModel.members ?? teamMembershipBoundary.members)
    .filter((member) => normalizeString(member.status, "active") !== "removed")
    .map((member) => ({
      name: normalizeString(member.displayName, normalizeString(member.email, normalizeString(member.userId, "חבר צוות"))),
      role: humanTeamRole(member.role),
      status: normalizeString(member.status, "active") === "disabled" ? "מושהה" : "פעיל",
      isOwner: member.isOwner === true || member.userId === workspaceModel.ownerUserId,
    }));
  const invitations = normalizeArray(workspaceModel.invitations ?? teamMembershipBoundary.invitations)
    .filter((invitation) => normalizeString(invitation.status, "") === "pending")
    .map((invitation) => ({
      email: normalizeString(invitation.email, "הזמנה ממתינה"),
      role: humanTeamRole(invitation.role),
      status: "ממתין לאישור",
    }));

  if (!workspaceModel.workspaceId && members.length === 0 && invitations.length === 0) {
    return null;
  }

  return {
    title: "צוות הפרויקט",
    subtitle: "מי מחובר לפרויקט ומה מותר לו לעשות בשלב הראשון.",
    ownerLabel: members.find((member) => member.isOwner)?.name ?? normalizeString(workspaceModel.ownerUserId, "בעלים"),
    memberCount: Number(workspaceModel.memberCount ?? members.length),
    members,
    invitations,
    boundary: "הזמנות נשמרות בפרויקט. שליחת אימייל, ארגון מתקדם וחיוב שייכים לשלבי המשך.",
  };
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

export function buildLoopCoreViewModel({ project = null, qaMode = false, companionConversation = null } = {}) {
  const safeProject = normalizeObject(project);
  const safeCompanionConversation = normalizeObject(
    companionConversation
      ?? safeProject.companionConversation
      ?? safeProject.context?.companionConversation,
  );
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
  const buildMutationTruth = normalizeObject(
    safeProject.buildMutationTruth
    ?? safeProject.context?.buildMutationTruth
    ?? safeProject.state?.buildMutationTruth,
  );
  const buildMutationHistory = normalizeArray(
    safeProject.buildMutationHistory
    ?? safeProject.context?.buildMutationHistory
    ?? safeProject.state?.buildMutationHistory,
  );
  const buildMutationIntents = normalizeArray(
    safeProject.buildMutationIntents
    ?? safeProject.context?.buildMutationIntents
    ?? safeProject.state?.buildMutationIntents,
  );
  const lastBuildMutationHistory = buildMutationHistory.at(-1) ?? null;
  const mutationChangeDecision = normalizeObject(
    safeProject.mutationChangeDecision
    ?? safeProject.context?.mutationChangeDecision
    ?? safeProject.state?.mutationChangeDecision,
  );
  const mutationChangeHistory = normalizeArray(
    safeProject.mutationChangeHistory
    ?? safeProject.context?.mutationChangeHistory
    ?? safeProject.state?.mutationChangeHistory,
  );
  const canonicalMutationFlow = normalizeObject(
    safeProject.canonicalMutationFlow
    ?? safeProject.context?.canonicalMutationFlow
    ?? safeProject.state?.canonicalMutationFlow,
  );
  const buildApprovalFlow = normalizeObject(
    safeProject.buildApprovalFlow
    ?? safeProject.context?.buildApprovalFlow
    ?? safeProject.state?.buildApprovalFlow,
  );
  const buildAgentTurnState = normalizeObject(
    safeCompanionConversation.buildAgentTurn
    ?? safeProject.buildAgentTurnState
    ?? safeProject.context?.buildAgentTurnState
    ?? safeProject.state?.buildAgentTurnState,
  );
  const buildSpeechTruthState = normalizeObject(
    safeCompanionConversation.buildSpeechTruth
    ?? safeProject.buildSpeechTruth
    ?? safeProject.context?.buildSpeechTruth
    ?? safeProject.state?.buildSpeechTruth,
  );
  const providerGatewayBoundary = normalizeObject(
    safeProject.providerGatewayBoundary
    ?? safeProject.context?.providerGatewayBoundary
    ?? safeProject.state?.providerGatewayBoundary,
  );
  const dataOwnershipBoundary = normalizeObject(
    safeProject.dataOwnershipBoundary
    ?? safeProject.context?.dataOwnershipBoundary
    ?? safeProject.state?.dataOwnershipBoundary,
  );
  const visualBuildTruth = normalizeObject(
    safeProject.visualBuildTruth
    ?? safeProject.context?.visualBuildTruth
    ?? safeProject.state?.visualBuildTruth,
  );
  const skeletonChoiceTruth = normalizeObject(
    safeProject.skeletonChoiceTruth
      ?? safeProject.context?.skeletonChoiceTruth
      ?? safeProject.state?.skeletonChoiceTruth,
  );
  const preview = normalizeObject(aiControlCenterSurface.generatedSurfacePreview);
  const proofArtifact = normalizeObject(safeProject.proofArtifact);
  const productSkeletonAgentOutput = normalizeObject(
    safeProject.productSkeletonAgentOutput
    ?? safeProject.onboardingStateHandoff?.productSkeletonAgentOutput
    ?? safeProject.context?.productSkeletonAgentOutput,
  );
  const visualProductSkeletonAgentOutput = normalizeObject(
    safeProject.visualProductSkeletonAgentOutput
    ?? safeProject.onboardingStateHandoff?.visualProductSkeletonAgentOutput
    ?? safeProject.context?.visualProductSkeletonAgentOutput,
  );
  const hasProductSkeletonAgentOutput = productSkeletonAgentOutput.agentId === "product-skeleton-agent"
    && productSkeletonAgentOutput.responseSource === "provider-composed";
  const hasVisualProductSkeletonAgentOutput = visualProductSkeletonAgentOutput.agentId === "visual-product-skeleton-agent"
    && visualProductSkeletonAgentOutput.responseSource === "provider-composed";
  const selectedDesignPlugin = hasProductSkeletonAgentOutput
    ? resolveDesignPluginForVisualSkeletonRequest({
        productSkeletonAgentOutput,
        designSourceInput: safeProject.designSourceInput ?? safeProject.context?.designSourceInput ?? null,
        userDesignPreference: safeProject.userDesignPreference ?? safeProject.context?.userDesignPreference ?? "",
      })
    : null;
  const currentPhase = projectBrainWorkspace.overview?.currentPhase ?? "understanding-complete";
  const hasProject = Boolean(safeProject.id);
  const needsRepeatedLoopClarification = repeatedLoopContinuation.requiresClarification === true;
  const shouldExecute = hasProject && taskSignal.queueCount > 0 && !needsRepeatedLoopClarification;
  const primaryProductClassResolution = resolveCanonicalProductClass({
    explicitClass: artifactExpectation.projectType
      ?? artifactExpectation.productClass
      ?? generationIntent.productClass
      ?? safeProject.projectType
      ?? safeProject.classification?.projectType
      ?? "",
    hintedClass: safeProject.classification?.projectType ?? "",
    texts: [
      safeProject.name,
      safeProject.goal,
      artifactExpectation.title,
      artifactExpectation.summary,
      artifactExpectation.deliverableLabel,
      productSkeletonAgentOutput.productType,
      productSkeletonAgentOutput.primaryUser,
      productSkeletonAgentOutput.primaryProblem,
      productSkeletonAgentOutput.firstWorkflow?.title,
      ...normalizeArray(productSkeletonAgentOutput.initialActions),
      ...normalizeArray(productSkeletonAgentOutput.versionOneBoundary?.buildNow),
    ],
    fallback: "unknown",
  });
  const productClassResolution = primaryProductClassResolution.productClass !== "unknown"
    ? primaryProductClassResolution
    : resolveCanonicalProductClass({
        explicitClass: generationIntent.productClass ?? "",
        hintedClass: safeProject.classification?.projectType ?? "",
        texts: [
          generationIntent.generationGoal,
          generationIntent.framingLine,
          safeProject.name,
          safeProject.goal,
        ],
        fallback: "generic",
      });
  const productClass = productClassResolution.productClass;
  const generationIntentClassResolution = resolveCanonicalProductClass({
    explicitClass: generationIntent.productClass ?? "",
    texts: [
      generationIntent.generationGoal,
      generationIntent.framingLine,
      generationIntent.artifactTitle,
    ],
    fallback: "unknown",
  });
  const generationIntentMatchesProduct = generationIntentClassResolution.productClass === "unknown"
    || generationIntentClassResolution.productClass === productClass;
  const effectiveGenerationIntent = generationIntentMatchesProduct ? generationIntent : {};
  const hasWeakClassGenerationIntent = effectiveGenerationIntent.weakClass === true;
  const surfaceWorkspace = createSplitWorkspaceAndLiveBuildSurfaceModel({
    productClass,
    runtimeDirection: safeProject.runtimeDirection,
    skeletonContract: hasProductSkeletonAgentOutput
      ? {
          visibleMilestones: [
            productSkeletonAgentOutput.firstWorkflow?.title,
            ...normalizeArray(productSkeletonAgentOutput.initialScreens).map((screen) => screen?.name),
            ...normalizeArray(productSkeletonAgentOutput.initialActions).slice(0, 3),
          ].filter(Boolean),
        }
      : safeProject.skeletonContract ?? safeProject.onboardingStateHandoff?.skeletonContract,
    skeletonQualityBaseline: safeProject.skeletonQualityBaseline,
    projectStage: currentPhase === "understanding-complete" ? "first-skeleton" : "build",
  });
  const runtimeSkeleton = buildRuntimeSkeletonViewModel({
    project: safeProject,
    productClass,
    productClassSource: productClassResolution.source,
    surfaceWorkspace,
    productSkeleton: productSkeletonAgentOutput,
    visualSkeleton: visualProductSkeletonAgentOutput,
    artifactExpectation,
    generationIntent: effectiveGenerationIntent,
    projectName: safeProject.name,
  });
  const buildPreviewSandbox = createBuildPreviewSandboxBoundary({
    project: safeProject,
    runtimeSkeleton,
    previewArtifact: proofArtifact,
    buildMutationTruth,
    buildAgentTurn: buildAgentTurnState,
  });
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
          label: "הוסף חומר תומך",
          actionKind: "navigate",
          target: "create",
        }
    : continuationGate.gateType && hasContinuationPreview
      ? {
          label: "הוסף חומר תומך",
          actionKind: "navigate",
          target: "create",
        }
      : {
          label: "דייק את הכיוון",
          actionKind: "navigate",
          target: "create",
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
          body: effectiveGenerationIntent.generationGoal ?? effectiveGenerationIntent.framingLine ?? "החלק הבא אמור להישאר נאמן לכיוון התוצרי שכבר נסגר.",
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
        ? continuationGate.detail ?? "הכיוון כבר מספיק ברור כדי להמשיך. אפשר עדיין להוסיף חומר תומך בלי לאבד את רצף העבודה."
      : continuationGate.detail
        ? continuationGate.detail
      : hasWeakClassGenerationIntent
        ? `Nexus בחר את הצעד הבא וגם מגדיר מראש איך ${effectiveGenerationIntent.artifactTitle || "התוצר"} צריך להיראות כבר בתצוגה הבאה.`
        : "זה החלק הבא שהכי נכון לבנות עכשיו כדי שהמוצר ירגיש יותר אמיתי.",
    mission: {
      title: humanMissionTitle,
      description: missionDescriptionWithGate,
      status: needsRepeatedLoopClarification ? "blocked" : taskSignal.queueCount > 0 ? "active" : "pending",
      icon: "◉",
      metadata: [
        {
          label: needsRepeatedLoopClarification ? "מה צריך להשלים לפני המשך" : "מה כבר סגור לשלד הראשון",
          value: taskSignal.blocker === "אין כרגע חסם מרכזי" ? "אין כרגע משהו שחוסם את ההתקדמות" : taskSignal.blocker,
        },
        {
          label: "מה עוד נחדד אחר כך",
          value: taskSignal.queueCount > 0 ? `${taskSignal.queueCount} חיזוקים שמחכים בהמשך` : "אין כרגע תור המשך פתוח",
        },
      ],
    },
    whyItMatters: needsRepeatedLoopClarification
      ? repeatedLoopClarification.detail ?? "בלי חומר תומך נוסף, הסבב הבא עלול למחזר את אותו artifact במקום להראות התקדמות אמיתית."
      : continuationGate.gateType
      ? continuationGate.detail
      : effectiveGenerationIntent.generationGoal
      || artifactExpectation.loopReadyMessage
      || (taskSignal.blockedTask
      ? `המשימה הזו משחררת את החסם המרכזי: ${taskSignal.blocker}.`
      : `זו הפעולה הישירה ביותר להתקדם ממנה עכשיו. יש כרגע ${brainSummary.blockerCount ?? 0} חסמים פתוחים בפרויקט.`),
    whatHappensNext: shouldExecute
      ? (continuationGate.gateType
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל כדי לקדם את ${artifactExpectation.title || "התוצר"}, והחומר התומך יכול להצטרף בהמשך בלי לעצור את ההתקדמות.`
          : effectiveGenerationIntent.framingLine
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל עם כיוון תוצרי מפורש: ${effectiveGenerationIntent.framingLine}`
          : artifactExpectation.title
          ? `בלחיצה על ביצוע נריץ את המשימה בפועל כדי לקדם את ${artifactExpectation.title}, ואז נעבור למסך הבנייה החי.`
          : "בלחיצה על ביצוע נריץ את המשימה בפועל ונעבור למסך הבנייה החי.")
      : needsRepeatedLoopClarification
        ? `בלחיצה נחזור למסך הבהרה שקשור ל־${artifactExpectation.title || "התוצר שאושר"} כדי לצרף ${repeatedLoopClarification.requestedMaterialLabel ?? "חומר תומך"}, ורק אז לפתוח increment אמיתי.`
      : continuationGate.gateType && hasContinuationPreview
        ? `בלחיצה נצרף ${continuationGate.requestedMaterialLabel ?? "חומר תומך"} ונמשיך מאותו כיוון בלי לפתוח תהליך חדש.`
        : "בלחיצה נדייק את ההקשר לפני שממשיכים לבנות.",
    previewArtifact: sanitizeLoopPreviewArtifact(
      proofArtifact,
      normalizeString(proofArtifact.previewPayload?.title, artifactExpectation.title),
      humanMissionTitle,
    ),
    previewSurfaceTitle: normalizeString(
      proofArtifact.previewPayload?.title,
      artifactExpectation.title || "זה התוצר שממשיך לקבל צורה",
    ),
    previewSurfaceEyebrow: normalizeString(
      proofArtifact.previewPayload?.eyebrow,
      "זה התוצר שממשיך להיבנות עכשיו",
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
    buildSurfaceContract: {
      contractId: "SURF-003",
      surfaceId: "build",
      purpose: "live-creation-workspace",
      legacyRouteCompatibility: "loop-route-renders-build-surface",
      requiredRegions: [
        "agent-conversation-rail",
        "live-artifact-build-canvas",
        "human-progress-state",
        "change-direction-affordance",
        "release-readiness-affordance",
        "continuity-restore-anchor",
      ],
      forbiddenShapes: [
        "loop-as-visible-product-label",
        "orchestration-first-stepper",
        "detached-details-panel",
        "timeline-dominant-build",
        "proof-dashboard-primary",
        "chat-without-live-canvas",
        "canvas-without-writable-agent-rail",
      ],
    },
    buildMutationTruth: Object.keys(buildMutationTruth).length
      ? {
          taskId: normalizeString(buildMutationTruth.taskId, "BUILD-MUTATION-TRUTH-001"),
          sliceTaskId: normalizeString(buildMutationTruth.sliceTaskId, "SLICE-006"),
          status: normalizeString(buildMutationTruth.status, ""),
          lastMutationId: normalizeString(buildMutationTruth.lastMutationId, ""),
          lastOperationId: normalizeString(buildMutationTruth.lastOperationId, ""),
          lastError: normalizeString(buildMutationTruth.lastError, ""),
          visibleSummary: normalizeString(lastBuildMutationHistory?.visibleSummary, ""),
          historyCount: buildMutationHistory.length,
          intentCount: buildMutationIntents.length,
        }
      : null,
    mutationChangeDecision: normalizeString(mutationChangeDecision.taskId, "") === "MUT-001"
      ? {
          taskId: "MUT-001",
          agentId: normalizeString(mutationChangeDecision.agentId, "mutation-change-agent"),
          status: normalizeString(mutationChangeDecision.status, ""),
          changeType: normalizeString(mutationChangeDecision.changeType, ""),
          requiresApproval: mutationChangeDecision.requiresApproval === true,
          requiresCheckpoint: mutationChangeDecision.requiresCheckpoint === true,
          requiresVerification: mutationChangeDecision.requiresVerification === true,
          requiresProductTruthMutation: mutationChangeDecision.requiresProductTruthMutation === true,
          mayApplyAutomatically: mutationChangeDecision.mayApplyAutomatically === true,
          approvalReason: normalizeString(mutationChangeDecision.approvalReason, ""),
          userReply: normalizeString(mutationChangeDecision.userReply, ""),
          historyCount: mutationChangeHistory.length,
          affectedScreens: normalizeArray(mutationChangeDecision.affectedAreas?.screens),
          affectedActions: normalizeArray(mutationChangeDecision.affectedAreas?.actions),
          affectedDataObjects: normalizeArray(mutationChangeDecision.affectedAreas?.dataObjects),
        }
      : null,
    canonicalMutationFlow: normalizeString(canonicalMutationFlow.taskId, "") === "EXP-002"
      ? {
          taskId: "EXP-002",
          ownerTaskId: normalizeString(canonicalMutationFlow.ownerTaskId, "MUT-001"),
          status: normalizeString(canonicalMutationFlow.status, ""),
          changeType: normalizeString(canonicalMutationFlow.changeType, ""),
          requiresApproval: canonicalMutationFlow.requiresApproval === true,
          requiresProductTruthMutation: canonicalMutationFlow.requiresProductTruthMutation === true,
          mayApplyAutomatically: canonicalMutationFlow.mayApplyAutomatically === true,
          userFacingSummary: normalizeString(canonicalMutationFlow.userFacingSummary, ""),
          historyCount: Number(canonicalMutationFlow.historyCount ?? 0),
          buildMutationHistoryCount: Number(canonicalMutationFlow.buildMutationHistoryCount ?? 0),
          boundary: normalizeString(canonicalMutationFlow.boundary, ""),
          steps: normalizeArray(canonicalMutationFlow.steps).map((step) => ({
            stepId: normalizeString(step.stepId, ""),
            label: normalizeString(step.label, ""),
            status: normalizeString(step.status, ""),
            description: normalizeString(step.description, ""),
          })),
        }
      : null,
    buildApprovalFlow: normalizeString(buildApprovalFlow.taskId, "") === "BUILD-APPROVAL-001"
      ? {
          taskId: "BUILD-APPROVAL-001",
          bridgeTaskId: normalizeString(buildApprovalFlow.bridgeTaskId, "BLD-AGT-001"),
          ownerTaskId: normalizeString(buildApprovalFlow.ownerTaskId, "MUT-001"),
          status: normalizeString(buildApprovalFlow.status, ""),
          decisionStatus: normalizeString(buildApprovalFlow.decisionStatus, ""),
          approvalRequestId: normalizeString(buildApprovalFlow.approvalRequestId, ""),
          mutationDecisionId: normalizeString(buildApprovalFlow.mutationDecisionId, ""),
          backedByMutationTruth: buildApprovalFlow.backedByMutationTruth === true,
          currentTruthUnchanged: buildApprovalFlow.currentTruthUnchanged === true,
          userFacingSummary: normalizeString(buildApprovalFlow.userFacingSummary, ""),
          targetDirection: {
            label: normalizeString(buildApprovalFlow.targetDirection?.label, ""),
            replaces: normalizeString(buildApprovalFlow.targetDirection?.replaces, ""),
            primaryObjectPlural: normalizeString(buildApprovalFlow.targetDirection?.primaryObjectPlural, ""),
          },
          impactSummary: {
            title: normalizeString(buildApprovalFlow.impactSummary?.title, ""),
            before: normalizeString(buildApprovalFlow.impactSummary?.before, ""),
            after: normalizeString(buildApprovalFlow.impactSummary?.after, ""),
            rejectionImpact: normalizeString(buildApprovalFlow.impactSummary?.rejectionImpact, ""),
            willChange: normalizeArray(buildApprovalFlow.impactSummary?.willChange),
            willKeep: normalizeArray(buildApprovalFlow.impactSummary?.willKeep),
          },
          allowedDecisions: normalizeArray(buildApprovalFlow.allowedDecisions),
        }
      : null,
    productSkeletonAgent: hasProductSkeletonAgentOutput
      ? {
          taskId: "SKEL-001",
          agentId: "product-skeleton-agent",
          responseSource: "provider-composed",
          productType: normalizeString(productSkeletonAgentOutput.productType, productClass),
          primaryUser: normalizeString(productSkeletonAgentOutput.primaryUser, ""),
          primaryProblem: normalizeString(productSkeletonAgentOutput.primaryProblem, ""),
          firstWorkflow: {
            title: normalizeString(productSkeletonAgentOutput.firstWorkflow?.title, ""),
            whyThisFirst: normalizeString(productSkeletonAgentOutput.firstWorkflow?.whyThisFirst, ""),
            steps: normalizeArray(productSkeletonAgentOutput.firstWorkflow?.steps),
          },
          initialScreens: normalizeArray(productSkeletonAgentOutput.initialScreens),
          initialActions: normalizeArray(productSkeletonAgentOutput.initialActions),
          dataObjects: normalizeArray(productSkeletonAgentOutput.dataObjects),
          buildNow: normalizeArray(productSkeletonAgentOutput.versionOneBoundary?.buildNow),
          doNotBuildNow: normalizeArray(productSkeletonAgentOutput.versionOneBoundary?.doNotBuildNow),
          assumptions: normalizeArray(productSkeletonAgentOutput.assumptions),
          unknowns: normalizeArray(productSkeletonAgentOutput.unknowns),
        }
      : null,
    visualProductSkeletonAgent: hasVisualProductSkeletonAgentOutput
      ? buildVisualProductSkeletonAgentViewModel(visualProductSkeletonAgentOutput)
      : null,
    visualBuildTruth: Object.keys(visualBuildTruth).length
      ? {
          taskId: normalizeString(visualBuildTruth.taskId, "VBUILD-001"),
          bridgeTaskId: normalizeString(visualBuildTruth.bridgeTaskId, "BLD-AGT-001"),
          status: normalizeString(visualBuildTruth.status, ""),
          visualBuildId: normalizeString(visualBuildTruth.visualBuildId, ""),
          lastOperationId: normalizeString(visualBuildTruth.lastOperationId, ""),
          selectedDesignPluginId: normalizeString(visualBuildTruth.selectedDesignPluginId, ""),
          selectedDesignPluginName: normalizeString(visualBuildTruth.selectedDesignPluginName, ""),
          boundary: normalizeString(visualBuildTruth.boundary, ""),
          screens: normalizeArray(visualBuildTruth.screens),
          lastVisualDiff: normalizeObject(visualBuildTruth.lastVisualDiff),
          historyCount: normalizeArray(visualBuildTruth.history).length,
        }
      : null,
    runtimeSkeleton,
    buildPreviewSandbox,
    dataOwnershipBoundary,
    skeletonChoice: buildSkeletonChoiceViewModel({
      project: safeProject,
      runtimeSkeleton,
      skeletonChoiceTruth,
    }),
    teamMembership: buildTeamMembershipViewModel(safeProject),
    designPluginLiveProof: selectedDesignPlugin
      ? buildDesignPluginLiveProofViewModel(selectedDesignPlugin, productSkeletonAgentOutput)
      : null,
    surfaceWorkspace,
    contextItems: stageItems,
    agentConversation: {
      projectName: normalizeString(safeCompanionConversation.projectName, safeProject.name ?? "Nexus"),
      understoodItems: normalizeArray(safeCompanionConversation.understoodItems),
      missingItems: normalizeArray(safeCompanionConversation.missingItems),
      pending: safeCompanionConversation.pending === true,
      draftMessage: normalizeString(safeCompanionConversation.draftMessage, ""),
      transcript: normalizeArray(safeCompanionConversation.transcript)
        .filter((entry) => normalizeObject(entry).speaker === "user" || normalizeObject(entry).speaker === "ai")
        .map((entry) => ({
          speaker: normalizeObject(entry).speaker === "user" ? "user" : "ai",
          text: normalizeString(normalizeObject(entry).text, ""),
        }))
        .filter((entry) => entry.text),
      buildAgentTurn: normalizeString(buildAgentTurnState.taskId, "") === "BLD-AGT-001"
        ? {
            taskId: "BLD-AGT-001",
            intent: normalizeString(buildAgentTurnState.intent, "question"),
            owner: normalizeString(buildAgentTurnState.owner, "build-loop-agent"),
            ownerLabel: normalizeString(buildAgentTurnState.ownerLabel, "שיחת בנייה"),
            status: normalizeString(buildAgentTurnState.status, "answer-only"),
            requiresApproval: buildAgentTurnState.requiresApproval === true,
            mayClaimChanged: buildAgentTurnState.mayClaimChanged === true,
            speechBoundary: normalizeString(buildAgentTurnState.speechBoundary, "reply-must-not-claim-product-change"),
            reason: normalizeString(buildAgentTurnState.reason, "הבקשה עדיין לא נותבה לשינוי מוצר."),
            selectedSkeletonCandidateId: normalizeString(buildAgentTurnState.selectedSkeletonCandidateId, ""),
            selectedCompositionStyle: normalizeString(buildAgentTurnState.selectedCompositionStyle, ""),
            selectedProductDirection: normalizeString(buildAgentTurnState.selectedProductDirection, ""),
          }
        : null,
      speechTruth: normalizeString(buildSpeechTruthState.taskId, "") === "BUILD-SPEECH-TRUTH-001"
        ? {
            taskId: "BUILD-SPEECH-TRUTH-001",
            speechState: normalizeString(buildSpeechTruthState.speechState, "answer-only"),
            requestClass: normalizeString(buildSpeechTruthState.requestClass, "other"),
            replyWasRewritten: buildSpeechTruthState.replyWasRewritten === true,
            mayClaimChanged: buildSpeechTruthState.mayClaimChanged === true,
            appliedMutationId: normalizeString(buildSpeechTruthState.appliedMutationId, ""),
            appliedOperationId: normalizeString(buildSpeechTruthState.appliedOperationId, ""),
          }
        : null,
      providerGateway: normalizeString(providerGatewayBoundary.taskId, "") === "PROV-001"
        ? {
            taskId: "PROV-001",
            status: normalizeString(providerGatewayBoundary.status, "blocked"),
            requestClass: normalizeString(providerGatewayBoundary.request?.requestClass, "provider-capability"),
            capability: normalizeString(providerGatewayBoundary.capability?.capability, "external-capability"),
            canExecuteExternally: providerGatewayBoundary.capability?.canExecuteExternally === true,
            connected: providerGatewayBoundary.provider?.connected === true,
            releaseDecision: normalizeString(providerGatewayBoundary.provider?.releaseDecision, "unknown"),
            userFacingLabel: normalizeString(providerGatewayBoundary.provider?.userFacingLabel, "יכולת חיצונית"),
            blockerCount: normalizeArray(providerGatewayBoundary.blockers).length,
            boundaryCopy: normalizeString(providerGatewayBoundary.userFacingBoundary, "זו יכולת חיצונית ולא פעולה שבוצעה."),
          }
        : null,
    },
    primaryAction,
    secondaryAction,
  };
}

function buildSkeletonChoiceViewModel({ project = null, runtimeSkeleton = null, skeletonChoiceTruth = null } = {}) {
  const runtime = normalizeObject(runtimeSkeleton);
  if (!runtime.runtimeSkeletonId) {
    return null;
  }
  const choice = Object.keys(normalizeObject(skeletonChoiceTruth)).length
    ? normalizeObject(skeletonChoiceTruth)
    : buildSkeletonChoiceTruthEnvelope({
        project,
        runtimeSkeletonTruth: runtime,
        productDomainSkeleton: runtime.productDomainSkeleton,
      });
  if (choice.taskId !== "SKELETON-CHOICE-001") {
    return null;
  }
  return {
    taskId: "SKELETON-CHOICE-001",
    status: normalizeString(choice.status, ""),
    selectionStatus: normalizeString(choice.selectionStatus, ""),
    selectedSkeletonCandidateId: normalizeString(choice.selectedSkeletonCandidateId, ""),
    selectedCompositionStyle: normalizeString(choice.selectedCompositionStyle, ""),
    selectedProductDirection: normalizeString(choice.selectedProductDirection, ""),
    recommendedCandidateId: normalizeString(choice.recommendedCandidateId, ""),
    providerFailureCount: normalizeArray(choice.providerFailures).length,
    candidates: normalizeArray(choice.candidates).map((candidate) => ({
      candidateId: normalizeString(candidate.candidateId, ""),
      label: normalizeString(candidate.userFacingLabel ?? candidate.label, ""),
      compositionStyle: normalizeString(candidate.compositionStyle, ""),
      productDirection: normalizeString(candidate.productDirection, ""),
      visualSummary: normalizeString(candidate.visualDirection?.summary, ""),
      productPattern: normalizeString(candidate.productKindFit?.productPattern, ""),
      domainKind: normalizeString(candidate.productDomainFit?.domainKind, ""),
      operationCount: candidate.productDomainFit?.operationCount ?? 0,
      actionIds: normalizeArray(candidate.actionsStateFit?.actionIds),
      isRecommended: candidate.isRecommended === true,
      isSelected: normalizeString(candidate.candidateId, "") === normalizeString(choice.selectedSkeletonCandidateId, ""),
    })),
    boundaryText: normalizeString(choice.providerContract?.truthOwner, "") === "nexus"
      ? "Nexus שומר את אמת המוצר; הכיוון הנבחר קובע איך ממשיכים לבנות."
      : "הכיוון הנבחר נשמר כחלק מהמשך הבנייה.",
  };
}

function buildRuntimeSkeletonViewModel({
  project = null,
  productClass = "generic",
  productClassSource = "fallback",
  surfaceWorkspace = {},
  productSkeleton = {},
  visualSkeleton = {},
  artifactExpectation = {},
  generationIntent = {},
  projectName = "",
} = {}) {
  const existingRuntimeTruth = resolveRuntimeSkeletonTruth(project);
  if (existingRuntimeTruth) {
    return existingRuntimeTruth;
  }

  return buildRuntimeSkeletonTruthEnvelope({
    project,
    productClass,
    productClassSource,
    surfaceWorkspace,
    productSkeleton,
    visualSkeleton,
    artifactExpectation,
    generationIntent,
    projectName,
  });

  const firstWorkflow = normalizeObject(productSkeleton.firstWorkflow);
  const firstScreen = normalizeObject(visualSkeleton.firstScreen);
  const dataObject = normalizeObject(normalizeArray(productSkeleton.dataObjects)[0]);
  const fields = normalizeArray(dataObject.fields).map((field) => normalizeString(field, "")).filter(Boolean);
  const actions = normalizeArray(productSkeleton.initialActions).map((action) => normalizeString(action, "")).filter(Boolean);
  const regions = normalizeArray(visualSkeleton.regions);
  const primaryRegion = regions.find((region) => region?.priority === "primary") ?? regions[0] ?? {};
  const primaryItems = normalizeArray(primaryRegion.content).map((item) => normalizeString(item, "")).filter(Boolean);
  const buildNow = normalizeArray(productSkeleton.versionOneBoundary?.buildNow).map((item) => normalizeString(item, "")).filter(Boolean);
  const doNotBuildNow = normalizeArray(productSkeleton.versionOneBoundary?.doNotBuildNow).map((item) => normalizeString(item, "")).filter(Boolean);
  const title = normalizeString(
    firstScreen.name,
    normalizeString(firstWorkflow.title, normalizeString(artifactExpectation.title, normalizeString(projectName, "שלד מוצר ראשון"))),
  );
  const subtitle = normalizeString(
    firstScreen.purpose,
    normalizeString(firstWorkflow.whyThisFirst, normalizeString(artifactExpectation.summary, "מסגרת הריצה הראשונה של המוצר מוצגת לפי סוג המוצר שנבחר.")),
  );
  const primaryAction = normalizeString(firstScreen.primaryAction, actions[0] ?? "התחל");
  const firstItem = primaryItems[0] ?? normalizeString(productSkeleton.primaryProblem, "הבעיה הראשונה שהשלד פותר");
  const secondItem = primaryItems[1] ?? normalizeString(productSkeleton.primaryUser, "המשתמש המרכזי");
  const thirdItem = primaryItems[2] ?? normalizeString(buildNow[0], "הפעולה הראשונה");
  const runtimeSkeletonId = `runtime-skeleton:${productClass}`;
  const common = {
    taskId: "SLICE-005",
    runtimeSkeletonId,
    productClass,
    productClassSource,
    workspaceFamily: surfaceWorkspace.workspaceFamily,
    previewFrameFamily: surfaceWorkspace.regions?.buildCanvas?.previewFrameFamily ?? surfaceWorkspace.previewFrameFamily,
    buildSurfaceFamily: surfaceWorkspace.buildSurfaceFamily,
    runtimeFamily: surfaceWorkspace.runtimeFamily,
    packagingFamily: surfaceWorkspace.packagingFamily,
    releasePathFamily: surfaceWorkspace.releasePathFamily,
    title,
    subtitle,
    primaryAction,
    primaryItems: [firstItem, secondItem, thirdItem].filter(Boolean),
    fields,
    actions,
    buildNow,
    doNotBuildNow,
    futureImplementationBoundary: "זה שלד ריצה ראשון בתוך Nexus, לא פרסום, תשלום, חיבור ספק או גרסת ייצור.",
  };

  if (productClass === "mobile-app") {
    return {
      ...common,
      shellFamily: "mobile-simulator",
      frameLabel: "תצוגת אפליקציה",
      screens: [
        { title, detail: firstItem, active: true },
        { title: normalizeString(productSkeleton.initialScreens?.[1]?.name, "המסך הבא"), detail: secondItem, active: false },
      ],
      controls: [primaryAction, actions[1] ?? "מסך הבא"].filter(Boolean),
      stateRows: [
        { label: "מסך ראשון", value: title },
        { label: "ניווט", value: "פעולה ראשונה ואז מעבר להמשך" },
        { label: "מצב", value: "מוכן לבדיקה" },
      ],
    };
  }

  if (productClass === "landing-page") {
    return {
      ...common,
      shellFamily: "web-page-preview",
      frameLabel: "תצוגת דף",
      sections: [
        { kind: "hero", title, body: subtitle, action: primaryAction },
        { kind: "proof", title: "למה להאמין לזה", body: firstItem },
        { kind: "cta", title: primaryAction, body: secondItem },
      ],
    };
  }

  if (productClass === "game") {
    return {
      ...common,
      shellFamily: "playable-preview",
      frameLabel: "תצוגת משחק",
      scene: {
        title,
        objective: firstItem,
        hud: fields.slice(0, 3).length ? fields.slice(0, 3) : ["ניקוד", "זמן", "פעולה"],
        interaction: primaryAction,
      },
      controls: [primaryAction, actions[1] ?? "תנועה", actions[2] ?? "עצירה"].filter(Boolean),
    };
  }

  if (productClass === "commerce-ops") {
    return {
      ...common,
      shellFamily: "commerce-flow-preview",
      frameLabel: "תצוגת מסחר",
      lanes: [
        { title: "מוצרים", items: [firstItem, fields[0] ?? "שם מוצר", fields[1] ?? "סטטוס"] },
        { title: "הזמנות", items: [secondItem, fields[2] ?? "עדיפות", fields[3] ?? "פעולה"] },
        { title: "צעד הבא", items: [primaryAction, thirdItem] },
      ],
    };
  }

  if (productClass === "internal-tool" || productClass === "saas") {
    return {
      ...common,
      shellFamily: productClass === "internal-tool" ? "workspace-state-shell" : "product-workflow-shell",
      frameLabel: productClass === "internal-tool" ? "משטח עבודה" : "תצוגת מוצר",
      columns: [
        { title: "פתוח", items: [firstItem, fields[0] ?? "שם", fields[1] ?? "סטטוס"] },
        { title: "בטיפול", items: [secondItem, fields[2] ?? "אחראי", fields[3] ?? "תזכורת"] },
        { title: "הצעד הבא", items: [primaryAction, thirdItem, fields[4] ?? "צעד הבא"] },
      ],
    };
  }

  return {
    ...common,
    shellFamily: "tool-control-shell",
    frameLabel: "תצוגת כלי",
    controls: [primaryAction, ...actions.slice(1, 3)].filter(Boolean),
    panels: [
      { title: "מצב", body: firstItem },
      { title: "קלט", body: fields.slice(0, 3).join(" · ") || secondItem },
      { title: "פלט", body: thirdItem },
    ],
  };
}

function buildVisualProductSkeletonAgentViewModel(visualSkeleton = {}) {
  const firstScreen = normalizeObject(visualSkeleton.firstScreen);
  const designPlugin = normalizeObject(visualSkeleton.designPlugin);
  return {
    taskId: "VSKEL-001",
    agentId: "visual-product-skeleton-agent",
    responseSource: "provider-composed",
    productType: normalizeString(visualSkeleton.productType, ""),
    firstScreen: {
      name: normalizeString(firstScreen.name, ""),
      purpose: normalizeString(firstScreen.purpose, ""),
      primaryUser: normalizeString(firstScreen.primaryUser, ""),
      primaryAction: normalizeString(firstScreen.primaryAction, ""),
    },
    regions: normalizeArray(visualSkeleton.regions).map((region, index) => ({
      id: normalizeString(region?.id, `region-${index + 1}`),
      kind: normalizeString(region?.kind, "region"),
      title: normalizeString(region?.title, ""),
      purpose: normalizeString(region?.purpose, ""),
      priority: normalizeString(region?.priority, "supporting"),
      traceToProductSkeleton: normalizeString(region?.traceToProductSkeleton, ""),
      content: normalizeArray(region?.content).map((item) => normalizeString(item, "")).filter(Boolean),
    })),
    components: normalizeArray(visualSkeleton.components),
    hierarchy: normalizeObject(visualSkeleton.hierarchy),
    initialCopy: normalizeArray(visualSkeleton.initialCopy),
    designPlugin: {
      pluginId: normalizeString(designPlugin.pluginId, ""),
      pluginName: normalizeString(designPlugin.pluginName, ""),
      reason: normalizeString(designPlugin.reason, ""),
      matchedBy: normalizeString(designPlugin.matchedBy, ""),
    },
    visualTone: normalizeString(visualSkeleton.visualTone, ""),
    assumptions: normalizeArray(visualSkeleton.assumptions),
    unknowns: normalizeArray(visualSkeleton.unknowns),
    doNotBuildNow: normalizeArray(visualSkeleton.doNotBuildNow),
    handoff: normalizeObject(visualSkeleton.handoff),
  };
}

function buildDesignPluginLiveProofViewModel(selectionEnvelope, productSkeletonAgentOutput = {}) {
  const pluginId = selectionEnvelope.selection?.pluginId ?? "";
  const visualRules = selectionEnvelope.plugin?.visualRules ?? {};
  const fields = normalizeArray(productSkeletonAgentOutput.dataObjects?.[0]?.fields);
  const actions = normalizeArray(productSkeletonAgentOutput.initialActions);
  const base = {
    taskId: "DESIGN-PLUG-004",
    boundary: "plugin-live-proof-not-visual-agent-closure",
    selectedPluginId: pluginId,
    selectedPluginName: selectionEnvelope.selection?.pluginName ?? "",
    selectionReason: selectionEnvelope.selection?.reason ?? "",
    matchedBy: selectionEnvelope.selection?.matchedBy ?? "",
    styleName: visualRules.styleName ?? selectionEnvelope.selection?.pluginName ?? "",
    colors: visualRules.colors ?? {},
    typography: visualRules.typography ?? {},
    cardShape: visualRules.cardShape ?? {},
    buttonShape: visualRules.buttonShape ?? {},
    rtlSupport: visualRules.rtlSupport ?? {},
    antiGenericDesignRules: normalizeArray(visualRules.antiGenericDesignRules),
    sampleRegions: normalizeArray(visualRules.sampleRegions),
  };

  if (pluginId === "premium-brand") {
    return {
      ...base,
      proofKind: "premium-commerce-brand",
      regions: [
        { kind: "hero", title: "מתנה אישית שמרגישה מוכנה למסירה", body: productSkeletonAgentOutput.primaryProblem ?? "בחירת מתנה אישית" },
        { kind: "products", title: "מוצרים מותאמים אישית", body: fields.slice(0, 4).join(" · ") || "בד, צבע, רקמה, הקדשה" },
        { kind: "embroidery", title: "בחירת רקמה", body: actions.slice(0, 3).join(" · ") || "בחר רקמה ואשר עיצוב" },
        { kind: "cta", title: "הכן דמו ללקוחה", body: "CTA מותגי אחד במקום דשבורד תפעולי." },
      ],
    };
  }

  if (pluginId === "israeli-smb" || pluginId === "internal-tool") {
    return {
      ...base,
      proofKind: "work-tool-lead-flow",
      regions: [
        { kind: "today", title: "לחזור היום", body: "לידים שחייבים טיפול עכשיו" },
        { kind: "lead-list", title: "רשימת לידים", body: fields.slice(0, 5).join(" · ") || "שם · סטטוס · אחראי · תזכורת · צעד הבא" },
        { kind: "owner", title: "אחראי ותזכורת", body: "מי מטפל, מתי חוזרים, ומה הצעד הבא" },
        { kind: "action", title: actions[0] || "הוסף ליד", body: "פעולה תפעולית אחת שמקדמת את הזרימה הראשונה" },
      ],
    };
  }

  return {
    ...base,
    proofKind: "bounded-plugin-surface",
    regions: normalizeArray(visualRules.sampleRegions).slice(0, 4).map((region, index) => ({
      kind: `region-${index + 1}`,
      title: region,
      body: index === 0 ? productSkeletonAgentOutput.firstWorkflow?.title ?? "זרימה ראשונה" : productSkeletonAgentOutput.primaryUser ?? "משתמש מרכזי",
    })),
  };
}
