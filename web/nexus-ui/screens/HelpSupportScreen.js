import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusInput } from "../components/NexusInput.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCategoryCard(category) {
  return renderNexusCard({
    className: `nexus-help-screen__category-card${category.active ? " is-active" : ""}`,
    hover: true,
    padding: "lg",
    content: `
      <div class="nexus-help-screen__category-card-main">
        <div class="nexus-help-screen__category-icon" aria-hidden="true">?</div>
        <div class="nexus-help-screen__category-copy">
          <h3>${escapeHtml(category.title)}</h3>
          <p>${escapeHtml(category.description)}</p>
        </div>
      </div>
      <div class="nexus-help-screen__category-footer">
        <span>${escapeHtml(`יש ${category.articleCount} פריטי עזרה`)}
        </span>
        ${renderNexusButton({
          label: category.ctaLabel,
          variant: category.active ? "primary" : "secondary",
          attrs: {
            "data-help-category": category.key,
          },
        })}
      </div>
    `,
  });
}

function renderArticleLink(article, activeArticleId) {
  return `
    <button
      type="button"
      class="nexus-help-screen__article-link${article.id === activeArticleId ? " is-active" : ""}"
      data-help-article-id="${escapeHtml(article.id)}"
    >
      <strong>${escapeHtml(article.title)}</strong>
      <span>${escapeHtml(article.categoryLabel)}</span>
    </button>
  `;
}

