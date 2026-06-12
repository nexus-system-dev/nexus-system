import { buildGrowthPluginLayer, summarizeGrowthPluginLayer } from "./growth-plugin-layer.js";
import { buildGrowthMeasurementTruth, summarizeGrowthMeasurementTruth } from "./growth-measurement-truth.js";
import { buildSocialCampaignExecutionAgentEnvelope, summarizeSocialCampaignExecutionAgent } from "./social-campaign-execution-agent.js";
import { buildSeoActionPathEnvelope, summarizeSeoActionPath } from "./seo-action-path.js";
import { buildSemActionPathEnvelope, summarizeSemActionPath } from "./sem-action-path.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasProductTruth(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const context = normalizeObject(safeProject.context);
  return Boolean(
    safeProject.runtimeSkeletonTruth
      ?? context.runtimeSkeletonTruth
      ?? state.runtimeSkeletonTruth
      ?? safeProject.productDomainSkeleton
      ?? context.productDomainSkeleton
      ?? state.productDomainSkeleton
      ?? safeProject.productOwnedBackendSkeleton
      ?? context.productOwnedBackendSkeleton
      ?? state.productOwnedBackendSkeleton
      ?? safeProject.shareDemoAgent
      ?? context.shareDemoAgent
      ?? state.shareDemoAgent
      ?? safeProject.releaseWorkspace
      ?? context.releaseWorkspace
      ?? state.releaseWorkspace,
  );
}

function resolveProductClass(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const runtime = normalizeObject(
    safeProject.runtimeSkeletonTruth
      ?? safeProject.context?.runtimeSkeletonTruth
      ?? state.runtimeSkeletonTruth,
  );
  return normalizeString(
    safeProject.artifactExpectation?.projectType
      ?? runtime.productClass
      ?? safeProject.projectType
      ?? state.projectType,
    "generic",
  );
}

function resolveAudience(project) {
  const safeProject = normalizeObject(project);
  const growthWorkspace = normalizeObject(
    safeProject.growthWorkspace
      ?? safeProject.context?.growthWorkspace
      ?? safeProject.state?.growthWorkspace,
  );
  const strategy = normalizeObject(growthWorkspace.strategy);
  const goal = normalizeString(safeProject.goal, "");
  if (/ליד|lead|וואטסאפ|whatsapp|שיחה/u.test(goal)) {
    return "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ";
  }
  return normalizeString(strategy.targetAudience ?? safeProject.targetAudience, "המשתמשים הראשונים שהמוצר אמור לשרת");
}

function resolveArtifactTitle(project) {
  const safeProject = normalizeObject(project);
  const runtime = normalizeObject(
    safeProject.runtimeSkeletonTruth
      ?? safeProject.context?.runtimeSkeletonTruth
      ?? safeProject.state?.runtimeSkeletonTruth,
  );
  return normalizeString(runtime.title ?? safeProject.artifactTitle ?? safeProject.name, "התוצר הראשון");
}

function buildBaseEnvelope({ project, userInput }) {
  const input = normalizeString(userInput);
  const growthPluginLayer = buildGrowthPluginLayer({ project, userInput });
  const existingMeasurementRecords = normalizeArray(
    project?.growthMeasurementTruth?.records
      ?? project?.context?.growthMeasurementTruth?.records
      ?? project?.state?.growthMeasurementTruth?.records,
  );
  const growthMeasurementTruth = buildGrowthMeasurementTruth({
    project,
    records: existingMeasurementRecords,
    externalAction: {
      actionType: growthPluginLayer.primaryPlugin?.pluginId ?? "draft-only",
      draftOnly: growthPluginLayer.primaryPlugin?.draftOnly !== false,
      successMetric: growthPluginLayer.primaryPlugin?.smallSuccessMetric ?? "",
    },
  });
  return {
    taskId: "GROW-AGT-001",
    agentId: "growth-agent",
    responseSource: "agent-envelope",
    projectId: normalizeString(project?.id, "growth-project"),
    input,
    productClass: resolveProductClass(project),
    originArtifactTitle: resolveArtifactTitle(project),
    productTruthAvailable: hasProductTruth(project),
    opportunityType: "user-learning",
    readiness: {
      canRunGrowth: false,
      reason: "צריך תוצר ברור לפני צמיחה.",
      missingProductTruth: [],
    },
    whyNow: "",
    targetAudience: resolveAudience(project),
    recommendedAction: "",
    preparationNeeded: [],
    doNotPromise: [
      "לא להבטיח תוצאה עסקית לפני מדידה אמיתית.",
      "לא לפרסם החוצה בלי אישור.",
      "לא לטעון שיש נתוני הצלחה לפני מדידה אמיתית.",
    ],
    requiresAgent: "none",
    requiresApproval: false,
    approvalReason: "",
    successMetric: "",
    campaignExecution: {
      isCampaign: false,
      allowedNow: ["prepare-drafts"],
      requiresProviderConnection: false,
      requiresExplicitApprovalBeforeExternalAction: true,
      forbiddenWithoutApproval: ["publish", "schedule", "reply", "delete", "direct-message", "spend"],
    },
    growthPluginLayer,
    growthMeasurementTruth,
    userMessage: "",
    status: "needs-product-first",
    visibleBoundary: {
      oneNextMoveOnly: true,
      noGenericMarketing: true,
      noUnverifiedOutcomeClaims: true,
      noExternalActionWithoutApproval: true,
    },
  };
}

