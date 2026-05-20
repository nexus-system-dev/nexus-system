import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStatusRow(item) {
  const icon = item.status === "done"
    ? '<span class="nexus-execution-status-row__icon done">✓</span>'
    : item.status === "active"
      ? '<span class="nexus-execution-status-row__icon active">▶</span>'
      : '<span class="nexus-execution-status-row__icon pending"></span>';
  return `
    <div class="nexus-execution-status-row${item.status === "active" ? " active" : ""}">
      <div class="nexus-execution-status-row__main">
        ${icon}
        <span>${escapeHtml(item.label)}</span>
      </div>
      <span class="nexus-execution-status-row__meta">◆</span>
    </div>
  `;
}

function renderBuildStateRow(state) {
  return `
    <div class="nexus-execution-build-state nexus-execution-build-state--${escapeHtml(state.status)}">
      <div class="nexus-execution-build-state__main">
        <strong>${escapeHtml(state.label)}</strong>
        <span>${escapeHtml(state.routeKey)}</span>
      </div>
      <span class="nexus-execution-build-state__status">${escapeHtml(state.status)}</span>
    </div>
  `;
}

function renderReleaseCheck(item) {
  return `
    <div class="nexus-execution-build-state nexus-execution-build-state--${escapeHtml(item.status)}">
      <div class="nexus-execution-build-state__main">
        <strong>${escapeHtml(item.checkId)}</strong>
        <span>${escapeHtml(item.reason || "passed")}</span>
      </div>
      <span class="nexus-execution-build-state__status">${escapeHtml(item.status)}</span>
    </div>
  `;
}

