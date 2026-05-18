function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

const HELP_CATEGORIES = [
  {
    key: "getting-started",
    title: "התחלה עם Nexus",
    description: "איך פותחים פרויקט, ממלאים הקשר וממשיכים למסך העבודה הראשון.",
    ctaLabel: "פתח מדריכי התחלה",
  },
  {
    key: "loop-basics",
    title: "הבנת ה־AI Loop",
    description: "מה קורה בין Understanding, Loop, Proof ו־Timeline ואיך יודעים שהמערכת התקדמה אמתית.",
    ctaLabel: "הבן את הלופ",
  },
  {
    key: "files-context",
    title: "קבצים, Upload והקשר",
    description: "איך Nexus משתמש בקבצים, קישורים וחומר תומך בלי להמציא runtime שלא קיים.",
    ctaLabel: "ראה חומר תומך",
  },
  {
    key: "support-troubleshooting",
    title: "פתרון תקלות ותמיכה",
    description: "מה לבדוק קודם כשמסך נחסם, route לא משוחזר או השרת מחזיר שגיאה חיה.",
    ctaLabel: "פתח עזרה טכנית",
  },
];

const HELP_ARTICLES = [
  {
    id: "start-project",
    category: "getting-started",
    title: "איך מתחילים עם Nexus?",
    subtitle: "יצירת פרויקט, הקשר ראשוני ומעבר למסלול העבודה.",
    body: "התחלה טובה ב־Nexus מתחילה ביצירת פרויקט עם שם ברור, תיאור חד, וקבצים או קישור אם כבר יש חומר קיים. רק אחרי שיש בסיס כזה ה־Onboarding יכול להמשיך באופן אמיתי.",
    bullets: [
      "פתח מסך יצירה והזן שם פרויקט ותיאור שמסבירים מה המערכת צריכה לבנות.",
      "אם יש README, קבצי קוד או מסמך אפיון, צרף אותם כבר בשלב היצירה.",
      "אחרי היצירה המשך ל־Onboarding כדי לוודא ש־Nexus באמת הבין את הכוונה.",
    ],
    action: { label: "פתח יצירה", target: "create" },
    keywords: ["יצירה", "פרויקט חדש", "start", "create", "onboarding"],
    categoryLabel: "התחלה",
  },
  {
    id: "understanding-loop",
    category: "loop-basics",
    title: "הבנת תהליך ה־AI Loop",
    subtitle: "איך Nexus מתקדם מהבנה לפעולה ול־Proof.",
    body: "ה־AI Loop של Nexus לא אמור לדלג ישר לתוצר. קודם מגיע שלב Understanding, ממנו נגזרת משימה ב־Loop, אחר כך ביצוע, Proof, ורק אז Timeline ו־next task. אם אחד השלבים לא ברור, עדיף לעצור שם ולא להתקדם בכוח.",
    bullets: [
      "Understanding אמור לשקף את מה שנאסף מהשיחה ומהחומר שהועלה.",
      "Loop בוחר משימה הבאה שיש לה הצדקה מוצרית ולא fallback כללי.",
      "Proof צריך להראות תוצר שנגזר מהמשימה ולא רק טקסט תיאורי.",
    ],
    action: { label: "פתח לופ", target: "loop" },
    keywords: ["loop", "proof", "understanding", "timeline", "ai loop"],
    categoryLabel: "מושגי יסוד",
  },
  {
    id: "multi-projects",
    category: "getting-started",
    title: "ניהול פרויקטים מרובים",
    subtitle: "מתי לחזור ל־Home ומתי לפתוח Project חדש.",
    body: "מסך הבית מרכז את כל הפרויקטים הידועים למערכת. אם אתה עובד על כמה יוזמות במקביל, כדאי לחזור ל־Home כדי לבחור פרויקט פעיל במקום לערבב הקשר בתוך אותו loop.",
    bullets: [
      "השתמש ב־Home כשצריך לעבור בין פרויקטים שכבר קיימים.",
      "אל תדביק חומר של פרויקט אחד לתוך Onboarding של פרויקט אחר.",
      "אם הפרויקט החדש שונה מהותית, פתח Project חדש במקום למחזר state ישן.",
    ],
    action: { label: "פתח בית", target: "home" },
    keywords: ["home", "multiple", "projects", "multi", "פרויקטים"],
    categoryLabel: "תכונות מתקדמות",
  },
  {
    id: "files-context",
    category: "files-context",
    title: "איך Nexus משתמש בקבצים וחומר תומך",
    subtitle: "מה נכנס ל־Files ומה באמת ממשיך ל־Onboarding.",
    body: "מסך Files ב־Nexus מציג רק קבצים שכבר ידועים למערכת: קבצי draft, generated files ו־proof files. הוא לא אמור להציג upload, delete או rename אם אין להם backend אמיתי.",
    bullets: [
      "בשלב היצירה אפשר לצרף קבצים אמיתיים כדי לתת הקשר טוב יותר.",
      "ב־Files רואים רק מה שכבר קיים ב־draft או ב־project payload.",
      "אם חומר תומך לא מופיע, כדאי לחזור ליצירה או ל־Onboarding ולא להניח שהוא נשמר.",
    ],
    action: { label: "פתח קבצים", target: "files" },
    keywords: ["upload", "files", "README", "context", "קבצים"],
    categoryLabel: "אינטגרציות",
  },
  {
    id: "troubleshooting",
    category: "support-troubleshooting",
    title: "פתרון בעיות נפוצות",
    subtitle: "מה לעשות כשיש 404, 429 או route שלא שוחזר.",
    body: "כאשר Nexus מציג שגיאת runtime, route שנפל ל־fallback או session שלא שוחזר, צריך קודם לבדוק אם מדובר בחסם שרת זמני, בחסר payload, או ב־route שדורש פרויקט פעיל. זה עדיף על לחיצה אקראית על כפתורים.",
    bullets: [
      "429 בדרך כלל אומר עומס או חסם bootstrap זמני. רענון מאוחר יותר יכול להספיק.",
      "404 ב־Onboarding אומר שה־session הישן כבר לא קיים וצריך להתחיל מחדש מהמסך המתאים.",
      "אם route כמו /loop נפתח כ־QA fallback, חסר project context אמיתי לשחזור.",
    ],
    action: { label: "פתח הגדרות", target: "settings" },
    keywords: ["404", "429", "restore", "route", "error", "שגיאה"],
    categoryLabel: "תמיכה טכנית",
  },
];

