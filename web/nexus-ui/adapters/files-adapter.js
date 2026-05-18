function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatUpdatedAt(value) {
  const text = trimText(value);
  if (!text) {
    return "לא זוהה זמן עדכון";
  }

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    return text;
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

function buildFileItem(entry, source) {
  if (typeof entry === "string") {
    return {
      id: `${source}:${entry}`,
      name: entry.split("/").pop() || entry,
      path: entry,
      source,
      summary: source === "proof" ? "קובץ שדווח כחלק מה־proof." : "קובץ שזוהה במצב הפרויקט.",
      meta: source === "proof" ? "proof artifact" : "project artifact",
    };
  }

  const file = normalizeObject(entry);
  const path = trimText(file.path) || trimText(file.filePath) || trimText(file.targetId) || trimText(file.name);
  const name = trimText(file.name) || (path ? path.split("/").pop() : "") || "unnamed-file";
  const status = trimText(file.status) || trimText(file.validationStatus) || trimText(file.operation);
  const type = trimText(file.type) || trimText(file.mimeType) || trimText(file.kind);
  const summary = trimText(file.summary)
    || trimText(file.description)
    || trimText(file.message)
    || (status ? `status: ${status}` : source === "proof" ? "קובץ שנגזר מה־proof." : "קובץ זמין במצב הנוכחי.");
  const meta = [type, status].filter(Boolean).join(" · ")
    || (source === "proof" ? "proof artifact" : "project artifact");

  return {
    id: `${source}:${path || name}`,
    name,
    path: path || name,
    source,
    summary,
    meta,
  };
}

function collectProjectFiles(project) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const proof = normalizeObject(safeProject.generatedSurfaceProofSchema ?? state.generatedSurfaceProofSchema);
  const files = [
    ...normalizeArray(safeProject.generatedFiles).map((entry) => buildFileItem(entry, "generated")),
    ...normalizeArray(safeProject.files).map((entry) => buildFileItem(entry, "project")),
    ...normalizeArray(proof.files).map((entry) => buildFileItem(entry, "proof")),
  ];

  const deduped = [];
  const seen = new Set();
  for (const file of files) {
    if (!file.path || seen.has(file.id) || seen.has(file.path)) {
      continue;
    }
    seen.add(file.id);
    seen.add(file.path);
    deduped.push(file);
  }

  return deduped;
}

function buildDraftFile(draftInputs) {
  const fileName = trimText(draftInputs?.fileName);
  const fileContent = trimText(draftInputs?.fileContent);
  if (!fileName && !fileContent) {
    return null;
  }

  return {
    id: `draft:${fileName || "supporting-notes.txt"}`,
    name: fileName || "supporting-notes.txt",
    path: fileName || "local draft",
    source: "draft",
    summary: fileContent
      ? `${fileContent.slice(0, 120)}${fileContent.length > 120 ? "..." : ""}`
      : "קובץ תומך שנשמר מקומית לפני פתיחת הפרויקט.",
    meta: "draft context",
  };
}

function buildSourceSummary(files) {
  const totals = new Map();
  for (const file of files) {
    totals.set(file.source, (totals.get(file.source) ?? 0) + 1);
  }

  const order = [
    ["project", "פרויקט"],
    ["generated", "Generated"],
    ["proof", "Proof"],
    ["draft", "Draft"],
  ];

  return order
    .filter(([key]) => totals.has(key))
    .map(([key, label]) => ({
      label,
      value: String(totals.get(key)),
    }));
}

export function buildFilesSupportViewModel({ project = null, draftInputs = null } = {}) {
  const safeProject = normalizeObject(project);
  const hasProject = Boolean(safeProject.id);
  const projectFiles = collectProjectFiles(safeProject);
  const draftFile = buildDraftFile(draftInputs);
  const files = draftFile ? [draftFile, ...projectFiles] : projectFiles;
  const proofCount = files.filter((file) => file.source === "proof").length;
  const generatedCount = files.filter((file) => file.source === "generated").length;
  const sourceSummary = buildSourceSummary(files);

  return {
    badge: "Support screen",
    title: hasProject ? `קבצים עבור ${safeProject.name ?? "הפרויקט הפעיל"}` : "קבצים ב־Nexus",
    subtitle: hasProject
      ? "רואים כאן רק קבצים שכבר דווחו בפרויקט או ב־proof. אין במסך הזה העלאה, מחיקה, או backend מומצא."
      : draftFile
        ? "עדיין אין runtime מלא לקבצים, אבל אפשר לראות את הקובץ התומך שנשמר ב־draft המקומי."
        : "אין עדיין runtime מלא לקבצים. זה shell בטוח שמציג רק מה שכבר קיים ב־draft או בפרויקט.",
    projectName: hasProject ? safeProject.name ?? "Project" : "Nexus Files",
    stats: [
      { label: "קבצים גלויים", value: String(files.length) },
      { label: "Generated", value: String(generatedCount) },
      { label: "Proof", value: String(proofCount) },
    ],
    files,
    sourceSummary,
    runtimeCard: {
      title: hasProject ? "החיבור הפעיל" : "מצב החיבור",
      body: hasProject
        ? `המסך מחובר ל־project payload הקיים. עודכן לאחרונה: ${formatUpdatedAt(safeProject.updatedAt)}.`
        : draftFile
          ? "המסך משתמש כרגע רק ב־draft המקומי של היצירה לפני שנפתח פרויקט פעיל."
          : "אין כרגע project payload או Files backend ייעודי, לכן נשמרת תצוגת placeholder בטוחה.",
    },
    limitsCard: {
      title: "מה המסך כן עושה",
      bullets: [
        "מאחד קבצים מה־project payload, מ־generated files, ומ־proof אם הם כבר קיימים.",
        "שומר את הממשק קריא גם בלי runtime ייעודי ל־Files.",
        "נמנע במכוון מלהציג upload, delete, rename, או open flows שלא חוברו.",
      ],
    },
    emptyState: hasProject
      ? {
          title: "עדיין אין קבצים מדווחים לפרויקט הזה",
          body: "ברגע שהפרויקט יתחיל לייצר artifacts או proof files, הם יופיעו כאן בלי שתצטרך לעבור למסך מתקדם.",
        }
      : {
          title: "עדיין אין קבצים להצגה",
          body: "אפשר ליצור פרויקט חדש או לבחור פרויקט קיים, ואז Files יציג רק נתונים שכבר ידועים למערכת.",
        },
    primaryAction: hasProject
      ? { label: "חזור ללופ", target: "loop" }
      : { label: "צור פרויקט", target: "create" },
    secondaryAction: {
      label: "פתח בית",
      target: "home",
    },
  };
}