export function renderHelpSupportScreen(viewModel) {
  const sidebar = {
    currentRoute: "/help",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
      { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
    ],
    support: [
      { title: "בית", href: "/home", target: "home", icon: "⌂" },
      { title: "קבצים", href: "/files", target: "files", icon: "⌘" },
    ],
    advanced: [
      { title: "Developer", href: "/developer", icon: "⌘" },
      { title: "מוח הפרויקט", href: "/brain", icon: "☷" },
      { title: "שחרורים", href: "/release", icon: "▤" },
      { title: "צמיחה", href: "/growth", icon: "↗" },
    ],
    footer: [
      { title: "הגדרות", href: "/settings", icon: "⚙" },
      { title: "עזרה", href: "/help", target: "help", icon: "?" },
    ],
  };

  const article = viewModel.selectedArticle;
  const supportPanel = viewModel.support.panelOpen
    ? `
      <div class="nexus-help-screen__support-panel">
        <pre id="help-support-summary" class="nexus-help-screen__support-summary">${escapeHtml(viewModel.support.summary)}</pre>
        <div class="nexus-help-screen__support-actions">
          ${renderNexusButton({
            label: "פתח פנייה במייל",
            variant: "primary",
            attrs: {
              "data-help-support-mailto": viewModel.support.mailtoHref,
            },
          })}
          ${renderNexusButton({
            label: "העתק פרטי תמיכה",
            variant: "secondary",
            attrs: {
              id: "help-support-copy-button",
              "data-help-support-copy": "true",
            },
          })}
        </div>
        ${viewModel.support.copyMessage
          ? `<p class="nexus-help-screen__support-copy-message">${escapeHtml(viewModel.support.copyMessage)}</p>`
          : ""}
      </div>
    `
    : "";

  const content = `
    <section class="nexus-help-screen">
      <div class="nexus-help-screen__intro">
        <div class="nexus-help-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <div class="nexus-help-screen__intro-main">
          <div>
            <h1>${escapeHtml(viewModel.title)}</h1>
            <p>${escapeHtml(viewModel.subtitle)}</p>
          </div>
        </div>
      </div>

      ${renderNexusCard({
        className: "nexus-help-screen__search-card",
        padding: "lg",
        content: `
          <div class="nexus-help-screen__search-header">
            <h2>חפש בעזרה</h2>
            <p>החיפוש מסנן בזמן אמת את המדריכים והמאמרים שכבר קיימים במסך הזה.</p>
          </div>
          ${renderNexusInput({
            id: "help-search-input",
            label: "",
            placeholder: viewModel.search.placeholder,
            value: viewModel.search.value,
            helperText: viewModel.search.helperText,
            className: "nexus-help-screen__search-input",
          })}
        `,
      })}

      <section class="nexus-help-screen__category-grid">
        ${viewModel.categories.map((category) => renderCategoryCard(category)).join("")}
      </section>

      <section class="nexus-help-screen__content-grid">
        <aside class="nexus-help-screen__sidebar-column">
          ${renderNexusCard({
            className: "nexus-help-screen__faq-card",
            padding: "lg",
            content: `
              <div class="nexus-help-screen__section-header">
                <h2>שאלות נפוצות</h2>
                <p>כל שורה פותחת מאמר אמיתי בתוך מרכז העזרה.</p>
              </div>
              <div class="nexus-help-screen__article-links">
                ${viewModel.quickLinks.map((link) => `
                  <button
                    type="button"
                    class="nexus-help-screen__quick-link${link.active ? " is-active" : ""}"
                    data-help-article-id="${escapeHtml(link.id)}"
                  >
                    <div>
                      <strong>${escapeHtml(link.title)}</strong>
                      <span>${escapeHtml(link.category)}</span>
                    </div>
                    <span aria-hidden="true">←</span>
                  </button>
                `).join("")}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-help-screen__list-card",
            padding: "lg",
            content: `
              <div class="nexus-help-screen__section-header">
                <h2>מאמרים בקטגוריה</h2>
                <p>בחירה בקטגוריה למעלה משנה את הרשימה כאן.</p>
              </div>
              <div class="nexus-help-screen__article-links">
                ${viewModel.articleList.map((entry) => renderArticleLink(entry, article?.id ?? "")).join("")}
              </div>
            `,
          })}
        </aside>

        <div class="nexus-help-screen__main-column">
          ${renderNexusCard({
            className: "nexus-help-screen__article-card",
            padding: "lg",
            content: article
              ? `
                <div class="nexus-help-screen__article-head">
                  <span class="nexus-help-screen__article-category">${escapeHtml(article.categoryLabel)}</span>
                  <h2>${escapeHtml(article.title)}</h2>
                  <p>${escapeHtml(article.subtitle)}</p>
                </div>
                <div class="nexus-help-screen__article-body">
                  <p>${escapeHtml(article.body)}</p>
                  <ul>
                    ${article.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
                <div class="nexus-help-screen__article-actions">
                  ${renderNexusButton({
                    label: article.action.label,
                    variant: "primary",
                    attrs: {
                      "data-nexus-ui-target": article.action.target,
                    },
                  })}
                </div>
              `
              : `
                <div class="nexus-help-screen__empty-results">
                  <h2>לא מצאנו תוכן מתאים</h2>
                  <p>נקה את החיפוש או עבור לקטגוריה אחרת כדי לראות שוב מאמרי עזרה.</p>
                </div>
              `,
          })}

          ${renderNexusCard({
            className: "nexus-help-screen__support-card",
            padding: "lg",
            content: `
              <div class="nexus-help-screen__support-header">
                <div>
                  <h2>צריך עזרה נוספת?</h2>
                  <p>אין כאן צ׳אט פיקטיבי. יש תקציר אמיתי שאפשר לפתוח ממנו פנייה במייל או להעתיק לצוות התמיכה.</p>
                </div>
                ${renderNexusButton({
                  label: viewModel.support.panelOpen ? "הסתר פרטי תמיכה" : "הצג פרטי תמיכה",
                  variant: "secondary",
                  attrs: {
                    "data-help-support-toggle": "true",
                  },
                })}
              </div>
              ${supportPanel}
            `,
          })}
        </div>
      </section>
    </section>
  `;

  return `
    <section class="nexus-help-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: "H",
        },
        content,
      })}
    </section>
  `;
}

export function bindHelpSupportScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-help");
  elements.helpSearchInput = host?.querySelector("#help-search-input") ?? null;
  elements.helpSupportSummary = host?.querySelector("#help-support-summary") ?? null;
  elements.helpSupportCopyButton = host?.querySelector("#help-support-copy-button") ?? null;
}
