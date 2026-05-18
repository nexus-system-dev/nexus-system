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
  };
}

export function buildHomeSupportViewModel({ projects = [], currentProjectId = null } = {}) {
  const normalizedProjects = normalizeArray(projects)
    .map((project) => buildProjectCard(normalizeObject(project), currentProjectId))
    .filter((project) => project.id);

  const activeProjects = normalizedProjects.filter((project) => project.status.tone === "active").length;
  const approvedProjects = normalizedProjects.filter((project) => project.status.tone === "success").length;

  return {
    badge: "Support screen",
    title: "הבית שלך ב־Nexus",
    subtitle: "כאן רואים את כל הפרויקטים, בוחרים על מה להמשיך, או פותחים פרויקט חדש.",
    projects: normalizedProjects,
    stats: [
      { label: "סה\"כ פרויקטים", value: String(normalizedProjects.length) },
      { label: "פעילים עכשיו", value: String(activeProjects) },
      { label: "אושרו", value: String(approvedProjects) },
    ],
    emptyState: {
      title: "עדיין אין פרויקטים",
      body: "כדי להתחיל את הלופ, צריך ליצור פרויקט ראשון ולחבר אליו את ההקשר הראשוני.",
      actionLabel: "צור פרויקט חדש",
    },
    primaryAction: {
      label: "צור פרויקט חדש",
      target: "create",
    },
  };
}
