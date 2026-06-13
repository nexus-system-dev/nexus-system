import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderFileChip(file) {
  const name = typeof file?.name === "string" ? file.name.trim() : "";
  if (!name) {
    return "";
  }
  return `<span class="nexus-create-screen__file-chip">${escapeHtml(name)}</span>`;
}

function renderFileIntakeBoundary(fileIntakeBoundary = null) {
  if (!fileIntakeBoundary || typeof fileIntakeBoundary !== "object") {
    return "";
  }

  const acceptedFiles = Array.isArray(fileIntakeBoundary.acceptedFiles) ? fileIntakeBoundary.acceptedFiles : [];
  const rejectedFiles = Array.isArray(fileIntakeBoundary.rejectedFiles) ? fileIntakeBoundary.rejectedFiles : [];
  const decisions = Array.isArray(fileIntakeBoundary.decisions) ? fileIntakeBoundary.decisions : [];
  if (decisions.length === 0) {
    return "";
  }

  const userFacing = fileIntakeBoundary.userFacing ?? {};
  const policy = fileIntakeBoundary.policy ?? {};
  const routing = fileIntakeBoundary.productUnderstandingRouting ?? {};
  const decisionRows = decisions.slice(0, 4).map((decision) => {
    const isRejected = decision.decision === "rejected";
    const label = isRejected ? "לא נקלט" : decision.decision === "reference-only" ? "רפרנס" : "נקלט";
    return `
      <li class="nexus-create-screen__file-boundary-row" data-file-decision="${escapeHtml(decision.decision ?? "unknown")}">
        <span>${escapeHtml(decision.name ?? "קובץ")}</span>
        <strong>${escapeHtml(label)}</strong>
      </li>
    `;
  }).join("");

  return `
    <aside
      class="nexus-create-screen__file-boundary"
      data-file-intake-task="${escapeHtml(fileIntakeBoundary.taskId ?? "FILE-001")}"
      data-file-intake-status="${escapeHtml(fileIntakeBoundary.status ?? "unknown")}"
      data-file-intake-accepted-count="${acceptedFiles.length}"
      data-file-intake-rejected-count="${rejectedFiles.length}"
      data-file-intake-routing="${escapeHtml(routing.status ?? "reference-only-or-empty")}"
      data-file-intake-retention="${escapeHtml(policy.retentionPolicy ?? "project-lifecycle")}"
      data-file-intake-delete-behavior="${escapeHtml(policy.deleteBehavior ?? "")}"
      data-file-intake-replace-behavior="${escapeHtml(policy.replaceBehavior ?? "")}"
      data-file-intake-max-files="${escapeHtml(String(policy.maxFiles ?? ""))}"
      data-file-intake-max-file-bytes="${escapeHtml(String(policy.maxFileBytes ?? ""))}"
    >
      <div>
        <strong>${escapeHtml(userFacing.title ?? "קבצים ייקלטו בזהירות")}</strong>
        <p>${escapeHtml(userFacing.body ?? "Nexus ישתמש רק בקבצים שעומדים בגבולות ההעלאה של הגרסה הראשונה.")}</p>
      </div>
      <ul>${decisionRows}</ul>
      <span>${escapeHtml(userFacing.limits ?? "")}</span>
    </aside>
  `;
}

