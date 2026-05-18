function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeInternalToolCopy(value, fallback = "") {
  const normalized = normalizeString(value, fallback);
  if (!normalized) {
    return normalized;
  }

  return normalized
    .replace(/\binternal tool\b/gi, "כלי פנימי")
    .replace(/\bworkspace\b/gi, "משטח עבודה")
    .replace(/\bqueue\b/gi, "תור")
    .replace(/\bowner(ship)?\b/gi, (match) => (/ownership/i.test(match) ? "בעלות" : "אחראי"))
    .replace(/\bapprovals?\b/gi, "אישורים")
    .replace(/\bSLA\b/g, "רמת שירות");
}

function normalizeTaskNarrative(value, fallback = "") {
  const normalized = normalizeObject(value);
  return normalizeString(
    normalized.summary
      ?? normalized.title
      ?? normalized.message
      ?? normalized.label
      ?? normalized.reason
      ?? value,
    fallback,
  );
}

function buildArtifactAlignedNarrative(rawValue, artifactTitle = "", fallback = "") {
  const narrative = normalizeString(rawValue, "");
  const title = normalizeString(artifactTitle, "");
  if (!narrative) {
    return fallback;
  }
  if (/^(להקים|לבנות|לקדם)\s/i.test(narrative) && title) {
    return fallback || `מחדדים עכשיו את ${title}`;
  }
  return narrative;
}

function readProjectField(project, key) {
  const safeProject = normalizeObject(project);
  return safeProject[key] ?? safeProject.context?.[key] ?? null;
}

function resolveArtifactExpectation(project = null, explicitExpectation = null) {
  const expectation = normalizeObject(explicitExpectation);
  if (expectation.expectationId) {
    return expectation;
  }

  const safeProject = normalizeObject(project);
  const directExpectation = normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation,
  );

  return directExpectation;
}

function resolveRepeatedLoopIncrement(project = null, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = normalizeObject(expectation);
  const repeatedLoopContinuation = normalizeObject(
    safeProject.repeatedLoopContinuation
      ?? safeProject.state?.repeatedLoopContinuation
      ?? safeProject.context?.repeatedLoopContinuation,
  );
  if (repeatedLoopContinuation.proofIncrement) {
    return normalizeObject(repeatedLoopContinuation.proofIncrement);
  }
  const approvalRecords = normalizeArray(safeProject.approvalRecords ?? safeProject.context?.approvalRecords);
  const approvedRecords = approvalRecords.filter((record) => {
    const status = normalizeString(record?.status ?? record?.decision, "").toLowerCase();
    return status === "approved";
  });
  if (!approvedRecords.length) {
    return null;
  }

  const roadmap = normalizeArray(safeProject.cycle?.roadmap);
  const activeTask = roadmap.find((task) => task?.status === "assigned")
    ?? roadmap.find((task) => task?.status === "ready")
    ?? null;
  const blockedTask = roadmap.find((task) => task?.status === "blocked") ?? null;
  const completedTask = normalizeArray(safeProject.taskResults)
    .filter((task) => normalizeString(task?.status, "").toLowerCase() === "completed")
    .at(-1) ?? null;
  const artifactTitle = normalizeString(normalizedExpectation.title, normalizeString(safeProject.name, "התוצר"));
  const iterationNumber = approvedRecords.length + 1;
  const currentTask = normalizeTaskNarrative(activeTask, "");
  const lastCompleted = normalizeTaskNarrative(completedTask?.output, normalizeTaskNarrative(completedTask, ""));
  const blockedSummary = normalizeTaskNarrative(blockedTask, "");

  if (!currentTask && !lastCompleted && !blockedSummary) {
    return {
      iterationNumber,
      title: `סבב ${iterationNumber} נפתח על ${artifactTitle}`,
      statusLine: `הסבב הבא של ${artifactTitle} נפתח אחרי האישור האחרון`,
      reason: `התוצר שאושר עבר עכשיו מסקיצה ראשונה לסבב המשך שמקדם אותו מעבר לטיוטה הראשונית.`,
      highlights: [
        `ה־approval האחרון פתח סבב חדש על ${artifactTitle}.`,
        "המערכת שומרת על אותו artifact, אבל ממשיכה לקדם אותו במקום להתחיל מחדש.",
      ],
    };
  }

  return {
    iterationNumber,
    title: currentTask || `סבב ${iterationNumber} נפתח על ${artifactTitle}`,
    statusLine: currentTask
      ? `סבב ${iterationNumber} מקדם עכשיו: ${currentTask}`
      : `הסבב הבא של ${artifactTitle} נפתח אחרי האישור האחרון`,
    reason: blockedSummary
      ? `המערכת זיהתה שהסבב הבא תלוי קודם ב: ${blockedSummary}.`
      : lastCompleted
        ? `הסבב החדש ממשיך ישירות מהצעד שהסתיים: ${lastCompleted}.`
        : `האישור האחרון פתח סבב המשך אמיתי על ${artifactTitle}.`,
    highlights: [
      currentTask ? `מה מתקדם עכשיו: ${currentTask}` : null,
      lastCompleted ? `מה כבר נסגר לפניו: ${lastCompleted}` : null,
      blockedSummary ? `מה עדיין מחכה להיפתר: ${blockedSummary}` : null,
    ].filter(Boolean),
  };
}

