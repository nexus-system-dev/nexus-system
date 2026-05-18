function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeVisibleCopy(value) {
  return String(value ?? "")
    .replaceAll("ב-Proof", "בתצוגה שנפתח")
    .replaceAll("ה־Proof", "התצוגה הבאה")
    .replaceAll("Proof", "התצוגה")
    .replaceAll("ownership", "בעלות");
}

function humanizeGenericRegion(region = {}) {
  const slot = String(region.slot ?? "").trim();
  const slotMap = {
    topbar: {
      title: "יש כותרת ברורה למסך",
      subtitle: "המשתמש מבין מיד מול איזה מוצר הוא עומד",
    },
    stepper: {
      title: "כיוון ההתקדמות כבר ברור",
      subtitle: "רואים איך ממשיכים מכאן בלי לאבד הקשר",
    },
    primaryContent: {
      title: "עיקר הערך כבר יושב במרכז המסך",
      subtitle: "מה שחשוב למשתמש מופיע במשטח הראשי",
    },
    assistantRail: {
      title: "יש הקשר תומך ליד התוצר",
      subtitle: "המסך מחזק החלטה ולא רק מציג חלקים טכניים",
    },
    footerActions: {
      title: "פעולת ההמשך כבר מחוברת למסך",
      subtitle: "אפשר להתקדם בלי לצאת מהתוצר שנבנה",
    },
  };

  return slotMap[slot] ?? {
    title: "יש עוד חלק פעיל בתוצר",
    subtitle: "התצוגה ממשיכה להיבנות כמסך אחד רציף",
  };
}