export function renderExecutionLiveScreen(viewModel) {
  const sidebar = {
    currentRoute: "/loop",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "הבנה", href: "/onboarding", target: "onboarding", icon: "⌂" },
      { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
      { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
    ],
    support: [
      { title: "בית", href: "/home", icon: "⌂" },
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

  const steps = renderNexusStepper([
    { label: "יצירה", status: "complete", glyph: "✓" },
    { label: "הכרת הפרויקט", status: "complete", glyph: "✓" },
    { label: "הבנה", status: "complete", glyph: "✓" },
    { label: "פעולה", status: "active" },
  ]);

  const content = `
    <section class="nexus-execution-screen">
      <div class="nexus-execution-screen__stepper">${steps}</div>
      ${renderNexusQaNav("execution")}

      <div class="nexus-execution-screen__intro">
        <div class="nexus-execution-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
        <span class="nexus-execution-screen__detail">${escapeHtml(viewModel.detail)}</span>
      </div>

      <div class="nexus-execution-screen__grid">
        <div class="nexus-execution-screen__main">
          ${renderNexusCard({
            className: "nexus-execution-screen__mission-card",
            padding: "lg",
            content: `
              <h2 id="execution-mission-title">${escapeHtml(viewModel.missionTitle)}</h2>
              <div id="execution-status-list" class="nexus-execution-status-list">
                ${viewModel.statusItems.map(renderStatusRow).join("")}
              </div>
              <div class="nexus-execution-screen__progress">
                <div class="nexus-execution-screen__progress-meta">
                  <span>התקדמות</span>
                  <strong>${escapeHtml(String(viewModel.progressPercent))}%</strong>
                </div>
                <div class="nexus-execution-screen__progress-bar">
                  <div class="nexus-execution-screen__progress-fill" style="width:${escapeHtml(String(viewModel.progressPercent))}%"></div>
                </div>
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-execution-screen__build-state-card",
            padding: "lg",
            content: `
              <div class="nexus-execution-screen__build-state-head">
                <div>
                  <h2>Build progression</h2>
                  <p>השלב הפעיל: ${escapeHtml(viewModel.buildProgressionStateMachine.currentLabel)}</p>
                </div>
                <span class="nexus-execution-screen__build-state-route">${escapeHtml(viewModel.buildProgressionStateMachine.currentRouteKey)}</span>
              </div>
              <div class="nexus-execution-screen__build-state-list">
                ${viewModel.buildProgressionStateMachine.states.map(renderBuildStateRow).join("")}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-execution-screen__live-card",
            padding: "lg",
            content: `
              <h2>פעולה בזמן אמת</h2>
              <div class="nexus-execution-screen__workspace-contract">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>${escapeHtml(viewModel.workspaceSurfaceModel.buildSurfaceTitle)}</strong>
                  <span>${escapeHtml(viewModel.workspaceSurfaceModel.workspaceFamily)}</span>
                </div>
                <p>${escapeHtml(viewModel.workspaceSurfaceModel.buildSurfaceDetail)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Orchestration</span>
                    <strong>${escapeHtml(viewModel.workspaceSurfaceModel.orchestrationEmphasis)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Preview frame</span>
                    <strong>${escapeHtml(viewModel.workspaceSurfaceModel.previewFrameFamily)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Runtime / release</span>
                    <strong>${escapeHtml(`${viewModel.workspaceSurfaceModel.runtimeDirection} -> ${viewModel.workspaceSurfaceModel.releasePathFamily}`)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  ${viewModel.workspaceSurfaceModel.visibleMilestones.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--evolution">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Class-aware evolution</strong>
                  <span>${escapeHtml(viewModel.classSpecificSurfaceEvolutionRules.evolutionFamily)}</span>
                </div>
                <p>${escapeHtml(viewModel.classSpecificSurfaceEvolutionRules.visibleEvolutionRule)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Frontend surface</span>
                    <strong>${escapeHtml(viewModel.classSpecificSurfaceEvolutionRules.frontendSurfaceType)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Backend state</span>
                    <strong>${escapeHtml(viewModel.classSpecificSurfaceEvolutionRules.backendStateType)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Scene / workflow</span>
                    <strong>${escapeHtml(viewModel.classSpecificSurfaceEvolutionRules.sceneType)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  ${viewModel.classSpecificSurfaceEvolutionRules.requiredVisibleChanges.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--local">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Local workspace contract</strong>
                  <span>${escapeHtml(viewModel.localWorkspaceContract.workspaceMode)}</span>
                </div>
                <p>${escapeHtml(`resume via ${viewModel.localWorkspaceContract.resumeWorkspace} | source ${viewModel.localWorkspaceContract.continuitySource}`)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Current workspace</span>
                    <strong>${escapeHtml(viewModel.localWorkspaceContract.currentWorkspaceKey)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Build route</span>
                    <strong>${escapeHtml(viewModel.localWorkspaceContract.buildRouteKey)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Desktop shell</span>
                    <strong>${escapeHtml(viewModel.localWorkspaceContract.desktopShellStatus)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  ${viewModel.localWorkspaceContract.continuityGuarantees.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--shell">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Desktop shell scope</strong>
                  <span>${escapeHtml(viewModel.desktopShellScopeContract.shellFamily)}</span>
                </div>
                <p>${escapeHtml(`${viewModel.desktopShellScopeContract.currentWave4Path} -> ${viewModel.desktopShellScopeContract.preferredFutureShell}`)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Shell status</span>
                    <strong>${escapeHtml(viewModel.desktopShellScopeContract.shellStatus)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Release workflow</span>
                    <strong>${escapeHtml(viewModel.desktopShellScopeContract.releaseWorkflowMode)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  ${viewModel.desktopShellScopeContract.obligations.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--runtime">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Runtime path</strong>
                  <span>${escapeHtml(viewModel.classAwareRuntimeResolver.runtimeFamily)}</span>
                </div>
                <p>${escapeHtml(viewModel.classAwareRuntimeResolver.visibleRuntimeRule)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Project-facing path</span>
                    <strong>${escapeHtml(viewModel.classAwareRuntimeResolver.projectFacingPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Packaging path</span>
                    <strong>${escapeHtml(viewModel.classAwareRuntimeResolver.packagingPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Shell path</span>
                    <strong>${escapeHtml(viewModel.classAwareRuntimeResolver.shellPath)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  <span>${escapeHtml(viewModel.classAwareRuntimeResolver.previewFamily)}</span>
                  <span>${escapeHtml(viewModel.classAwareRuntimeResolver.packagingFamily)}</span>
                  <span>${escapeHtml(viewModel.classAwareRuntimeResolver.preferredReleaseTarget)}</span>
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--package-preview">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Packaging / preview contract</strong>
                  <span>${escapeHtml(viewModel.classAwarePackagingPreviewContract.previewMode)}</span>
                </div>
                <p>${escapeHtml(viewModel.classAwarePackagingPreviewContract.packagingExpectation)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Preview path</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.previewPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Package path</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.packagePath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Package artifact</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.packageArtifactType)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Preview surface</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.previewSurface)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Preview artifact</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.previewArtifact)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Shell path</span>
                    <strong>${escapeHtml(viewModel.classAwarePackagingPreviewContract.shellPath)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  <span>${escapeHtml(viewModel.classAwarePackagingPreviewContract.visiblePreviewRule)}</span>
                  <span>${escapeHtml(viewModel.classAwarePackagingPreviewContract.visiblePackagingRule)}</span>
                  <span>${escapeHtml(viewModel.classAwarePackagingPreviewContract.continuityRule)}</span>
                  ${viewModel.classAwarePackagingPreviewContract.mobileArchivePath
                    ? `<span>${escapeHtml(viewModel.classAwarePackagingPreviewContract.mobileArchivePath)}</span>`
                    : ""}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--releaseable">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Releaseable state</strong>
                  <span>${escapeHtml(viewModel.releaseableProductStateContract.label)}</span>
                </div>
                <p>${escapeHtml(viewModel.releaseableProductStateContract.visibleStateRule)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Release target</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.releaseTarget)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Package path</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.packagePath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Next action</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.nextAction)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Preview path</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.previewPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Package artifact</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.packageArtifactType)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Readiness score</span>
                    <strong>${escapeHtml(viewModel.releaseableProductStateContract.readinessScore)}%</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__build-state-list">
                  ${viewModel.releaseableProductStateContract.visibleChecks.map(renderReleaseCheck).join("")}
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  <span>${escapeHtml(viewModel.releaseableProductStateContract.packagingExpectation)}</span>
                  <span>${escapeHtml(viewModel.releaseableProductStateContract.continuityRule)}</span>
                  ${viewModel.releaseableProductStateContract.blockedReasons.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                </div>
              </div>
              <div class="nexus-execution-screen__workspace-contract nexus-execution-screen__workspace-contract--deployment-path">
                <div class="nexus-execution-screen__workspace-contract-head">
                  <strong>Deployment / release path</strong>
                  <span>${escapeHtml(viewModel.classAwareDeploymentReleasePath.pathFamily)}</span>
                </div>
                <p>${escapeHtml(viewModel.classAwareDeploymentReleasePath.visibleReleaseRule)}</p>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Provider</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.providerType)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Primary target</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.primaryTarget)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Next gate</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.nextGate)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-grid">
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Environment path</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.environmentPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Operational path</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.operationalPath)}</strong>
                  </div>
                  <div class="nexus-execution-screen__workspace-contract-item">
                    <span>Artifact</span>
                    <strong>${escapeHtml(viewModel.classAwareDeploymentReleasePath.deploymentArtifactType)}</strong>
                  </div>
                </div>
                <div class="nexus-execution-screen__workspace-contract-milestones">
                  ${viewModel.classAwareDeploymentReleasePath.boundedTargets.map((item) => `
                    <span>${escapeHtml(item)}</span>
                  `).join("")}
                  <span>${escapeHtml(viewModel.classAwareDeploymentReleasePath.continuityRule)}</span>
                </div>
              </div>
              <div id="execution-live-list" class="nexus-execution-live-list">
                ${viewModel.liveItems.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}
                <div class="execution-route-spinner" aria-hidden="true"></div>
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-execution-screen__logs-card",
            padding: "lg",
            content: `
              <h2>לוג פעולות אחרונות</h2>
              <div id="execution-log-list" class="nexus-execution-log-list">
                ${viewModel.logItems.map((entry) => `
                  <div class="execution-route-log-row">
                    <span>${escapeHtml(entry.time)}</span>
                    <span>${escapeHtml(entry.message)}</span>
                  </div>
                `).join("")}
              </div>
            `,
          })}

          <div class="nexus-execution-screen__actions">
            ${renderNexusButton({
              label: viewModel.stopAction.label,
              variant: "secondary",
              className: "nexus-execution-screen__button",
              disabled: !viewModel.stopAction.supported,
              attrs: { id: "execution-stop-button" },
            })}
            ${renderNexusButton({
              label: viewModel.proofAction.label,
              variant: "primary",
              className: "nexus-execution-screen__button",
              attrs: { id: "execution-proof-button", "data-execution-target": viewModel.proofAction.target },
            })}
          </div>
        </div>

        <aside class="nexus-execution-screen__side">
          ${renderNexusCard({
            className: "nexus-execution-screen__stats-card",
            padding: "lg",
            content: `
              <h2>סטטוס הביצוע</h2>
              <div class="nexus-execution-screen__stats">
                ${viewModel.stats.map((item) => `
                  <div class="nexus-execution-screen__stat">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </div>
                `).join("")}
              </div>
              ${renderNexusButton({
                label: "רענן ביצוע",
                variant: "secondary",
                className: "nexus-execution-screen__refresh",
                attrs: { id: "execution-refresh-button" },
              })}
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-execution-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "ב",
        },
        content,
      })}
    </section>
  `;
}

export function bindExecutionLiveScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-execution");
  const bindings = {
    executionMissionTitle: "#execution-mission-title",
    executionStatusList: "#execution-status-list",
    executionLiveList: "#execution-live-list",
    executionLogList: "#execution-log-list",
    executionStopButton: "#execution-stop-button",
    executionProofButton: "#execution-proof-button",
    executionRefreshButton: "#execution-refresh-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