function productFirstEnvelope(base) {
  return {
    ...base,
    readiness: {
      canRunGrowth: false,
      reason: "מוקדם מדי לפתוח צמיחה.",
      missingProductTruth: [
        "שלד מוצר ברור",
        "מסך ראשון שאפשר להראות",
        "קהל ובעיה ברורים",
        "פעולה מרכזית במוצר",
      ],
    },
    whyNow: "אין עדיין משהו יציב להראות, לבדוק או לשפר.",
    recommendedAction: "לסגור קודם שלד או דמו ברור שאפשר להראות למשתמש ראשון.",
    successMetric: "המשתמש מבין בתוך דקה מה המוצר עושה ולמי הוא עוזר.",
    userMessage: "מוקדם מדי לתכנן צמיחה. קודם צריך תוצר ברור שאפשר להראות או לבדוק.",
    status: "needs-product-first",
  };
}

function productImprovementEnvelope(base) {
  return {
    ...base,
    opportunityType: "product-improvement",
    readiness: {
      canRunGrowth: true,
      reason: "יש תוצר, אבל ההמלצה משנה את אמת המוצר.",
      missingProductTruth: [],
    },
    whyNow: "הצעד יכול לשפר הבנה של הערך, אבל הוא משנה מסך או זרימה.",
    recommendedAction: "להוסיף אזור שמבליט לידים שדורשים מעקב היום, אחרי אישור שינוי.",
    preparationNeeded: ["לנסח את השינוי כמוטציית מוצר", "לקבל אישור לפני שינוי אמת המוצר"],
    requiresAgent: "mutation-change-agent",
    requiresApproval: true,
    approvalReason: "ההמלצה משנה את המוצר ולכן חייבת לעבור דרך סוכן שינוי.",
    successMetric: "בודק מבין מי צריך מעקב היום בלי לחפש בטבלה.",
    userMessage: "זו המלצת צמיחה שמשנה את המוצר, לכן היא עוברת לסוכן שינוי ולא מתבצעת לבד.",
    status: "handoff-required",
  };
}

function shareDemoEnvelope(base) {
  return {
    ...base,
    opportunityType: "share",
    readiness: {
      canRunGrowth: true,
      reason: "יש תוצר שאפשר להכין לסקירה בטוחה.",
      missingProductTruth: [],
    },
    whyNow: "הצעד הבא הוא לקבל תגובת לקוח, לא לפרסם החוצה.",
    recommendedAction: "להכין תצוגת סקירה קצרה שמראה את הערך בלי לחשוף מידע פנימי.",
    preparationNeeded: ["לבחור מה להראות", "להגדיר שאלת משוב אחת", "להעביר לשיתוף בטוח"],
    requiresAgent: "share-demo-agent",
    requiresApproval: true,
    approvalReason: "כל תצוגה חיצונית חייבת לעבור דרך מסלול שיתוף בטוח.",
    successMetric: "3 מתוך 5 לקוחות מבינים את הערך המרכזי בתוך דקה.",
    userMessage: "אפשר להכין משהו לשליחה, אבל סוכן השיתוף יוצר את הסקירה הבטוחה. צמיחה לא יוצרת קישור ציבורי לבד.",
    status: "handoff-required",
  };
}