function renderIncrementCallout(payload, className = "nexus-proof-artifact-increment") {
  const increment = payload.increment ?? null;
  if (!increment?.title) {
    return "";
  }

  return `
    <section class="${escapeHtml(className)}">
      <span class="${escapeHtml(className)}__eyebrow">מה התקדם מאז האישור</span>
      <strong>${escapeHtml(normalizeVisibleCopy(increment.title))}</strong>
      <p>${escapeHtml(normalizeVisibleCopy(increment.reason ?? ""))}</p>
      ${(increment.highlights ?? []).length ? `
        <div class="${escapeHtml(className)}__highlights">
          ${(increment.highlights ?? []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

export function renderProofArtifactSurface(artifact, { surfaceId = "proof-artifact-preview" } = {}) {
  const payload = artifact.previewPayload ?? {};
  const proofMeta = payload.proofMeta ?? {};

  if (payload.kind === "followup-dashboard") {
    return `
      <section id="${escapeHtml(surfaceId)}" class="nexus-proof-artifact-surface nexus-proof-artifact-surface--followup">
        <div class="nexus-proof-artifact-surface__header">
          <div>
            <span class="nexus-proof-artifact-surface__eyebrow">${escapeHtml(normalizeVisibleCopy(payload.eyebrow ?? "תצוגת תוצאה"))}</span>
            <h3>${escapeHtml(normalizeVisibleCopy(payload.title ?? artifact.title))}</h3>
            <p>${escapeHtml(normalizeVisibleCopy(payload.subtitle ?? ""))}</p>
          </div>
          <div class="nexus-proof-artifact-surface__status">${escapeHtml(normalizeVisibleCopy(payload.statusLine ?? artifact.status))}</div>
        </div>

        <div class="nexus-proof-followup-stats">
          ${(payload.stats ?? []).map((item) => `
            <article class="nexus-proof-followup-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </article>
          `).join("")}
        </div>

        <div class="nexus-proof-followup-grid">
          <section class="nexus-proof-followup-panel">
            <h4>לקוחות במעקב</h4>
            <div class="nexus-proof-followup-clients">
              ${(payload.clients ?? []).map((client) => `
                <article class="nexus-proof-followup-client">
                  <div>
                    <strong>${escapeHtml(client.name)}</strong>
                    <span>${escapeHtml(client.company)}</span>
                  </div>
                  <div>
                    <span>${escapeHtml(client.lastTouch)}</span>
                    <span class="nexus-proof-followup-pill">${escapeHtml(client.status)}</span>
                    <span class="nexus-proof-followup-priority">${escapeHtml(client.priority)}</span>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="nexus-proof-followup-panel nexus-proof-followup-panel--action">
            <h4>הפעולה הבאה</h4>
            <strong>${escapeHtml(payload.nextAction?.title ?? "")}</strong>
            <p>${escapeHtml(payload.nextAction?.reason ?? "")}</p>
            <div class="nexus-proof-followup-callout">${escapeHtml(payload.nextAction?.recommendation ?? "")}</div>
          </section>
        </div>

        <section class="nexus-proof-followup-panel nexus-proof-followup-panel--message">
          <h4>${escapeHtml(payload.generatedMessage?.label ?? "הודעה מוכנה לשליחה")}</h4>
          <div class="nexus-proof-followup-message">${escapeHtml(payload.generatedMessage?.body ?? "")}</div>
          <div class="nexus-proof-followup-controls">
            ${(payload.controls ?? []).map((label) => `<span class="nexus-proof-followup-control">${escapeHtml(label)}</span>`).join("")}
          </div>
        </section>

        ${renderIncrementCallout(payload)}

        <footer class="nexus-proof-artifact-surface__footer">
          <span>${proofMeta.previewable === true ? "הלוח נשמר כתצוגה שאפשר לפתוח שוב" : "הלוח כרגע נבדק מתוך המסלול"}</span>
          <span>${escapeHtml(String((payload.stats ?? []).length || 0))} מדדי עבודה גלויים בלוח</span>
        </footer>
      </section>
    `;
  }

  if (payload.kind === "internal-ops-dashboard" || payload.kind === "commerce-ops-dashboard") {
    return `
      <section id="${escapeHtml(surfaceId)}" class="nexus-proof-artifact-surface nexus-proof-artifact-surface--internal-tool">
        <div class="nexus-proof-artifact-surface__header">
          <div>
            <span class="nexus-proof-artifact-surface__eyebrow">${escapeHtml(normalizeVisibleCopy(payload.eyebrow ?? "Internal tool preview"))}</span>
            <h3>${escapeHtml(normalizeVisibleCopy(payload.title ?? artifact.title))}</h3>
            <p>${escapeHtml(normalizeVisibleCopy(payload.subtitle ?? ""))}</p>
          </div>
          <div class="nexus-proof-artifact-surface__status">${escapeHtml(normalizeVisibleCopy(payload.statusLine ?? artifact.status))}</div>
        </div>

        <div class="nexus-proof-internal-stats">
          ${(payload.stats ?? []).map((item) => `
            <article class="nexus-proof-internal-stat">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </article>
          `).join("")}
        </div>

        <div class="nexus-proof-internal-summary">
          <section class="nexus-proof-internal-summary__panel nexus-proof-internal-summary__panel--next">
            <span class="nexus-proof-internal-summary__eyebrow">הצעד הבא</span>
            <h4>${escapeHtml(normalizeVisibleCopy(payload.nextAction?.title ?? ""))}</h4>
            <p>${escapeHtml(normalizeVisibleCopy(payload.nextAction?.reason ?? ""))}</p>
            <div class="nexus-proof-internal-summary__callout">${escapeHtml(normalizeVisibleCopy(payload.nextAction?.recommendation ?? ""))}</div>
          </section>
          <section class="nexus-proof-internal-summary__panel nexus-proof-internal-summary__panel--insight">
            <span class="nexus-proof-internal-summary__eyebrow">למי זה מיועד</span>
            <h4>${escapeHtml(normalizeVisibleCopy(payload.audience ?? ""))}</h4>
            <p>${escapeHtml(normalizeVisibleCopy(payload.insight ?? ""))}</p>
            <div class="nexus-proof-internal-controls">
              ${(payload.controlStrip ?? []).map((label) => `<span class="nexus-proof-internal-control">${escapeHtml(label)}</span>`).join("")}
            </div>
          </section>
        </div>

        ${renderIncrementCallout(payload)}

        <section class="nexus-proof-internal-board">
          ${(payload.queueColumns ?? []).map((column) => `
            <article class="nexus-proof-internal-column">
              <div class="nexus-proof-internal-column__head">
                <h4>${escapeHtml(column.title)}</h4>
                <span>${escapeHtml(String((column.items ?? []).length))}</span>
              </div>
              <div class="nexus-proof-internal-column__items">
                ${(column.items ?? []).map((item) => `
                  <article class="nexus-proof-internal-item">
                    <strong>${escapeHtml(item.title)}</strong>
                    <div class="nexus-proof-internal-item__meta">
                      <span>${escapeHtml(item.owner)}</span>
                      <span>${escapeHtml(item.sla)}</span>
                    </div>
                    <span class="nexus-proof-internal-item__priority">${escapeHtml(item.priority)}</span>
                  </article>
                `).join("")}
              </div>
            </article>
          `).join("")}
        </section>

        <footer class="nexus-proof-artifact-surface__footer">
          <span>${proofMeta.previewable === true ? "פתיח כמשטח עצמאי" : "מוצג כרגע בתוך המסלול"}</span>
          <span>${escapeHtml(String((payload.queueColumns ?? []).length))} עמודות עבודה חיות</span>
        </footer>
      </section>
    `;
  }

  if (payload.kind === "landing-page") {
    return `
      <section id="${escapeHtml(surfaceId)}" class="nexus-proof-artifact-surface nexus-proof-artifact-surface--landing">
        <div class="nexus-proof-artifact-surface__header">
          <div>
            <span class="nexus-proof-artifact-surface__eyebrow">${escapeHtml(normalizeVisibleCopy(payload.eyebrow ?? "Landing page preview"))}</span>
            <h3>${escapeHtml(normalizeVisibleCopy(payload.title ?? artifact.title))}</h3>
            <p>${escapeHtml(normalizeVisibleCopy(payload.subtitle ?? ""))}</p>
          </div>
          <div class="nexus-proof-artifact-surface__status">${escapeHtml(normalizeVisibleCopy(payload.statusLine ?? artifact.status))}</div>
        </div>

        <section class="nexus-proof-landing-hero">
          <div class="nexus-proof-landing-hero__copy">
            <span class="nexus-proof-landing-hero__eyebrow">הבטחה מעל הקפל</span>
            <h4>${escapeHtml(payload.headline ?? payload.title ?? "")}</h4>
            <p>${escapeHtml(payload.subheadline ?? "")}</p>
            <div class="nexus-proof-landing-cta-row">
              <button type="button" class="nexus-proof-landing-cta nexus-proof-landing-cta--primary">${escapeHtml(payload.primaryCta?.label ?? "השאר פרטים")}</button>
              ${(payload.secondaryCtas ?? []).map((label) => `
                <span class="nexus-proof-landing-cta nexus-proof-landing-cta--secondary">${escapeHtml(label)}</span>
              `).join("")}
            </div>
          </div>
          <div class="nexus-proof-landing-hero__meta">
            <span class="nexus-proof-landing-hero__meta-label">למי הדף מדבר</span>
            <strong>${escapeHtml(payload.audience ?? "הקהל שננעל ב-onboarding")}</strong>
            <p>${escapeHtml(payload.insight ?? "")}</p>
          </div>
        </section>

        <div class="nexus-proof-landing-stats">
          ${(payload.stats ?? []).map((item) => `
            <article class="nexus-proof-landing-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </article>
          `).join("")}
        </div>

        ${renderIncrementCallout(payload)}

        <div class="nexus-proof-landing-grid">
          <section class="nexus-proof-landing-panel">
            <h4>עמודי התווך של הדף</h4>
            <div class="nexus-proof-landing-pill-list">
              ${(payload.valueProps ?? []).map((item) => `<span class="nexus-proof-landing-pill">${escapeHtml(item)}</span>`).join("")}
            </div>
            <div class="nexus-proof-landing-section-list">
              ${(payload.sectionCards ?? []).map((section) => `
                <article class="nexus-proof-landing-section-card">
                  <strong>${escapeHtml(section.title)}</strong>
                  <p>${escapeHtml(section.intent)}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="nexus-proof-landing-panel nexus-proof-landing-panel--proof">
            <h4>למה אפשר לסמוך על המסך</h4>
            <div class="nexus-proof-landing-proof-list">
              ${(payload.proofBlocks ?? []).map((block) => `
                <article class="nexus-proof-landing-proof-card">
                  <strong>${escapeHtml(block.title)}</strong>
                  <p>${escapeHtml(block.body)}</p>
                </article>
              `).join("")}
            </div>
          </section>
        </div>

        ${(payload.faqEntries ?? []).length ? `
          <section class="nexus-proof-landing-panel nexus-proof-landing-panel--faq">
            <h4>שאלות התנגדות קריטיות</h4>
            <div class="nexus-proof-landing-faq-list">
              ${(payload.faqEntries ?? []).map((item) => `
                <article class="nexus-proof-landing-faq-item">
                  <strong>${escapeHtml(item.question)}</strong>
                  <p>${escapeHtml(item.answer)}</p>
                </article>
              `).join("")}
            </div>
          </section>
        ` : ""}

        <footer class="nexus-proof-artifact-surface__footer">
          <span>${proofMeta.previewable === true ? "הדף נשמר כתצוגה שאפשר לפתוח שוב" : "הדף כרגע נבדק מתוך המסלול"}</span>
          <span>${escapeHtml(String((payload.sectionCards ?? []).length || 0))} חלקים גלויים בדף</span>
        </footer>
      </section>
    `;
  }

  if (payload.kind === "mobile-app") {
    return `
      <section id="${escapeHtml(surfaceId)}" class="nexus-proof-artifact-surface nexus-proof-artifact-surface--mobile">
        <div class="nexus-proof-artifact-surface__header">
          <div>
            <span class="nexus-proof-artifact-surface__eyebrow">${escapeHtml(payload.eyebrow ?? "Mobile app preview")}</span>
            <h3>${escapeHtml(payload.title ?? artifact.title)}</h3>
            <p>${escapeHtml(payload.subtitle ?? "")}</p>
          </div>
          <div class="nexus-proof-artifact-surface__status">${escapeHtml(payload.statusLine ?? artifact.status)}</div>
        </div>

        <section class="nexus-proof-mobile-hero">
          <article class="nexus-proof-mobile-phone">
            <span class="nexus-proof-mobile-phone__eyebrow">מה המשתמש פוגש ראשון</span>
            <strong>${escapeHtml(payload.firstScreen?.title ?? "Home")}</strong>
            <span class="nexus-proof-mobile-phone__type">${escapeHtml(payload.firstScreen?.screenType ?? "mobile-screen")}</span>
            <p>${escapeHtml(payload.firstScreen?.summary ?? "")}</p>
            <div class="nexus-proof-mobile-pill-list">
              ${(payload.firstScreen?.states ?? []).map((state) => `<span class="nexus-proof-mobile-pill">${escapeHtml(state)}</span>`).join("")}
            </div>
          </article>

          <article class="nexus-proof-mobile-summary">
            <span class="nexus-proof-mobile-summary__eyebrow">מה המשתמש עושה קודם</span>
            <h4>${escapeHtml(payload.firstAction?.title ?? "")}</h4>
            <p>${escapeHtml(payload.firstAction?.reason ?? "")}</p>
            <div class="nexus-proof-mobile-summary__callout">${escapeHtml(payload.firstAction?.followThrough ?? "")}</div>
            <div class="nexus-proof-mobile-summary__meta">
              <span>${escapeHtml(payload.audience ?? "")}</span>
              <span>${escapeHtml(payload.release?.platform ?? "ios")}</span>
            </div>
          </article>
        </section>

        <div class="nexus-proof-mobile-stats">
          ${(payload.stats ?? []).map((item) => `
            <article class="nexus-proof-mobile-stat">
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </article>
          `).join("")}
        </div>

        ${renderIncrementCallout(payload)}

        <div class="nexus-proof-mobile-grid">
          <section class="nexus-proof-mobile-panel">
            <h4>איך הזרימה ממשיכה קדימה</h4>
            <div class="nexus-proof-mobile-screen-list">
              ${(payload.screens ?? []).map((screen) => `
                <article class="nexus-proof-mobile-screen-card">
                  <strong>${escapeHtml(screen.title)}</strong>
                  <span>${escapeHtml(screen.screenType)}</span>
                  <em>${escapeHtml(screen.meta)}</em>
                  <p>${escapeHtml(screen.description)}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="nexus-proof-mobile-panel nexus-proof-mobile-panel--release">
            <h4>${escapeHtml(payload.release?.label ?? "נתיב השחרור שנשמר")}</h4>
            <div class="nexus-proof-mobile-release-card">
              <strong>${escapeHtml(payload.release?.artifactPath ?? "")}</strong>
              <span>${escapeHtml(payload.release?.exportMethod ?? "")}</span>
            </div>
            <p>${escapeHtml(payload.insight ?? "")}</p>
            <div class="nexus-proof-mobile-pill-list">
              <span class="nexus-proof-mobile-pill">${escapeHtml(payload.continuity?.nextScreenTitle ?? "next screen")}</span>
              <span class="nexus-proof-mobile-pill">${escapeHtml(String(payload.continuity?.flowCount ?? 0))} flow links</span>
            </div>
          </section>
        </div>

        <footer class="nexus-proof-artifact-surface__footer">
          <span>${proofMeta.previewable === true ? "הזרימה נשמרה כתצוגה שאפשר לפתוח שוב" : "הזרימה כרגע נבדקת מתוך המסלול"}</span>
          <span>${escapeHtml(String((payload.screens ?? []).length || 0))} מסכים גלויים בזרימה</span>
        </footer>
      </section>
    `;
  }

  return `
    <section id="${escapeHtml(surfaceId)}" class="nexus-proof-artifact-surface nexus-proof-artifact-surface--generic">
      <div class="nexus-proof-artifact-surface__header">
        <div>
          <span class="nexus-proof-artifact-surface__eyebrow">${escapeHtml(payload.eyebrow ?? "תצוגת תוצר")}</span>
          <h3>${escapeHtml(payload.title ?? artifact.title)}</h3>
          <p>${escapeHtml(payload.subtitle ?? "")}</p>
        </div>
        <div class="nexus-proof-artifact-surface__status">${escapeHtml(payload.statusLine ?? artifact.status)}</div>
      </div>
      <div class="nexus-proof-generic-preview">
        <div class="nexus-proof-generic-preview__regions">
          ${(payload.regions ?? []).map((region) => {
            const copy = humanizeGenericRegion(region);
            return `
            <article class="nexus-proof-generic-region">
              <strong>${escapeHtml(copy.title)}</strong>
              <span>${escapeHtml(copy.subtitle)}</span>
            </article>
          `;
          }).join("")}
        </div>
        <div class="nexus-proof-generic-preview__meta">
          <span>${proofMeta.previewable === true ? "התצוגה נשמרה לפתיחה חוזרת" : "התצוגה נבדקת בתוך המסלול"}</span>
          <span>החלקים המרכזיים כבר נראים יחד כמסך אחד</span>
          <span>המשך הפעולה נשמר בתוך התצוגה עצמה</span>
        </div>
      </div>
    </section>
  `;
}