function buildKeywordBlob(project) {
  const safeProject = normalizeObject(project);
  const answers = normalizeObject(
    safeProject.projectDraft?.state?.knowledge?.onboardingConversationAnswers
      ?? safeProject.state?.knowledge?.onboardingConversationAnswers,
  );

  return [
    safeProject.name,
    safeProject.goal,
    answers["target-audience"],
    answers["core-problem"],
    answers["successful-solution"],
  ]
    .map((value) => normalizeString(value, ""))
    .join(" ")
    .toLowerCase();
}

function isFollowUpStyleProject(project) {
  const blob = buildKeywordBlob(project);
  return /follow-?up|reminder|client|customer|proposal|pipeline|crm|מעקב|תזכורת|לקוחות|לקוח|הצעה/.test(blob);
}

function isInternalToolStyleProject(project) {
  const blob = buildKeywordBlob(project);
  return /internal|ops|operations|workflow|queue|ticket|backoffice|back-office|service desk|support desk|team tool|requests|approval flow|תפעול|פנימי|וורקפלואו|workflow|בקשות|תור|כרטיסיות|צוות/.test(blob);
}

function isCommerceOpsStyleProject(project) {
  const blob = buildKeywordBlob(project);
  return /ecommerce|commerce|shop|store|catalog|checkout|cart|orders?|inventory|merchant|fulfillment|קטלוג|הזמנות|מלאי|מסחר/.test(blob);
}

function isMobileAppStyleProject(project) {
  const blob = buildKeywordBlob(project);
  return /mobile app|native app|ios app|android app|ios|android|mobile flow|mobile experience|in-app|מובייל|אפליקציית מובייל|אפליקציה לנייד|אפליקציה/.test(blob);
}

function normalizeMobileScreenDisplay(screen = null, index = 0) {
  const normalizedScreen = normalizeObject(screen);
  const rawTitle = normalizeString(normalizedScreen.title, "");
  const rawType = normalizeString(normalizedScreen.screenType, "mobile-screen");
  const rawTitleLower = rawTitle.toLowerCase();
  const looksInternal = /(onboarding|project intake|handoff|initial project state|required onboarding|capture-intake|wizard)/i.test(rawTitleLower);
  const fallbackCards = [
    {
      title: "היום שלי",
      screenType: "home",
      description: "מסך פתיחה שמסכם מה קורה היום, מה דחוף, ומה צריך לאשר עכשיו.",
    },
    {
      title: "פרטי המשימה הקרובה",
      screenType: "detail",
      description: "מסך שמבהיר את הפעולה הבאה, מי אחראי עליה, ואיך מאשרים אותה במהירות.",
    },
    {
      title: "אישור מהיר",
      screenType: "action",
      description: "צעד קצר שבו ההורה מאשר, דוחה, או מעדכן את הפעולה הבאה בלי לצאת מהזרימה.",
    },
    {
      title: "סיכום ועדכון",
      screenType: "summary",
      description: "המסך שסוגר את הפעולה ומראה מה עוד נשאר פתוח אחרי האישור.",
    },
  ];
  const fallback = fallbackCards[index] ?? fallbackCards[fallbackCards.length - 1];

  return {
    title: looksInternal ? fallback.title : normalizeString(rawTitle, fallback.title),
    screenType: looksInternal ? fallback.screenType : rawType,
    description: fallback.description,
    usedFallback: looksInternal || !rawTitle,
  };
}

function buildFollowUpArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const repeatedLoopIncrement = resolveRepeatedLoopIncrement(project, normalizedExpectation);
  const answers = normalizeObject(
    safeProject.projectDraft?.state?.knowledge?.onboardingConversationAnswers
      ?? safeProject.state?.knowledge?.onboardingConversationAnswers,
  );
  const roadmap = normalizeArray(safeProject.cycle?.roadmap);
  const activeTask = roadmap.find((task) => task?.status === "assigned") ?? roadmap[0] ?? null;
  const problem = normalizeString(
    answers["core-problem"],
    "ללקוחות נופלים follow-ups ואין מעקב ברור אחרי ההזדמנויות הפתוחות.",
  );
  const solution = normalizeString(
    answers["successful-solution"],
    "לוח follow-up פשוט עם תזכורות אוטומטיות והמלצה מה לעשות עכשיו.",
  );
  const artifactTitle = normalizeString(
    normalizedExpectation.title,
    `${normalizeString(safeProject.name, "Follow-up Reminder")} dashboard`,
  );
  const artifactProgressLine = buildArtifactAlignedNarrative(
    repeatedLoopIncrement?.statusLine ?? activeTask?.summary,
    artifactTitle,
    `מחדדים עכשיו את ${artifactTitle}`,
  );

  return {
    kind: "followup-dashboard",
    eyebrow: "תצוגת המוצר",
    title: artifactTitle,
    subtitle: normalizeString(normalizedExpectation.summary, solution),
    statusLine: artifactProgressLine,
    stats: [
      { label: "לקוחות למעקב", value: "3" },
      { label: "מעקבים היום", value: "2" },
      { label: "עדיפות גבוהה", value: "1" },
    ],
    clients: [
      { name: "דנה כהן", company: "Studio Dana", lastTouch: "לפני 5 ימים", status: "צריך מעקב", priority: "גבוהה" },
      { name: "אורי לוי", company: "Levi Ops", lastTouch: "אתמול", status: "ממתין", priority: "בינונית" },
      { name: "מיכל שחר", company: "Shahar Design", lastTouch: "היום", status: "סגור", priority: "נמוכה" },
    ],
    nextAction: {
      title: "שלח הודעת המשך לדנה",
      reason: normalizeString(normalizedExpectation.problem, problem),
      recommendation: buildArtifactAlignedNarrative(
        activeTask?.summary,
        artifactTitle,
        "מומלץ לשלוח היום הודעת המשך אחת ברורה",
      ),
    },
    generatedMessage: {
      label: "הודעה מוכנה לשליחה",
      body: "היי דנה, רק רציתי לבדוק אם יצא לך לעבור על ההצעה. אשמח לדעת אם יש שאלות פתוחות או אם נוח לקבוע המשך השבוע.",
    },
    increment: repeatedLoopIncrement,
    controls: [
      "העתק הודעה",
      "סמן כטופל",
      "הזכר לי אחר כך",
      "נסח גרסה נוספת",
    ],
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

function buildGeneratedSurfaceArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const regions = normalizeArray(preview.regions).map((region) => ({
    slot: normalizeString(region.slot, "section"),
    component: normalizeString(region.component, "panel"),
    approved: region.isApproved !== false,
  }));
  const ctas = normalizeArray(preview.ctaAnchors)
    .filter((cta) => cta?.isVisible !== false)
    .map((cta) => normalizeString(cta.label, "Action"))
    .filter(Boolean);

  return {
    kind: "generated-surface",
    eyebrow: "תצוגת מוצר",
    title: normalizeString(normalizedExpectation.title, normalizeString(preview.screenId, normalizeString(safeProject.name, "התוצר הראשוני"))),
    subtitle: normalizeString(
      normalizedExpectation.summary,
      "נבנתה כאן תצוגת מוצר ראשונית מתוך מה שסגרנו עד עכשיו.",
    ),
    statusLine: normalizeString(normalizedExpectation.continuityLine, `${regions.length} חלקים גלויים כבר בתוצר`),
    regions,
    ctas,
    tokens: normalizeObject(preview.tokens),
    expectation: normalizedExpectation,
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

function buildLandingPageArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const repeatedLoopIncrement = resolveRepeatedLoopIncrement(project, normalizedExpectation);
  const genericPositioningFallbacks = new Set([
    "Focused digital product",
    "Structured publishing product",
    "Mobile-first product experience",
    "SaaS product with activation and retention focus",
    "Operations system for client delivery",
  ]);
  const messagingFramework = normalizeObject(readProjectField(project, "messagingFramework"));
  const landingVariantDecision = normalizeObject(readProjectField(project, "landingVariantDecision"));
  const websiteCopyPack = normalizeObject(readProjectField(project, "websiteCopyPack"));
  const landingPageIa = normalizeObject(readProjectField(project, "landingPageIa"));
  const trustProofBlocks = normalizeObject(readProjectField(project, "trustProofBlocks"));
  const productCtaStrategy = normalizeObject(readProjectField(project, "productCtaStrategy"));

  const heroCopy = normalizeArray(websiteCopyPack.pageCopy).find((entry) => entry?.sectionId === "section:hero") ?? null;
  const valueCopy = normalizeArray(websiteCopyPack.pageCopy).find((entry) => entry?.sectionId === "section:value-props") ?? null;
  const primaryCta = normalizeObject(websiteCopyPack.primaryCta ?? productCtaStrategy.primaryCta);
  const secondaryCtas = normalizeArray(productCtaStrategy.secondaryCtas)
    .slice(0, 2)
    .map((cta) => normalizeString(cta?.label, ""))
    .filter(Boolean);
  const proofBlocks = normalizeArray(trustProofBlocks.blocks)
    .slice(0, 3)
    .map((block) => ({
      title: normalizeString(block?.title, "Trust proof"),
      body: normalizeString(block?.body, "נבנה כאן בלוק אמון שתומך בהחלטה של המבקר."),
    }));
  const sectionCards = normalizeArray(landingPageIa.sections)
    .slice(0, 4)
    .map((section) => ({
      title: normalizeString(section?.title, "Landing section"),
      intent: normalizeString(section?.intent, "המסך שומר על רצף ברור עד ה־CTA."),
    }));
  const valueProps = normalizeArray(messagingFramework.valueProps)
    .slice(0, 3)
    .map((entry) => normalizeString(entry?.label, ""))
    .filter(Boolean);
  const faqEntries = normalizeArray(websiteCopyPack.faqEntries)
    .slice(0, 2)
    .map((entry) => ({
      question: normalizeString(entry?.question, "למה זה שונה?"),
      answer: normalizeString(entry?.answer, normalizeString(entry?.response, "כי המסלול הזה בנוי סביב הוכחת אמון ופעולה אחת ברורה.")),
    }));
  const audience = normalizeString(
    normalizedExpectation.audience,
    normalizeString(landingVariantDecision.audienceLabel, normalizeString(messagingFramework.audience, "מבקרים עם צורך דחוף וברור")),
  );
  let headline = normalizeString(
    landingVariantDecision.headline,
    normalizeString(heroCopy?.title, normalizeString(messagingFramework.headline, normalizedExpectation.title)),
  );
  if (genericPositioningFallbacks.has(headline)) {
    headline = normalizeString(
      normalizedExpectation.problem,
      normalizeString(normalizedExpectation.summary, normalizeString(normalizedExpectation.title, "כותרת ראשית ברורה")),
    );
  }
  const subheadline = normalizeString(
    landingVariantDecision.subheadline,
    normalizeString(heroCopy?.body, normalizeString(messagingFramework.subheadline, normalizedExpectation.summary)),
  );
  const primaryLabel = normalizeString(primaryCta.label, normalizeString(heroCopy?.ctaLabel, "השאר פרטים"));

  return {
    kind: "landing-page",
    eyebrow: "Landing page preview",
    title: normalizeString(normalizedExpectation.title, `${normalizeString(safeProject.name, "Landing")} landing page`),
    subtitle: normalizeString(normalizedExpectation.summary, subheadline),
    statusLine: repeatedLoopIncrement?.statusLine ?? "דף הנחיתה מוכן לבדיקה עם הבטחה, אמון ו־CTA ברור",
    audience,
    headline,
    subheadline,
    primaryCta: {
      label: primaryLabel,
      reason: normalizeString(primaryCta.reason, "ה־CTA המרכזי מחובר ישירות לצעד ההפעלה הראשון."),
    },
    secondaryCtas,
    valueProps: valueProps.length
      ? valueProps
      : [
          "הבטחה ברורה כבר מעל הקפל",
          "הוכחת אמון שתומכת בהחלטה",
          "פעולה אחת שקל להבין מיד",
        ],
    sectionCards: sectionCards.length
      ? sectionCards
      : [
          { title: "כותרת ראשית", intent: "לפתוח בהבטחה חדה שמסבירה מה מקבלים מיד." },
          { title: "אזור אמון", intent: "לחזק את ההחלטה עם בלוק אמון אחד ברור." },
          { title: "כפתור פעולה", intent: "לסגור את המסך עם פעולה אחת שקל לבחור." },
        ],
    proofBlocks: proofBlocks.length
      ? proofBlocks
      : [
          { title: "הבטחה חדה", body: "המבקר צריך להבין בתוך שניות למה הדף הזה רלוונטי עבורו." },
          { title: "אמון בלי רעש", body: "בלוק ההוכחה צריך להוריד סיכון לפני הלחיצה." },
          { title: "CTA אחד ברור", body: "המסך מכוון לפעולה אחת שמחוברת ישירות ל־onboarding." },
        ],
    faqEntries,
    increment: repeatedLoopIncrement,
    insight: normalizeString(
      normalizedExpectation.continuityLine,
      `הדף נבנה עבור ${audience}, כדי להפוך את ${normalizeString(normalizedExpectation.problem, "הכאב המרכזי")} להבטחה שקל להבין וקל לפעול עליה.`,
    ),
    stats: [
      { label: "בלוקי אמון", value: String(proofBlocks.length || 3) },
      { label: "מסרי ערך", value: String(valueProps.length || 3) },
      { label: "CTA מרכזי", value: primaryLabel ? "1" : "0" },
    ],
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

function buildMobileAppArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const repeatedLoopIncrement = resolveRepeatedLoopIncrement(project, normalizedExpectation);
  const expectationIsMobile = normalizedExpectation.projectType === "mobile-app";
  const screenInventory = normalizeObject(readProjectField(project, "screenInventory"));
  const screenFlowMap = normalizeObject(readProjectField(project, "screenFlowMap"));
  const mobileChecklist = normalizeObject(readProjectField(project, "mobileChecklist"));
  const screenStates = normalizeObject(readProjectField(project, "screenStates"));
  const remoteMacRunner = normalizeObject(readProjectField(project, "remoteMacRunner"));

  const screens = normalizeArray(screenInventory.screens);
  const checklistScreens = normalizeArray(mobileChecklist.screens);
  const stateScreens = normalizeArray(screenStates.screens);
  const flowEntries = normalizeArray(screenFlowMap.flows ?? screenFlowMap.screens ?? screenFlowMap.entries);
  const primaryScreens = screens.slice(0, 4).map((screen, index) => {
    const screenId = normalizeString(screen.screenId, `screen-${index + 1}`);
    const checklist = checklistScreens.find((item) => item?.screenId === screenId) ?? null;
    const stateDefinition = stateScreens.find((item) => item?.screenId === screenId) ?? null;
    const states = normalizeObject(stateDefinition?.states);
    const enabledStates = ["loading", "empty", "error", "success"]
      .filter((stateKey) => states[stateKey]?.enabled)
      .map((stateKey) => stateKey);
    const display = normalizeMobileScreenDisplay(screen, index);

    return {
      screenId,
      title: display.title,
      screenType: display.screenType,
      productDescription: display.description,
      mobileReady: checklist?.summary?.mobileReadyByContract !== false,
      requiredItems: checklist?.summary?.requiredItems ?? 0,
      enabledStates,
    };
  });
  const releasePath = normalizeString(
    remoteMacRunner.appleBuildConfig?.archive?.artifactPath,
    "artifacts/ios/app.ipa",
  );
  const audience = normalizeString(
    normalizedExpectation.audience,
    "הורה עסוק שצריך להבין מה קורה היום בלי לחפש בין הודעות ותזכורות",
  );
  const firstScreen = primaryScreens[0] ?? {
    title: "Home",
    screenType: "dashboard",
    mobileReady: true,
    requiredItems: 0,
    enabledStates: ["loading", "success"],
  };
  const nextScreen = primaryScreens[1] ?? firstScreen;

  return {
    kind: "mobile-app",
    eyebrow: "Mobile app preview",
    title: expectationIsMobile
      ? normalizeString(normalizedExpectation.title, `${normalizeString(safeProject.name, "Mobile Flow")} mobile flow`)
      : `${normalizeString(safeProject.name, "Mobile Flow")} mobile flow`,
    subtitle: expectationIsMobile
      ? normalizeString(normalizedExpectation.summary, "זרימת מובייל ברורה עם מסך ראשון, פעולה ראשונה, ומעבר נקי להמשך.")
      : "זרימת מובייל ברורה עם מסך ראשון, פעולה ראשונה, ומעבר נקי להמשך.",
    statusLine: repeatedLoopIncrement?.statusLine ?? "האפליקציה מוכנה לבדיקה עם מסך ראשון, פעולה ראשונה ונתיב שחרור ברור",
    audience,
    firstScreen: {
      title: firstScreen.title,
      screenType: firstScreen.screenType,
      summary: normalizeString(
        normalizedExpectation.problem,
        "המסך הראשון צריך להוריד עומס ולרכז את מה שהמשתמש באמת צריך לראות עכשיו.",
      ),
      mobileReady: firstScreen.mobileReady,
      states: firstScreen.enabledStates,
    },
    firstAction: {
      title: normalizeString(
        normalizedExpectation.solution,
        "אישור מהיר של התוכנית להיום והפעלת התזכורת הבאה בלחיצה אחת",
      ),
      reason: normalizeString(
        normalizedExpectation.problem,
        "המשתמש צריך להבין מיד מה הצעד הבא שלו בלי לקפוץ בין כלים שונים.",
      ),
      followThrough: repeatedLoopIncrement?.title
        ? `${repeatedLoopIncrement.title} — ומשם הזרימה ממשיכה ל-${normalizeString(nextScreen.title, "המסך הבא")} בלי לאבד הקשר.`
        : `אחרי הפעולה הראשונה הזרימה ממשיכה ל-${normalizeString(nextScreen.title, "המסך הבא")} בלי לאבד הקשר.`,
    },
      screens: primaryScreens.map((screen) => ({
      title: screen.title,
      screenType: screen.screenType,
      meta: screen.mobileReady ? "mobile-ready by contract" : "דורש hardening",
      description: screen.requiredItems > 0
        ? `${screen.productDescription} ${screen.requiredItems} פריטי readiness נשמרו למסך הזה.`
        : `${screen.productDescription} המסך הזה כבר מוכן להצגה כחלק מהזרימה הראשונה.`,
    })),
    stats: [
      { label: "מסכים בזרימה", value: String(screenInventory.summary?.totalScreens ?? primaryScreens.length ?? 1) },
      { label: "מסכים מוכנים לנייד", value: String(mobileChecklist.summary?.mobileReadyScreens ?? primaryScreens.filter((screen) => screen.mobileReady).length) },
      { label: "מצבי UX מכוסים", value: String(screenStates.summary?.successScreens ?? primaryScreens.filter((screen) => screen.enabledStates.includes("success")).length ?? 1) },
    ],
    release: {
      label: "נתיב השחרור שנשמר",
      platform: normalizeString(remoteMacRunner.appleBuildConfig?.platform, "ios"),
      artifactPath: releasePath,
      exportMethod: normalizeString(remoteMacRunner.appleBuildConfig?.archive?.exportMethod, "app-store"),
    },
    continuity: {
      nextScreenTitle: normalizeString(nextScreen.title, "המסך הבא"),
      nextScreenStates: normalizeArray(nextScreen.enabledStates),
      flowCount: flowEntries.length || Math.max(primaryScreens.length - 1, 1),
    },
    increment: repeatedLoopIncrement,
    insight: normalizeString(
      normalizedExpectation.continuityLine,
      `הזרימה נבנתה עבור ${audience}, כדי להראות כבר ב־Proof מה המשתמש פוגש ראשון, מה הוא עושה קודם, ואיך המובייל ממשיך קדימה בלי בלבול.`,
    ),
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

function buildInternalToolArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const repeatedLoopIncrement = resolveRepeatedLoopIncrement(project, normalizedExpectation);
  const answers = normalizeObject(
    safeProject.projectDraft?.state?.knowledge?.onboardingConversationAnswers
      ?? safeProject.state?.knowledge?.onboardingConversationAnswers,
  );
  const roadmap = normalizeArray(safeProject.cycle?.roadmap);
  const activeTask = roadmap.find((task) => task?.status === "assigned") ?? roadmap[0] ?? null;
  const audience = normalizeString(
    answers["target-audience"],
    "צוותים פנימיים שצריכים תור עבודה ברור",
  );
  const problem = normalizeString(
    answers["core-problem"],
    "בקשות פתוחות נופלות בין הצוותים ואין בעלות ברורה על הטיפול.",
  );
  const solution = normalizeString(
    answers["successful-solution"],
    "לוח פנימי שמרכז תור בקשות, אחריות, SLA ופעולה הבאה לכל בקשה.",
  );
  const sanitizedAudience = normalizeInternalToolCopy(audience, "צוותים פנימיים שצריכים תור עבודה ברור");
  const sanitizedProblem = normalizeInternalToolCopy(problem, "בקשות פתוחות נופלות בין הצוותים ואין בעלות ברורה על הטיפול.");
  const sanitizedSolution = normalizeInternalToolCopy(solution, "לוח פנימי שמרכז תור בקשות, אחריות, רמת שירות ופעולה הבאה לכל בקשה.");
  const sanitizedTitle = normalizeInternalToolCopy(
    normalizeString(normalizedExpectation.title, `${normalizeString(safeProject.name, "Ops Queue")} משטח עבודה`),
    `${normalizeString(safeProject.name, "Ops Queue")} משטח עבודה`,
  );
  const sanitizedSummary = normalizeInternalToolCopy(
    normalizeString(normalizedExpectation.summary, sanitizedSolution),
    sanitizedSolution,
  );
  const sanitizedStatusLine = normalizeInternalToolCopy(
    repeatedLoopIncrement?.statusLine ?? "תור העבודה מוכן לבדיקה עם בעלות, רמת שירות ופעולה הבאה",
    "תור העבודה מוכן לבדיקה עם בעלות, רמת שירות ופעולה הבאה",
  );
  const sanitizedExpectationProblem = normalizeInternalToolCopy(
    normalizeString(normalizedExpectation.problem, sanitizedProblem),
    sanitizedProblem,
  );
  const sanitizedContinuity = normalizeInternalToolCopy(
    normalizeString(
      normalizedExpectation.continuityLine,
      `המסך נבנה עבור ${sanitizedAudience}, כדי להוריד את הבלבול סביב ${sanitizedProblem}`,
    ),
    `המסך נבנה עבור ${sanitizedAudience}, כדי להוריד את הבלבול סביב ${sanitizedProblem}`,
  );

  return {
    kind: "internal-ops-dashboard",
    eyebrow: "תצוגת כלי פנימי",
    title: sanitizedTitle,
    subtitle: sanitizedSummary,
    statusLine: sanitizedStatusLine,
    stats: [
      { label: "בקשות פתוחות", value: "12" },
      { label: "דורש טיפול היום", value: "4" },
      { label: "בעלי משימה פעילים", value: "3" },
    ],
    audience: sanitizedAudience,
    queueColumns: [
      {
        title: "חדש",
        items: [
          { title: "פתיחת גישה לספק חדש", owner: "רוני", sla: "היום", priority: "גבוהה" },
          { title: "עדכון תהליך קליטה", owner: "דנה", sla: "מחר", priority: "בינונית" },
        ],
      },
      {
        title: "בטיפול",
        items: [
          { title: "מיפוי בקשות שירות פתוחות", owner: "אורי", sla: "היום", priority: "גבוהה" },
          { title: "איחוד טפסי קליטה", owner: "מיכל", sla: "מחרתיים", priority: "נמוכה" },
        ],
      },
      {
        title: "ממתין לאישור",
        items: [
          { title: "אישור רמת שירות חדשה לצוות", owner: "נועה", sla: "מחכה למנהל", priority: "בינונית" },
        ],
      },
    ],
    nextAction: {
      title: "לקבע בעלות ולסגור צוואר בקבוק אחד",
      reason: sanitizedExpectationProblem,
      recommendation: "להקצות אחראי ברור לבקשה הדחופה ביותר ולסגור יעד רמת שירות אחד עוד היום.",
    },
    controlStrip: [
      "בקשה חדשה",
      "שיוך אחראי",
      "סימון כהושלם",
      "הקפצת רמת שירות",
    ],
    increment: repeatedLoopIncrement,
    insight: sanitizedContinuity,
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

function buildCommerceOpsArtifactModel(project, proof, preview, expectation = null) {
  const safeProject = normalizeObject(project);
  const normalizedExpectation = resolveArtifactExpectation(project, expectation);
  const repeatedLoopIncrement = resolveRepeatedLoopIncrement(project, normalizedExpectation);
  const answers = normalizeObject(
    safeProject.projectDraft?.state?.knowledge?.onboardingConversationAnswers
      ?? safeProject.state?.knowledge?.onboardingConversationAnswers,
  );
  const audience = normalizeString(
    answers["target-audience"],
    "צוות מסחר ותפעול שמחזיק קטלוג, הזמנות ומלאי בכל יום",
  );
  const problem = normalizeString(
    answers["core-problem"],
    "הזמנות, מלאי ותוכן לא נפגשים באותו flow ולכן הטיפול נמרח ונופל בין בעלי תפקידים.",
  );
  const solution = normalizeString(
    answers["successful-solution"],
    "מרכז מסחר אחד שמראה הזמנות דחופות, חריגות קטלוג, בעלות ופעולה הבאה לכל נציג.",
  );

  return {
    kind: "commerce-ops-dashboard",
    eyebrow: "תצוגת מסחר ותפעול",
    title: normalizeString(normalizedExpectation.title, `${normalizeString(safeProject.name, "Commerce Ops")} command center`),
    subtitle: normalizeString(normalizedExpectation.summary, solution),
    statusLine: repeatedLoopIncrement?.statusLine ?? "מרכז המסחר מוכן לבדיקה עם הזמנות, קטלוג ופעולה הבאה במקום אחד",
    stats: [
      { label: "הזמנות דחופות", value: "5" },
      { label: "חריגות קטלוג", value: "3" },
      { label: "פריטי מלאי בסיכון", value: "2" },
    ],
    audience,
    queueColumns: [
      {
        title: "הזמנות לטיפול",
        items: [
          { title: "אימות כתובת למשלוח מהיר", owner: "רוני", sla: "היום", priority: "גבוהה" },
          { title: "בדיקת תשלום שנכשל", owner: "דנה", sla: "היום", priority: "גבוהה" },
        ],
      },
      {
        title: "קטלוג ומלאי",
        items: [
          { title: "מוצר חסר תמונה בקטלוג", owner: "מיכל", sla: "מחר", priority: "בינונית" },
          { title: "SKU עם מלאי שלילי", owner: "אורי", sla: "היום", priority: "גבוהה" },
        ],
      },
      {
        title: "ממתין להכרעה",
        items: [
          { title: "אישור מבצע לפריט רגיש", owner: "נועה", sla: "מחכה למנהל", priority: "בינונית" },
        ],
      },
    ],
    nextAction: {
      title: "לנעול owner על ההזמנה הדחופה ולסגור חריגת קטלוג אחת עוד היום",
      reason: normalizeString(normalizedExpectation.problem, problem),
      recommendation: "להקצות owner ברור להזמנה הקריטית ולסגור חריגת קטלוג אחת שמשפיעה על המכירה.",
    },
    controlStrip: [
      "הזמנה חדשה",
      "עדכון קטלוג",
      "שיוך owner",
      "סימון כטופל",
    ],
    increment: repeatedLoopIncrement,
    insight: normalizeString(
      normalizedExpectation.continuityLine,
      `המסך נבנה עבור ${audience}, כדי לסדר את ${problem}`,
    ),
    proofMeta: {
      previewable: proof.evidence?.isPreviewable === true,
      regionCount: preview.meta?.regionCount ?? proof.evidence?.regionCount ?? 0,
    },
  };
}

export function buildCanonicalProofArtifact({
  project = null,
  previewScreenViewModel = null,
  generatedSurfaceProofSchema = null,
  aiControlCenterSurface = null,
  proposalApplyDecision = null,
  artifactExpectation = null,
} = {}) {
  const safeProject = normalizeObject(project);
  const preview = normalizeObject(previewScreenViewModel);
  const proof = normalizeObject(generatedSurfaceProofSchema);
  const controlCenter = normalizeObject(aiControlCenterSurface);
  const applyDecision = normalizeObject(proposalApplyDecision);
  const expectation = resolveArtifactExpectation(safeProject, artifactExpectation);
  const previewKind = normalizeString(expectation.proofArtifactType, "")
    || (isMobileAppStyleProject(safeProject)
      ? "mobile-app"
      : isFollowUpStyleProject(safeProject)
      ? "followup-dashboard"
      : expectation.projectType === "commerce-ops" || isCommerceOpsStyleProject(safeProject)
        ? "commerce-ops-dashboard"
      : isInternalToolStyleProject(safeProject)
        ? "internal-ops-dashboard"
        : expectation.projectType === "landing-page"
          ? "landing-page"
        : expectation.projectType === "mobile-app"
          ? "mobile-app"
        : "generated-surface");
  const renderModel = previewKind === "followup-dashboard"
    ? buildFollowUpArtifactModel(safeProject, proof, preview, expectation)
    : previewKind === "commerce-ops-dashboard"
      ? buildCommerceOpsArtifactModel(safeProject, proof, preview, expectation)
      : previewKind === "internal-ops-dashboard"
      ? buildInternalToolArtifactModel(safeProject, proof, preview, expectation)
      : previewKind === "landing-page"
        ? buildLandingPageArtifactModel(safeProject, proof, preview, expectation)
      : previewKind === "mobile-app"
        ? buildMobileAppArtifactModel(safeProject, proof, preview, expectation)
      : buildGeneratedSurfaceArtifactModel(safeProject, proof, preview, expectation);

  return {
    artifactId: normalizeString(proof.proofId, `proof-artifact:${normalizeString(safeProject.id, "project")}`),
    artifactType: previewKind,
    title: renderModel.title,
    status: normalizeString(proof.summary?.proofStatus, "ready"),
    previewKind,
    previewPayload: renderModel,
    artifactExpectation: expectation.expectationId ? expectation : null,
    actions: {
      open: {
        supported: Boolean(renderModel.kind),
        label: "פתח את התוצר",
        routeKey: "artifact",
        artifactId: normalizeString(proof.proofId, `proof-artifact:${normalizeString(safeProject.id, "project")}`),
      },
      download: {
        supported: previewKind === "followup-dashboard" || previewKind === "commerce-ops-dashboard" || previewKind === "internal-ops-dashboard" || previewKind === "landing-page" || previewKind === "mobile-app",
        label: "הורד את התוצר",
      },
    },
    provenance: {
      projectId: normalizeString(safeProject.id, ""),
      proofId: normalizeString(proof.proofId, ""),
      proposalId: normalizeString(proof.proposalId, ""),
      screenId: normalizeString(preview.screenId, controlCenter.generatedSurfacePreview?.screenId ?? ""),
      sourceProposalId: normalizeString(proof.evidence?.sourceProposalId, ""),
      applyStatus: normalizeString(applyDecision.status, ""),
    },
  };
}
