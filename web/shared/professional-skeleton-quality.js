function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function count(value) {
  return normalizeArray(value).length;
}

function hasOperation(runtimeSkeleton, operationPrefix) {
  return normalizeArray(runtimeSkeleton.productDomainSkeleton?.operations)
    .some((operation) => typeof operation?.id === "string" && operation.id.startsWith(operationPrefix));
}

function createCriterion({ id, label, ok, evidence }) {
  return {
    id,
    label,
    ok: Boolean(ok),
    evidence,
  };
}

const CLASS_LABELS = {
  "mobile-app": "אפליקציה מדומה ברמת סימולטור",
  "landing-page": "דף חי מקצועי",
  "internal-tool": "משטח עבודה מקצועי",
  saas: "מוצר עבודה מקצועי",
  "commerce-ops": "זרימת מסחר מדומה",
  game: "משחק מדומה עם מצב וחוקים",
  "software-tool": "כלי תוכנה מדומה עם קלט ופלט",
  "tool-control-shell": "כלי עבודה מדומה",
  generic: "שלד לא מסווג",
};

const MARKET_STANDARD_DIMENSIONS = [
  {
    id: "instant-product-recognition",
    label: "המשתמש מבין מיד איזה מוצר נבנה",
  },
  {
    id: "dominant-live-product-canvas",
    label: "המסך המרכזי מרגיש כמו מוצר חי ולא כמו כרטיס הסבר",
  },
  {
    id: "product-class-depth",
    label: "השלד מותאם לעומק של סוג המוצר",
  },
  {
    id: "stateful-control-feedback",
    label: "כפתורים ופעולות משנים מצב נראה לעין",
  },
  {
    id: "premium-visual-hierarchy",
    label: "היררכיה, מרווחים ושפה נראים מקצועיים",
  },
  {
    id: "context-continuity",
    label: "השלד מחובר לאמת הפרויקט ולא מתחיל מחדש",
  },
  {
    id: "truthful-boundary",
    label: "המשתמש מבין מה מדומה ומה לא ייצור אמיתי",
  },
  {
    id: "learning-uplift-ready",
    label: "הלמידה יכולה להשפיע על בחירת השלד בהמשך",
  },
];

const PRODUCT_REALISM_DIMENSIONS = [
  {
    id: "real-product-first-screen",
    label: "המסך הראשון נראה כמו מוצר אמיתי",
  },
  {
    id: "class-native-composition",
    label: "הקומפוזיציה מתאימה לסוג המוצר",
  },
  {
    id: "product-specific-depth",
    label: "התוכן ספציפי לרעיון ולא גנרי",
  },
  {
    id: "hidden-internal-language",
    label: "השפה הפנימית מוסתרת מהמשתמש",
  },
  {
    id: "continuation-foundation",
    label: "אפשר להמשיך לבנות בלי עיצוב מחדש",
  },
];

function criteriaForMobile(runtimeSkeleton) {
  return [
    createCriterion({
      id: "mobile-phone-simulator-frame",
      label: "מסגרת אפליקציה עם כרום וניווט",
      ok: runtimeSkeleton.shellFamily === "mobile-simulator" && count(runtimeSkeleton.screens) >= 3,
      evidence: `${count(runtimeSkeleton.screens)} מסכים`,
    }),
    createCriterion({
      id: "mobile-real-app-state",
      label: "מצב פנימי ונתוני דוגמה",
      ok: count(runtimeSkeleton.taskRows) >= 2 && count(runtimeSkeleton.summaryRows) >= 2,
      evidence: `${count(runtimeSkeleton.taskRows)} פריטי מצב`,
    }),
    createCriterion({
      id: "mobile-domain-operations",
      label: "כפתורים מחוברים לפעולות מוצר",
      ok: hasOperation(runtimeSkeleton, "task.") && count(runtimeSkeleton.productDomainSkeleton?.operations) >= 3,
      evidence: `${count(runtimeSkeleton.productDomainSkeleton?.operations)} פעולות`,
    }),
    createCriterion({
      id: "mobile-professional-navigation",
      label: "ניווט מסכים שמרגיש כמו אפליקציה",
      ok: count(runtimeSkeleton.appTabs) >= 3 && count(runtimeSkeleton.controls) >= 2,
      evidence: `${count(runtimeSkeleton.appTabs)} אזורי ניווט`,
    }),
  ];
}

