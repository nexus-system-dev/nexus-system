import { createSplitWorkspaceAndLiveBuildSurfaceModel } from "./split-workspace-live-build-surface-model.js";
import { resolveCanonicalProductClass } from "./product-class-model.js";
import { resolveProductKindDiscovery } from "./product-kind-discovery.js";
import { createProductPatternLearningDecision } from "./product-pattern-learning-intelligence.js";
import { buildProductDomainSkeletonEnvelope } from "./product-domain-skeleton.js";
import { buildProductOwnedBackendSkeletonEnvelope } from "./product-owned-backend-skeleton.js";
import { buildProfessionalSkeletonQualityEnvelope } from "./professional-skeleton-quality.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanVisibleText(value, fallback = "") {
  const text = normalizeString(value, fallback)
    .replace(/\s*first artifact\s*/gi, " ")
    .replace(/\s*nexus\.preview\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

function isGenericVisibleText(value) {
  return /הבעיה הראשונה|המשתמש המרכזי|הפעולה הראשונה|שלד מוצר ראשון|first artifact|nexus\.preview|מסגרת ראשונה|פריט ראשון|פריט שני|פריט שלישי/i.test(normalizeString(value, ""));
}

function defaultProductDetails(productClass, productName) {
  if (productClass === "mobile-app") {
    return {
      subtitle: "אפליקציית משימות יומית עם רשימה, הוספה, סימון וסיכום התקדמות.",
      items: [
        `${productName}: משימות היום לפי עדיפות`,
        "הוספת משימה חדשה בלחיצה אחת",
        "סיכום יומי עם פתוחות ובוצעו",
      ],
      action: "הוסף משימה",
    };
  }
  if (productClass === "landing-page") {
    return {
      subtitle: "דף שמסביר את הערך, יוצר אמון, ושומר פנייה חדשה כטיוטת ליד מקומית.",
      items: [
        "עצירת איבוד לידים עוד היום",
        "מעקב ברור אחרי כל פנייה חדשה",
        "טופס קצר שמייצר רשומת ליד מדומה",
      ],
      action: "קבל שיחת התאמה",
    };
  }
  if (productClass === "internal-tool" || productClass === "saas") {
    return {
      subtitle: "סביבת עבודה יומית שמרכזת לידים, אחראים, תזכורות וצעד הבא במקום אחד.",
      items: [
        "לידים פתוחים שממתינים לאחראי",
        "תזכורות היום לפי בעל טיפול",
        "צעד הבא לכל ליד לפני שהוא נופל",
      ],
      action: "הוסף ליד",
    };
  }
  return {
    subtitle: "כלי עבודה ראשון עם קלט, פעולה ותוצאה נראית.",
    items: [
      `${productName}: פעולה ראשונה`,
      "מצב עבודה מדומה",
      "תוצאה נראית אחרי פעולה",
    ],
    action: "הפעל",
  };
}

function resolveArtifactExpectation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.state?.artifactExpectation
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
      ?? safeProject.state?.generationIntent
      ?? safeProject.context?.aiDesignRequest?.generationIntent,
  );
}

export function resolveRuntimeSkeletonTruth(project = null) {
  const safeProject = normalizeObject(project);
  const candidates = [
    safeProject.runtimeSkeletonTruth,
    safeProject.runtimeSkeleton,
    safeProject.state?.runtimeSkeletonTruth,
    safeProject.context?.runtimeSkeletonTruth,
    safeProject.onboardingStateHandoff?.runtimeSkeletonTruth,
    safeProject.context?.onboardingStateHandoff?.runtimeSkeletonTruth,
  ];
  return candidates.find((candidate) => {
    const normalized = normalizeObject(candidate);
    return normalized.truthTaskId === "RUNTIME-TRUTH-001"
      && normalizeString(normalized.runtimeSkeletonId, "")
      && normalizeString(normalized.projectId, "");
  }) ?? null;
}

