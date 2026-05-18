function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value, fallback = "nexus-artifact") {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return text || fallback;
}

function renderFollowupBody(payload) {
  return `
    <section class="artifact-shell__stats">
      ${normalizeArray(payload.stats).map((item) => `
        <article class="artifact-shell__stat">
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `).join("")}
    </section>

    <section class="artifact-shell__panel">
      <h2>לקוחות במעקב</h2>
      <div class="artifact-shell__list">
        ${normalizeArray(payload.clients).map((client) => `
          <article class="artifact-shell__card">
            <div>
              <strong>${escapeHtml(client.name)}</strong>
              <span>${escapeHtml(client.company)}</span>
            </div>
            <div class="artifact-shell__stack">
              <span>${escapeHtml(client.lastTouch)}</span>
              <span>${escapeHtml(client.status)}</span>
              <span>${escapeHtml(client.priority)}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="artifact-shell__grid">
      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">הפעולה הבאה</span>
        <h2>${escapeHtml(payload.nextAction?.title ?? "")}</h2>
        <p>${escapeHtml(payload.nextAction?.reason ?? "")}</p>
        <div class="artifact-shell__callout">${escapeHtml(payload.nextAction?.recommendation ?? "")}</div>
      </article>

      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">${escapeHtml(payload.generatedMessage?.label ?? "Generated message")}</span>
        <div class="artifact-shell__message">${escapeHtml(payload.generatedMessage?.body ?? "")}</div>
        <div class="artifact-shell__controls">
          ${normalizeArray(payload.controls).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderInternalToolBody(payload) {
  return `
    <section class="artifact-shell__stats">
      ${normalizeArray(payload.stats).map((item) => `
        <article class="artifact-shell__stat">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `).join("")}
    </section>

    <section class="artifact-shell__grid">
      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">הצעד הבא</span>
        <h2>${escapeHtml(payload.nextAction?.title ?? "")}</h2>
        <p>${escapeHtml(payload.nextAction?.reason ?? "")}</p>
        <div class="artifact-shell__callout">${escapeHtml(payload.nextAction?.recommendation ?? "")}</div>
      </article>

      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">למי זה מיועד</span>
        <h2>${escapeHtml(payload.audience ?? "")}</h2>
        <p>${escapeHtml(payload.insight ?? "")}</p>
        <div class="artifact-shell__controls">
          ${normalizeArray(payload.controlStrip).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
        </div>
      </article>
    </section>

    <section class="artifact-shell__board">
      ${normalizeArray(payload.queueColumns).map((column) => `
        <article class="artifact-shell__column">
          <div class="artifact-shell__column-head">
            <h2>${escapeHtml(column.title)}</h2>
            <span>${escapeHtml(String(normalizeArray(column.items).length))}</span>
          </div>
          <div class="artifact-shell__column-items">
            ${normalizeArray(column.items).map((item) => `
              <article class="artifact-shell__card artifact-shell__card--stacked">
                <strong>${escapeHtml(item.title)}</strong>
                <div class="artifact-shell__stack">
                  <span>${escapeHtml(item.owner)}</span>
                  <span>${escapeHtml(item.sla)}</span>
                  <span>${escapeHtml(item.priority)}</span>
                </div>
              </article>
            `).join("")}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderLandingBody(payload) {
  return `
    <section class="artifact-shell__panel">
      <span class="artifact-shell__eyebrow">Landing page preview</span>
      <h2>${escapeHtml(payload.headline ?? payload.title ?? "Landing page")}</h2>
      <p>${escapeHtml(payload.subheadline ?? payload.subtitle ?? "")}</p>
      <div class="artifact-shell__hero-meta">
        <span>${escapeHtml(payload.audience ?? "קהל יעד")}</span>
        <span>${escapeHtml(payload.primaryCta?.label ?? "Primary CTA")}</span>
        ${(payload.secondaryCtas ?? []).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
      </div>
    </section>

    <section class="artifact-shell__stats">
      ${(payload.stats ?? []).map((item) => `
        <article class="artifact-shell__stat">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `).join("")}
    </section>

    <section class="artifact-shell__grid">
      <article class="artifact-shell__panel">
        <h2>עמודי התווך של הדף</h2>
        <div class="artifact-shell__chips">
          ${(payload.valueProps ?? []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="artifact-shell__stack">
          ${(payload.sectionCards ?? []).map((section) => `
            <article class="artifact-shell__stack-card">
              <strong>${escapeHtml(section.title)}</strong>
              <p>${escapeHtml(section.intent)}</p>
            </article>
          `).join("")}
        </div>
      </article>

      <article class="artifact-shell__panel">
        <h2>למה אפשר לסמוך על ההצעה</h2>
        <div class="artifact-shell__stack">
          ${(payload.proofBlocks ?? []).map((block) => `
            <article class="artifact-shell__stack-card">
              <strong>${escapeHtml(block.title)}</strong>
              <p>${escapeHtml(block.body)}</p>
            </article>
          `).join("")}
        </div>
      </article>
    </section>

    ${(payload.faqEntries ?? []).length ? `
      <section class="artifact-shell__panel">
        <h2>שאלות קריטיות לפני פעולה</h2>
        <div class="artifact-shell__stack">
          ${(payload.faqEntries ?? []).map((item) => `
            <article class="artifact-shell__stack-card">
              <strong>${escapeHtml(item.question)}</strong>
              <p>${escapeHtml(item.answer)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function renderMobileBody(payload) {
  return `
    <section class="artifact-shell__grid">
      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">מה המשתמש פוגש ראשון</span>
        <h2>${escapeHtml(payload.firstScreen?.title ?? "Home")}</h2>
        <p>${escapeHtml(payload.firstScreen?.summary ?? "")}</p>
        <div class="artifact-shell__chips">
          ${(payload.firstScreen?.states ?? []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </article>

      <article class="artifact-shell__panel">
        <span class="artifact-shell__eyebrow">מה המשתמש עושה קודם</span>
        <h2>${escapeHtml(payload.firstAction?.title ?? "")}</h2>
        <p>${escapeHtml(payload.firstAction?.reason ?? "")}</p>
        <div class="artifact-shell__callout">${escapeHtml(payload.firstAction?.followThrough ?? "")}</div>
      </article>
    </section>

    <section class="artifact-shell__stats">
      ${(payload.stats ?? []).map((item) => `
        <article class="artifact-shell__stat">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `).join("")}
    </section>

    <section class="artifact-shell__grid">
      <article class="artifact-shell__panel">
        <h2>איך הזרימה ממשיכה קדימה</h2>
        <div class="artifact-shell__stack">
          ${(payload.screens ?? []).map((screen) => `
            <article class="artifact-shell__stack-card">
              <strong>${escapeHtml(screen.title)}</strong>
              <p>${escapeHtml(screen.screenType)} · ${escapeHtml(screen.meta)}</p>
              <p>${escapeHtml(screen.description)}</p>
            </article>
          `).join("")}
        </div>
      </article>

      <article class="artifact-shell__panel">
        <h2>${escapeHtml(payload.release?.label ?? "Release path")}</h2>
        <div class="artifact-shell__stack">
          <article class="artifact-shell__stack-card">
            <strong>${escapeHtml(payload.release?.artifactPath ?? "")}</strong>
            <p>${escapeHtml(payload.release?.platform ?? "ios")} · ${escapeHtml(payload.release?.exportMethod ?? "")}</p>
          </article>
        </div>
        <p>${escapeHtml(payload.insight ?? "")}</p>
      </article>
    </section>
  `;
}

function renderArtifactBody(artifact) {
  const payload = normalizeObject(artifact.previewPayload);
  if (payload.kind === "followup-dashboard") {
    return renderFollowupBody(payload);
  }
  if (payload.kind === "internal-ops-dashboard" || payload.kind === "commerce-ops-dashboard") {
    return renderInternalToolBody(payload);
  }
  if (payload.kind === "landing-page") {
    return renderLandingBody(payload);
  }
  if (payload.kind === "mobile-app") {
    return renderMobileBody(payload);
  }
  return "";
}

function buildArtifactHtml({ project, artifact }) {
  const safeArtifact = normalizeObject(artifact);
  const payload = normalizeObject(safeArtifact.previewPayload);
  const projectName = escapeHtml(project?.name ?? "Nexus artifact");
  const title = escapeHtml(payload.title ?? safeArtifact.title ?? "Nexus artifact");
  const subtitle = escapeHtml(payload.subtitle ?? "");
  const statusLine = escapeHtml(payload.statusLine ?? safeArtifact.status ?? "");
  const artifactType = escapeHtml(safeArtifact.artifactType ?? payload.kind ?? "artifact");
  const body = renderArtifactBody(safeArtifact);

  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f3ec;
        --panel: #fffdf8;
        --ink: #1f1a14;
        --muted: #6a6358;
        --line: #dfd6ca;
        --accent: #0f766e;
        --accent-soft: #d7f3ef;
        --shadow: 0 24px 60px rgba(31, 26, 20, 0.08);
        --radius: 28px;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Heebo", "Assistant", system-ui, sans-serif;
        background:
          radial-gradient(circle at top right, rgba(15,118,110,0.1), transparent 26%),
          linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
        color: var(--ink);
      }
      .artifact-shell {
        width: min(1120px, calc(100% - 32px));
        margin: 32px auto 48px;
      }
      .artifact-shell__hero,
      .artifact-shell__panel,
      .artifact-shell__column,
      .artifact-shell__stat {
        background: var(--panel);
        border: 1px solid rgba(223, 214, 202, 0.9);
        box-shadow: var(--shadow);
      }
      .artifact-shell__hero {
        border-radius: 40px;
        padding: 32px;
        display: grid;
        gap: 20px;
      }
      .artifact-shell__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(15,118,110,0.08);
        color: var(--accent);
        font-size: 13px;
        font-weight: 700;
      }
      h1, h2, p { margin: 0; }
      .artifact-shell__hero h1 {
        font-size: clamp(32px, 4vw, 52px);
        line-height: 1;
      }
      .artifact-shell__hero p {
        font-size: 18px;
        color: var(--muted);
        line-height: 1.6;
      }
      .artifact-shell__hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .artifact-shell__hero-meta span {
        padding: 10px 14px;
        border-radius: 999px;
        background: #f4eee2;
        color: var(--muted);
        font-size: 14px;
      }
      .artifact-shell__stats,
      .artifact-shell__grid,
      .artifact-shell__board {
        display: grid;
        gap: 18px;
        margin-top: 18px;
      }
      .artifact-shell__stats {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .artifact-shell__stat,
      .artifact-shell__panel,
      .artifact-shell__column {
        border-radius: var(--radius);
        padding: 22px;
      }
      .artifact-shell__stat strong {
        display: block;
        font-size: 34px;
        margin-top: 10px;
      }
      .artifact-shell__stat span,
      .artifact-shell__stack span {
        color: var(--muted);
      }
      .artifact-shell__grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .artifact-shell__panel {
        display: grid;
        gap: 14px;
      }
      .artifact-shell__list,
      .artifact-shell__column-items {
        display: grid;
        gap: 14px;
      }
      .artifact-shell__card {
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        background: #fff;
      }
      .artifact-shell__card--stacked {
        display: grid;
      }
      .artifact-shell__stack {
        display: grid;
        gap: 6px;
        text-align: left;
      }
      .artifact-shell__callout,
      .artifact-shell__message {
        padding: 18px;
        border-radius: 20px;
        background: var(--accent-soft);
        line-height: 1.7;
      }
      .artifact-shell__controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .artifact-shell__controls span {
        padding: 9px 12px;
        border-radius: 999px;
        background: #f4eee2;
        color: var(--accent);
        font-weight: 700;
        font-size: 14px;
      }
      .artifact-shell__board {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .artifact-shell__column-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .artifact-shell__column-head span {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #f4eee2;
        color: var(--accent);
        font-weight: 800;
      }
      .artifact-shell__footer {
        margin-top: 18px;
        color: var(--muted);
        font-size: 14px;
      }
      @media (max-width: 720px) {
        .artifact-shell { width: min(100% - 20px, 1120px); }
        .artifact-shell__hero { padding: 24px; border-radius: 28px; }
        .artifact-shell__card { display: grid; }
        .artifact-shell__stack { text-align: right; }
      }
    </style>
  </head>
  <body>
    <main class="artifact-shell">
      <section class="artifact-shell__hero">
        <span class="artifact-shell__eyebrow">Nexus artifact export</span>
        <div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="artifact-shell__hero-meta">
          <span>פרויקט: ${projectName}</span>
          <span>סוג תוצר: ${artifactType}</span>
          <span>מוכן עכשיו: ${statusLine}</span>
        </div>
      </section>
      ${body}
      <p class="artifact-shell__footer">נוצר מתוך Nexus כדי לאפשר review ו־handoff מחוץ למסך ה־Proof, בלי לאבד את התוצר עצמו.</p>
    </main>
  </body>
</html>`;
}

export function buildArtifactDownloadDescriptor({ project = null, artifact = null } = {}) {
  const safeArtifact = normalizeObject(artifact);
  const payload = normalizeObject(safeArtifact.previewPayload);
  const supportedKinds = new Set(["followup-dashboard", "internal-ops-dashboard", "commerce-ops-dashboard", "landing-page"]);
  if (!supportedKinds.has(payload.kind)) {
    return null;
  }

  return {
    mimeType: "text/html;charset=utf-8",
    filename: `${slugify(payload.title ?? safeArtifact.title, "nexus-artifact")}.html`,
    content: buildArtifactHtml({ project, artifact: safeArtifact }),
  };
}