function criteriaForLanding(runtimeSkeleton) {
  const sectionKinds = normalizeArray(runtimeSkeleton.sections).map((section) => section?.kind);
  return [
    createCriterion({
      id: "landing-page-depth",
      label: "מבנה אתר עם עומק מקצועי",
      ok: count(runtimeSkeleton.sections) >= 5,
      evidence: `${count(runtimeSkeleton.sections)} אזורים`,
    }),
    createCriterion({
      id: "landing-page-conversion-flow",
      label: "קריאה לפעולה וטופס שמירת ליד",
      ok: sectionKinds.includes("hero") && sectionKinds.includes("form") && hasOperation(runtimeSkeleton, "lead."),
      evidence: sectionKinds.join(", "),
    }),
    createCriterion({
      id: "landing-page-trust",
      label: "הוכחה, אמון וערך ברור",
      ok: sectionKinds.includes("proof") && sectionKinds.includes("trust"),
      evidence: sectionKinds.join(", "),
    }),
    createCriterion({
      id: "landing-page-real-copy",
      label: "טקסט ייעודי ולא תבנית ריקה",
      ok: Boolean(runtimeSkeleton.title) && Boolean(runtimeSkeleton.subtitle) && normalizeArray(runtimeSkeleton.primaryItems).length >= 3,
      evidence: runtimeSkeleton.title ?? "",
    }),
  ];
}

function criteriaForWorkspace(runtimeSkeleton) {
  return [
    createCriterion({
      id: "workspace-density",
      label: "משטח עבודה צפוף וברור",
      ok: count(runtimeSkeleton.columns) >= 3 && count(runtimeSkeleton.tableRows) >= 2,
      evidence: `${count(runtimeSkeleton.columns)} עמודות, ${count(runtimeSkeleton.tableRows)} רשומות`,
    }),
    createCriterion({
      id: "workspace-operational-state",
      label: "סטטוס, אחראי, תזכורת וצעד הבא",
      ok: count(runtimeSkeleton.metrics) >= 3 && hasOperation(runtimeSkeleton, "record."),
      evidence: `${count(runtimeSkeleton.metrics)} מדדים`,
    }),
    createCriterion({
      id: "workspace-repeat-actions",
      label: "פעולות חוזרות למשתמש עובד",
      ok: count(runtimeSkeleton.workflowActions) >= 3 && count(runtimeSkeleton.productDomainSkeleton?.operations) >= 4,
      evidence: `${count(runtimeSkeleton.workflowActions)} פעולות`,
    }),
  ];
}

function criteriaForCommerce(runtimeSkeleton) {
  return [
    createCriterion({
      id: "commerce-flow",
      label: "זרימת מוצר, עגלה והזמנה",
      ok: count(runtimeSkeleton.lanes) >= 3 && hasOperation(runtimeSkeleton, "cart."),
      evidence: `${count(runtimeSkeleton.lanes)} אזורים`,
    }),
    createCriterion({
      id: "commerce-boundaries",
      label: "גבול ברור ללא תשלום אמיתי",
      ok: runtimeSkeleton.boundaries?.paymentExecution === false,
      evidence: "תשלום חסום",
    }),
  ];
}

function criteriaForGame(runtimeSkeleton) {
  return [
    createCriterion({
      id: "game-playable-loop",
      label: "לולאת משחק עם מצב וחוקים",
      ok: runtimeSkeleton.shellFamily === "playable-preview" && count(runtimeSkeleton.controls) >= 2 && hasOperation(runtimeSkeleton, "game."),
      evidence: `${count(runtimeSkeleton.controls)} כפתורים`,
    }),
    createCriterion({
      id: "game-hud-state",
      label: "תצוגת מצב משחק",
      ok: count(runtimeSkeleton.scene?.hud) >= 3,
      evidence: `${count(runtimeSkeleton.scene?.hud)} מדדי משחק`,
    }),
  ];
}