function matchesQuery(article, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    article.title,
    article.subtitle,
    article.body,
    article.categoryLabel,
    ...normalizeArray(article.bullets),
    ...normalizeArray(article.keywords),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function buildSupportMailto({ currentRouteKey, currentProjectName, currentPathname, selectedArticleTitle }) {
  const subject = encodeURIComponent(`Nexus Help - ${selectedArticleTitle || currentRouteKey || "support"}`);
  const lines = [
    "שלום צוות Nexus,",
    "",
    "אני צריך עזרה במסך Nexus.",
    `מסלול נוכחי: ${currentRouteKey || "unknown"}`,
    `פרויקט נוכחי: ${currentProjectName || "ללא פרויקט פעיל"}`,
    `URL: ${currentPathname || "/"}`,
    `מאמר פתוח: ${selectedArticleTitle || "ללא"}`,
    "",
    "מה קרה בפועל:",
    "",
    "מה ציפיתי שיקרה:",
  ];
  return `mailto:support@nexus.local?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildHelpSupportViewModel({
  currentRouteKey = "help",
  currentProjectName = "",
  currentPathname = "/help",
  searchQuery = "",
  selectedCategory = "",
  selectedArticleId = "",
  supportPanelOpen = false,
  supportCopyMessage = "",
} = {}) {
  const normalizedQuery = normalizeString(searchQuery);
  const filteredArticles = HELP_ARTICLES.filter((article) => matchesQuery(article, normalizedQuery));
  const allowedCategories = new Set(filteredArticles.map((article) => article.category));
  const visibleCategories = HELP_CATEGORIES.map((category) => {
    const articleCount = filteredArticles.filter((article) => article.category === category.key).length;
    return {
      ...category,
      articleCount,
      hidden: articleCount === 0,
      active: selectedCategory ? selectedCategory === category.key : false,
    };
  }).filter((category) => !category.hidden);

  const effectiveCategory = visibleCategories.some((category) => category.key === selectedCategory)
    ? selectedCategory
    : (visibleCategories[0]?.key ?? "");

  const categoryArticles = filteredArticles.filter((article) => (
    effectiveCategory ? article.category === effectiveCategory : true
  ));

  const effectiveArticle = categoryArticles.find((article) => article.id === selectedArticleId)
    ?? categoryArticles[0]
    ?? filteredArticles[0]
    ?? null;

  const quickLinks = filteredArticles.slice(0, 5).map((article) => ({
    id: article.id,
    title: article.title,
    category: article.categoryLabel,
    active: effectiveArticle?.id === article.id,
  }));

  const mailtoHref = buildSupportMailto({
    currentRouteKey,
    currentProjectName,
    currentPathname,
    selectedArticleTitle: effectiveArticle?.title ?? "",
  });

  const supportSummaryLines = [
    `מסלול נוכחי: ${currentRouteKey || "help"}`,
    `פרויקט פעיל: ${currentProjectName || "ללא"}`,
    `URL: ${currentPathname || "/help"}`,
    `מאמר נבחר: ${effectiveArticle?.title ?? "ללא"}`,
  ];

  return {
    badge: "Nexus Help",
    title: "מרכז העזרה",
    subtitle: "הסברים אמיתיים על איך Nexus עובד עכשיו, בלי כפתורים דקורטיביים ובלי מסכי תמיכה פיקטיביים.",
    projectName: currentProjectName || "Nexus Help",
    search: {
      value: normalizedQuery,
      placeholder: "לדוגמה: איך ליצור פרויקט חדש...",
      helperText: filteredArticles.length
        ? `נמצאו ${filteredArticles.length} פריטי עזרה רלוונטיים`
        : "לא נמצאו תוצאות. נסה מונחים קצרים יותר או חזור לקטגוריה אחרת.",
    },
    categories: visibleCategories,
    quickLinks,
    selectedCategory: effectiveCategory,
    selectedArticle: effectiveArticle,
    articleList: categoryArticles.length ? categoryArticles : filteredArticles,
    support: {
      panelOpen: supportPanelOpen,
      copyMessage: supportCopyMessage,
      summary: supportSummaryLines.join("\n"),
      mailtoHref,
    },
  };
}