function campaignDraftEnvelope(base) {
  const socialCampaignExecutionAgent = buildSocialCampaignExecutionAgentEnvelope({
    project: {
      id: base.projectId,
      goal: base.input,
      runtimeSkeletonTruth: {
        title: base.originArtifactTitle,
        productClass: base.productClass,
      },
      targetAudience: base.targetAudience,
      valueProposition: base.recommendedAction,
    },
    userInput: base.input,
    growthAgent: base,
  });
  return {
    ...base,
    opportunityType: "campaign-draft",
    readiness: {
      canRunGrowth: true,
      reason: "יש תוצר שאפשר להכין סביבו טיוטת מסר.",
      missingProductTruth: [],
    },
    whyNow: "אפשר לבדוק מסר סביב הערך הקיים בלי להפעיל פרסום אמיתי.",
    recommendedAction: "להכין רצף קצר של שלושה מסרים לאישור, בלי פרסום או תזמון.",
    preparationNeeded: ["מסר פתיחה", "דוגמת שימוש אחת", "שאלת משוב אחת"],
    requiresAgent: "social-campaign-execution-agent",
    requiresApproval: true,
    approvalReason: "כל פעולה חיצונית דורשת אישור וספק מחובר.",
    successMetric: "לפחות 3 תגובות איכותיות מתוך 10 פניות מאושרות.",
    campaignExecution: {
      isCampaign: true,
      allowedNow: ["prepare-drafts"],
      requiresProviderConnection: true,
      requiresExplicitApprovalBeforeExternalAction: true,
      forbiddenWithoutApproval: ["publish", "schedule", "reply", "delete", "direct-message", "spend"],
    },
    socialCampaignExecutionAgent,
    userMessage: "אפשר להכין טיוטת קמפיין קטנה, אבל שום דבר לא יפורסם, יתוזמן או יישלח בלי אישור וספק מחובר.",
    status: "needs-approval",
  };
}

function pluginLayerEnvelope(base) {
  const plugin = normalizeObject(base.growthPluginLayer?.primaryPlugin);
  if (!plugin.pluginId) {
    return null;
  }
  const opportunityTypeByPlugin = {
    "seo-page-draft": "seo-draft",
    "paid-test-draft": "paid-test-draft",
    "email-draft": "email-draft",
    "landing-experiment-draft": "landing-experiment",
    "measurement-plan": "measurement-plan",
    "social-campaign-draft": "campaign-draft",
  };

  const seoActionPath = plugin.pluginId === "seo-page-draft"
    ? buildSeoActionPathEnvelope({
        project: {
          id: base.projectId,
          goal: base.input,
          runtimeSkeletonTruth: {
            title: base.originArtifactTitle,
            productClass: base.productClass,
          },
          targetAudience: base.targetAudience,
        },
        userInput: base.input,
        growthAgent: base,
        measurementTruth: base.growthMeasurementTruth,
      })
    : null;
  const semActionPath = plugin.pluginId === "paid-test-draft"
    ? buildSemActionPathEnvelope({
        project: {
          id: base.projectId,
          goal: base.input,
          runtimeSkeletonTruth: {
            title: base.originArtifactTitle,
            productClass: base.productClass,
          },
          targetAudience: base.targetAudience,
        },
        userInput: base.input,
        growthAgent: base,
        measurementTruth: base.growthMeasurementTruth,
      })
    : null;

  return {
    ...base,
    opportunityType: opportunityTypeByPlugin[plugin.pluginId] ?? "growth-plugin",
    readiness: {
      canRunGrowth: true,
      reason: "יש תוצר שאפשר להכין סביבו צעד צמיחה מוגבל.",
      missingProductTruth: [],
    },
    whyNow: normalizeString(plugin.whyThisPlugin, "הצעד מחובר לתוצר ולמדד קטן."),
    recommendedAction: normalizeString(plugin.label, "להכין צעד צמיחה מוגבל."),
    preparationNeeded: normalizeArray(plugin.allowedActions),
    requiresAgent: normalizeString(plugin.handoffRequired, "none"),
    requiresApproval: plugin.approvalRequired === true,
    approvalReason: plugin.approvalRequired === true
      ? "הצעד דורש אישור לפני פעולה חיצונית או שינוי גלוי."
      : "",
    successMetric: normalizeString(plugin.smallSuccessMetric, "לקבל סימן למידה קטן ואמיתי."),
    campaignExecution: {
      isCampaign: plugin.pluginId === "social-campaign-draft" || plugin.providerRequired === true,
      allowedNow: normalizeArray(plugin.allowedActions),
      requiresProviderConnection: plugin.providerRequired === true,
      requiresExplicitApprovalBeforeExternalAction: plugin.approvalRequired === true,
      forbiddenWithoutApproval: normalizeArray(plugin.blockedActions),
    },
    ...(seoActionPath ? { seoActionPath } : {}),
    ...(semActionPath ? { semActionPath } : {}),
    userMessage: normalizeString(plugin.whyThisPlugin, "זה צעד צמיחה מוגבל שמחובר לתוצר ולא מבצע פעולה חיצונית לבד."),
    status: normalizeString(plugin.status, "recommended"),
  };
}