function criteriaForTool(runtimeSkeleton) {
  const hasToolLikeOperation = hasOperation(runtimeSkeleton, "tool.")
    || hasOperation(runtimeSkeleton, "editor.")
    || hasOperation(runtimeSkeleton, "simulator.")
    || hasOperation(runtimeSkeleton, "aiTool.");
  return [
    createCriterion({
      id: "tool-processing-flow",
      label: "כלי עם קלט, פעולה ופלט",
      ok: count(runtimeSkeleton.panels) >= 3 && hasToolLikeOperation,
      evidence: `${count(runtimeSkeleton.panels)} אזורים`,
    }),
    createCriterion({
      id: "tool-stateful-controls",
      label: "בקרות שמשנות מצב",
      ok: count(runtimeSkeleton.controls) >= 2,
      evidence: `${count(runtimeSkeleton.controls)} בקרות`,
    }),
  ];
}

function resolveCriteria(runtimeSkeleton) {
  if (runtimeSkeleton.productClass === "mobile-app") {
    return criteriaForMobile(runtimeSkeleton);
  }
  if (runtimeSkeleton.productClass === "landing-page") {
    return criteriaForLanding(runtimeSkeleton);
  }
  if (runtimeSkeleton.productClass === "internal-tool" || runtimeSkeleton.productClass === "saas") {
    return criteriaForWorkspace(runtimeSkeleton);
  }
  if (runtimeSkeleton.productClass === "commerce-ops") {
    return criteriaForCommerce(runtimeSkeleton);
  }
  if (runtimeSkeleton.productClass === "game") {
    return criteriaForGame(runtimeSkeleton);
  }
  return criteriaForTool(runtimeSkeleton);
}

function createMarketCriterion({ id, ok, evidence }) {
  const dimension = MARKET_STANDARD_DIMENSIONS.find((item) => item.id === id) ?? { id, label: id };
  return createCriterion({
    id: dimension.id,
    label: dimension.label,
    ok,
    evidence,
  });
}

function createRealismCriterion({ id, ok, evidence }) {
  const dimension = PRODUCT_REALISM_DIMENSIONS.find((item) => item.id === id) ?? { id, label: id };
  return createCriterion({
    id: dimension.id,
    label: dimension.label,
    ok,
    evidence,
  });
}

function textIncludesInternalLanguage(value) {
  const text = [
    value?.title,
    value?.subtitle,
    ...normalizeArray(value?.primaryItems),
    ...normalizeArray(value?.sections).flatMap((section) => [section?.kind, section?.title, section?.body]),
    ...normalizeArray(value?.screens).flatMap((screen) => [screen?.title, screen?.detail]),
    ...normalizeArray(value?.tableRows).flatMap((row) => [row?.name, row?.status, row?.owner, row?.reminder, row?.nextStep]),
  ].filter(Boolean).join(" ").toLowerCase();
  return /first artifact|qa|preview|benchmark|provider|backend|runtime|skeleton|task id|pro-skel|slice-|agent|mock-local|nexus\.preview/.test(text);
}

function hasProductSpecificContent(runtimeSkeleton) {
  const values = [
    runtimeSkeleton.title,
    runtimeSkeleton.subtitle,
    ...normalizeArray(runtimeSkeleton.primaryItems),
    ...normalizeArray(runtimeSkeleton.taskRows).map((row) => row?.title),
    ...normalizeArray(runtimeSkeleton.tableRows).map((row) => row?.name),
    ...normalizeArray(runtimeSkeleton.sections).map((section) => section?.title),
  ].filter(Boolean);
  const genericMatches = values.filter((value) => /הבעיה הראשונה|המשתמש המרכזי|הפעולה הראשונה|דוגמה|שלד מוצר ראשון|מוצר ראשון/.test(String(value))).length;
  return values.length >= 4 && genericMatches === 0;
}

