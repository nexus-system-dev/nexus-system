import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";

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

function containsExecutionLeak(value = "") {
  const text = escapeText(value, "").toLowerCase();
  return [
    "agent-runtime",
    "bootstrap validation failed",
    "recommended defaults are still provisional",
    "journey-onboarding-initialization",
    "validation",
    "apply",
    "invalid",
    "blocked",
    "invoked ",
    "artifact",
  ].some((token) => text.includes(token));
}

function sanitizeTimelineCopy(value = "", fallback = "") {
  const text = escapeText(value, fallback);
  if (!text) {
    return fallback;
  }
  if (containsExecutionLeak(text)) {
    return fallback;
  }
  return text;
}

function mapEventTypeLabel(type) {
  const map = {
    "task.assigned": "משימה",
    "task.completed": "משימה",
    "task.failed": "משימה",
    "roadmap.generated": "אבן דרך",
    "state.updated": "עדכון מצב",
  };
  return map[type] ?? "אירוע";
}

function mapEventTone(type) {
  if (type === "state.updated" || type === "task.completed") {
    return "success";
  }
  if (type === "task.failed") {
    return "warning";
  }
  return "primary";
}

function mapEventGlyph(type) {
  if (type === "state.updated" || type === "task.completed") {
    return "✓";
  }
  if (type === "roadmap.generated") {
    return "◷";
  }
  if (type === "task.failed") {
    return "!";
  }
  return "→";
}

function resolveTimelineEntries(project) {
  const events = normalizeArray(project.events);
  const liveEvents = normalizeArray(project.realtimeEventStream?.events).map((event) => ({
    type: event.status === "done" ? "state.updated" : "task.assigned",
    payload: { task: { summary: event.message } },
    timestamp: event.timestamp,
  }));
  const combined = [...events, ...liveEvents].filter((event) => {
    const payload = normalizeObject(event.payload);
    const task = normalizeObject(payload.task);
    return !containsExecutionLeak(task.summary ?? event.message ?? payload.taskId ?? "");
  });

  const artifactTruth = buildArtifactTruthViewModel(project);
  const artifactEntry = artifactTruth.artifact?.artifactId
    ? [{
        id: `artifact-${artifactTruth.artifact.artifactId}`,
        title: artifactTruth.title,
        description: artifactTruth.subtitle,
        timestamp: "השלב האחרון",
        kind: "תוצר",
        tone: "success",
        glyph: "◫",
      }]
    : [];

  const entries = [...artifactEntry, ...combined
    .slice()
    .reverse()
    .slice(0, 8)
    .map((event, index) => {
      const payload = normalizeObject(event.payload);
      const task = normalizeObject(payload.task);
      const title = sanitizeTimelineCopy(
        task.summary ?? payload.taskId ?? payload.projectId,
        "צעד שמקדם את התוצר",
      );
      const type = escapeText(event.type, "event");
      return {
        id: `${type}-${index}`,
        title,
        description: buildEntryDescription(event, payload),
        timestamp: escapeText(event.timestamp ?? payload.eventTime, "לא ידוע"),
        kind: mapEventTypeLabel(type),
        tone: mapEventTone(type),
        glyph: mapEventGlyph(type),
      };
    })];

  return entries.length
    ? entries
    : [
        {
          id: "fallback-understanding",
          title: "הבנת הפרויקט הושלמה",
          description: "אושרו קהל היעד, הבעיה והפתרון כדי להתחיל לעבוד.",
          timestamp: "לאחרונה",
          kind: "אבן דרך",
          tone: "success",
          glyph: "✓",
        },
      ];
}

function buildEntryDescription(event, payload) {
  const task = normalizeObject(payload.task);
  if (task.summary) {
    return sanitizeTimelineCopy(task.summary, "בוצע צעד שמקדם את התוצר קדימה.");
  }
  if (event.message) {
    return sanitizeTimelineCopy(event.message, "האירוע הזה קידם את התוצר ונשמר ברצף ההתקדמות.");
  }
  if (payload.taskId) {
    return "האירוע הזה נשמר סביב משימה פעילה בלולאה.";
  }
  if (payload.projectId) {
    return "האירוע נשמר בהיסטוריית הפרויקט ונשאר זמין לחזרה לאחור.";
  }
  return "האירוע נשמר בהיסטוריית הפרויקט.";
}

function buildStats(project, entries) {
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const completedTasks = roadmap.filter((task) => task.status === "done").length;
  const milestones = entries.filter((entry) => entry.kind === "אבן דרך" || entry.kind === "עדכון מצב").length;
  const filesCount = normalizeArray(project.generatedFiles ?? project.files).length
    || normalizeArray(project.generatedSurfaceProofSchema?.files).length
    || 0;
  const liveCount = normalizeArray(project.realtimeEventStream?.events).length;

  return [
    { label: "משימות הושלמו", value: String(completedTasks || Math.max(entries.length - 1, 1)) },
    { label: "אבני דרך", value: String(milestones || 1) },
    { label: "קבצים נוצרו", value: String(filesCount) },
    { label: "אירועים חיים", value: String(liveCount) },
  ];
}

export function buildTimelineViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const entries = resolveTimelineEntries(safeProject);

  return {
    title: "איך התוצר התקדם עד כאן",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך timeline גם בלי history מלא מה־runtime."
      : "רצף ההתקדמות של הפרויקט, עם התוצר האחרון והאירועים שהביאו אותנו עד לכאן.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "ציר עבודה",
    artifactTruth,
    entries,
    stats: buildStats(safeProject, entries),
    primaryAction: {
      label: "חזור לצעד הנוכחי",
      target: "loop",
    },
    artifactAction: {
      label: artifactTruth.openAction.label,
      target: artifactTruth.openAction.target,
      supported: artifactTruth.openAction.supported,
    },
  };
}
