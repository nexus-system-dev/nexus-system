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

function renderAccountPanel(viewModel) {
  const activityItems = Array.isArray(viewModel.account.activityItems) ? viewModel.account.activityItems : [];
  const provider = viewModel.persistenceProvider ?? {};
  return renderNexusCard({
    className: "nexus-settings-screen__card",
    content: `
      <div class="nexus-settings-screen__card-copy">
        <h3>גבול חשבון</h3>
        <p>כאן מוצג מה החשבון שלך באמת מחזיק עכשיו ומה עובר למשימות המשך.</p>
      </div>
      <div class="nexus-settings-screen__security-grid">
        <article class="nexus-settings-screen__security-item">
          <span>מצב חשבון</span>
          <strong>${escapeHtml(viewModel.account.status)}</strong>
        </article>
        <article class="nexus-settings-screen__security-item">
          <span>מצב הפעלה</span>
          <strong>${escapeHtml(viewModel.account.sessionStatus)}</strong>
        </article>
        <article class="nexus-settings-screen__security-item">
          <span>אימות אימייל</span>
          <strong>${escapeHtml(viewModel.account.verificationStatus)}</strong>
        </article>
        <article class="nexus-settings-screen__security-item">
          <span>שיטת כניסה</span>
          <strong>${escapeHtml(viewModel.account.authMethod)}</strong>
        </article>
      </div>
      <div class="nexus-settings-screen__account-actions">
        ${renderNexusButton({
          label: "החלף סיסמה",
          variant: "secondary",
          attrs: { id: "settings-change-password-button" },
          disabled: !viewModel.account.canChangePassword,
        })}
        ${renderNexusButton({
          label: "צא מכל ההפעלות",
          variant: "secondary",
          attrs: { id: "settings-logout-all-button" },
        })}
        ${renderNexusButton({
          label: "בקש מחיקת חשבון",
          variant: "secondary",
          attrs: { id: "settings-delete-account-button" },
        })}
      </div>
      <div class="nexus-settings-screen__boundary-list">
        ${(Array.isArray(viewModel.account.boundaries) ? viewModel.account.boundaries : []).map((item) => `
          <p>${escapeHtml(item)}</p>
        `).join("")}
      </div>
      <section
        class="nexus-settings-screen__boundary-list"
        data-supabase-provider-task="${escapeHtml(provider.taskId)}"
        data-supabase-provider-decision="${escapeHtml(provider.decision)}"
        data-supabase-selected-path="${escapeHtml(provider.selectedPersistencePath)}"
        data-supabase-adoption-requirement-count="${escapeHtml(provider.adoptionRequirementCount)}"
      >
        <h4>${escapeHtml(provider.title ?? "ספק אחסון חיצוני")}</h4>
        <p><strong>${escapeHtml(provider.status ?? "לא מחובר עכשיו")}</strong></p>
        <p>${escapeHtml(provider.summary ?? "נקסוס לא מחברת ספק אחסון חיצוני לפני שיש מיפוי מלא.")}</p>
        <p>${escapeHtml(provider.nextStep ?? "החיבור ייפתח אחרי שמיפוי הרשאות, קבצים, פרטיות ושחזור יהיה מוכן.")}</p>
      </section>
      <div class="nexus-settings-screen__activity-list">
        <h4>פעילות חשבון</h4>
        ${activityItems.length > 0
          ? activityItems.map((item) => `
            <article>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.status)}${item.occurredAt ? ` · ${escapeHtml(item.occurredAt)}` : ""}</span>
            </article>
          `).join("")
          : "<p>עדיין אין פעולות חשבון רגישות.</p>"}
      </div>
    `,
  });
}