function renderDiscoveryAgent(discoveryAgent = {}) {
  const transcript = Array.isArray(discoveryAgent.transcript) ? discoveryAgent.transcript : [];
  const agentLayer = discoveryAgent.agentLayer ?? {};
  const enoughTruthGate = discoveryAgent.enoughTruthGate ?? {};
  const askPolicy = discoveryAgent.askPolicy ?? {};
  const visibleTranscript = transcript.filter((entry) => {
    if (entry.speaker === "user") {
      return Boolean(String(entry.text ?? "").trim());
    }
    return entry.responseSource === "agent-envelope"
      && Boolean(String(entry.text ?? "").trim());
  });
  const isEmpty = visibleTranscript.length === 0;

  return `
    <div
      class="nexus-create-screen__agent-card${isEmpty ? " nexus-create-screen__agent-card--empty" : ""}"
      data-agent-mode="project-discovery"
      data-hidden-intake-engine="${discoveryAgent.hiddenEngine?.preserved ? "preserved" : "missing"}"
      data-agent-conversation="${discoveryAgent.isConversational ? "multi-turn" : "missing"}"
      data-agent-authority="${escapeHtml(agentLayer.agentAuthority ?? "unknown")}"
      data-intake-agent-brain="${discoveryAgent.hiddenEngine?.isAgentBrain === true ? "true" : "false"}"
      data-agent-layer-contract="${escapeHtml(agentLayer.contractId ?? "")}"
      data-agent-response-source="${escapeHtml(discoveryAgent.agentResponseSource ?? "unknown")}"
      data-enough-truth-task="${escapeHtml(enoughTruthGate.taskId ?? "SLICE-003")}"
      data-enough-truth-gate="${escapeHtml(enoughTruthGate.gate ?? "enough-truth-before-build")}"
      data-enough-truth-status="${escapeHtml(enoughTruthGate.status ?? "unknown")}"
      data-enough-truth-build-allowed="${enoughTruthGate.buildAllowed === true ? "true" : "false"}"
      data-enough-truth-authority="${escapeHtml(enoughTruthGate.authority ?? "project-discovery-agent-decision")}"
      data-enough-truth-engine="${escapeHtml(enoughTruthGate.preservedEngine ?? "onboarding-intake-engine")}"
      data-enough-truth-boundary="${escapeHtml(enoughTruthGate.proofBoundary ?? "agent-decision-only-not-skeleton-generation")}"
      data-ask-policy-task="${escapeHtml(askPolicy.taskId ?? "SLICE-004")}"
      data-ask-policy="${escapeHtml(askPolicy.policy ?? "ask-only-if-needed")}"
      data-ask-policy-outcome="${escapeHtml(askPolicy.outcome ?? "unknown")}"
      data-ask-policy-question-count="${escapeHtml(String(askPolicy.questionCount ?? 0))}"
      data-ask-policy-authority="${escapeHtml(askPolicy.authority ?? "project-discovery-agent-decision")}"
      data-ask-policy-boundary="${escapeHtml(askPolicy.proofBoundary ?? "interaction-policy-only-not-skeleton-generation")}"
    >
      <div class="nexus-create-screen__agent-thread" id="project-discovery-agent-thread">
        ${visibleTranscript.map((entry) => `
          <article class="nexus-create-screen__agent-turn nexus-create-screen__agent-turn--${entry.speaker === "user" ? "user" : "agent"}">
            <span>${escapeHtml(entry.label ?? (entry.speaker === "user" ? "אתה" : "Nexus"))}</span>
            <p>${escapeHtml(entry.text ?? "")}</p>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderIdentityBoundary(identity = {}) {
  return `
    <div
      class="nexus-create-screen__identity"
      data-identity-task="${escapeHtml(identity.taskId ?? "ID-001")}"
      data-identity-mode="${escapeHtml(identity.mode ?? "not-started")}"
      data-identity-status="${escapeHtml(identity.status ?? "needs-local-session")}"
      data-identity-user-id="${escapeHtml(identity.userId ?? "")}"
      data-identity-boundary="local-first-release-session"
    >
      <div>
        <span>${escapeHtml(identity.label ?? "שמירה תתחיל ביצירת הפרויקט")}</span>
        <strong>${escapeHtml(identity.displayName ?? "משתמש מקומי")}</strong>
        <p>${escapeHtml(identity.boundary ?? "לפני שמירת פרויקט Nexus תיצור משתמש מקומי ותשייך אליו את הפרויקט.")}</p>
      </div>
      <button
        id="create-local-identity-logout-button"
        class="nexus-create-screen__identity-action"
        type="button"
        ${identity.canLogout ? "" : "disabled"}
      >יציאה ממצב מקומי</button>
    </div>
  `;
}

export function renderProjectCreateScreen(viewModel) {
  const {
    title,
    statusMessage,
    discoveryAgent,
    identity,
    fields,
    upload,
  } = viewModel;
  const selectedFiles = Array.isArray(upload?.selectedFiles) ? upload.selectedFiles : [];
  const sidebar = {
    currentRoute: "/create",
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

  const content = `
    <section id="empty-app-state" class="nexus-create-screen nexus-create-screen--chat-first" data-mode="create">
      <div class="nexus-create-screen__brand">
        <span class="nexus-create-screen__brand-mark">N</span>
        <span class="nexus-create-screen__brand-label">Nexus</span>
      </div>

      <div class="nexus-create-screen__hero">
        <div class="nexus-create-screen__intro">
          <h1 id="create-screen-title" class="nexus-create-screen__title">${escapeHtml(title)}</h1>
          <p id="create-screen-status" class="nexus-create-screen__status">${escapeHtml(statusMessage)}</p>
          ${renderIdentityBoundary(identity)}
        </div>

        <div id="project-create-stage" class="nexus-create-screen__stage">
          ${renderDiscoveryAgent(discoveryAgent)}

          ${renderNexusCard({
            padding: "lg",
            className: "nexus-create-screen__composer-card",
            content: `
              <div
                id="create-project-dropzone"
                class="nexus-create-screen__composer-shell"
                data-has-files="${selectedFiles.length > 0 ? "true" : "false"}"
              >
                <div
                  id="create-project-selected-files"
                  class="nexus-create-screen__files"
                  ${selectedFiles.length === 0 ? "hidden" : ""}
                >
                  ${selectedFiles.map((file) => renderFileChip(file)).join("")}
                </div>
                ${renderFileIntakeBoundary(upload.fileIntakeBoundary)}
                <div class="nexus-create-screen__composer-row">
                  <button
                    id="create-project-file-picker-button"
                    class="nexus-create-screen__composer-plus"
                    type="button"
                    aria-label="הוסף קבצים"
                  >＋</button>
                  <label class="nexus-create-screen__composer-field" for="create-project-vision-input">
                    <textarea
                      id="create-project-vision-input"
                      class="nexus-create-screen__composer-input"
                      rows="3"
                      placeholder="כתוב מה אתה רוצה לבנות..."
                    >${escapeHtml(fields.visionText)}</textarea>
                  </label>
                  ${renderNexusButton({
                    label: "צור פרויקט",
                    variant: "primary",
                    className: "nexus-create-screen__send",
                    attrs: {
                      id: "create-project-button",
                      "aria-label": "התחל עם Nexus",
                    },
                  })}
                </div>
                <span id="create-project-file-picker-title" hidden>${escapeHtml(upload.title)}</span>
                <span id="create-project-file-picker-meta" hidden>${escapeHtml(upload.meta)}</span>
                <input id="create-project-file-upload-input" type="file" accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.json,.js,.jsx,.ts,.tsx,.css,.scss,.html,.yml,.yaml,.csv" multiple hidden />
                <input id="create-project-file-name-input" type="hidden" value="${escapeHtml(fields.fileName)}" />
                <textarea id="create-project-file-content-input" hidden>${escapeHtml(fields.fileContent)}</textarea>
                <input id="create-project-name-input" type="hidden" value="${escapeHtml(fields.projectName)}" />
                <input id="create-project-link-input" type="hidden" value="${escapeHtml(fields.supportingLink)}" />
              </div>
            `,
          })}
        </div>
      </div>
    </section>
  `;

  return `
    <section class="nexus-create-page nexus-create-page--chat-first">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: "שער שיחה · פרויקט חדש",
          avatar: "N",
        },
        content,
      })}
    </section>
  `;
}

export function bindProjectCreateScreenElements(doc, elements) {
  const bindings = {
    emptyAppState: "#empty-app-state",
    createScreenTitle: "#create-screen-title",
    createScreenStatus: "#create-screen-status",
    projectCreateStage: "#project-create-stage",
    createProjectNameInput: "#create-project-name-input",
    createProjectVisionInput: "#create-project-vision-input",
    createProjectLinkInput: "#create-project-link-input",
    createProjectDropzone: "#create-project-dropzone",
    createProjectSelectedFiles: "#create-project-selected-files",
    createProjectFilePickerButton: "#create-project-file-picker-button",
    createProjectFilePickerTitle: "#create-project-file-picker-title",
    createProjectFilePickerMeta: "#create-project-file-picker-meta",
    createProjectFileUploadInput: "#create-project-file-upload-input",
    createProjectFileNameInput: "#create-project-file-name-input",
    createProjectFileContentInput: "#create-project-file-content-input",
    createProjectButton: "#create-project-button",
    createLocalIdentityLogoutButton: "#create-local-identity-logout-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