function hasClassNativeComposition(runtimeSkeleton) {
  if (runtimeSkeleton.productClass === "mobile-app") {
    return runtimeSkeleton.shellFamily === "mobile-simulator"
      && count(runtimeSkeleton.screens) >= 3
      && count(runtimeSkeleton.appTabs) >= 3
      && count(runtimeSkeleton.quickStats) >= 2
      && count(runtimeSkeleton.taskRows) >= 3;
  }
  if (runtimeSkeleton.productClass === "landing-page") {
    const sectionKinds = normalizeArray(runtimeSkeleton.sections).map((section) => section?.kind);
    return runtimeSkeleton.shellFamily === "web-page-preview"
      && sectionKinds.includes("hero")
      && sectionKinds.includes("value")
      && sectionKinds.includes("proof")
      && sectionKinds.includes("form")
      && count(runtimeSkeleton.trustSignals) >= 2;
  }
  if (runtimeSkeleton.productClass === "internal-tool" || runtimeSkeleton.productClass === "saas") {
    return count(runtimeSkeleton.filters) >= 3
      && count(runtimeSkeleton.tableRows) >= 3
      && count(runtimeSkeleton.rowActions) >= 2
      && count(runtimeSkeleton.metrics) >= 3;
  }
  if (runtimeSkeleton.productClass === "commerce-ops") {
    return count(runtimeSkeleton.lanes) >= 3 && hasOperation(runtimeSkeleton, "cart.");
  }
  if (runtimeSkeleton.productClass === "game") {
    return runtimeSkeleton.shellFamily === "playable-preview" && count(runtimeSkeleton.scene?.hud) >= 3 && count(runtimeSkeleton.controls) >= 2;
  }
  return count(runtimeSkeleton.controls) >= 2 && (count(runtimeSkeleton.panels) >= 3 || count(runtimeSkeleton.columns) >= 3);
}

function buildProductRealisticSkeletonEnvelope(runtimeSkeleton, marketStatus) {
  const productClass = runtimeSkeleton.productClass ?? "generic";
  const hasStableTruth = Boolean(runtimeSkeleton.projectId && runtimeSkeleton.runtimeSkeletonId && runtimeSkeleton.productDomainSkeletonId);
  const criteria = [
    createRealismCriterion({
      id: "real-product-first-screen",
      ok: productClass !== "generic" && Boolean(runtimeSkeleton.title) && hasClassNativeComposition(runtimeSkeleton),
      evidence: `${productClass} · ${runtimeSkeleton.title ?? ""}`,
    }),
    createRealismCriterion({
      id: "class-native-composition",
      ok: hasClassNativeComposition(runtimeSkeleton),
      evidence: runtimeSkeleton.shellFamily ?? "",
    }),
    createRealismCriterion({
      id: "product-specific-depth",
      ok: hasProductSpecificContent(runtimeSkeleton),
      evidence: `${count(runtimeSkeleton.primaryItems)} נקודות מוצר`,
    }),
    createRealismCriterion({
      id: "hidden-internal-language",
      ok: !textIncludesInternalLanguage(runtimeSkeleton),
      evidence: "שפה פנימית לא מופיעה בתוכן השלד",
    }),
    createRealismCriterion({
      id: "continuation-foundation",
      ok: marketStatus === "pass" && hasStableTruth && hasClassNativeComposition(runtimeSkeleton),
      evidence: hasStableTruth ? "אמת פרויקט ושלד יציבה" : "חסרה אמת יציבה",
    }),
  ];
  const failedCriteria = criteria.filter((criterion) => !criterion.ok);
  const status = failedCriteria.length === 0 ? "pass" : "blocked";
  return {
    taskId: "PRO-SKEL-003",
    status,
    level: "product-realistic-composition-standard",
    criteria,
    failedCriteria: failedCriteria.map((criterion) => criterion.id),
    score: criteria.length ? Math.round(((criteria.length - failedCriteria.length) / criteria.length) * 100) : 0,
    buildContinuationAllowed: status === "pass",
    userFacingSummary: status === "pass"
      ? "נוצר בסיס מוצרי שאפשר להמשיך לבנות עליו."
      : "צריך להפוך את השלד לבסיס מוצרי אמין לפני המשך.",
  };
}