export function buildRuntimeSkeletonTruthEnvelope({
  project = null,
  productClass = "",
  productClassSource = "",
  surfaceWorkspace = null,
  productSkeleton = {},
  visualSkeleton = {},
  artifactExpectation = null,
  generationIntent = null,
  projectName = "",
} = {}) {
  const safeProject = normalizeObject(project);
  const safeArtifactExpectation = normalizeObject(artifactExpectation ?? resolveArtifactExpectation(safeProject));
  const safeGenerationIntent = normalizeObject(generationIntent ?? resolveGenerationIntent(safeProject));
  const safeProductSkeleton = normalizeObject(
    productSkeleton.agentId
      ? productSkeleton
      : safeProject.productSkeletonAgentOutput
        ?? safeProject.onboardingStateHandoff?.productSkeletonAgentOutput
        ?? safeProject.context?.productSkeletonAgentOutput
        ?? safeProject.state?.productSkeletonAgentOutput,
  );
  const safeVisualSkeleton = normalizeObject(
    visualSkeleton.agentId
      ? visualSkeleton
      : safeProject.visualProductSkeletonAgentOutput
        ?? safeProject.onboardingStateHandoff?.visualProductSkeletonAgentOutput
        ?? safeProject.context?.visualProductSkeletonAgentOutput
        ?? safeProject.state?.visualProductSkeletonAgentOutput,
  );
  const projectId = normalizeString(safeProject.id, "runtime-preview");
  const initialClassResolution = resolveCanonicalProductClass({
    explicitClass: safeArtifactExpectation.projectType
      ?? safeArtifactExpectation.productClass
      ?? safeGenerationIntent.productClass
      ?? safeProject.projectType
      ?? safeProject.classification?.projectType
      ?? "",
    hintedClass: safeProject.classification?.projectType ?? "",
    texts: [
      safeProject.name,
      safeProject.goal,
      safeArtifactExpectation.title,
      safeArtifactExpectation.summary,
      safeArtifactExpectation.deliverableLabel,
      safeProductSkeleton.productType,
      safeProductSkeleton.primaryUser,
      safeProductSkeleton.primaryProblem,
      safeProductSkeleton.firstWorkflow?.title,
      ...normalizeArray(safeProductSkeleton.initialActions),
      ...normalizeArray(safeProductSkeleton.versionOneBoundary?.buildNow),
    ],
    fallback: "generic",
  });
  const initialResolvedClass = normalizeString(productClass, "") || initialClassResolution.productClass;
  const productPatternLearningDecision = createProductPatternLearningDecision({
    project: safeProject,
    productClass: initialResolvedClass,
    texts: [
      safeProject.name,
      safeProject.goal,
      safeArtifactExpectation.title,
      safeArtifactExpectation.summary,
      safeArtifactExpectation.deliverableLabel,
      safeProductSkeleton.productType,
      safeProductSkeleton.primaryUser,
      safeProductSkeleton.primaryProblem,
      safeProductSkeleton.firstWorkflow?.title,
      safeProductSkeleton.firstWorkflow?.whyThisFirst,
      safeProductSkeleton.firstWorkflow?.steps ?? [],
      safeProductSkeleton.initialActions ?? [],
      safeProductSkeleton.versionOneBoundary?.buildNow ?? [],
    ],
    productSkeleton: safeProductSkeleton,
    artifactExpectation: safeArtifactExpectation,
    generationIntent: safeGenerationIntent,
  });
  const productKindDiscovery = resolveProductKindDiscovery({
    productClass: initialResolvedClass,
    productClassSource: normalizeString(productClassSource, initialClassResolution.source),
    texts: [
      safeProject.name,
      safeProject.goal,
      safeArtifactExpectation.title,
      safeArtifactExpectation.summary,
      safeArtifactExpectation.deliverableLabel,
      safeProductSkeleton.productType,
      safeProductSkeleton.primaryUser,
      safeProductSkeleton.primaryProblem,
      safeProductSkeleton.firstWorkflow?.title,
      safeProductSkeleton.firstWorkflow?.whyThisFirst,
      safeProductSkeleton.firstWorkflow?.steps ?? [],
      safeProductSkeleton.initialActions ?? [],
      safeProductSkeleton.versionOneBoundary?.buildNow ?? [],
    ],
    productSkeleton: safeProductSkeleton,
    artifactExpectation: safeArtifactExpectation,
    generationIntent: safeGenerationIntent,
    learningSignals: safeProject.runtimeLearningDecisionHints?.recommendedPatterns ?? [],
    learningDecision: productPatternLearningDecision,
  });
  const resolvedClass = productKindDiscovery.needsClarification
    ? "generic"
    : normalizeString(productKindDiscovery.skeletonSelection?.productClass, initialResolvedClass);
  const resolvedClassSource = normalizeString(productClassSource, "runtime-truth-builder");
  const workspace = normalizeObject(surfaceWorkspace).surfaceContractId
    ? surfaceWorkspace
    : createSplitWorkspaceAndLiveBuildSurfaceModel({
        productClass: resolvedClass,
        runtimeDirection: safeProject.runtimeDirection,
        skeletonContract: safeProject.skeletonContract ?? safeProject.onboardingStateHandoff?.skeletonContract,
        skeletonQualityBaseline: safeProject.skeletonQualityBaseline,
        projectStage: "first-skeleton",
      });

  const firstWorkflow = normalizeObject(safeProductSkeleton.firstWorkflow);
  const firstScreen = normalizeObject(safeVisualSkeleton.firstScreen);
  const dataObject = normalizeObject(normalizeArray(safeProductSkeleton.dataObjects)[0]);
  const fields = normalizeArray(dataObject.fields).map((field) => normalizeString(field, "")).filter(Boolean);
  const actions = normalizeArray(safeProductSkeleton.initialActions).map((action) => normalizeString(action, "")).filter(Boolean);
  const regions = normalizeArray(safeVisualSkeleton.regions);
  const primaryRegion = regions.find((region) => region?.priority === "primary") ?? regions[0] ?? {};
  const primaryItems = normalizeArray(primaryRegion.content).map((item) => normalizeString(item, "")).filter(Boolean);
  const buildNow = normalizeArray(safeProductSkeleton.versionOneBoundary?.buildNow).map((item) => normalizeString(item, "")).filter(Boolean);
  const doNotBuildNow = normalizeArray(safeProductSkeleton.versionOneBoundary?.doNotBuildNow).map((item) => normalizeString(item, "")).filter(Boolean);
  const productName = cleanVisibleText(
    safeArtifactExpectation.title
      ?? firstWorkflow.title
      ?? projectName
      ?? safeProject.name,
    "המוצר שלך",
  );
  const title = cleanVisibleText(
    safeArtifactExpectation.title
      ?? firstWorkflow.title
      ?? firstScreen.name
      ?? projectName
      ?? safeProject.name,
    productName,
  );
  const defaults = defaultProductDetails(resolvedClass, productName);
  const rawSubtitle = cleanVisibleText(
    safeArtifactExpectation.summary
      ?? firstWorkflow.whyThisFirst
      ?? firstScreen.purpose,
    defaults.subtitle,
  );
  const subtitle = isGenericVisibleText(rawSubtitle) ? defaults.subtitle : rawSubtitle;
  const primaryAction = cleanVisibleText(firstScreen.primaryAction, actions[0] ?? defaults.action);
  const visiblePrimaryItems = [
    primaryItems[0],
    normalizeString(safeProductSkeleton.primaryProblem, ""),
    primaryItems[1],
    normalizeString(safeProductSkeleton.primaryUser, ""),
    primaryItems[2],
    normalizeString(buildNow[0], ""),
  ].map((item) => cleanVisibleText(item, "")).filter((item) => item && !isGenericVisibleText(item));
  const firstItem = visiblePrimaryItems[0] ?? defaults.items[0];
  const secondItem = visiblePrimaryItems[1] ?? defaults.items[1];
  const thirdItem = visiblePrimaryItems[2] ?? defaults.items[2];
  const runtimeSkeletonId = `runtime-skeleton:${projectId}:${resolvedClass}`;
  const productDomainSkeleton = buildProductDomainSkeletonEnvelope({
    projectId,
    productClass: resolvedClass,
    runtimeSkeletonId,
    productSkeleton: safeProductSkeleton,
    productKindDiscovery,
  });
  const artifactBuildId = `runtime-build:${projectId}:first-skeleton`;
  const productOwnedBackendSkeleton = buildProductOwnedBackendSkeletonEnvelope({
    project: safeProject,
    projectId,
    productClass: resolvedClass,
    runtimeSkeletonId,
    artifactBuildId,
    productDomainSkeleton,
  });
  const common = {
    taskId: "SLICE-005",
    truthTaskId: "RUNTIME-TRUTH-001",
    truthSource: "canonical-project-runtime-skeleton",
    truthStatus: "backend-project-truth-envelope",
    runtimeSkeletonId,
    artifactBuildId,
    productDomainSkeletonId: productDomainSkeleton.productDomainSkeletonId,
    productOwnedBackendSkeletonId: productOwnedBackendSkeleton.productOwnedBackendSkeletonId,
    projectId,
    productClass: resolvedClass,
    productClassSource: resolvedClassSource,
    productKindDiscovery,
    productKindTaskId: productKindDiscovery.taskId,
    productKindStatus: productKindDiscovery.status,
    productPattern: productKindDiscovery.productPattern,
    productKind: productKindDiscovery.productKind,
    productKindConfidence: productKindDiscovery.confidence,
    productKindNeedsClarification: productKindDiscovery.needsClarification,
    productKindClarificationQuestions: productKindDiscovery.clarificationQuestions,
    productKindSkeletonSelection: productKindDiscovery.skeletonSelection,
    productPatternLearningDecision,
    productPatternLearningStatus: productPatternLearningDecision.status,
    productPatternLearningApplied: productKindDiscovery.learningDecision?.applied === true,
    productPatternLearningBoundary: productPatternLearningDecision.truthBoundary,
    workspaceFamily: workspace.workspaceFamily,
    previewFrameFamily: workspace.regions?.buildCanvas?.previewFrameFamily ?? workspace.previewFrameFamily,
    buildSurfaceFamily: workspace.buildSurfaceFamily,
    runtimeFamily: workspace.runtimeFamily,
    packagingFamily: workspace.packagingFamily,
    releasePathFamily: workspace.releasePathFamily,
    title,
    subtitle,
    primaryAction,
    primaryItems: [firstItem, secondItem, thirdItem].filter(Boolean),
    fields,
    actions,
    buildNow,
    doNotBuildNow,
    boundaries: {
      simulatedRuntime: true,
      productionImplementation: false,
      externalProviderConnection: false,
      paymentExecution: false,
      publishingExecution: false,
    },
    futureImplementationBoundary: "זה שלד ריצה ראשון בתוך Nexus, לא פרסום, תשלום, חיבור ספק או גרסת ייצור.",
    productDomainSkeleton,
    productOwnedBackendSkeleton,
  };
  const withProfessionalQuality = (runtimeSkeleton) => {
    const professionalSkeletonQuality = buildProfessionalSkeletonQualityEnvelope(runtimeSkeleton);
    return {
      ...runtimeSkeleton,
      professionalSkeletonQuality,
    };
  };

  if (resolvedClass === "mobile-app") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "mobile-simulator",
      frameLabel: productName,
      screens: [
        { title: "היום", detail: firstItem, active: true, role: "home" },
        { title: "הוספה", detail: secondItem, active: false, role: "create" },
        { title: "סיכום", detail: thirdItem, active: false, role: "summary" },
      ],
      appTabs: ["היום", "הוספה", "סיכום"],
      controls: [primaryAction, actions[1] ?? "סמן בוצע", actions[2] ?? "מחק"].filter(Boolean),
      quickStats: [
        { label: "פתוחות", value: "5" },
        { label: "הושלמו", value: "3" },
        { label: "רצף", value: "4 ימים" },
      ],
      taskRows: [
        { title: "לסגור הצעת מחיר", meta: "09:30 · עדיפות גבוהה", status: "פתוח" },
        { title: "לחזור לליד מאתמול", meta: "11:00 · שיוך לדנה", status: "בטיפול" },
        { title: "לשלוח סיכום יומי", meta: "16:30 · תזכורת", status: "בוצע" },
      ],
      summaryRows: [
        { label: "הושלמו היום", value: "3" },
        { label: "נשארו להיום", value: "5" },
        { label: "הפעולה הבאה", value: primaryAction },
      ],
      stateRows: [
        { label: "מסך פעיל", value: "היום" },
        { label: "ניווט", value: "היום, הוספה וסיכום" },
        { label: "מצב", value: "רשימת משימות מקומית" },
        { label: "פעולות", value: "הוספה, סימון ומחיקה" },
      ],
    });
  }

  if (resolvedClass === "landing-page") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "web-page-preview",
      frameLabel: productName,
      trustSignals: ["תגובה בתוך שעה", "מעקב בלי חיבור חיצוני", "רשומת ליד נשמרת מקומית"],
      sections: [
        { kind: "hero", label: "פתרון", title, body: subtitle, action: primaryAction },
        { kind: "value", label: "ערך מיידי", title: "כל ליד מקבל אחראי וצעד הבא", body: [firstItem, secondItem, thirdItem].filter(Boolean).join(" · ") },
        { kind: "proof", label: "הוכחה", title: "פחות לידים נופלים בין הכיסאות", body: "הדף מכוון לפנייה אחת ברורה: להשאיר פרטים כדי שהעסק יחזור לליד בזמן." },
        { kind: "trust", label: "אמון", title: "בלי פרסום ובלי חיבור חיצוני בשלב הזה", body: "השליחה יוצרת רשומת ליד מקומית בלבד, כדי לבדוק את הזרימה לפני חיבור ספקים." },
        { kind: "form", label: "פנייה", title: "השארת ליד לבדיקה", body: "שם, טלפון והודעה קצרה נשמרים כרשומת ליד מקומית.", action: primaryAction },
        { kind: "cta", label: "המשך", title: "להתחיל עם רשימת לידים נקייה", body: secondItem, action: primaryAction },
      ],
    });
  }

  if (resolvedClass === "game") {
    return withProfessionalQuality({
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
    });
  }

  if (productKindDiscovery.productPattern === "editor-canvas") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "editor-canvas-shell",
      frameLabel: productName,
      controls: ["בחר", "הוסף צורה", "שנה צבע", "בטל", "חזור"],
      panels: [
        { title: "קנבס", body: firstItem },
        { title: "אובייקט נבחר", body: secondItem },
        { title: "היסטוריה", body: "שינוי ראשון נשמר מקומית" },
      ],
      stateRows: [
        { label: "מצב", value: "אובייקט נבחר" },
        { label: "פעולה", value: "שינוי על הקנבס" },
        { label: "היסטוריה", value: "בטל וחזור זמינים" },
      ],
    });
  }

  if (productKindDiscovery.productPattern === "simulator-state") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "simulator-control-shell",
      frameLabel: productName,
      controls: [primaryAction, "שנה פרמטר", "הרץ תרחיש", "אפס"],
      metrics: [
        { label: "תרחיש", value: "בסיס" },
        { label: "דיוק", value: "82%" },
        { label: "תוצאה", value: "משתנה" },
      ],
      panels: [
        { title: "מצב", body: firstItem },
        { title: "שליטה", body: secondItem },
        { title: "תוצאה", body: thirdItem },
      ],
    });
  }

  if (productKindDiscovery.productPattern === "ai-tool") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "ai-tool-workbench",
      frameLabel: productName,
      controls: [primaryAction, "שנה הנחיה", "שמור תוצאה"],
      panels: [
        { title: "הנחיה", body: firstItem },
        { title: "פעולה", body: secondItem },
        { title: "תוצאה", body: "תוצאה מדומה בלי חיבור ספק חיצוני" },
      ],
    });
  }

  if (productKindDiscovery.needsClarification) {
    return withProfessionalQuality({
      ...common,
      shellFamily: "clarification-required",
      frameLabel: "צריך לדייק את המוצר",
      controls: ["ענה על שאלה", "שמור כיוון"],
      panels: productKindDiscovery.clarificationQuestions.map((question, index) => ({
        title: `שאלה ${index + 1}`,
        body: question,
      })),
    });
  }

  if (resolvedClass === "commerce-ops") {
    return withProfessionalQuality({
      ...common,
      shellFamily: "commerce-flow-preview",
      frameLabel: "תצוגת מסחר",
      lanes: [
        { title: "מוצרים", items: [firstItem, fields[0] ?? "שם מוצר", fields[1] ?? "סטטוס"] },
        { title: "הזמנות", items: [secondItem, fields[2] ?? "עדיפות", fields[3] ?? "פעולה"] },
        { title: "צעד הבא", items: [primaryAction, thirdItem] },
      ],
    });
  }

  if (resolvedClass === "internal-tool" || resolvedClass === "saas") {
    return withProfessionalQuality({
      ...common,
      shellFamily: resolvedClass === "internal-tool" ? "workspace-state-shell" : "product-workflow-shell",
      frameLabel: productName,
      metrics: [
        { label: "פתוחים", value: "12" },
        { label: "דורשים תזכורת", value: "4" },
        { label: "ממתינים לאחראי", value: "3" },
      ],
      filters: ["כל הלידים", "ללא אחראי", "תזכורת היום", "תקועים"],
      tableRows: [
        { id: "rec-1", name: "רוני כהן · שיחה נכנסת", status: "פתוח", owner: "דנה", reminder: "היום 14:00", nextStep: "לחזור עם הצעת מחיר", priority: "גבוה" },
        { id: "rec-2", name: "מאיה לוי · הודעת וואטסאפ", status: "בטיפול", owner: "יוסי", reminder: "מחר 09:30", nextStep: "לקבוע פגישה", priority: "בינוני" },
        { id: "rec-3", name: "א.מ. שירותים · טופס אתר", status: "ממתין", owner: "ללא אחראי", reminder: "היום 16:00", nextStep: "לשייך אחראי", priority: "דחוף" },
      ],
      workflowActions: [primaryAction, actions[1] ?? "עדכן סטטוס", actions[2] ?? "שנה אחראי", "קבע תזכורת"],
      rowActions: ["שייך אחראי", "קבע תזכורת", "סמן טופל"],
      columns: [
        { title: "פתוחים", items: ["רוני כהן", "א.מ. שירותים", "טלפון ללא שם"] },
        { title: "בטיפול", items: ["מאיה לוי", "עסק חדש", "בדיקת הצעה"] },
        { title: "הצעד הבא", items: ["לחזור עם הצעת מחיר", "לקבוע פגישה", "לשייך אחראי"] },
      ],
    });
  }

  return withProfessionalQuality({
    ...common,
    shellFamily: "tool-control-shell",
    frameLabel: "תצוגת כלי",
    controls: [primaryAction, actions[1] ?? "שנה מצב", actions[2] ?? "נקה פלט"].filter(Boolean),
    panels: [
      { title: "מצב", body: firstItem },
      { title: "קלט", body: fields.slice(0, 3).join(" · ") || secondItem },
      { title: "פלט", body: thirdItem },
    ],
  });
}
