import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusButton } from "../components/NexusButton.js";
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

function renderSettingsToggle({ id, label, description, enabled = false } = {}) {
  return `
    <button
      id="${escapeHtml(id)}"
      type="button"
      class="nexus-settings-screen__toggle"
      data-enabled="${enabled ? "true" : "false"}"
      aria-pressed="${enabled ? "true" : "false"}"
    >
      <div class="nexus-settings-screen__toggle-copy">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(description)}</span>
      </div>
      <span class="nexus-settings-screen__toggle-track" data-enabled="${enabled ? "true" : "false"}">
        <span class="nexus-settings-screen__toggle-thumb"></span>
      </span>
    </button>
  `;
}

function renderPanel(viewModel) {
  const profileCard = renderNexusCard({
    className: "nexus-settings-screen__card",
    content: `
      <div class="nexus-settings-screen__card-copy">
        <h3>פרטים אישיים</h3>
        <p>עדכן את פרטי המשתמש שמופיעים במרחב העבודה.</p>
      </div>
      <div class="nexus-settings-screen__field-stack">
        ${renderNexusInput({
          id: "settings-display-name-input",
          label: "שם מלא",
          value: viewModel.profile.displayName,
          placeholder: "הכנס שם מלא",
        })}
        ${renderNexusInput({
          id: "settings-email-input",
          label: "אימייל",
          type: "email",
          value: viewModel.profile.email,
          placeholder: "your@email.com",
        })}
        <div class="nexus-settings-screen__readonly-field">
          <span class="nexus-settings-screen__readonly-label">תפקיד</span>
          <strong>${escapeHtml(viewModel.profile.role)}</strong>
          <p>הרשאת המרחב נקבעת לפי המשתמש וה־workspace שלך.</p>
        </div>
      </div>
    `,
  });

  const preferencesCard = renderNexusCard({
    className: "nexus-settings-screen__card",
    content: `
      <div class="nexus-settings-screen__card-copy">
        <h3>העדפות</h3>
        <p>שמור את שפת הממשק והעדפות ההתראות שלך.</p>
      </div>
      <div class="nexus-settings-screen__preference-list">
        <label class="nexus-settings-screen__select-row">
          <div>
            <strong>שפת ממשק</strong>
            <span>בחר את שפת הממשק של Nexus</span>
          </div>
          <select id="settings-language-select" class="nexus-settings-screen__select">
            <option value="he" ${viewModel.preferences.preferredLanguage === "he" ? "selected" : ""}>עברית</option>
            <option value="en" ${viewModel.preferences.preferredLanguage === "en" ? "selected" : ""}>English</option>
          </select>
        </label>
        <label class="nexus-settings-screen__select-row">
          <div>
            <strong>ערכת צבע</strong>
            <span>התאם את תצוגת המערכת לסביבת העבודה שלך</span>
          </div>
          <select id="settings-theme-select" class="nexus-settings-screen__select">
            <option value="light" ${viewModel.preferences.themePreference === "light" ? "selected" : ""}>בהיר</option>
            <option value="system" ${viewModel.preferences.themePreference === "system" ? "selected" : ""}>מערכת</option>
          </select>
        </label>
        ${renderSettingsToggle({
          id: "settings-email-toggle",
          label: "התראות אימייל",
          description: "קבל עדכונים משמעותיים גם לתיבת המייל",
          enabled: viewModel.preferences.emailEnabled,
        })}
        ${renderSettingsToggle({
          id: "settings-inapp-toggle",
          label: "התראות בתוך Nexus",
          description: "המשך לקבל התראות ישירות מתוך הממשק",
          enabled: viewModel.preferences.inAppEnabled,
        })}
      </div>
    `,
  });

  const securityCard = renderNexusCard({
    className: "nexus-settings-screen__card",
    content: `
      <div class="nexus-settings-screen__card-copy">
        <h3>אבטחה</h3>
        <p>מצב האימות והאמון של המשתמש הנוכחי.</p>
      </div>
      <div class="nexus-settings-screen__security-grid">
        <article class="nexus-settings-screen__security-item">
          <span>מצב MFA</span>
          <strong>${escapeHtml(viewModel.security.mfaDecision)}</strong>
        </article>
        <article class="nexus-settings-screen__security-item">
          <span>רמת אמון</span>
          <strong>${escapeHtml(viewModel.security.trustLevel)}</strong>
        </article>
      </div>
    `,
  });

  const visibilityMap = {
    profile: "",
    notifications: "",
    security: "",
    appearance: "",
  };

  return `
    <div class="nexus-settings-screen__content-stack">
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "profile" ? "" : "is-hidden"}" data-settings-panel="profile">
        ${profileCard}
        ${preferencesCard}
      </section>
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "notifications" ? "" : "is-hidden"}" data-settings-panel="notifications">
        ${renderNexusCard({
          className: "nexus-settings-screen__card",
          content: `
            <div class="nexus-settings-screen__card-copy">
              <h3>התראות</h3>
              <p>העדפות ההתראות נשמרות בשרת עבור המשתמש הנוכחי.</p>
            </div>
            <div class="nexus-settings-screen__preference-list">
              ${renderSettingsToggle({
                id: "settings-email-toggle-clone",
                label: "עדכוני אימייל",
                description: "זהה למתג הראשי ותישמר באותו payload",
                enabled: viewModel.preferences.emailEnabled,
              })}
              ${renderSettingsToggle({
                id: "settings-inapp-toggle-clone",
                label: "עדכונים בממשק",
                description: "הודעות בתוך Nexus על approvals, failures ו־success",
                enabled: viewModel.preferences.inAppEnabled,
              })}
            </div>
          `,
        })}
      </section>
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "security" ? "" : "is-hidden"}" data-settings-panel="security">
        ${securityCard}
      </section>
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "appearance" ? "" : "is-hidden"}" data-settings-panel="appearance">
        ${renderNexusCard({
          className: "nexus-settings-screen__card",
          content: `
            <div class="nexus-settings-screen__card-copy">
              <h3>מראה</h3>
              <p>ערכת הממשק נשמרת יחד עם הגדרות המרחב.</p>
            </div>
            <label class="nexus-settings-screen__select-row">
              <div>
                <strong>ערכת צבע</strong>
                <span>כרגע נשמרות ערכות בהיר או מערכת</span>
              </div>
              <select id="settings-theme-select-clone" class="nexus-settings-screen__select">
                <option value="light" ${viewModel.preferences.themePreference === "light" ? "selected" : ""}>בהיר</option>
                <option value="system" ${viewModel.preferences.themePreference === "system" ? "selected" : ""}>מערכת</option>
              </select>
            </label>
          `,
        })}
      </section>
    </div>
  `;
}