function renderPrivacyPanel(viewModel) {
  const privacy = viewModel.privacy ?? {};
  const inventoryItems = Array.isArray(privacy.inventoryItems) ? privacy.inventoryItems : [];
  const consentItems = Array.isArray(privacy.consentItems) ? privacy.consentItems : [];
  const blockedScopes = Array.isArray(privacy.blockedDeletionScopes) ? privacy.blockedDeletionScopes : [];

  return renderNexusCard({
    className: "nexus-settings-screen__card nexus-settings-screen__privacy-card",
    content: `
      <section
        data-privacy-center-task="${escapeHtml(privacy.taskId)}"
        data-privacy-center-status="${escapeHtml(privacy.status)}"
        data-privacy-export-status="${escapeHtml(privacy.exportStatus)}"
        data-privacy-deletion-status="${escapeHtml(privacy.deletionStatus)}"
        data-privacy-retention-status="${escapeHtml(privacy.retentionStatus)}"
        data-privacy-rights-request-status="${escapeHtml(privacy.rightsRequestStatus)}"
      >
        <div class="nexus-settings-screen__card-copy">
          <h3>${escapeHtml(privacy.title ?? "פרטיות ונתונים")}</h3>
          <p>${escapeHtml(privacy.summary ?? "כאן מוצג מה נשמר ומה ניתן לייצא או למחוק בפועל.")}</p>
        </div>
        <div class="nexus-settings-screen__security-grid">
          <article class="nexus-settings-screen__security-item">
            <span>יצוא מידע</span>
            <strong>${escapeHtml(privacy.exportStatus ?? "unknown")}</strong>
          </article>
          <article class="nexus-settings-screen__security-item">
            <span>מחיקה</span>
            <strong>${escapeHtml(privacy.deletionStatus ?? "unknown")}</strong>
          </article>
          <article class="nexus-settings-screen__security-item">
            <span>שמירת מידע</span>
            <strong>${escapeHtml(privacy.retentionStatus ?? "unknown")}</strong>
          </article>
          <article class="nexus-settings-screen__security-item">
            <span>בקשה אחרונה</span>
            <strong>${escapeHtml(privacy.rightsRequestStatus ?? "not-requested")}</strong>
          </article>
        </div>
        <div class="nexus-settings-screen__boundary-list">
          <h4>מה נשמר עכשיו</h4>
          ${inventoryItems.map((item) => `
            <p>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.status)} · ${escapeHtml(item.retentionBoundary)}</span>
            </p>
          `).join("")}
        </div>
        <div class="nexus-settings-screen__boundary-list">
          <h4>הסכמות ושליטה</h4>
          ${consentItems.map((item) => `
            <p>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.status)}</span>
            </p>
          `).join("")}
        </div>
        <div class="nexus-settings-screen__boundary-list">
          <h4>גבולות מחיקה</h4>
          <p>${escapeHtml(privacy.deletionPromise ?? "מחיקה לא מוצגת כמיידית אם יש שמירה מוצדקת.")}</p>
          ${blockedScopes.length > 0
            ? blockedScopes.map((item) => `
              <p>
                <strong>${escapeHtml(item.key)}</strong>
                <span>${escapeHtml(item.reason)}</span>
              </p>
            `).join("")
            : "<p>אין כרגע גבולות מחיקה חסומים.</p>"}
        </div>
      </section>
    `,
  });
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
    privacy: "",
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
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "account" ? "" : "is-hidden"}" data-settings-panel="account">
        ${renderAccountPanel(viewModel)}
      </section>
      <section class="nexus-settings-screen__panel ${viewModel.activePanel === "privacy" ? "" : "is-hidden"}" data-settings-panel="privacy">
        ${renderPrivacyPanel(viewModel)}
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
  elements.settingsChangePasswordButton = host.querySelector("#settings-change-password-button");
  elements.settingsLogoutAllButton = host.querySelector("#settings-logout-all-button");
  elements.settingsDeleteAccountButton = host.querySelector("#settings-delete-account-button");
  elements.settingsSaveButton = host.querySelector("#settings-save-button");
  elements.settingsCancelButton = host.querySelector("#settings-cancel-button");
}