function experimentEnvelope(base) {
  return {
    ...base,
    opportunityType: "audience-test",
    readiness: {
      canRunGrowth: true,
      reason: "יש תוצר שאפשר להראות וללמוד ממנו.",
      missingProductTruth: [],
    },
    whyNow: `יש ${base.originArtifactTitle || "תוצר"} שמספיק טוב לניסוי הבנה קטן.`,
    recommendedAction: "להראות דמו קצר לבעלי עסקים שמקבלים לידים, ולבדוק אם הם מבינים את הערך של אחראי, תזכורת וצעד הבא.",
    preparationNeeded: ["להכין תסריט דמו של דקה", "לבחור 5 בעלי עסקים", "לרשום תגובת הבנה אחת מכל אחד"],
    requiresAgent: "none",
    requiresApproval: false,
    successMetric: "3 מתוך 5 בעלי עסקים מבינים בתוך דקה למה אחראי, תזכורת וצעד הבא עוזרים להם לטפל בליד.",
    userMessage: "הצעד הנכון הוא ניסוי הבנה קטן שמחובר לשלד הלידים, בלי לפתוח הפצה רחבה.",
    status: "recommended",
  };
}

export function buildGrowthAgentEnvelope({ project = null, userInput = "" } = {}) {
  const safeProject = normalizeObject(project);
  const base = buildBaseEnvelope({ project: safeProject, userInput });
  const normalizedInput = normalizeString(userInput).toLowerCase();

  if (!base.productTruthAvailable) {
    return productFirstEnvelope(base);
  }

  if (includesAny(normalizedInput, [/follow.?up|מעקב|היום|today/u])) {
    return productImprovementEnvelope(base);
  }

  const pluginFirstIds = new Set([
    "seo-page-draft",
    "paid-test-draft",
    "email-draft",
    "landing-experiment-draft",
    "measurement-plan",
  ]);
  if (pluginFirstIds.has(base.growthPluginLayer?.primaryPlugin?.pluginId)) {
    return pluginLayerEnvelope(base);
  }

  if (includesAny(normalizedInput, [/campaign|launch|קמפיין|השקה|פרסום/u])) {
    return campaignDraftEnvelope(base);
  }

  if (includesAny(normalizedInput, [/send|client|demo|share|לשלוח|לקוחות|סקירה|דמו/u])) {
    return shareDemoEnvelope(base);
  }

  return experimentEnvelope(base);
}

export function summarizeGrowthAgentForSurface(envelope = {}) {
  const safeEnvelope = normalizeObject(envelope);
  return {
    taskId: normalizeString(safeEnvelope.taskId, "GROW-AGT-001"),
    agentId: normalizeString(safeEnvelope.agentId, "growth-agent"),
    status: normalizeString(safeEnvelope.status, "needs-product-first"),
    opportunityType: normalizeString(safeEnvelope.opportunityType, "user-learning"),
    canRunGrowth: safeEnvelope.readiness?.canRunGrowth === true,
    recommendedAction: normalizeString(safeEnvelope.recommendedAction, "לסגור קודם אמת מוצר."),
    targetAudience: normalizeString(safeEnvelope.targetAudience, "קהל היעד עדיין לא ברור."),
    successMetric: normalizeString(safeEnvelope.successMetric, "מדד הצלחה קטן עוד לא הוגדר."),
    requiresAgent: normalizeString(safeEnvelope.requiresAgent, "none"),
    requiresApproval: safeEnvelope.requiresApproval === true,
    userMessage: normalizeString(safeEnvelope.userMessage, "צמיחה מחכה לאמת מוצר."),
    preparationNeeded: normalizeArray(safeEnvelope.preparationNeeded),
    doNotPromise: normalizeArray(safeEnvelope.doNotPromise),
    campaignExecution: normalizeObject(safeEnvelope.campaignExecution),
    socialCampaignExecutionAgent: summarizeSocialCampaignExecutionAgent(safeEnvelope.socialCampaignExecutionAgent),
    seoActionPath: summarizeSeoActionPath(safeEnvelope.seoActionPath),
    semActionPath: summarizeSemActionPath(safeEnvelope.semActionPath),
    growthPluginLayer: summarizeGrowthPluginLayer(safeEnvelope.growthPluginLayer),
    growthMeasurementTruth: summarizeGrowthMeasurementTruth(safeEnvelope.growthMeasurementTruth),
  };
}