export function renderSettingsScreen(viewModel) {
  const sidebar = {
    currentRoute: "/settings",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "הבנה", href: "/onboarding", target: "onboarding", icon: "⌂" },
      { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
      { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
    ],
    support: [
      { title: "בית", href: "/home", target: "home", icon: "⌂" },
      { title: "קבצים", href: "/files", icon: "⌘" },
    ],
    advanced: [
      { title: "Developer", href: "/developer", icon: "⌘" },
      { title: "מוח הפרויקט", href: "/brain", icon: "☷" },
      { title: "שחרורים", href: "/release", icon: "▤" },
      { title: "צמיחה", href: "/growth", icon: "↗" },
    ],
    footer: [
      { title: "הגדרות", href: "/settings", icon: "⚙" },
      { title: "עזרה", href: "/help", icon: "?" },
    ],
  };

  const flash = viewModel.errorMessage
    ? `<div class="nexus-settings-screen__flash nexus-settings-screen__flash--error">${escapeHtml(viewModel.errorMessage)}</div>`
    : viewModel.flashMessage
      ? `<div class="nexus-settings-screen__flash">${escapeHtml(viewModel.flashMessage)}</div>`
      : "";

  const content = `
    <section class="nexus-settings-screen">
      <div class="nexus-settings-screen__hero">
        <div>
          <h1>${escapeHtml(viewModel.title)}</h1>
          <p>${escapeHtml(viewModel.subtitle)}</p>
        </div>
        <div class="nexus-settings-screen__hero-actions">
          ${renderNexusButton({
            label: viewModel.savingState === "saving" ? "שומר..." : "שמור שינויים",
            size: "lg",
            attrs: { id: "settings-save-button" },
            disabled: viewModel.savingState === "saving",
          })}
          ${renderNexusButton({
            label: "ביטול",
            size: "lg",
            variant: "secondary",
            attrs: { id: "settings-cancel-button" },
          })}
        </div>
      </div>

      ${flash}

      <div class="nexus-settings-screen__grid">
        <aside class="nexus-settings-screen__menu">
          ${viewModel.tabItems.map((item) => `
            <button
              type="button"
              class="nexus-settings-screen__menu-item ${item.active ? "is-active" : ""}"
              data-settings-tab="${escapeHtml(item.key)}"
            >
              <span class="nexus-settings-screen__menu-icon">${escapeHtml(item.icon)}</span>
              <span>${escapeHtml(item.label)}</span>
            </button>
          `).join("")}
        </aside>
        <div class="nexus-settings-screen__main">
          ${renderPanel(viewModel)}
        </div>
      </div>
    </section>
  `;

  return `
    <section class="nexus-settings-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: "Settings",
          avatar: "N",
        },
        content,
      })}
    </section>
  `;
}

export function bindSettingsScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-settings");
  if (!host) {
    return;
  }

  elements.settingsDisplayNameInput = host.querySelector("#settings-display-name-input");
  elements.settingsEmailInput = host.querySelector("#settings-email-input");
  elements.settingsLanguageSelect = host.querySelector("#settings-language-select");
  elements.settingsThemeSelect = host.querySelector("#settings-theme-select");
  elements.settingsThemeSelectClone = host.querySelector("#settings-theme-select-clone");
  elements.settingsEmailToggle = host.querySelector("#settings-email-toggle");
  elements.settingsEmailToggleClone = host.querySelector("#settings-email-toggle-clone");
  elements.settingsInAppToggle = host.querySelector("#settings-inapp-toggle");
  elements.settingsInAppToggleClone = host.querySelector("#settings-inapp-toggle-clone");
  elements.settingsSaveButton = host.querySelector("#settings-save-button");
  elements.settingsCancelButton = host.querySelector("#settings-cancel-button");
}
