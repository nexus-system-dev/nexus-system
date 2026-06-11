function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function formatUpdatedAt(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "לא עודכן עדיין";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

function resolveProjectStatus(project) {
  const progressState = normalizeObject(project.progressState);
  const approvalStatus = normalizeObject(project.context?.approvalStatus);

  if (approvalStatus.status === "approved") {
    return { label: "מאושר", tone: "success" };
  }
  if (progressState.status === "running" || progressState.status === "active") {
    return { label: "בתהליך", tone: "active" };
  }
  if (progressState.status === "blocked") {
    return { label: "תקוע", tone: "warning" };
  }

  return { label: "מוכן", tone: "neutral" };
}

function buildProjectCard(project, currentProjectId) {
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const assignedTask = roadmap.find((task) => task?.status === "assigned");
  const phase = project.projectBrainWorkspace?.overview?.currentPhase
    ?? project.overview?.currentPhase
    ?? "Project flow";
  const status = resolveProjectStatus(project);

  return {
    id: String(project.id ?? ""),
    name: project.name ?? "Untitled project",
    description: project.goal ?? project.overview?.summary ?? "עדיין אין תיאור זמין לפרויקט הזה.",
    phase,
    updatedAt: formatUpdatedAt(project.updatedAt),
    isCurrent: String(project.id ?? "") === String(currentProjectId ?? ""),
    status,
    metadata: [
      { label: "שלב", value: phase },
      { label: "משימות", value: String(roadmap.length) },
      { label: "עכשיו", value: assignedTask?.summary ?? "אין משימה רצה" },
    ],
    lastMeaningfulAction: assignedTask?.summary
      ?? project.projectBrainWorkspace?.overview?.lastMeaningfulAction
      ?? project.overview?.lastMeaningfulAction
      ?? "להמשיך מהמקום האחרון שבו Nexus עצרה.",
  };
}

export function buildHomeSupportViewModel({ projects = [], currentProjectId = null } = {}) {
  const normalizedProjects = normalizeArray(projects)
    .map((project) => buildProjectCard(normalizeObject(project), currentProjectId))
    .filter((project) => project.id);

  const currentProject = normalizedProjects.find((project) => project.isCurrent) ?? normalizedProjects[0] ?? null;
  const recentProjects = normalizedProjects
    .filter((project) => !currentProject || project.id !== currentProject.id)
    .slice(0, 3);

  return {
    surfaceContract: "SURF-002",
    workspaceLaw: "momentum-gateway",
    ideaHandoff: {
      sliceContract: "SLICE-002",
      sourceSurface: "home",
      targetSurface: "create",
      responsibleAgent: "project-discovery-agent",
      hiddenEngine: "onboarding-intake-engine",
      boundary: "handoff-only-not-agent-response",
      intent: "new-product-idea",
    },
    badge: "שער מומנטום",
    title: currentProject ? "להמשיך מהמקום הנכון" : "מה בונים עכשיו?",
    subtitle: currentProject
      ? "Home לא מנהל פרויקטים. הוא מחזיר אותך לפעולה הבאה הכי משמעותית."
      : "שיחה אחת עם Nexus פותחת הבנה מוצרית ואז סביבת בנייה חיה.",
    projects: normalizedProjects,
    currentProject,
    recentProjects,
    lastMeaningfulAction: currentProject
      ? {
        title: "הפעולה הבאה",
        body: currentProject.lastMeaningfulAction,
        projectId: currentProject.id,
        projectName: currentProject.name,
      }
      : {
        title: "הפעולה הבאה",
        body: "להתחיל שיחת מוצר חדשה ולתת ל־Nexus להבין מה לבנות.",
        projectId: "",
        projectName: "",
      },
    emptyState: {
      title: "עוד אין מוצר להמשיך ממנו",
      body: "הכניסה הנכונה היא שיחת גילוי קצרה. משם Nexus תפתח סביבת בנייה חיה.",
      actionLabel: "פתח שיחה עם Nexus",
    },
    primaryAction: {
      label: currentProject ? "המשך בבנייה" : "פתח שיחה עם Nexus",
      target: "create",
    },
    secondaryAction: {
      label: "שיחה חדשה",
      target: "create",
    },
  };
}
