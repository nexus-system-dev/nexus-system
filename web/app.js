const elements = {
  projectSelect: document.querySelector("#project-select"),
  syncCasinoButton: document.querySelector("#sync-casino-button"),
  analyzeButton: document.querySelector("#analyze-button"),
  runCycleButton: document.querySelector("#run-cycle-button"),
  heroProjectName: document.querySelector("#hero-project-name"),
  heroGoal: document.querySelector("#hero-goal"),
  now: document.querySelector("#now-content"),
  critical: document.querySelector("#critical-content"),
  missing: document.querySelector("#missing-content"),
  existing: document.querySelector("#existing-content"),
  live: document.querySelector("#live-content"),
  decision: document.querySelector("#decision-content"),
  casinoBaseUrlInput: document.querySelector("#casino-base-url-input"),
  external: document.querySelector("#external-content"),
  scanPathInput: document.querySelector("#scan-path-input"),
  scanButton: document.querySelector("#scan-button"),
  scanner: document.querySelector("#scanner-content"),
  analysis: document.querySelector("#analysis-content"),
  graph: document.querySelector("#graph-content"),
  agents: document.querySelector("#agents-content"),
  events: document.querySelector("#events-content"),
};

let currentProjectId = null;

const labels = {
  active: "פעיל",
  blocked: "חסום",
  idle: "ממתין",
  working: "עובד",
  assigned: "בתהליך",
  done: "הושלם",
  failed: "נכשל",
  build: "בנייה",
  maintenance: "תחזוקה",
  marketing: "שיווק",
  growth: "צמיחה",
  "task.assigned": "משימה שובצה",
  "task.completed": "משימה הושלמה",
  "task.failed": "משימה נכשלה",
  "roadmap.generated": "נוצרה תוכנית",
  "state.updated": "המצב עודכן",
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function t(value) {
  return labels[value] ?? value;
}

function listHtml(items, emptyText) {
  if (!items.length) {
    return `<p class="empty">${emptyText}</p>`;
  }

  return items
    .map(
      (item) => `
      <article class="list-item">
        <strong>${item.title}</strong>
        ${item.body ? `<p>${item.body}</p>` : ""}
      </article>
    `,
    )
    .join("");
}

function renderTop(project) {
  const blockedTasks = project.cycle?.roadmap.filter((task) => task.status === "blocked") ?? [];
  const activeTasks = project.cycle?.roadmap.filter((task) => task.status === "assigned") ?? [];
  const activeAgents = project.agents.filter((agent) => agent.status === "working").length;

  elements.heroProjectName.textContent = project.name;
  elements.heroGoal.textContent = project.goal;
  elements.casinoBaseUrlInput.value = project.source?.baseUrl ?? "http://localhost:4101";

  elements.now.innerHTML = `
    <div class="big-status ${project.status}">
      <span>${t(project.status)}</span>
    </div>
    <div class="now-grid">
      <div><span class="mini-label">חסם מרכזי</span><strong>${project.overview.bottleneck}</strong></div>
      <div><span class="mini-label">משימות פעילות</span><strong>${activeTasks.length}</strong></div>
      <div><span class="mini-label">משימות חסומות</span><strong>${blockedTasks.length}</strong></div>
      <div><span class="mini-label">סוכנים עובדים</span><strong>${activeAgents}</strong></div>
    </div>
  `;
}

function renderCritical(project) {
  const firstApproval = project.approvals[0];
  const blockedTask = project.cycle?.roadmap.find((task) => task.status === "blocked");
  const title = firstApproval ?? blockedTask?.summary ?? "כרגע אין פעולה דחופה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${blockedTask.dependencies.join(", ") || "חסר מידע"}`
    : "כרגע אין חסם גדול, אפשר להמשיך לסנכרן או לנתח.";

  elements.critical.innerHTML = `
    <div class="critical-main">${title}</div>
    <p class="critical-sub">${reason}</p>
  `;
}

function renderMissing(project) {
  const scan = project.scan;
  const external = project.externalSnapshot;
  const items = [];

  if (scan) {
    if (!scan.findings.hasMigrations) items.push({ title: "חסרות מיגרציות" });
    if (!scan.findings.hasEnvExample) items.push({ title: "חסר קובץ env לדוגמה" });
    if (!scan.findings.hasTests) items.push({ title: "חסרות בדיקות" });
  }

  if (external) {
    if (!external.features.hasPayments) items.push({ title: "חסר תהליך תשלומים" });
    if (!external.features.hasWallet) items.push({ title: "חסר ארנק" });
    if (external.roadmapContext?.knownMissingParts?.length) {
      items.push(
        ...external.roadmapContext.knownMissingParts.slice(0, 4).map((item) => ({
          title: item,
        })),
      );
    }
  }

  elements.missing.innerHTML = listHtml(items, "לא זוהו כרגע חוסרים בולטים.");
}

function renderExisting(project) {
  const scan = project.scan;
  const external = project.externalSnapshot;
  const items = [];

  if (scan?.findings.hasBackend) items.push({ title: "יש backend" });
  if (scan?.findings.hasAuth) items.push({ title: "יש auth" });
  if (scan?.findings.hasEnvExample) items.push({ title: "יש env לדוגמה" });
  if (external?.features.hasAuth) items.push({ title: "ה־API של הקזינו מדווח ש־auth קיים" });

  elements.existing.innerHTML = listHtml(items, "עדיין אין מספיק מידע חיובי להציג.");
}

function renderLive(project) {
  const activeTasks = project.cycle?.roadmap.filter((task) => task.status === "assigned") ?? [];
  const blockedTasks = project.cycle?.roadmap.filter((task) => task.status === "blocked") ?? [];
  const items = [
    ...activeTasks.slice(0, 3).map((task) => ({
      title: task.summary,
      body: "קורה עכשיו",
    })),
    ...blockedTasks.slice(0, 2).map((task) => ({
      title: task.summary,
      body: "חסום כרגע",
    })),
  ];

  elements.live.innerHTML = listHtml(items, "כרגע אין פעילות מיוחדת.");
}

function renderDecision(project) {
  const items = project.approvals.slice(0, 4).map((approval) => ({ title: approval }));
  elements.decision.innerHTML = listHtml(items, "אין כרגע משהו שצריך לאשר.");
}

function renderExternal(project) {
  if (!project.externalSnapshot && !project.gitSnapshot) {
    elements.external.innerHTML = `<p class="empty">עדיין לא בוצע חיבור חיצוני.</p>`;
    return;
  }

  const items = [];

  if (project.externalSnapshot) {
    const snapshot = project.externalSnapshot;
    items.push(
      { title: `מצב הקזינו: ${snapshot.health.status}` },
      {
        title: "מסד נתונים",
        body:
          snapshot.health.databaseConnected === null
            ? snapshot.health.databaseConnectedReason
            : snapshot.health.databaseConnected
              ? "מחובר"
              : "לא מחובר",
      },
      {
        title: "זרימות חסומות",
        body: snapshot.blockedFlows?.slice(0, 3).join(" | ") || "אין כרגע",
      },
    );
  }

  if (project.gitSnapshot) {
    items.push(
      {
        title: `חיבור Git: ${project.gitSnapshot.repo.fullName}`,
        body: `${project.gitSnapshot.provider} | ענף ראשי: ${project.gitSnapshot.repo.defaultBranch}`,
      },
      {
        title: "Branches / PRs",
        body: `${project.gitSnapshot.branches.length} branches | ${project.gitSnapshot.pullRequests.length} PR/MR`,
      },
      {
        title: "Commit אחרון",
        body: project.gitSnapshot.commits[0]?.title ?? "אין commits זמינים",
      },
    );
  }

  if (project.runtimeSnapshot) {
    items.push(
      {
        title: "Runtime",
        body: `CI: ${project.runtimeSnapshot.ci?.[0]?.status ?? "unknown"} | Deploy: ${project.runtimeSnapshot.deployments?.[0]?.status ?? "unknown"}`,
      },
      {
        title: "Errors / Monitoring",
        body: `${project.runtimeSnapshot.errorLogs?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0} שגיאות | ${project.runtimeSnapshot.monitoring?.filter((item) => item.status !== "ok").length ?? 0} התראות`,
      },
    );
  }

  elements.external.innerHTML = listHtml(items, "אין מידע חיצוני.");
}

function renderScanner(project) {
  elements.scanPathInput.value = project.path ?? "";
  if (!project.scan) {
    elements.scanner.innerHTML = `<p class="empty">עדיין לא בוצעה סריקה.</p>`;
    return;
  }

  const scan = project.scan;
  elements.scanner.innerHTML = listHtml(
    [
      { title: scan.summary },
      { title: "חוסרים", body: scan.gaps.join(" | ") || "לא זוהו" },
      { title: "בדיקות", body: (scan.evidence.testFiles ?? []).join(", ") || "לא זוהו" },
    ],
    "אין נתוני סריקה.",
  );
}

function renderAnalysis(project) {
  if (!project.analysis) {
    elements.analysis.innerHTML = `<p class="empty">עדיין לא בוצע ניתוח AI.</p>`;
    return;
  }

  const analysis = project.analysis;
  elements.analysis.innerHTML = listHtml(
    [
      { title: analysis.summary },
      { title: "סיכונים", body: analysis.risks.join(" | ") || "אין כרגע" },
      { title: "צעדים מומלצים", body: analysis.nextActions.join(" | ") || "אין כרגע" },
    ],
    "אין ניתוח.",
  );
}

function renderGraph(project) {
  const tasks = project.cycle?.roadmap ?? [];
  elements.graph.innerHTML = listHtml(
    tasks.map((task) => ({
      title: task.summary,
      body: `${t(task.lane)} | ${t(task.status)}`,
    })),
    "אין זרימת ביצוע.",
  );
}

function renderAgents(project) {
  elements.agents.innerHTML = listHtml(
    project.agents.map((agent) => ({
      title: `${agent.name} - ${t(agent.status)}`,
      body: agent.currentTask ?? "אין כרגע משימה",
    })),
    "אין סוכנים.",
  );
}

function renderEvents(project) {
  elements.events.innerHTML = listHtml(
    project.events.slice().reverse().slice(0, 6).map((event) => ({
      title: t(event.type),
      body: event.payload.task?.summary ?? event.payload.taskId ?? event.payload.projectId ?? "",
    })),
    "אין אירועים.",
  );
}

async function loadProject(projectId) {
  const project = await fetchJson(`/api/projects/${projectId}`);
  currentProjectId = projectId;
  renderTop(project);
  renderCritical(project);
  renderMissing(project);
  renderExisting(project);
  renderLive(project);
  renderDecision(project);
  renderExternal(project);
  renderScanner(project);
  renderAnalysis(project);
  renderGraph(project);
  renderAgents(project);
  renderEvents(project);
}

async function loadProjects() {
  const { projects } = await fetchJson("/api/projects");
  elements.projectSelect.innerHTML = projects
    .map((project) => `<option value="${project.id}">${project.name}</option>`)
    .join("");
  if (projects[0]) {
    await loadProject(projects[0].id);
  }
}

elements.projectSelect.addEventListener("change", async (event) => {
  await loadProject(event.target.value);
});

elements.runCycleButton.addEventListener("click", async () => {
  if (!currentProjectId) return;
  await fetchJson(`/api/projects/${currentProjectId}/run-cycle`, { method: "POST" });
  await loadProject(currentProjectId);
});

elements.analyzeButton.addEventListener("click", async () => {
  if (!currentProjectId) return;
  await fetchJson(`/api/projects/${currentProjectId}/analyze`, { method: "POST" });
  await loadProject(currentProjectId);
});

elements.scanButton.addEventListener("click", async () => {
  if (!currentProjectId) return;
  await fetchJson(`/api/projects/${currentProjectId}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: elements.scanPathInput.value }),
  });
  await loadProject(currentProjectId);
});

elements.syncCasinoButton.addEventListener("click", async () => {
  if (!currentProjectId) return;
  await fetchJson(`/api/projects/${currentProjectId}/sync-casino`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl: elements.casinoBaseUrlInput.value }),
  });
  await loadProject(currentProjectId);
});

loadProjects().catch((error) => {
  elements.now.innerHTML = `<p class="empty">טעינת המסך נכשלה: ${error.message}</p>`;
});
