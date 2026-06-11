function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolveProjectTitle(project = {}) {
  return normalizeString(
    project.name,
    normalizeString(project.context?.projectIdentity?.name, "המוצר"),
  );
}

function createVisualEnvelope({
  visualBuildId,
  operationId,
  requestedBy,
  requestText,
  skeletonChoiceTruth,
  changeType,
  affectedScreen,
  affectedRegions = [],
  affectedComponents = [],
  operation = "changed",
  visualDiff = {},
  requiresApproval = false,
  approvalReason = "",
  requiresProductTruthMutation = false,
  productTruthReason = "",
  requiresOtherAgent = false,
  nextAgent = "",
  assumptions = [],
  unknowns = [],
  userReply = "",
  status = "applied",
} = {}) {
  return {
    diffId: visualBuildId,
    taskId: "VBUILD-001",
    agentId: "visual-build-agent",
    operationId,
    requestedBy,
    requestText: normalizeString(requestText, ""),
    selectedSkeletonCandidateId: normalizeString(skeletonChoiceTruth.selectedSkeletonCandidateId, ""),
    selectedCompositionStyle: normalizeString(skeletonChoiceTruth.selectedCompositionStyle, ""),
    selectedProductDirection: normalizeString(skeletonChoiceTruth.selectedProductDirection, ""),
    changeType,
    affectedScreen,
    affectedRegions,
    affectedComponents,
    operation,
    visualDiff: {
      layout: normalizeString(visualDiff.layout, "נשמר מבנה המסך הקיים."),
      hierarchy: normalizeString(visualDiff.hierarchy, "ההיררכיה נשמרה."),
      spacing: normalizeString(visualDiff.spacing, "המרווחים נשמרו בתוך אותה שפה."),
      color: normalizeString(visualDiff.color, "לא בוצעה החלפת שפת צבע."),
      typography: normalizeString(visualDiff.typography, "הטיפוגרפיה נשמרה."),
      components: normalizeString(visualDiff.components, "רכיבים קיימים נשמרו."),
      copy: normalizeString(visualDiff.copy, "הטקסט נשאר מוצרי וקצר."),
      interaction: normalizeString(visualDiff.interaction, "האינטראקציה נשארת מקומית בשלד."),
    },
    requiresApproval,
    approvalReason,
    requiresProductTruthMutation,
    productTruthReason,
    requiresOtherAgent,
    nextAgent,
    assumptions,
    unknowns,
    userReply,
    failureSafe: status !== "applied",
    status,
    visibleSummary: userReply,
  };
}

function buildCardsFollowupScreen({ appName, affectedScreen, affectedRegion } = {}) {
  return {
    screenId: "lead-cards-follow-up",
    title: affectedScreen,
    headline: appName,
    body: "רשימת הלידים מוצגת ככרטיסים עם אזור חזרה היום.",
    primaryAction: "הוסף ליד",
    affectedRegion,
    layoutMode: "cards-with-follow-up-today",
    leadCards: [
      { name: "רוני כהן", status: "פתוח", owner: "דנה", reminder: "היום 14:00", nextStep: "לחזור עם הצעת מחיר" },
      { name: "מאיה לוי", status: "בטיפול", owner: "יוסי", reminder: "מחר 09:30", nextStep: "לקבוע פגישה" },
      { name: "א.מ. שירותים", status: "ממתין", owner: "ללא אחראי", reminder: "היום 16:00", nextStep: "לשייך אחראי" },
    ],
    followUpToday: [
      "רוני כהן · לחזור עם הצעת מחיר",
      "א.מ. שירותים · לשייך אחראי",
    ],
  };
}

function buildSplashScreen({ appName, affectedScreen, affectedRegion } = {}) {
  return {
    screenId: "splash-screen",
    title: affectedScreen,
    headline: appName,
    body: "פתיחה קצרה לפני הכניסה לשלד העבודה.",
    primaryAction: "המשך למוצר",
    affectedRegion,
    layoutMode: "splash-screen",
  };
}