function hasProductClassDepth(runtimeSkeleton) {
  if (runtimeSkeleton.productClass === "mobile-app") {
    return count(runtimeSkeleton.screens) >= 3
      && count(runtimeSkeleton.appTabs) >= 3
      && count(runtimeSkeleton.taskRows) >= 2;
  }
  if (runtimeSkeleton.productClass === "landing-page") {
    const sectionKinds = normalizeArray(runtimeSkeleton.sections).map((section) => section?.kind);
    return count(runtimeSkeleton.sections) >= 5
      && sectionKinds.includes("hero")
      && sectionKinds.includes("form")
      && sectionKinds.includes("trust");
  }
  if (runtimeSkeleton.productClass === "internal-tool" || runtimeSkeleton.productClass === "saas") {
    return count(runtimeSkeleton.tableRows) >= 2
      && count(runtimeSkeleton.workflowActions) >= 3
      && count(runtimeSkeleton.metrics) >= 3;
  }
  if (runtimeSkeleton.productClass === "commerce-ops") {
    return count(runtimeSkeleton.lanes) >= 3 && hasOperation(runtimeSkeleton, "cart.");
  }
  if (runtimeSkeleton.productClass === "game") {
    return count(runtimeSkeleton.controls) >= 2 && count(runtimeSkeleton.scene?.hud) >= 3;
  }
  return count(runtimeSkeleton.controls) >= 2 && (count(runtimeSkeleton.panels) >= 3 || count(runtimeSkeleton.columns) >= 3);
}

function buildMarketCalibratedSkeletonEnvelope(runtimeSkeleton, professionalStatus) {
  const productClass = runtimeSkeleton.productClass ?? "generic";
  const operationCount = count(runtimeSkeleton.productDomainSkeleton?.operations);
  const hasStatefulFeedback = operationCount >= 2
    || (runtimeSkeleton.productClass === "commerce-ops" && hasOperation(runtimeSkeleton, "cart.") && count(runtimeSkeleton.lanes) >= 3)
    || (runtimeSkeleton.productClass === "landing-page" && hasOperation(runtimeSkeleton, "lead."))
    || ((runtimeSkeleton.productClass === "internal-tool" || runtimeSkeleton.productClass === "saas") && hasOperation(runtimeSkeleton, "record."))
    || (runtimeSkeleton.productClass === "game" && hasOperation(runtimeSkeleton, "game.") && count(runtimeSkeleton.controls) >= 2)
    || (runtimeSkeleton.productClass === "software-tool" && hasOperation(runtimeSkeleton, "tool.") && count(runtimeSkeleton.controls) >= 2);
  const hasIds = Boolean(
    runtimeSkeleton.projectId
      && runtimeSkeleton.runtimeSkeletonId
      && runtimeSkeleton.artifactBuildId
      && runtimeSkeleton.productDomainSkeletonId,
  );
  const criteria = [
    createMarketCriterion({
      id: "instant-product-recognition",
      ok: productClass !== "generic" && Boolean(runtimeSkeleton.title) && Boolean(runtimeSkeleton.classLabel ?? CLASS_LABELS[productClass]),
      evidence: `${productClass} · ${runtimeSkeleton.title ?? ""}`,
    }),
    createMarketCriterion({
      id: "dominant-live-product-canvas",
      ok: Boolean(runtimeSkeleton.shellFamily) && runtimeSkeleton.shellFamily !== "generic" && professionalStatus === "pass",
      evidence: runtimeSkeleton.shellFamily ?? "",
    }),
    createMarketCriterion({
      id: "product-class-depth",
      ok: hasProductClassDepth(runtimeSkeleton),
      evidence: `${productClass} עומק סוג מוצר`,
    }),
    createMarketCriterion({
      id: "stateful-control-feedback",
      ok: hasStatefulFeedback,
      evidence: `${operationCount} פעולות דומיין`,
    }),
    createMarketCriterion({
      id: "premium-visual-hierarchy",
      ok: professionalStatus === "pass" && count(runtimeSkeleton.primaryItems) >= 3,
      evidence: `${count(runtimeSkeleton.primaryItems)} נקודות ערך`,
    }),
    createMarketCriterion({
      id: "context-continuity",
      ok: hasIds,
      evidence: hasIds ? "יש מזהי פרויקט, שלד ובנייה" : "חסר מזהה אמת יציב",
    }),
    createMarketCriterion({
      id: "truthful-boundary",
      ok: runtimeSkeleton.boundaries?.productionImplementation === false
        && runtimeSkeleton.boundaries?.externalProviderConnection === false
        && Boolean(runtimeSkeleton.futureImplementationBoundary),
      evidence: runtimeSkeleton.futureImplementationBoundary ?? "",
    }),
    createMarketCriterion({
      id: "learning-uplift-ready",
      ok: hasIds && Boolean(runtimeSkeleton.productDomainSkeleton?.productDomainSkeletonId),
      evidence: runtimeSkeleton.productDomainSkeleton?.productDomainSkeletonId ?? "",
    }),
  ];
  const failedCriteria = criteria.filter((criterion) => !criterion.ok);
  const status = failedCriteria.length === 0 ? "pass" : "blocked";
  const marketEnvelope = {
    taskId: "PRO-SKEL-002",
    status,
    level: "market-calibrated-nexus-standard",
    standardSource: "official-competitor-research-2026-06-07",
    originalityBoundary: "Nexus לומדת את רף האיכות בשוק, לא מעתיקה עיצוב או מילים של מתחרים.",
    learningBoundary: "הלמידה מוכנה להשפיע על בחירת השלד דרך שכבת החלטה, בלי לעקוף את אמת המוצר.",
    criteria,
    failedCriteria: failedCriteria.map((criterion) => criterion.id),
    score: criteria.length ? Math.round(((criteria.length - failedCriteria.length) / criteria.length) * 100) : 0,
    buildContinuationAllowed: status === "pass",
    userFacingSummary: status === "pass"
      ? "השלד עומד ברף שוק מקצועי ומציג התחלה רצינית של מוצר."
      : "צריך להעלות את השלד לרף שוק לפני המשך בנייה.",
  };
  return {
    ...marketEnvelope,
    productRealisticSkeletonQuality: buildProductRealisticSkeletonEnvelope(runtimeSkeleton, status),
  };
}