export function applyVisualBuildTruth({
  project = {},
  requestText = "",
  operationId = "visual.screen.addSplash",
  payload = {},
  requestedBy = "visual-build-agent",
} = {}) {
  const projectId = normalizeString(project.id, "project");
  const previous = normalizeObject(
    project.visualBuildTruth
      ?? project.context?.visualBuildTruth
      ?? project.state?.visualBuildTruth,
  );
  const skeletonChoiceTruth = normalizeObject(
    project.skeletonChoiceTruth
      ?? project.context?.skeletonChoiceTruth
      ?? project.state?.skeletonChoiceTruth,
  );
  const previousScreens = normalizeArray(previous.screens);
  const visualBuildId = `visual-build:${projectId}:${Date.now()}`;
  const appName = resolveProjectTitle(project);
  const affectedScreen = normalizeString(payload.affectedScreen, "מסך פתיחה");
  const affectedRegion = normalizeString(payload.affectedRegion, "splash-screen");
  const isCardsFollowup = operationId === "visual.leads.cardsFollowupToday";
  const screen = isCardsFollowup
    ? buildCardsFollowupScreen({ appName, affectedScreen, affectedRegion })
    : buildSplashScreen({ appName, affectedScreen, affectedRegion });
  const screens = [
    screen,
    ...previousScreens.filter((item) => normalizeObject(item).screenId !== screen.screenId),
  ];
  const visualDiff = isCardsFollowup
    ? createVisualEnvelope({
        visualBuildId,
        operationId,
        requestedBy,
        requestText,
        skeletonChoiceTruth,
        changeType: "structure",
        affectedScreen,
        affectedRegions: ["lead-list", "follow-up-today"],
        affectedComponents: ["lead-card", "follow-up-region", "row-actions"],
        operation: "replaced",
        visualDiff: {
          layout: "הטבלה הוחלפה בכרטיסי לידים כדי להבליט בעלות וצעד הבא.",
          hierarchy: "אזור חזרה היום קודם לרשימת העבודה כדי להדגיש דחיפות.",
          spacing: "המרווחים נשארים תפעוליים וצפופים מספיק לעבודה יומית.",
          color: "נשמרת שפת העיצוב שנבחרה, בלי החלפת סגנון.",
          typography: "כותרות הכרטיסים מקבלות משקל ברור יותר.",
          components: "נוספו כרטיסי ליד ואזור חזרה היום.",
          copy: "הטקסט נשאר קצר, תפעולי ומכוון פעולה.",
          interaction: "פעולות הכרטיסים נשארות מקומיות בשלד הריצה.",
        },
        requiresApproval: false,
        requiresProductTruthMutation: false,
        requiresOtherAgent: false,
        assumptions: ["המשתמש ביקש שינוי תצוגה ולא שינוי אמת מוצרית."],
        unknowns: [],
        userReply: "רשימת הלידים הפכה לכרטיסים ונוסף אזור חזרה היום. שמרתי על אותו כיוון עיצובי.",
      })
    : createVisualEnvelope({
        visualBuildId,
        operationId,
        requestedBy,
        requestText,
        skeletonChoiceTruth,
        changeType: "flow",
        affectedScreen,
        affectedRegions: [affectedRegion],
        affectedComponents: ["splash-screen"],
        operation: "added",
        visualDiff: {
          layout: "נוסף מסך פתיחה לפני המסך הראשי.",
          hierarchy: "שם המוצר מוצג במרכז המסך.",
          spacing: "מסך הפתיחה משתמש במרווחים רגועים.",
          components: "נוסף מסך פתיחה עם פעולה אחת.",
          interaction: "המשך למוצר מוביל בחזרה לשלד.",
        },
        requiresApproval: false,
        requiresProductTruthMutation: false,
        requiresOtherAgent: false,
        assumptions: ["הבקשה היא שינוי חזותי בטוח."],
        unknowns: [],
        userReply: "נוסף מסך פתיחה חזותי לשלד הריצה.",
      });
  const visualDiffCompatibility = {
    ...visualDiff,
    affectedScreen,
    affectedRegion,
  };
  const history = [
    ...normalizeArray(previous.history),
    visualDiffCompatibility,
  ];

  return {
    taskId: "VBUILD-001",
    bridgeTaskId: "BLD-AGT-001",
    status: "applied",
    visualBuildId,
    projectId,
    lastOperationId: operationId,
    selectedDesignPluginId: normalizeString(
      project.visualProductSkeletonAgentOutput?.designPlugin?.pluginId
        ?? project.context?.visualProductSkeletonAgentOutput?.designPlugin?.pluginId,
      "design-plugin:preserved",
    ),
    selectedDesignPluginName: normalizeString(
      project.visualProductSkeletonAgentOutput?.designPlugin?.pluginName
        ?? project.context?.visualProductSkeletonAgentOutput?.designPlugin?.pluginName,
      "שפת העיצוב שנבחרה לשלד",
    ),
    selectedSkeletonCandidateId: normalizeString(skeletonChoiceTruth.selectedSkeletonCandidateId, ""),
    selectedCompositionStyle: normalizeString(skeletonChoiceTruth.selectedCompositionStyle, ""),
    selectedProductDirection: normalizeString(skeletonChoiceTruth.selectedProductDirection, ""),
    screens,
    lastVisualDiff: visualDiffCompatibility,
    history,
    boundary: "שינוי חזותי בשלד הריצה, לא שחרור ולא אפליקציית ייצור.",
  };
}