export function buildProfessionalSkeletonQualityEnvelope(runtimeSkeleton = {}) {
  const safeRuntimeSkeleton = normalizeObject(runtimeSkeleton);
  const productClass = safeRuntimeSkeleton.productClass ?? "generic";
  const criteria = resolveCriteria(safeRuntimeSkeleton);
  const failedCriteria = criteria.filter((criterion) => !criterion.ok);
  const hasSpecificClass = productClass !== "generic";
  const status = hasSpecificClass && failedCriteria.length === 0 ? "pass" : "blocked";
  const score = criteria.length ? Math.round(((criteria.length - failedCriteria.length) / criteria.length) * 100) : 0;

  const marketCalibratedSkeletonQuality = buildMarketCalibratedSkeletonEnvelope({
    ...safeRuntimeSkeleton,
    productClass,
    classLabel: CLASS_LABELS[productClass] ?? CLASS_LABELS.generic,
  }, status);
  const productRealisticSkeletonQuality = marketCalibratedSkeletonQuality.productRealisticSkeletonQuality;
  const continuationAllowed = status === "pass"
    && marketCalibratedSkeletonQuality.status === "pass"
    && productRealisticSkeletonQuality?.status === "pass";

  return {
    taskId: "PRO-SKEL-001",
    status,
    level: "professional-product-grade",
    productClass,
    classLabel: CLASS_LABELS[productClass] ?? CLASS_LABELS.generic,
    score,
    criteria,
    failedCriteria: failedCriteria.map((criterion) => criterion.id),
    marketCalibratedSkeletonQuality,
    productRealisticSkeletonQuality,
    buildContinuationAllowed: continuationAllowed,
    userFacingSummary: continuationAllowed
      ? "השלד עומד ברף מקצועי ראשון ואפשר להמשיך לעבוד עליו."
      : "צריך לחזק את השלד לפני שממשיכים לבנות עליו.",
    blockedReason: continuationAllowed
      ? ""
      : "השלד לא עומד עדיין ברף מוצרי אמין לפי סוג המוצר.",
  };
}
