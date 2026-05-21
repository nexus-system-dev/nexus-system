import { buildProjectCreateViewModel } from "./nexus-ui/adapters/project-adapter.js";
import { bindProjectCreateScreenElements, renderProjectCreateScreen } from "./nexus-ui/screens/ProjectCreateScreen.js";
import { buildSmartOnboardingViewModel } from "./nexus-ui/adapters/onboarding-adapter.js";
import { bindSmartOnboardingScreenElements, renderSmartOnboardingScreen } from "./nexus-ui/screens/SmartOnboardingScreen.js";
import {
  buildOnboardingArtifactExpectationPreview,
  buildOnboardingGenerationIntentPreview,
  buildUnderstandingSummaryViewModel,
} from "./nexus-ui/adapters/understanding-adapter.js";
import { bindUnderstandingSummaryScreenElements, renderUnderstandingSummaryScreen } from "./nexus-ui/screens/UnderstandingSummaryScreen.js";
import { buildLoopCoreViewModel } from "./nexus-ui/adapters/loop-adapter.js";
import { renderLoopCoreScreen } from "./nexus-ui/screens/LoopCoreScreen.js";
import { buildExecutionLiveViewModel } from "./nexus-ui/adapters/execution-adapter.js";
import { bindExecutionLiveScreenElements, renderExecutionLiveScreen } from "./nexus-ui/screens/ExecutionLiveScreen.js";
import { buildProofResultViewModel } from "./nexus-ui/adapters/proof-adapter.js";
import { bindProofResultScreenElements, renderProofResultScreen } from "./nexus-ui/screens/ProofResultScreen.js";
import { buildArtifactPreviewViewModel } from "./nexus-ui/adapters/artifact-preview-adapter.js";
import { bindArtifactPreviewScreenElements, renderArtifactPreviewScreen } from "./nexus-ui/screens/ArtifactPreviewScreen.js";
import { buildArtifactDownloadDescriptor } from "./nexus-ui/components/proof-artifact-download.js";
import { buildConfirmationViewModel } from "./nexus-ui/adapters/confirmation-adapter.js";
import { bindConfirmationDecisionScreenElements, renderConfirmationDecisionScreen } from "./nexus-ui/screens/ConfirmationDecisionScreen.js";
import { buildStateUpdateViewModel } from "./nexus-ui/adapters/state-update-adapter.js";
import { bindStateUpdateScreenElements, renderStateUpdateScreen } from "./nexus-ui/screens/StateUpdateScreen.js";
import { buildNextTaskViewModel } from "./nexus-ui/adapters/next-task-adapter.js";
import { bindNextTaskScreenElements, renderNextTaskScreen } from "./nexus-ui/screens/NextTaskScreen.js";
import { buildTimelineViewModel } from "./nexus-ui/adapters/timeline-adapter.js";
import { bindTimelineHistoryScreenElements, renderTimelineHistoryScreen } from "./nexus-ui/screens/TimelineHistoryScreen.js";
import { buildHomeSupportViewModel } from "./nexus-ui/adapters/home-adapter.js";
import { bindHomeSupportScreenElements, renderHomeSupportScreen } from "./nexus-ui/screens/HomeSupportScreen.js";
import { buildFilesSupportViewModel } from "./nexus-ui/adapters/files-adapter.js";
import { renderFilesSupportScreen } from "./nexus-ui/screens/FilesSupportScreen.js";
import { buildSettingsViewModel } from "./nexus-ui/adapters/settings-adapter.js";
import { bindSettingsScreenElements, renderSettingsScreen } from "./nexus-ui/screens/SettingsScreen.js";
import { buildHelpSupportViewModel } from "./nexus-ui/adapters/help-adapter.js";
import { bindHelpSupportScreenElements, renderHelpSupportScreen } from "./nexus-ui/screens/HelpSupportScreen.js";
import { renderQaFallbackScreen } from "./nexus-ui/screens/QaFallbackScreen.js";
import { renderNexusCard } from "./nexus-ui/components/NexusCard.js";
import { renderNexusButton } from "./nexus-ui/components/NexusButton.js";
import { renderWorkspaceLayout } from "./nexus-ui/layouts/WorkspaceLayout.js";
import { PRIMARY_LOOP_ROUTES, SUPPORT_ROUTES } from "./nexus-ui/routes/index.js";
import { resolveCanonicalProductClass } from "./shared/product-class-model.js";
import {
  createLearningGuidedOnboardingContext,
  hasLearningGuidedSufficientUnderstanding,
  resolveCanonicalOnboardingAnswers,
  resolveLearningGuidedOnboardingDecision,
} from "./shared/learning-guided-onboarding.js";
import {
  createOnboardingProviderRuntime,
  resolveOnboardingAgentProvider,
} from "./shared/onboarding-provider-runtime.js";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function isExplicitDevModeEnabled() {
  if (globalThis.location === undefined) {
    return false;
  }

  const searchParams = new URLSearchParams(globalThis.location.search ?? "");
  return searchParams.get("dev") === "1";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setCssVar(styleTarget, name, value) {
  if (!styleTarget || typeof styleTarget.setProperty !== "function" || value === undefined || value === null) {
    return;
  }

  styleTarget.setProperty(name, String(value));
}

const CREATE_PROJECT_UPLOAD_EMPTY_META = "README, package.json, קבצי קוד, מסמכים וקבצי הקשר. אפשר לבחור כמה קבצים יחד.";
const CREATE_PROJECT_UPLOAD_SELECTED_META = "הקבצים ייכנסו ל־onboarding כחומר פרויקט אמיתי לפני פתיחת ה־workspace.";

function triggerArtifactDownload(doc, project) {
  const artifact = normalizeObject(project?.proofArtifact);
  const descriptor = buildArtifactDownloadDescriptor({ project, artifact });
  if (!descriptor || !doc?.defaultView?.URL || !doc?.defaultView?.Blob) {
    return false;
  }

  const blob = new doc.defaultView.Blob([descriptor.content], { type: descriptor.mimeType });
  const objectUrl = doc.defaultView.URL.createObjectURL(blob);
  const link = doc.createElement("a");
  link.href = objectUrl;
  link.download = descriptor.filename;
  link.style.display = "none";
  doc.body.append(link);
  link.click();
  link.remove();
  doc.defaultView.setTimeout(() => doc.defaultView.URL.revokeObjectURL(objectUrl), 0);
  return true;
}

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
  advisory: "זמין",
  recommendation: "המלצה",
  warning: "אזהרה",
  critical: "קריטי",
  partial: "חלקי",
  full: "מלא",
  shared: "משותף",
  solo: "יחיד",
  open: "פתוח",
  success: "הצלחה",
  "task.assigned": "משימה שובצה",
  "task.completed": "משימה הושלמה",
  "task.failed": "משימה נכשלה",
  "roadmap.generated": "נוצרה תוכנית",
  "state.updated": "המצב עודכן",
};

function t(value) {
  return labels[value] ?? value;
}

function listHtml(items, emptyText) {
  if (!items.length) {
    return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  }

  return items
    .map(
      (item) => `
      <article class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
      </article>
    `,
    )
    .join("");
}

function metricHtml(metrics) {
  return `
    <div class="signal-grid">
      ${metrics
        .map(
          (metric) => `
          <div class="signal-item">
            <span class="mini-label">${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function stackHtml(title, items, emptyText) {
  if (!items.length) {
    return `
      <section class="stack-block">
        <h3>${escapeHtml(title)}</h3>
        <p class="empty">${escapeHtml(emptyText)}</p>
      </section>
    `;
  }

  return `
    <section class="stack-block">
      <h3>${escapeHtml(title)}</h3>
      <div class="stack-list">
        ${items
          .map(
            (item) => `
            <article class="stack-item">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
            </article>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function queryElements(doc) {
  return {
    projectSelect: doc.querySelector("#project-select"),
    shellRouteLabel: doc.querySelector("#shell-route-label"),
    shellRouteTitle: doc.querySelector("#shell-route-title"),
    shellRouteSubtitle: doc.querySelector("#shell-route-subtitle"),
    topbarNotificationsButton: doc.querySelector("#topbar-notifications-button"),
    topbarProfileButton: doc.querySelector("#topbar-profile-button"),
    navCreateButton: doc.querySelector("#nav-create"),
    navOnboardingButton: doc.querySelector("#nav-onboarding"),
    navLoopButton: doc.querySelector("#nav-loop"),
    navTimelineButton: doc.querySelector("#nav-timeline"),
    navDeveloperButton: doc.querySelector("#nav-developer"),
    navProjectBrainButton: doc.querySelector("#nav-project-brain"),
    navReleaseButton: doc.querySelector("#nav-release"),
    navGrowthButton: doc.querySelector("#nav-growth"),
    navSettingsButton: doc.querySelector("#nav-settings"),
    navHelpButton: doc.querySelector("#nav-help"),
    flowStepCreateButton: doc.querySelector("#flow-step-create"),
    flowStepOnboardingButton: doc.querySelector("#flow-step-onboarding"),
    flowStepUnderstandingButton: doc.querySelector("#flow-step-understanding"),
    flowStepLoopButton: doc.querySelector("#flow-step-loop"),
    qaRouteSwitcher: doc.querySelector("#qa-route-switcher"),
    qaPrevScreenButton: doc.querySelector("#qa-prev-screen-button"),
    qaNextScreenButton: doc.querySelector("#qa-next-screen-button"),
    qaScreenCreateButton: doc.querySelector("#qa-screen-create-button"),
    qaScreenOnboardingButton: doc.querySelector("#qa-screen-onboarding-button"),
    qaScreenUnderstandingButton: doc.querySelector("#qa-screen-understanding-button"),
    qaScreenLoopButton: doc.querySelector("#qa-screen-loop-button"),
    qaScreenExecutionButton: doc.querySelector("#qa-screen-execution-button"),
    qaScreenProofButton: doc.querySelector("#qa-screen-proof-button"),
    syncCasinoButton: doc.querySelector("#sync-casino-button"),
    analyzeButton: doc.querySelector("#analyze-button"),
    runCycleButton: doc.querySelector("#run-cycle-button"),
    heroActions: doc.querySelector(".hero-actions"),
    screenCreate: doc.querySelector("#screen-create"),
    screenHome: doc.querySelector("#screen-home"),
    screenFiles: doc.querySelector("#screen-files"),
    screenSettings: doc.querySelector("#screen-settings"),
    screenHelp: doc.querySelector("#screen-help"),
    screenOnboarding: doc.querySelector("#screen-onboarding"),
    screenUnderstanding: doc.querySelector("#screen-understanding"),
    screenLoop: doc.querySelector("#screen-loop"),
    screenExecution: doc.querySelector("#screen-execution"),
    screenProof: doc.querySelector("#screen-proof"),
    screenArtifact: doc.querySelector("#screen-artifact"),
    screenConfirmation: doc.querySelector("#screen-confirmation"),
    screenStateUpdate: doc.querySelector("#screen-state-update"),
    screenNextTask: doc.querySelector("#screen-next-task"),
    screenTimeline: doc.querySelector("#screen-timeline"),
    screenWorkspace: doc.querySelector("#screen-workspace"),
    workspaceTabs: doc.querySelector(".workspace-tabs"),
    workspaceTopShell: doc.querySelector(".workspace-top-shell"),
    workspaceOverviewGrid: doc.querySelector(".workspace-overview-grid"),
    workspaceBoard: doc.querySelector("#workspace-board"),
    flowFeedbackBanner: doc.querySelector("#flow-feedback-banner"),
    flowFeedbackTitle: doc.querySelector("#flow-feedback-title"),
    flowFeedbackMessage: doc.querySelector("#flow-feedback-message"),
    createNewProjectButton: doc.querySelector("#create-new-project-button"),
    reopenOnboardingButton: doc.querySelector("#reopen-onboarding-button"),
    emptyAppState: doc.querySelector("#empty-app-state"),
    createScreenTitle: doc.querySelector("#create-screen-title"),
    createScreenStatus: doc.querySelector("#create-screen-status"),
    projectCreateStage: doc.querySelector("#project-create-stage"),
    onboardingStage: doc.querySelector("#onboarding-stage"),
    onboardingScreenMessage: doc.querySelector("#onboarding-screen-message"),
    onboardingScreenStatus: doc.querySelector("#onboarding-screen-status"),
    onboardingStageTitle: doc.querySelector("#onboarding-stage-title"),
    onboardingStageDescription: doc.querySelector("#onboarding-stage-description"),
    onboardingProgressPill: doc.querySelector("#onboarding-progress-pill"),
    onboardingProviderRuntimePill: doc.querySelector("#onboarding-provider-runtime-pill"),
    onboardingBackButton: doc.querySelector("#onboarding-back-button"),
    onboardingForwardButton: doc.querySelector("#onboarding-forward-button"),
    onboardingNotesList: doc.querySelector("#onboarding-notes-list"),
    onboardingUnderstoodList: doc.querySelector("#onboarding-understood-list"),
    onboardingMissingList: doc.querySelector("#onboarding-missing-list"),
    onboardingChatThread: doc.querySelector("#onboarding-chat-thread"),
    onboardingProviderSelect: doc.querySelector("#onboarding-provider-select"),
    onboardingProviderRuntimeLabel: doc.querySelector("#onboarding-provider-runtime-label"),
    onboardingProviderRuleLine: doc.querySelector("#onboarding-provider-rule-line"),
    onboardingProviderSummaryLine: doc.querySelector("#onboarding-provider-summary-line"),
    onboardingProviderCanonicalRule: doc.querySelector("#onboarding-provider-canonical-rule"),
    understandingAudienceTitle: doc.querySelector("#understanding-audience-title"),
    understandingAudienceBody: doc.querySelector("#understanding-audience-body"),
    understandingProblemTitle: doc.querySelector("#understanding-problem-title"),
    understandingProblemBody: doc.querySelector("#understanding-problem-body"),
    understandingSolutionTitle: doc.querySelector("#understanding-solution-title"),
    understandingSolutionBody: doc.querySelector("#understanding-solution-body"),
    understandingGoalTitle: doc.querySelector("#understanding-goal-title"),
    understandingGoalBody: doc.querySelector("#understanding-goal-body"),
    understandingCorrectButton: doc.querySelector("#understanding-correct-button"),
    understandingContinueButton: doc.querySelector("#understanding-continue-button"),
    onboardingCurrentQuestionTitle: doc.querySelector("#onboarding-current-question-title"),
    onboardingCurrentQuestionBody: doc.querySelector("#onboarding-current-question-body"),
    onboardingAnswerInput: doc.querySelector("#onboarding-answer-input"),
    onboardingNextButton: doc.querySelector("#onboarding-next-button"),
    onboardingMaterialStage: doc.querySelector("#onboarding-material-stage"),
    onboardingFormStage: doc.querySelector("#onboarding-form-stage"),
    createProjectNameInput: doc.querySelector("#create-project-name-input"),
    createProjectVisionInput: doc.querySelector("#create-project-vision-input"),
    createProjectLinkInput: doc.querySelector("#create-project-link-input"),
    helpSearchInput: doc.querySelector("#help-search-input"),
    helpSupportSummary: doc.querySelector("#help-support-summary"),
    helpSupportCopyButton: doc.querySelector("#help-support-copy-button"),
    createProjectFileNameInput: doc.querySelector("#create-project-file-name-input"),
    createProjectFileContentInput: doc.querySelector("#create-project-file-content-input"),
    createProjectFileUploadInput: doc.querySelector("#create-project-file-upload-input"),
    createProjectFilePickerButton: doc.querySelector("#create-project-file-picker-button"),
    createProjectFilePickerTitle: doc.querySelector("#create-project-file-picker-title"),
    createProjectFilePickerMeta: doc.querySelector("#create-project-file-picker-meta"),
    createProjectButton: doc.querySelector("#create-project-button"),
    finishOnboardingButton: doc.querySelector("#finish-onboarding-button"),
    loopTab: doc.querySelector("#tab-loop"),
    developerTab: doc.querySelector("#tab-developer"),
    projectBrainTab: doc.querySelector("#tab-project-brain"),
    releaseTab: doc.querySelector("#tab-release"),
    growthTab: doc.querySelector("#tab-growth"),
    heroProjectName: doc.querySelector("#hero-project-name"),
    heroGoal: doc.querySelector("#hero-goal"),
    now: doc.querySelector("#now-content"),
    critical: doc.querySelector("#critical-content"),
    missing: doc.querySelector("#missing-content"),
    existing: doc.querySelector("#existing-content"),
    live: doc.querySelector("#live-content"),
    decision: doc.querySelector("#decision-content"),
    loopWorkspaceSummary: doc.querySelector("#loop-workspace-summary"),
    loopScreenIntro: doc.querySelector("#loop-screen-intro"),
    loopPrimaryTitle: doc.querySelector("#loop-primary-title"),
    loopPrimaryReason: doc.querySelector("#loop-primary-reason"),
    loopWhatHappensBody: doc.querySelector("#loop-what-happens-body"),
    loopPrimaryActionButton: doc.querySelector("#loop-primary-action-button"),
    loopSecondaryActionButton: doc.querySelector("#loop-secondary-action-button"),
    loopWorkspacePanel: doc.querySelector("#workspace-loop"),
    executionWorkspacePanel: doc.querySelector("#workspace-execution"),
    proofWorkspacePanel: doc.querySelector("#workspace-proof"),
    loopStageRail: doc.querySelector("#loop-stage-rail-content"),
    loopUnderstanding: doc.querySelector("#loop-understanding-content"),
    loopNextTask: doc.querySelector("#loop-next-task-content"),
    loopExecution: doc.querySelector("#loop-execution-content"),
    loopProof: doc.querySelector("#loop-proof-content"),
    loopOpenOnboardingButton: doc.querySelector("#loop-open-onboarding-button"),
    loopOpenProjectBrainButton: doc.querySelector("#loop-open-project-brain-button"),
    loopOpenDeveloperButton: doc.querySelector("#loop-open-developer-button"),
    loopOpenReleaseButton: doc.querySelector("#loop-open-release-button"),
    executionMissionTitle: doc.querySelector("#execution-mission-title"),
    executionStatusList: doc.querySelector("#execution-status-list"),
    executionLiveList: doc.querySelector("#execution-live-list"),
    executionLogList: doc.querySelector("#execution-log-list"),
    executionStopButton: doc.querySelector("#execution-stop-button"),
    executionProofButton: doc.querySelector("#execution-proof-button"),
    executionRefreshButton: doc.querySelector("#execution-refresh-button"),
    proofPreviewTitle: doc.querySelector("#proof-preview-title"),
    proofReadyTitle: doc.querySelector("#proof-ready-title"),
    proofBulletsList: doc.querySelector("#proof-bullets-list"),
    proofStatsGrid: doc.querySelector("#proof-stats-grid"),
    proofDownloadButton: doc.querySelector("#proof-download-button"),
    proofOpenButton: doc.querySelector("#proof-open-button"),
    proofFullButton: doc.querySelector("#proof-full-button"),
    developerWorkspaceSummary: doc.querySelector("#developer-workspace-summary"),
    developerWorkspacePanel: doc.querySelector("#workspace-developer"),
    projectBrainSummary: doc.querySelector("#project-brain-summary"),
    projectBrainPanel: doc.querySelector("#workspace-project-brain"),
    releaseWorkspaceSummary: doc.querySelector("#release-workspace-summary"),
    releaseWorkspacePanel: doc.querySelector("#workspace-release"),
    growthWorkspaceSummary: doc.querySelector("#growth-workspace-summary"),
    growthWorkspacePanel: doc.querySelector("#workspace-growth"),
    screenReview: doc.querySelector("#screen-review-content"),
    proposalReview: doc.querySelector("#proposal-review-content"),
    proposalSectionTitleInput: doc.querySelector("#proposal-section-title-input"),
    proposalSectionSummaryInput: doc.querySelector("#proposal-section-summary-input"),
    proposalNextActionLabelInput: doc.querySelector("#proposal-next-action-label-input"),
    proposalAnnotationInput: doc.querySelector("#proposal-annotation-input"),
    proposalEditButton: doc.querySelector("#proposal-edit-button"),
    partialSectionDecisionSelect: doc.querySelector("#partial-section-decision-select"),
    partialComponentDecisionSelect: doc.querySelector("#partial-component-decision-select"),
    partialCopyDecisionSelect: doc.querySelector("#partial-copy-decision-select"),
    partialAcceptanceNoteInput: doc.querySelector("#partial-acceptance-note-input"),
    partialAcceptanceButton: doc.querySelector("#partial-acceptance-button"),
    snapshotIntervalInput: doc.querySelector("#snapshot-interval-input"),
    snapshotTriggersInput: doc.querySelector("#snapshot-triggers-input"),
    snapshotScheduleButton: doc.querySelector("#snapshot-schedule-button"),
    runSnapshotBackupButton: doc.querySelector("#run-snapshot-backup-button"),
    snapshotMaxInput: doc.querySelector("#snapshot-max-input"),
    snapshotRetentionButton: doc.querySelector("#snapshot-retention-button"),
    snapshotCleanupButton: doc.querySelector("#snapshot-cleanup-button"),
    snapshotWorkerToggleButton: doc.querySelector("#snapshot-worker-toggle-button"),
    snapshotWorkerRunButton: doc.querySelector("#snapshot-worker-run-button"),
    disasterRecoveryRefreshButton: doc.querySelector("#disaster-recovery-refresh-button"),
    continuityActionSelect: doc.querySelector("#continuity-action-select"),
    continuityActionButton: doc.querySelector("#continuity-action-button"),
    continuityRefreshButton: doc.querySelector("#continuity-refresh-button"),
    executeRollbackButton: doc.querySelector("#execute-rollback-button"),
    projectAuditActorInput: doc.querySelector("#project-audit-actor-input"),
    projectAuditActionInput: doc.querySelector("#project-audit-action-input"),
    projectAuditSensitivitySelect: doc.querySelector("#project-audit-sensitivity-select"),
    projectAuditRefreshButton: doc.querySelector("#project-audit-refresh-button"),
    projectAudit: doc.querySelector("#project-audit-content"),
    accessIsolation: doc.querySelector("#access-isolation-content"),
    learning: doc.querySelector("#learning-content"),
    companion: doc.querySelector("#companion-content"),
    collaboration: doc.querySelector("#collaboration-content"),
    versioning: doc.querySelector("#versioning-content"),
    growth: doc.querySelector("#growth-content"),
    casinoBaseUrlInput: doc.querySelector("#casino-base-url-input"),
    external: doc.querySelector("#external-content"),
    scanPathInput: doc.querySelector("#scan-path-input"),
    scanButton: doc.querySelector("#scan-button"),
    scanner: doc.querySelector("#scanner-content"),
    primitiveComponents: doc.querySelector("#primitive-components-content"),
    layoutComponents: doc.querySelector("#layout-components-content"),
    feedbackComponents: doc.querySelector("#feedback-components-content"),
    navigationComponents: doc.querySelector("#navigation-components-content"),
    dataDisplayComponents: doc.querySelector("#data-display-components-content"),
    analysis: doc.querySelector("#analysis-content"),
    graph: doc.querySelector("#graph-content"),
    agents: doc.querySelector("#agents-content"),
    events: doc.querySelector("#events-content"),
  };
}

function applyDevModeVisibility(elements) {
  const showDeveloper = isExplicitDevModeEnabled();
  if (elements.navDeveloperButton) {
    elements.navDeveloperButton.hidden = !showDeveloper;
  }
  if (elements.developerTab) {
    elements.developerTab.hidden = !showDeveloper;
  }
  if (elements.developerWorkspacePanel) {
    elements.developerWorkspacePanel.hidden = !showDeveloper;
  }
}

const workspaceKeys = ["loop", "execution", "proof", "artifact", "confirmation", "state-update", "next-task", "timeline", "developer", "project-brain", "release", "growth"];
const shellPrimaryStepKeys = ["create", "onboarding", "understanding", "loop"];
const advancedShellRouteKeys = ["developer", "project-brain", "release", "growth"];
const shellRouteKeys = new Set([
  ...PRIMARY_LOOP_ROUTES,
  ...SUPPORT_ROUTES.filter((routeKey) => routeKey !== "notifications" && routeKey !== "integrations"),
  ...advancedShellRouteKeys,
  "artifact",
  "qa",
]);
  const onboardingQuestionFlow = [
  {
    id: "target-audience",
    title: "מי המשתמש או הקהל המרכזי של הפרויקט הזה?",
    body: "ענה בקצרה מי המשתמש המרכזי כדי שנבין עבור מי בונים את הפרויקט.",
    placeholder: "לדוגמה: עצמאים שרוצים יותר פניות, או צוות תפעול שצריך תור עבודה ברור",
  },
  {
    id: "core-problem",
    title: "מה הבעיה המרכזית שהם מתמודדים איתה?",
    body: "תאר את הכאב המרכזי שחוזר שוב ושוב אצל המשתמש הזה.",
    placeholder: "לדוגמה: קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
  },
  {
    id: "successful-solution",
    title: "איך נראה פתרון מוצלח מבחינתם?",
    body: "תאר איך נראה בעיניהם פתרון שממש עובד עבורם.",
    placeholder: "לדוגמה: כלי לקוחות פשוט ונוח עם התראות",
  },
];

function detectOnboardingProjectType(text = "") {
  return resolveCanonicalProductClass({
    texts: [String(text ?? "")],
    fallback: "unknown",
  }).productClass;
}

function detectOnboardingProjectTypeCandidates(text = "") {
  const normalized = String(text ?? "").toLowerCase();
  const candidates = new Set();

  if (/(landing page|landing-page|website|marketing site|marketing page|homepage|web site|site|דף נחיתה|אתר שיווקי|שיווק)/i.test(normalized)) {
    candidates.add("landing-page");
  }
  if (/(ecommerce|shop|store|catalog|checkout|cart|order|orders|inventory|merchant|fulfillment|commerce|מסחר|קטלוג|הזמנות|מלאי)/i.test(normalized)) {
    candidates.add("commerce-ops");
  }
  if (/(internal tool|ops|operations|backoffice|back office|admin panel|portal|workspace|queue|תפעול|צוות פנימי|כלי פנימי)/i.test(normalized)) {
    candidates.add("internal-tool");
  }
  if (/(saas|subscription|mvp|web app|platform|crm|customer|client|follow-up|reminder|dashboard|מערכת|כלי|לקוחות)/i.test(normalized)) {
    candidates.add("saas");
  }
  if (/(mobile app|react native|expo|ios|android|אפליקציה)/i.test(normalized)) {
    candidates.add("mobile-app");
  }

  return [...candidates];
}

function resolveOnboardingProjectType(options = {}) {
  const draftVisionText =
    options.visionText
    ?? globalThis.document?.querySelector("#create-project-vision-input")?.value
    ?? "";
  const projectSummaryText = options.projectTypeHint ?? "";
  const uploadedFilesText = (() => {
    const rawFileContent = globalThis.document?.querySelector("#create-project-file-content-input")?.value ?? "";
    if (!rawFileContent.trim()) {
      return "";
    }
    try {
      const parsed = JSON.parse(rawFileContent);
      if (!Array.isArray(parsed)) {
        return "";
      }
      return parsed
        .flatMap((file) => [file?.name, file?.type, file?.content])
        .filter((value) => typeof value === "string" && value.trim())
        .join("\n");
    } catch {
      return rawFileContent;
    }
  })();
  const combinedSignals = [draftVisionText, projectSummaryText, uploadedFilesText].join("\n");
  return resolveCanonicalProductClass({
    texts: [combinedSignals],
    hintedClass: options.projectTypeHint,
    fallback: "unknown",
  }).productClass;
}

function resolveLocalOnboardingClassification(answers = {}, options = {}) {
  const projectTypeHint = normalizeString(options.projectTypeHint, "");
  if (projectTypeHint && projectTypeHint !== "unknown") {
    return {
      projectType: projectTypeHint,
      candidateTypes: [projectTypeHint],
      isAmbiguous: false,
    };
  }

  const projectClassAnswer = normalizeString(answers["project-class"], "");
  if (projectClassAnswer) {
    const answerType = detectOnboardingProjectType(projectClassAnswer);
    if (answerType !== "unknown") {
      return {
        projectType: answerType,
        candidateTypes: [answerType],
        isAmbiguous: false,
      };
    }
  }

  const sourceText = [
    options.visionText,
    projectTypeHint,
    normalizeString(answers["target-audience"], ""),
    normalizeString(answers["core-problem"], ""),
    normalizeString(answers["successful-solution"], ""),
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");
  const candidateTypes = detectOnboardingProjectTypeCandidates(sourceText);
  const detectedProjectType = resolveCanonicalProductClass({
    texts: [sourceText],
    hintedClass: projectTypeHint || null,
    fallback: "unknown",
  }).productClass;
  const projectType = detectedProjectType !== "unknown"
    ? detectedProjectType
    : candidateTypes.length === 1
      ? candidateTypes[0]
      : "unknown";

  return {
    projectType,
    candidateTypes,
    isAmbiguous: candidateTypes.length > 1 || projectType === "unknown",
  };
}

function resolveLocalOnboardingProjectType(answers = {}, options = {}) {
  return resolveLocalOnboardingClassification(answers, options).projectType;
}

function resolveLocalLearningContext(options = {}, projectType = "unknown") {
  return createLearningGuidedOnboardingContext({
    learningDecisionImpact: options.learningDecisionImpact ?? null,
    generationIntent: options.generationIntent ?? null,
    projectTypeHint: projectType !== "unknown" ? projectType : options.projectTypeHint ?? "",
    visionText: options.visionText ?? "",
  });
}

function localRequiresSolutionQuestion(projectType) {
  return projectType !== "landing-page";
}

function localHasSufficientUnderstanding({ projectType, audience, problem, solution }) {
  if (!audience || !problem) {
    return false;
  }

  if (projectType === "landing-page") {
    return true;
  }

  return Boolean(solution);
}

function buildLocalAdaptiveQuestionPlan(answers = {}, options = {}) {
  const classification = resolveLocalOnboardingClassification(answers, options);
  return resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveLocalLearningContext(options, classification.projectType),
  }).questionPlan;
}

function resolveLocalNextQuestionId(answers = {}, options = {}) {
  const classification = resolveLocalOnboardingClassification(answers, options);
  return resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveLocalLearningContext(options, classification.projectType),
  }).nextQuestionId;
}

function resolveOnboardingQuestionPresentation(questionId, answers = {}, options = {}) {
  const projectType = resolveLocalOnboardingProjectType(answers, options) || resolveOnboardingProjectType(options);
  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);

  if (questionId === "target-audience") {
    if (projectType === "landing-page") {
      return {
        title: "למי דף הנחיתה הזה צריך לדבר?",
        placeholder: "לדוגמה: עצמאים שרוצים יותר פניות בלי שיחת מכירה ארוכה",
        reason: "השאלה הזו תעזור לי לנסח כותרת, אמון ופעולה כך שהדף ידבר מיד אל הקהל הנכון.",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: "מי ישתמש באפליקציה הזאת ביום-יום?",
        placeholder: "לדוגמה: הורים עובדים שצריכים להבין מהר מה קורה היום",
        reason: "השאלה הזו תעזור לי לדייק את המסך הראשון, הפעולה הראשונה והזרימה שאחריה.",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: "מי הצוות שיעבוד עם הכלי הזה בכל יום?",
        placeholder: "לדוגמה: צוות תפעול ושירות שצריך לראות תור עבודה ברור",
        reason: "השאלה הזו תעזור לי לבנות משטח עבודה שמדבר ישר אל מי שמטפל בתור ובבקשות.",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: "מי הצוות שמנהל את המסחר הזה בכל יום?",
        placeholder: "לדוגמה: צוות מסחר ותפעול שמחזיק קטלוג, הזמנות ותוכן",
        reason: "השאלה הזו תעזור לי לבנות מרכז מסחר שמראה מה נתקע בקטלוג, בהזמנות ובתוכן בלי לפצל את הצוות בין מסכים.",
      };
    }
    if (projectType === "saas") {
      return {
        title: "מי המשתמשים שצריכים לנהל את העבודה בתוך המוצר?",
        placeholder: "לדוגמה: מאמנים עצמאיים שמנהלים לקוחות וחידושי מנוי",
        reason: "השאלה הזו תעזור לי לדייק את הלוח, הפעולה הראשונה וההתקדמות שהמוצר צריך לאפשר.",
      };
    }
  }

  if (questionId === "audience-clarification") {
    if (projectType === "landing-page") {
      return {
        title: "התשובה עדיין כללית מדי. איזה סוג עסק בדיוק צריך את הדף, מי מקבל את ההחלטה, ומה גורם לו להשאיר ליד?",
        placeholder: "לדוגמה: בעלי קליניקות פרטיות שמקבלים לידים אבל לא מצליחים להפוך אותם לשיחת ייעוץ",
        reason: "הלמידה עוצרת כאן כי תשובה כללית כמו 'עסק' מחזירה את Nexus ל־generation גנרי במקום להבין מי הלקוח ומה רגע ההמרה.",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: "התשובה עדיין כללית מדי. איזה צוות בדיוק עובד עם הכלי, מי מחזיק את התור, ומה קורה במשמרת רגילה?",
        placeholder: "לדוגמה: צוות שירות של 12 נציגים שמחלק פניות בין משמרות ונופל בלי בעלות ברורה",
        reason: "הלמידה עוצרת כאן כי בלי סוג צוות ו-workflow מדויק Nexus בונה משטח עבודה כללי מדי.",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: "התשובה עדיין כללית מדי. איזה צוות מסחר בדיוק עובד כאן, מי מחזיק הזמנות או מלאי, ומה הפעולה היומית הקריטית?",
        placeholder: "לדוגמה: צוות מסחר שמעדכן קטלוג, חריגות מלאי והזמנות דחופות לאורך היום",
        reason: "הלמידה עוצרת כאן כי בלי סוג צוות ו-flow ברור Nexus תפתח מסך מסחר כללי מדי.",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: "התשובה עדיין כללית מדי. מי המשתמש המדויק באפליקציה, ובאיזה רגע ביום הוא חייב לפתוח אותה?",
        placeholder: "לדוגמה: הורים עובדים שפותחים את האפליקציה כל בוקר כדי להבין מה השתנה לילד",
        reason: "הלמידה עוצרת כאן כי אפליקציה בלי משתמש ורגע שימוש ברורים מתדרדרת למסך פתיחה גנרי.",
      };
    }
    return {
      title: "התשובה עדיין כללית מדי. איזה סוג עסק או צוות בדיוק משתמש במוצר, מי המשתמש המרכזי, ומה הוא מנסה להשיג ביום רגיל?",
      placeholder: "לדוגמה: בעלי קליניקות קטנות שמנהלים לידים וחוזרים ידנית לכל פנייה",
      reason: "הלמידה עוצרת כאן כי תשובה כללית מדי לא מספיקה כדי להתחיל generation אמיתי.",
    };
  }

  if (questionId === "project-class") {
    return {
      title: "מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, מערכת מסחר תפעולית, כלי פנימי לצוות, או מוצר SaaS קטן?",
      placeholder: "לדוגמה: דף נחיתה / מערכת מסחר תפעולית / כלי פנימי לצוות / מוצר SaaS קטן",
      reason: "יש כאן כמה אותות אפשריים, ואני צריך לנעול את סוג הפרויקט כדי לא לערבב בין דף שיווקי, כלי פנימי ומוצר SaaS.",
    };
  }

  if (questionId === "core-problem" && audience) {
    if (projectType === "landing-page") {
      return {
        title: `מעולה. אם הדף נבנה עבור ${audience}, מה גורם להם לא לעצור ולהשאיר פרטים היום?`,
        placeholder: "לדוגמה: הם לא מבינים מהר למה לבחור בי ולכן לא משאירים פרטים",
        reason: `כבר ברור לי מי הקהל. עכשיו אני צריך להבין מה שוברים במסר של הדף עבור ${audience}.`,
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: `מעולה. אם הכלי נבנה עבור ${audience}, מה נשבר להם בעבודה היומית?`,
        placeholder: "לדוגמה: פניות נופלות בין נציגים ואין בעלות ברורה על הטיפול",
        reason: `כבר ברור לי מי הצוות. עכשיו צריך להבין מה צוואר הבקבוק שחוזר אצל ${audience}.`,
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: `מעולה. אם המערכת נבנית עבור ${audience}, מה נשבר להם במסחר היומי?`,
        placeholder: "לדוגמה: הזמנות, מלאי ותוכן לא נפגשים באותו flow ולכן הטיפול נמרח ונופל בין בעלי תפקידים",
        reason: `כבר ברור לי מי הצוות. עכשיו צריך להבין איפה מסחר, קטלוג או הזמנות נתקעים אצל ${audience}.`,
      };
    }
  }

  if (questionId === "problem-clarification") {
    if (projectType === "landing-page" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק קורה אצל ${audience} שגורם לדף הנוכחי לא להמיר?`,
        placeholder: "לדוגמה: הם רואים כמה הצעות יחד, לא מבינים מהר את ההבטחה, ונוטשים לפני השארת פרטים",
        reason: "הלמידה עוצרת כאן כי בלי רגע הכשלון המדויק Nexus תבנה דף חד למראה אבל חלש בהמרה.",
      };
    }
    if (projectType === "internal-tool" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience} בתוך התור או המשמרת היומית?`,
        placeholder: "לדוגמה: אותה פנייה חוזרת בין נציגים כי אף אחד לא רואה מי בעל הטיפול ומה הצעד הבא",
        reason: "הלמידה עוצרת כאן כי בלי breakdown מדויק של ה-flow Nexus תבנה queue יפה אבל לא שימושי.",
      };
    }
    if (projectType === "commerce-ops" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience} בין הזמנות, קטלוג ומלאי?`,
        placeholder: "לדוגמה: קטלוג לא מתעדכן בזמן, מבצעים עולים עם מלאי שגוי, והצוות לא רואה מה דחוף",
        reason: "הלמידה עוצרת כאן כי בלי point-of-failure ברור Nexus תבנה dashboard מסחרי כללי מדי.",
      };
    }
    return {
      title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience || "המשתמש"} ובאיזה רגע זה פוגע בו?`,
      placeholder: "לדוגמה: ליד מגיע, אבל אין בעלות על הטיפול ולכן הוא נופל בין משימות ותזכורות",
      reason: "הלמידה עוצרת כאן כי צריך לתאר את הכשלון האמיתי ולא רק את הכיוון הכללי.",
    };
  }

  if (questionId === "successful-solution" && audience && problem) {
    if (projectType === "landing-page") {
      return {
        title: `יש כבר תמונה טובה: הקהל הוא ${audience} והכאב המרכזי הוא ${problem}. איך נראה דף שנכון לקדם עכשיו?`,
        placeholder: "לדוגמה: דף ברור עם הבטחה חדה, הוכחת אמון, ו־CTA אחד שקל להבין וללחוץ עליו",
        reason: `הלמידה לא עוצרת רק בקהל ובכאב. נשאר לחדד איך דף נחיתה מוצלח נראה בפועל עבור ${audience}.`,
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: `יש כבר תמונה טובה: הצוות הוא ${audience} והכאב המרכזי הוא ${problem}. איך נראה כלי מוצלח מבחינתם?`,
        placeholder: "לדוגמה: תור עבודה ברור עם בעלות, סטטוס ופעולה אחת שאפשר לבצע מיד",
        reason: `יש לי קהל וכאב. נשאר לחדד איך נראה כלי שמסדר את העבודה בפועל עבור ${audience}.`,
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: `יש כבר תמונה טובה: הצוות הוא ${audience} והכאב המרכזי הוא ${problem}. איך נראה מרכז מסחר מוצלח מבחינתם?`,
        placeholder: "לדוגמה: מסך אחד שמראה הזמנות דחופות, חריגות קטלוג, בעלות ופעולה הבאה לכל נציג",
        reason: `יש לי קהל וכאב. נשאר לחדד איך נראה מרכז מסחר שמסדר את העבודה היומית בפועל עבור ${audience}.`,
      };
    }
  }

  const fallback = onboardingQuestionFlow.find((item) => item.id === questionId) ?? onboardingQuestionFlow[0];
  return {
    title: fallback?.title ?? "",
    placeholder: fallback?.placeholder ?? "",
    reason: "",
  };
}

function refreshOnboardingConversationPresentation(conversation, options = {}) {
  const normalizedConversation = normalizeObject(conversation);
  const currentQuestion = normalizeObject(normalizedConversation.currentQuestion);

  if (!currentQuestion.id) {
    return normalizedConversation;
  }

  const answers = normalizeObject(normalizedConversation.answers);
  const presentation = resolveOnboardingQuestionPresentation(currentQuestion.id, answers, options);

  return {
    ...normalizedConversation,
    currentQuestion: {
      ...currentQuestion,
      title: presentation.title || currentQuestion.title || "",
      placeholder: presentation.placeholder || currentQuestion.placeholder || "",
      reason: presentation.reason || currentQuestion.reason || "",
    },
  };
}

function buildLocalOnboardingPromptForQuestion(questionId, answers = {}, options = {}) {
  if (!questionId) {
    return null;
  }

  const presentation = resolveOnboardingQuestionPresentation(questionId, answers, options);
  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);

  if (questionId === "project-class" && audience) {
    return `כדי לא להוביל את ${audience} למסלול הלא נכון, מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן?`;
  }
  if (questionId === "audience-clarification") {
    return presentation.title;
  }
  if (questionId === "core-problem" && audience) {
    return `מעולה. אם המערכת נבנית עבור ${audience}, מה הבעיה המרכזית שהם מתמודדים איתה?`;
  }
  if (questionId === "problem-clarification") {
    return presentation.title;
  }
  if (questionId === "successful-solution" && audience && problem) {
    return `יש כבר תמונה טובה: הקהל הוא ${audience} והכאב המרכזי הוא ${problem}. איך נראה פתרון מוצלח מבחינתם?`;
  }

  return presentation.title;
}

function buildLocalOnboardingQuestionReason(questionId, answers = {}, options = {}) {
  if (!questionId) {
    return "";
  }

  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);
  const classification = resolveLocalOnboardingClassification(answers, options);
  const learningDecision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveLocalLearningContext(options, classification.projectType),
  });

  if (questionId === "project-class") {
    return "יש כאן כמה אותות אפשריים, ואני צריך לנעול את סוג הפרויקט כדי לא לערבב בין דף שיווקי, כלי פנימי ומוצר SaaS.";
  }
  if (questionId === "audience-clarification") {
    return learningDecision.learningReason;
  }
  if (questionId === "core-problem" && audience) {
    return `כבר ברור לי מי המשתמש המרכזי. עכשיו אני צריך להבין מה הכאב שחוזר אצל ${audience} כדי לכוון את ה-onboarding נכון.`;
  }
  if (questionId === "problem-clarification") {
    return learningDecision.learningReason;
  }
  if (questionId === "successful-solution" && audience && problem) {
    return learningDecision.requiresLandingSolution
      ? `${learningDecision.learningReason} נשאר לחדד איך נראה פתרון שעובד בפועל עבור ${audience}.`
      : `יש לי כבר קהל יעד וכאב מרכזי. נשאר לחדד איך נראה פתרון שעובד בפועל עבור ${audience}.`;
  }
  if (questionId === "target-audience" && classification.projectType !== "unknown") {
    return "השאלה הזו תעזור לי לדייק את סוג המשטח, הפעולה הראשונה, וההקשר שבו הפרויקט צריך להתחיל לבנות.";
  }

  return "השאלה הזו סוגרת את פער ההבנה הבא שחסר כדי להבין נכון את הפרויקט.";
}

function buildLocalOnboardingCompletionReason(answers = {}, options = {}) {
  const { audience, problem, solution } = resolveCanonicalOnboardingAnswers(answers);
  const classification = resolveLocalOnboardingClassification(answers, options);
  const learningDecision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveLocalLearningContext(options, classification.projectType),
  });

  if (classification.projectType === "landing-page" && audience && problem && solution) {
    return "יש כבר מספיק הבנה כדי לסכם דף נחיתה: הלמידה כבר החזיקה את ה־onboarding עד שננעל גם הכיוון להבטחה, לאמון ול־CTA לפני סיכום ההבנה.";
  }

  if (
    classification.projectType === "landing-page"
    && audience
    && problem
    && learningDecision.requiresLandingSolution !== true
  ) {
    return "יש כבר מספיק הבנה כדי לסכם דף נחיתה: ברור מי הקהל ומה צריך לתקן במסר או בהמרה, ולכן לא נדרש עוד סבב שאלות לפני סיכום ההבנה.";
  }

  if (audience && problem && solution) {
    return learningDecision.learningStatus === "live"
      ? "יש כבר קהל יעד, כאב מרכזי ותמונת פתרון, והלמידה מאשרת שהשיחה חדה מספיק כדי לעבור לסיכום ההבנה."
      : "יש כבר קהל יעד, כאב מרכזי ותמונת פתרון. זה מספיק כדי לעצור את השיחה ולעבור לסיכום ההבנה.";
  }

  return "יש מספיק הבנה ראשונית כדי לעצור כאן ולעבור לסיכום ההבנה.";
}

function workspaceTabHtml(title, metaItems = []) {
  return `
    <span class="workspace-tab-title">${escapeHtml(title)}</span>
    <span class="workspace-tab-meta">${metaItems.map((item) => escapeHtml(item)).join(" · ")}</span>
  `;
}

function normalizeShellRouteKey(routeKey) {
  const aliases = {
    brain: "project-brain",
  };
  const normalizedKey = aliases[routeKey] ?? routeKey;
  return shellRouteKeys.has(normalizedKey) ? normalizedKey : "create";
}

const shellRoutePathMap = {
  create: "/",
  onboarding: "/onboarding",
  understanding: "/understanding",
  loop: "/loop",
  execution: "/execution",
  proof: "/proof",
  artifact: "/artifact",
  confirmation: "/confirmation",
  "state-update": "/state-update",
  "next-task": "/next-task",
  timeline: "/timeline",
  home: "/home",
  files: "/files",
  settings: "/settings",
  help: "/help",
  developer: "/developer",
  "project-brain": "/project-brain",
  release: "/release",
  growth: "/growth",
};

function resolveShellRouteKeyFromPath(pathname = "/") {
  const normalizedPath = normalizeString(pathname) || "/";
  for (const [routeKey, routePath] of Object.entries(shellRoutePathMap)) {
    if (routePath === normalizedPath) {
      return routeKey;
    }
  }
  return normalizedPath === "/" ? "create" : null;
}

function resolveArtifactExpectation(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

function resolveGenerationIntent(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.generationIntent
      ?? safeProject.aiDesignRequest?.generationIntent
      ?? safeProject.context?.generationIntent
      ?? safeProject.context?.aiDesignRequest?.generationIntent,
  );
}

function resolveLoopTaskSignal(project) {
  const approvals = normalizeArray(project.approvals);
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const blockedTask = roadmap.find((task) => task.status === "blocked");
  const assignedTask = roadmap.find((task) => task.status === "assigned");
  const title = approvals[0] ?? assignedTask?.summary ?? blockedTask?.summary ?? "כרגע אין משימה פעילה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : approvals[0]
      ? "יש כאן החלטה אחת שמחזיקה את ההתקדמות."
      : "זה הצעד הכי ישיר להמשיך ממנו עכשיו.";

  return {
    title,
    reason,
    assignedTask,
    blockedTask,
    blocker: project.overview?.bottleneck ?? blockedTask?.summary ?? "לא זוהה חסם מרכזי",
    queueCount: roadmap.length,
    activeCount: roadmap.filter((task) => task.status === "assigned").length,
    blockedCount: roadmap.filter((task) => task.status === "blocked").length,
  };
}

function buildInternalToolExecutionFallback(project) {
  const expectation = resolveArtifactExpectation(project);
  if (expectation.projectType !== "internal-tool") {
    return null;
  }

  const generationIntent = resolveGenerationIntent(project);
  const title = normalizeString(expectation.title) || "משטח עבודה פנימי";
  const focusAreas = normalizeArray(expectation.proofFocus)
    .map((item) => normalizeString(item))
    .filter(Boolean);
  const primaryFocus = focusAreas[0] ?? "בעלות גלויה על התור";
  const secondaryFocus = focusAreas[1] ?? "רמת שירות ברורה על כל בקשה";
  const tertiaryFocus = focusAreas[2] ?? "הפעולה הבאה שניתנת לביצוע מיד";
  const detail = normalizeString(generationIntent.generationGoal)
    || normalizeString(expectation.continuityLine)
    || normalizeString(expectation.summary)
    || "Nexus משלים עכשיו את סביבת העבודה הראשונה לפני ההוכחה.";

  return {
    missionTitle: `מכינים את ${title}`,
    detail,
    statusItems: [
      { label: "ננעל כיוון משטח העבודה עבור הצוות", state: "done" },
      { label: `ממקמים ${primaryFocus}`, state: "done" },
      { label: `מכינים ${secondaryFocus}`, state: "active" },
      { label: `ה־Proof הבא יראה ${tertiaryFocus}`, state: "pending" },
    ],
    liveLines: [
      `מגדיר ${primaryFocus}`,
      `מכין ${secondaryFocus}`,
      `מסיים את ${title} לקראת Proof`,
      `מוביל אל ${tertiaryFocus}`,
    ],
    logRows: [
      { time: "עכשיו", message: `Nexus משלים את ${title} לפני Proof.` },
      { time: "עכשיו", message: `היעד הקרוב: ${primaryFocus}.` },
      { time: "עכשיו", message: `עוד רגע נראה ${tertiaryFocus}.` },
    ],
  };
}

function loopStageRailHtml(stages = []) {
  if (!stages.length) {
    return `<p class="empty">עדיין אין route זמין ל־loop.</p>`;
  }

  return `
    <ol class="loop-core-stage-list">
      ${stages.map((stage) => `
        <li class="loop-core-stage-item ${stage.status === "active" ? "active" : ""}" data-stage-status="${escapeHtml(stage.status)}">
          <button class="loop-core-stage-button" type="button" data-loop-target="${escapeHtml(stage.target)}">
            <span class="loop-core-stage-dot"></span>
            <span class="loop-core-stage-label">${escapeHtml(stage.title)}</span>
          </button>
        </li>
      `).join("")}
    </ol>
  `;
}

function loopExplainHtml(items = []) {
  if (!items.length) {
    return `<p class="empty">עדיין אין הכוונה זמינה ללולאה.</p>`;
  }

  return `
    <div class="loop-explain-grid">
      ${items.map((item) => `
        <article class="loop-explain-card">
          <span class="mini-label">${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderWorkspaceTabs(elements, project) {
  const developerWorkspace = normalizeObject(project.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const projectBrainWorkspace = normalizeObject(project.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const releaseWorkspace = normalizeObject(project.releaseWorkspace);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const growthSummary = normalizeObject(growthWorkspace.summary);
  const loopTask = resolveLoopTaskSignal(project);

  if (elements.loopTab) {
    elements.loopTab.innerHTML = workspaceTabHtml("Loop", [
      projectBrainWorkspace.overview?.currentPhase ?? "flow",
      loopTask.title,
      releaseValidation.status ?? "review",
    ]);
  }

  if (elements.developerTab) {
    if (isExplicitDevModeEnabled()) {
      elements.developerTab.hidden = false;
      elements.developerTab.innerHTML = workspaceTabHtml("Developer", [
        `${developerSummary.progressPercent ?? 0}%`,
        developerSummary.progressStatus ?? "idle",
        developerSummary.nextAction ?? "no next action",
      ]);
    } else {
      elements.developerTab.hidden = true;
      elements.developerTab.innerHTML = "";
    }
  }

  if (elements.projectBrainTab) {
    elements.projectBrainTab.innerHTML = workspaceTabHtml("Project Brain", [
      `${brainSummary.blockerCount ?? 0} blockers`,
      projectBrainWorkspace.overview?.currentPhase ?? "unknown",
      brainSummary.requiresApproval ? "approval required" : "clear",
    ]);
  }

  if (elements.releaseTab) {
    elements.releaseTab.innerHTML = workspaceTabHtml("Release", [
      releaseValidation.status ?? "unknown",
      releaseSummary.isBlocked ? "blocked" : "moving",
      releaseWorkspace.buildAndDeploy?.currentStage ?? "planned",
    ]);
  }

  if (elements.growthTab) {
    elements.growthTab.innerHTML = workspaceTabHtml("Growth", [
      `${growthSummary.totalPillars ?? 0} pillars`,
      `${growthSummary.totalKpis ?? 0} kpis`,
      growthSummary.hasGrowthPlan ? "plan active" : "plan empty",
    ]);
  }
}

function setActiveWorkspace(elements, workspaceKey) {
  const activeKey = workspaceKeys.includes(workspaceKey) ? workspaceKey : "loop";
  const mapping = [
    { key: "loop", tab: elements.loopTab, panel: elements.loopWorkspacePanel },
    { key: "execution", tab: null, panel: elements.executionWorkspacePanel },
    { key: "proof", tab: null, panel: elements.proofWorkspacePanel },
    { key: "developer", tab: elements.developerTab, panel: elements.developerWorkspacePanel },
    { key: "project-brain", tab: elements.projectBrainTab, panel: elements.projectBrainPanel },
    { key: "release", tab: elements.releaseTab, panel: elements.releaseWorkspacePanel },
    { key: "growth", tab: elements.growthTab, panel: elements.growthWorkspacePanel },
  ];

  for (const entry of mapping) {
    const isActive = entry.key === activeKey;
    if (entry.tab) {
      entry.tab.classList?.toggle("active", isActive);
      if ("ariaSelected" in entry.tab) {
        entry.tab.ariaSelected = isActive ? "true" : "false";
      }
    }
    if (entry.panel) {
      entry.panel.classList?.toggle("active", isActive);
      entry.panel.hidden = !isActive;
    }
  }

  if (elements.screenWorkspace) {
    elements.screenWorkspace.dataset.activeWorkspace = activeKey;
  }
  if (elements.workspaceTopShell) {
    elements.workspaceTopShell.dataset.activeWorkspace = activeKey;
  }
  const isLoop = activeKey === "loop";
  if (elements.workspaceTabs) {
    elements.workspaceTabs.hidden = true;
  }
  if (elements.workspaceTopShell) {
    elements.workspaceTopShell.hidden = true;
  }
  if (elements.workspaceOverviewGrid) {
    elements.workspaceOverviewGrid.hidden = true;
  }
  const body = elements.screenWorkspace?.ownerDocument?.body;
  if (body?.dataset) {
    body.dataset.activeWorkspace = activeKey;
  }
}

export function applyDesignSystem(doc, project) {
  const rootStyle = doc?.documentElement?.style;
  if (!rootStyle) {
    return;
  }

  const designTokens = normalizeObject(project.designTokens);
  const colors = normalizeObject(designTokens.colors);
  const spacing = normalizeObject(designTokens.spacing);
  const radius = normalizeObject(designTokens.radius);
  const borders = normalizeObject(designTokens.borders);
  const shadows = normalizeObject(designTokens.shadows);
  const typographySystem = normalizeObject(project.typographySystem);
  const typeScale = normalizeObject(typographySystem.typeScale);
  const layoutSystem = normalizeObject(project.layoutSystem);
  const spacingScale = normalizeObject(layoutSystem.spacingScale);
  const sectionRhythm = normalizeObject(layoutSystem.sectionRhythm);
  const colorRules = normalizeObject(project.colorRules);
  const roles = normalizeObject(colorRules.roles);
  const states = normalizeObject(colorRules.states);

  setCssVar(rootStyle, "--bg", roles.canvas?.token ?? colors.canvas);
  setCssVar(rootStyle, "--panel", roles.surface?.token ?? colors.surface);
  setCssVar(rootStyle, "--ink", roles.textPrimary?.token ?? colors.ink);
  setCssVar(rootStyle, "--muted", roles.textMuted?.token ?? colors.muted);
  setCssVar(rootStyle, "--line", roles.border?.token ?? colors.border);
  setCssVar(rootStyle, "--accent", roles.accent?.token ?? colors.accent);
  setCssVar(rootStyle, "--accent-strong", roles.accentStrong?.token ?? colors.accentStrong);
  setCssVar(rootStyle, "--good", states.success?.token ?? colors.success);
  setCssVar(rootStyle, "--warn", states.warning?.token ?? colors.warning);
  setCssVar(rootStyle, "--bad", states.danger?.token ?? colors.danger);
  setCssVar(rootStyle, "--font-display", typographySystem.displayFontFamily ?? designTokens.typography?.familyDisplay);
  setCssVar(rootStyle, "--font-body", typographySystem.baseFontFamily ?? designTokens.typography?.familyBody);
  setCssVar(rootStyle, "--font-size-display", `${typeScale.display?.fontSize ?? designTokens.typography?.sizeDisplay ?? 40}px`);
  setCssVar(rootStyle, "--font-size-h1", `${typeScale.h1?.fontSize ?? designTokens.typography?.sizeXl ?? 28}px`);
  setCssVar(rootStyle, "--font-size-h2", `${typeScale.h2?.fontSize ?? designTokens.typography?.sizeLg ?? 20}px`);
  setCssVar(rootStyle, "--font-size-body", `${typeScale.body?.fontSize ?? designTokens.typography?.sizeMd ?? 16}px`);
  setCssVar(rootStyle, "--font-size-meta", `${typeScale.meta?.fontSize ?? designTokens.typography?.sizeXs ?? 12}px`);
  setCssVar(rootStyle, "--line-height-body", String(typeScale.body?.lineHeight ?? 1.5));
  setCssVar(rootStyle, "--line-height-heading", String(typeScale.h1?.lineHeight ?? 1.1));
  setCssVar(rootStyle, "--space-xs", `${spacingScale.xs ?? spacing.xs ?? 4}px`);
  setCssVar(rootStyle, "--space-sm", `${spacingScale.sm ?? spacing.sm ?? 8}px`);
  setCssVar(rootStyle, "--space-md", `${spacingScale.md ?? spacing.md ?? 12}px`);
  setCssVar(rootStyle, "--space-lg", `${spacingScale.lg ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--space-xl", `${spacingScale.xl ?? spacing.xl ?? 32}px`);
  setCssVar(rootStyle, "--space-xxl", `${spacingScale.xxl ?? spacing.xxl ?? 48}px`);
  setCssVar(rootStyle, "--radius-sm", `${radius.sm ?? 6}px`);
  setCssVar(rootStyle, "--radius-md", `${radius.md ?? 12}px`);
  setCssVar(rootStyle, "--radius-lg", `${radius.lg ?? 20}px`);
  setCssVar(rootStyle, "--radius-pill", `${radius.pill ?? 999}px`);
  setCssVar(rootStyle, "--border-subtle", `${borders.subtle ?? 1}px`);
  setCssVar(rootStyle, "--border-strong", `${borders.strong ?? 2}px`);
  setCssVar(rootStyle, "--border-focus", `${borders.focus ?? 3}px`);
  setCssVar(rootStyle, "--shadow-soft", shadows.soft);
  setCssVar(rootStyle, "--shadow-medium", shadows.medium);
  setCssVar(rootStyle, "--shadow-focus", shadows.focus);
  setCssVar(rootStyle, "--layout-max-width", `${layoutSystem.grid?.maxContentWidth ?? 1280}px`);
  setCssVar(rootStyle, "--layout-gap", `${layoutSystem.grid?.gutter ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--section-gap", `${sectionRhythm.sectionGap ?? spacing.xl ?? 32}px`);
  setCssVar(rootStyle, "--panel-gap", `${sectionRhythm.panelGap ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--page-top", `${sectionRhythm.pageTop ?? spacing.xxl ?? 48}px`);
}

function renderTop(elements, project) {
  const blockedTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "blocked");
  const activeTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "assigned");
  const firstValueOutput = normalizeObject(project.firstValueOutput ?? project.state?.firstValueOutput);
  const firstValueSummary = normalizeObject(project.firstValueSummary ?? project.state?.firstValueSummary);
  const bottleneck = project.overview?.bottleneck ?? "לא זוהה";
  const projectStatus = t(project.status ?? "idle");
  const currentStateSummary = activeTasks.length > 0
    ? `הפרויקט נמצא עכשיו בשלב ${projectStatus}, וכבר יש צעד עבודה פעיל שמחכה לבדיקה.`
    : `הפרויקט נמצא עכשיו בשלב ${projectStatus}, וה־workspace מוכן לצעד הבא.`;
  const firstValueHeadline = firstValueOutput.preview?.headline ?? firstValueSummary.message ?? null;
  const firstValueDetail =
    firstValueOutput.preview?.detail
    ?? normalizeArray(firstValueOutput.userVisibleArtifacts).join(" | ")
    ?? null;

  elements.heroProjectName.textContent = project.name ?? "Project";
  elements.heroGoal.textContent = project.goal ?? "המטרה תופיע כאן";
  elements.casinoBaseUrlInput.value = project.source?.baseUrl ?? "http://localhost:4101";

  elements.now.innerHTML = `
    <div class="workspace-top-summary">
      <div class="big-status ${escapeHtml(project.status ?? "idle")}">
        <span>${escapeHtml(t(project.status ?? "idle"))}</span>
      </div>
      <div class="workspace-top-copy">
        <strong>המצב הנוכחי</strong>
        <p>${escapeHtml(currentStateSummary)}</p>
        ${firstValueHeadline ? `<p class="workspace-top-support">כרגע כבר רואים התחלה של ערך: ${escapeHtml(firstValueHeadline)}.</p>` : ""}
        ${firstValueDetail ? `<p class="workspace-top-support subtle">${escapeHtml(firstValueDetail)}</p>` : ""}
      </div>
    </div>
    <div class="workspace-priority-line">
      <span class="mini-label">החסם המרכזי כרגע</span>
      <strong>${escapeHtml(bottleneck)}</strong>
      <span>${escapeHtml(blockedTasks.length > 0 ? "זה הדבר הראשון שכדאי לפתור לפני הרחבה נוספת." : "אין כרגע חסימה קשה, אבל זה עדיין הנקודה שדורשת הכי הרבה תשומת לב.")}</span>
    </div>
  `;
}

function renderCritical(elements, project) {
  const firstApproval = normalizeArray(project.approvals)[0];
  const blockedTask = normalizeArray(project.cycle?.roadmap).find((task) => task.status === "blocked");
  const assignedTask = normalizeArray(project.cycle?.roadmap).find((task) => task.status === "assigned");
  const title = firstApproval ?? assignedTask?.summary ?? blockedTask?.summary ?? "כרגע אין פעולה דחופה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : firstApproval
      ? "זאת הנקודה היחידה שמחזיקה את ההתקדמות לפני הרצה נוספת."
      : "זה הצעד הכי ישיר לקדם עכשיו כדי לשמור על מומנטום.";
  const blocker = project.overview?.bottleneck ?? blockedTask?.summary ?? "לא זוהה חסם מרכזי";

  elements.critical.innerHTML = `
    <div class="critical-kicker-line">הפעולה הבאה</div>
    <div class="critical-main">${escapeHtml(title)}</div>
    <p class="critical-sub">${escapeHtml(reason)}</p>
    <div class="critical-single-blocker">
      <span class="mini-label">הדבר שמעכב אותך עכשיו</span>
      <strong>${escapeHtml(blocker)}</strong>
    </div>
  `;
}

function renderMissing(elements, project) {
  const scan = normalizeObject(project.scan);
  const external = normalizeObject(project.externalSnapshot);
  const items = [];

  if (scan.findings) {
    if (!scan.findings.hasMigrations) items.push({ title: "חסרות מיגרציות" });
    if (!scan.findings.hasEnvExample) items.push({ title: "חסר קובץ env לדוגמה" });
    if (!scan.findings.hasTests) items.push({ title: "חסרות בדיקות" });
  }

  if (external.features) {
    if (!external.features.hasPayments) items.push({ title: "חסר תהליך תשלומים" });
    if (!external.features.hasWallet) items.push({ title: "חסר ארנק" });
    if (normalizeArray(external.roadmapContext?.knownMissingParts).length) {
      items.push(
        ...normalizeArray(external.roadmapContext?.knownMissingParts).slice(0, 4).map((item) => ({
          title: item,
        })),
      );
    }
  }

  elements.missing.innerHTML = listHtml(items, "לא זוהו כרגע חוסרים בולטים.");
}

function renderExisting(elements, project) {
  const scan = normalizeObject(project.scan);
  const external = normalizeObject(project.externalSnapshot);
  const repositoryDiagnosis = normalizeObject(
    project.repositoryImportAndCodebaseDiagnosis ?? project.state?.repositoryImportAndCodebaseDiagnosis,
  );
  const items = [];

  if (scan.findings?.hasBackend) items.push({ title: "יש backend" });
  if (scan.findings?.hasAuth) items.push({ title: "יש auth" });
  if (scan.findings?.hasEnvExample) items.push({ title: "יש env לדוגמה" });
  if (external.features?.hasAuth) items.push({ title: "ה־API של הקזינו מדווח ש־auth קיים" });
  if (repositoryDiagnosis.status === "ready") {
    items.push({
      title: `Diagnosis ready: ${repositoryDiagnosis.repository?.fullName ?? "connected-repository"}`,
      body: repositoryDiagnosis.summary?.architectureSummary ?? repositoryDiagnosis.summary?.codebaseSummary ?? "",
    });
  }

  elements.existing.innerHTML = listHtml(items, "עדיין אין מספיק מידע חיובי להציג.");
}

function renderLive(elements, project) {
  const activeTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "assigned");
  const blockedTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "blocked");
  const progressState = normalizeObject(project.progressState);
  const reactiveWorkspaceState = normalizeObject(project.reactiveWorkspaceState);
  const liveUpdateChannel = normalizeObject(project.liveUpdateChannel);
  const liveLogStream = normalizeObject(project.liveLogStream);
  const realtimeEvents = normalizeArray(project.realtimeEventStream?.events);
  const commandOutputs = normalizeArray(liveLogStream.commandOutputs);
  const stdoutEntries = normalizeArray(liveLogStream.streams?.stdout);
  const stderrEntries = normalizeArray(liveLogStream.streams?.stderr);
  const executionViewModel = buildExecutionLiveViewModel({ project });
  const items = [
    {
      title: `Live channel: ${liveUpdateChannel.transportMode ?? "polling"}`,
      body: `refresh ${liveUpdateChannel.refreshStrategy ?? "scheduled-refresh"} | progress ${reactiveWorkspaceState.progressBar?.percent ?? progressState.percent ?? 0}% | logs ${liveLogStream.summary?.totalEntries ?? 0}`,
    },
    ...realtimeEvents.slice(0, 2).map((event) => ({
      title: event.message ?? event.streamType ?? "Live event",
      body: `${event.streamType ?? "stream"} | ${t(event.status ?? "active")}`,
    })),
    ...commandOutputs.slice(-2).reverse().map((entry) => ({
      title: entry.message ?? "Command output",
      body: `${entry.stream ?? "stdout"} | command output`,
    })),
    ...stdoutEntries.slice(-2).reverse().map((entry) => ({
      title: entry.message ?? "stdout",
      body: `${entry.source ?? "runtime"} | stdout`,
    })),
    ...stderrEntries.slice(-1).reverse().map((entry) => ({
      title: entry.message ?? "stderr",
      body: `${entry.source ?? "runtime"} | stderr`,
    })),
    ...activeTasks.slice(0, 3).map((task) => ({
      title: task.summary,
      body: "קורה עכשיו",
    })),
    ...blockedTasks.slice(0, 2).map((task) => ({
      title: task.summary,
      body: "חסום כרגע",
    })),
  ];

  if (elements.live) {
    elements.live.innerHTML = listHtml(items, "כרגע אין פעילות מיוחדת.");
  }

  if (elements.executionMissionTitle) {
    elements.executionMissionTitle.textContent = executionViewModel.missionTitle;
  }

  if (elements.executionStatusList) {
    elements.executionStatusList.innerHTML = executionViewModel.statusItems
      .map((item) => {
        const state = item.status === "done" ? "done" : item.status === "active" ? "active" : "pending";
        const icon = state === "done"
          ? '<span class="execution-route-status-icon check">✓</span>'
          : state === "active"
            ? '<span class="execution-route-status-icon play">▶</span>'
            : '<span class="execution-route-status-icon pending"></span>';
        return `
          <div class="execution-route-status-row${state === "active" ? " active" : ""}">
            <div class="execution-route-status-left">
              ${icon}
              <span>${escapeHtml(item.label)}</span>
            </div>
            <span class="execution-route-status-drag">◆</span>
          </div>
        `;
      })
      .join("");
  }

  if (elements.executionLiveList) {
    elements.executionLiveList.innerHTML = `
      ${executionViewModel.liveItems.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
      <div class="execution-route-spinner" aria-hidden="true"></div>
    `;
  }

  if (elements.executionLogList) {
    elements.executionLogList.innerHTML = executionViewModel.logItems
      .map((entry) => `
        <div class="execution-route-log-row">
          <span>${escapeHtml(String(entry.time))}</span>
          <span>${escapeHtml(entry.message)}</span>
        </div>
      `)
      .join("");
  }

  if (elements.executionStopButton) {
    elements.executionStopButton.disabled = true;
    elements.executionStopButton.title = "אין כרגע backend route מאושר לעצירת execution live.";
  }

  if (elements.executionProofButton) {
    elements.executionProofButton.disabled = false;
    elements.executionProofButton.title = "עבור למסך ההוכחה כשהתוצאה מוכנה.";
  }

  if (elements.executionRefreshButton) {
    elements.executionRefreshButton.disabled = false;
    elements.executionRefreshButton.title = "רענן את מצב הביצוע והלוגים מהפרויקט הפעיל.";
  }
}

function renderDecision(elements, project) {
  const surface = normalizeObject(project.cockpitRecommendationSurface);
  const recommendationPanel = normalizeObject(surface.recommendationPanel);

  if (surface.surfaceId) {
    const items = [
      {
        title: surface.headline ?? "No active recommendation",
        body: surface.summary ?? recommendationPanel.reason ?? "",
      },
      {
        title: surface.whyNow ?? "No recommendation reasoning yet",
        body: recommendationPanel.expectedOutcome ?? "",
      },
      {
        title: recommendationPanel.primaryCta?.label ?? "Review recommendation",
        body: surface.approval?.requiresApproval
          ? `${surface.approval?.riskLevel ?? "unknown"} | ${surface.approval?.whatIfRejected ?? "Approval required"}`
          : `urgency ${recommendationPanel.urgency ?? "normal"}`,
      },
    ];

    elements.decision.innerHTML = `
      ${metricHtml([
        { label: "Recommendation", value: surface.headline ?? "not-set" },
        { label: "Approval", value: surface.approval?.requiresApproval ? "required" : "clear" },
        { label: "Blockers", value: String(surface.summaryMeta?.blockerCount ?? 0) },
        { label: "Urgency", value: recommendationPanel.urgency ?? "normal" },
      ])}
      ${stackHtml("Cockpit recommendation", items, "אין כרגע recommendation זמינה.")}
    `;
    return;
  }

  const items = normalizeArray(project.approvals).slice(0, 4).map((approval) => ({ title: approval }));
  elements.decision.innerHTML = listHtml(items, "אין כרגע משהו שצריך לאשר.");
}

function renderProofScreen(elements, project) {
  const viewModel = buildProofResultViewModel({ project });
  const visibleBullets = [
    ...normalizeArray(viewModel.successCriteria).map((item) => item?.title).filter(Boolean),
    ...normalizeArray(viewModel.artifacts).slice(0, 2).map((item) => item?.name).filter(Boolean),
  ].slice(0, 5);
  const stats = normalizeArray(viewModel.stats).slice(0, 4);

  if (elements.proofPreviewTitle) {
    elements.proofPreviewTitle.textContent = viewModel.previewTitle;
  }
  if (elements.proofReadyTitle) {
    elements.proofReadyTitle.textContent = viewModel.readyTitle;
  }
  if (elements.proofBulletsList) {
    elements.proofBulletsList.innerHTML = visibleBullets
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
  if (elements.proofStatsGrid) {
    elements.proofStatsGrid.innerHTML = stats
      .map((item) => `
        <div class="proof-route-stat-card">
          <div class="proof-route-stat-value">${escapeHtml(String(item.value))}</div>
          <div class="proof-route-stat-label">${escapeHtml(item.label)}</div>
        </div>
      `)
      .join("");
  }
  if (elements.proofDownloadButton) {
    const downloadSupported = viewModel.secondaryActions?.[1]?.supported === true;
    elements.proofDownloadButton.disabled = !downloadSupported;
    elements.proofDownloadButton.title = downloadSupported
      ? "הורד artifact קנוני self-contained שאפשר לפתוח ולשתף מחוץ ל־Nexus."
      : "אין כרגע artifact קנוני מספיק יציב להורדה מתוך ה־proof screen.";
  }
  if (elements.proofOpenButton) {
    const openSupported = viewModel.secondaryActions?.[0]?.supported === true;
    elements.proofOpenButton.disabled = !openSupported;
    elements.proofOpenButton.title = openSupported
      ? "פתח את ה־artifact הקנוני כמשטח עצמאי בתוך Nexus."
      : "אין כרגע artifact route קנוני לפתיחה ישירה.";
  }
  if (elements.proofFullButton) {
    elements.proofFullButton.disabled = false;
    elements.proofFullButton.title = "המשך למסך האישור כדי להחליט אם לקדם את התוצאה או לבקש תיקון.";
  }
}

function renderProposalReview(elements, project) {
  const state = normalizeObject(project.state);
  const aiControlCenterSurface = normalizeObject(project.aiControlCenterSurface ?? state.aiControlCenterSurface);
  const aiDesignRequest = normalizeObject(project.aiDesignRequest ?? state.aiDesignRequest);
  const generationIntent = normalizeObject(project.generationIntent ?? aiDesignRequest.generationIntent);
  const aiDesignProposal = normalizeObject(project.aiDesignProposal ?? state.aiDesignProposal);
  const aiGenerationObservability = normalizeObject(project.aiGenerationObservability ?? state.aiGenerationObservability);
  const providerLatencyFailureTracker = normalizeObject(project.providerLatencyFailureTracker ?? state.providerLatencyFailureTracker);
  const generationSuccessAcceptanceTracker = normalizeObject(
    project.generationSuccessAcceptanceTracker ?? state.generationSuccessAcceptanceTracker,
  );
  const promptContractFailureTracker = normalizeObject(project.promptContractFailureTracker ?? state.promptContractFailureTracker);
  const aiGenerationReviewDashboard = normalizeObject(project.aiGenerationReviewDashboard ?? state.aiGenerationReviewDashboard);
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema ?? state.generatedSurfaceProofSchema);
  const generatedAccessibilityValidationEngine = normalizeObject(
    project.generatedAccessibilityValidationEngine ?? state.generatedAccessibilityValidationEngine,
  );
  const generatedSurfacePerformanceBudgetValidator = normalizeObject(
    project.generatedSurfacePerformanceBudgetValidator ?? state.generatedSurfacePerformanceBudgetValidator,
  );
  const generatedBrandConsistencyValidator = normalizeObject(
    project.generatedBrandConsistencyValidator ?? state.generatedBrandConsistencyValidator,
  );
  const designProposalValidation = normalizeObject(project.designProposalValidation ?? state.designProposalValidation);
  const designProposalReviewState = normalizeObject(project.designProposalReviewState ?? state.designProposalReviewState);
  const generatedAssetProvenanceRecord = normalizeObject(
    project.generatedAssetProvenanceRecord ?? state.generatedAssetProvenanceRecord,
  );
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision ?? state.proposalApplyDecision);
  const editableProposal = normalizeObject(project.editableProposal ?? state.editableProposal);
  const editedProposal = normalizeObject(project.editedProposal ?? state.editedProposal);
  const activeProposal = editedProposal.revisionId ? editedProposal : editableProposal;
  const history = normalizeObject(project.proposalEditHistory ?? state.proposalEditHistory);
  const partialAcceptanceDecision = normalizeObject(project.partialAcceptanceDecision ?? state.partialAcceptanceDecision);
  const remainingProposalScope = normalizeObject(project.remainingProposalScope ?? state.remainingProposalScope);

  if (!editableProposal.proposalId) {
    if (elements.proposalReview) {
      elements.proposalReview.innerHTML = `<p class="empty">עדיין אין proposal פתוח לעריכה או partial acceptance.</p>`;
    }
    if (elements.proposalSectionTitleInput) elements.proposalSectionTitleInput.value = "";
    if (elements.proposalSectionSummaryInput) elements.proposalSectionSummaryInput.value = "";
    if (elements.proposalNextActionLabelInput) elements.proposalNextActionLabelInput.value = "";
    if (elements.proposalAnnotationInput) elements.proposalAnnotationInput.value = "";
    if (elements.partialAcceptanceNoteInput) elements.partialAcceptanceNoteInput.value = "";
    return;
  }

  const sections = normalizeArray(activeProposal.sections);
  const components = normalizeArray(activeProposal.components);
  const copyItems = normalizeArray(activeProposal.copy);
  const firstSection = normalizeObject(sections[0]);
  const firstComponent = normalizeObject(components[0]);
  const firstCopy = normalizeObject(copyItems[0]);
  const nextAction = normalizeObject(activeProposal.nextAction);
  const historyEntries = normalizeArray(history.entries).slice(-3).reverse().map((entry) => ({
    title: `Revision ${entry.revisionNumber ?? "?"} · ${entry.action ?? "edited"}`,
    body: `${entry.proposalId ?? activeProposal.proposalId ?? "proposal"} | annotations ${entry.annotationCount ?? 0}`,
  }));
  const reviewScope = [
    {
      title: firstSection.label ?? firstSection.sectionId ?? "Section",
      body: firstSection.contentSummary ?? "אין סיכום section זמין.",
    },
    {
      title: firstComponent.componentType ?? firstComponent.componentId ?? "Component",
      body: String(firstComponent.proposedValue ?? firstComponent.currentValue ?? "No proposed value"),
    },
    {
      title: firstCopy.label ?? firstCopy.copyId ?? "Copy",
      body: firstCopy.proposedText ?? firstCopy.currentText ?? "No proposed copy",
    },
  ];
  const partialItems = partialAcceptanceDecision.decisionId
    ? [
        {
          title: partialAcceptanceDecision.status ?? "unknown",
          body: `follow-up: ${partialAcceptanceDecision.followUpAction ?? "not-set"}`,
        },
        {
          title: "Approved",
          body: String(partialAcceptanceDecision.summary?.approvedCount ?? 0),
        },
        {
          title: "Remaining",
          body: String(partialAcceptanceDecision.summary?.remainingCount ?? 0),
        },
        {
          title: "Regeneration scope",
          body:
            normalizeArray(remainingProposalScope.componentsNeedingRegeneration)
              .map((component) => component.componentId)
              .join(" | ")
            || "אין כרגע רכיבים פתוחים ל־regeneration.",
        },
      ]
    : [];
  const generatedPreviewItems = aiControlCenterSurface.aiControlCenterSurfaceId
    ? [
        {
          title: aiControlCenterSurface.generatedSurfacePreview?.screenId ?? "generated-preview",
          body: `delivery: ${aiControlCenterSurface.summary?.deliveryStatus ?? "unknown"}`,
        },
        {
          title: "Preview regions",
          body: String(aiControlCenterSurface.generatedSurfacePreview?.regionCount ?? 0),
        },
        {
          title: "CTA anchors",
          body: aiControlCenterSurface.generatedSurfacePreview?.hasCtaAnchors ? "yes" : "no",
        },
        {
          title: "Live binding",
          body: aiControlCenterSurface.liveRuntimeBinding?.activeScreenId ?? "not-bound",
        },
      ]
    : [];
  const aiDesignItems = aiDesignRequest.requestId
    ? [
        {
          title: aiDesignRequest.screen?.screenId ?? "screen",
          body: aiDesignRequest.selectedTask?.summary ?? "No selected task summary",
        },
        ...(generationIntent.intentId
          ? [{
              title: generationIntent.artifactTitle ?? "Artifact intent",
              body: generationIntent.generationGoal ?? generationIntent.framingLine ?? "No explicit generation intent",
            }]
          : []),
        {
          title: aiDesignProposal.proposalId ?? "proposal",
          body: `regions ${normalizeArray(aiDesignProposal.regions).length} | provider ${aiDesignProposal.reasoning?.source ?? "unknown"}`,
        },
        {
          title: "Validation",
          body: `${designProposalValidation.status ?? "unknown"} | review ${designProposalReviewState.status ?? "unknown"}`,
        },
        {
          title: "Apply",
          body: proposalApplyDecision.status ?? "unknown",
        },
      ]
    : [];
  const aiObservabilityItems = aiGenerationObservability.observabilityId
    ? [
        {
          title: aiGenerationObservability.providerId ?? "provider",
          body: `status ${aiGenerationObservability.status ?? "unknown"} | checks ${aiGenerationObservability.summary?.readyCheckCount ?? 0}/${aiGenerationObservability.summary?.totalCheckCount ?? 0}`,
        },
        {
          title: "Validation / review",
          body: `${aiGenerationObservability.summary?.validationStatus ?? "unknown"} | ${aiGenerationObservability.summary?.reviewStatus ?? "unknown"}`,
        },
        {
          title: "Apply / attention",
          body: `${aiGenerationObservability.summary?.applyStatus ?? "unknown"} | blockers ${aiGenerationObservability.summary?.blockingCheckCount ?? 0}`,
        },
      ]
    : [];
  const providerLatencyItems = providerLatencyFailureTracker.trackerId
    ? [
        {
          title: providerLatencyFailureTracker.providerId ?? "provider",
          body: `latency ${providerLatencyFailureTracker.latency?.latencyStatus ?? "unknown"} | failures ${providerLatencyFailureTracker.failure?.failureCount ?? 0}`,
        },
        {
          title: "Health / circuit",
          body: `${providerLatencyFailureTracker.providerHealth?.providerHealth ?? "unknown"} | ${providerLatencyFailureTracker.providerHealth?.circuitState ?? "unknown"}`,
        },
        {
          title: "Latest reason",
          body: providerLatencyFailureTracker.failure?.latestReason ?? "No provider failure reason is active.",
        },
      ]
    : [];
  const generationSuccessItems = generationSuccessAcceptanceTracker.trackerId
    ? [
        {
          title: `produced ${generationSuccessAcceptanceTracker.summary?.producedProposalCount ?? 0} | accepted ${generationSuccessAcceptanceTracker.summary?.acceptedProposalCount ?? 0}`,
          body: `rejected ${generationSuccessAcceptanceTracker.summary?.rejectedProposalCount ?? 0} | pending ${generationSuccessAcceptanceTracker.summary?.pendingProposalCount ?? 0}`,
        },
        {
          title: "Owner / operator",
          body: `${generationSuccessAcceptanceTracker.summary?.ownerAcceptanceStatus ?? "unknown"} | ${generationSuccessAcceptanceTracker.summary?.applyStatus ?? "unknown"}`,
        },
        {
          title: "Acceptance rate",
          body: `${Math.round((generationSuccessAcceptanceTracker.summary?.acceptanceRate ?? 0) * 100)}% | review ${generationSuccessAcceptanceTracker.summary?.reviewStatus ?? "unknown"}`,
        },
      ]
    : [];
  const promptContractFailureItems = promptContractFailureTracker.trackerId
    ? [
        {
          title: `blocking ${promptContractFailureTracker.failureSummary?.blockingFailureCount ?? 0} | missing ${promptContractFailureTracker.failureSummary?.missingContractCount ?? 0}`,
          body: `invalid ${promptContractFailureTracker.failureSummary?.invalidContractCount ?? 0} | blocked ${promptContractFailureTracker.failureSummary?.blockedContractCount ?? 0}`,
        },
        {
          title: "Execution / provider",
          body: `${promptContractFailureTracker.failureSummary?.executionStatus ?? "unknown"} | ${promptContractFailureTracker.failureSummary?.providerStatus ?? "unknown"}`,
        },
        {
          title: "Latest failure",
          body: promptContractFailureTracker.latestFailure?.reason ?? "No prompt contract failure is active.",
        },
      ]
    : [];
  const aiGenerationDashboardItems = aiGenerationReviewDashboard.dashboardId
    ? [
        {
          title: `blockers ${aiGenerationReviewDashboard.summary?.blockerCount ?? 0} | risks ${aiGenerationReviewDashboard.summary?.riskSignalCount ?? 0}`,
          body: `${aiGenerationReviewDashboard.summary?.providerHealth ?? "unknown"} | review ${aiGenerationReviewDashboard.summary?.reviewStatus ?? "unknown"}`,
        },
        {
          title: "Acceptance / prompt failures",
          body: `${Math.round((aiGenerationReviewDashboard.summary?.acceptanceRate ?? 0) * 100)}% | prompt ${aiGenerationReviewDashboard.summary?.promptFailureCount ?? 0}`,
        },
        {
          title: "Primary action",
          body: aiGenerationReviewDashboard.summary?.primaryAction ?? "No action available.",
        },
      ]
    : [];
  const generatedSurfaceProofItems = generatedSurfaceProofSchema.proofId
    ? [
        {
          title: `proof ${generatedSurfaceProofSchema.summary?.proofStatus ?? "unknown"} | failed ${generatedSurfaceProofSchema.summary?.failedCheckCount ?? 0}`,
          body: `warnings ${generatedSurfaceProofSchema.summary?.warningCheckCount ?? 0} | preview ${generatedSurfaceProofSchema.summary?.previewStatus ?? "unknown"}`,
        },
        {
          title: "Evidence",
          body: `regions ${generatedSurfaceProofSchema.evidence?.regionCount ?? 0} | previewable ${generatedSurfaceProofSchema.evidence?.isPreviewable ? "yes" : "no"} | ctas ${generatedSurfaceProofSchema.evidence?.hasCtaAnchors ? "yes" : "no"}`,
        },
        {
          title: "Provenance / validation",
          body: `${generatedSurfaceProofSchema.evidence?.sourceProposalId ?? "no-source"} | ${generatedSurfaceProofSchema.summary?.validationStatus ?? "unknown"}`,
        },
      ]
    : [];
  const generatedAccessibilityItems = generatedAccessibilityValidationEngine.validationEngineId
    ? [
        {
          title: `accessibility ${generatedAccessibilityValidationEngine.summary?.accessibilityStatus ?? "unknown"} | failed ${generatedAccessibilityValidationEngine.summary?.failedCheckCount ?? 0}`,
          body: `warnings ${generatedAccessibilityValidationEngine.summary?.warningCheckCount ?? 0} | proof ${generatedAccessibilityValidationEngine.summary?.proofStatus ?? "unknown"}`,
        },
        {
          title: "Regions / CTA labels",
          body: `regions ${generatedAccessibilityValidationEngine.evidence?.labeledRegionCount ?? 0}/${generatedAccessibilityValidationEngine.evidence?.regionCount ?? 0} | ctas ${generatedAccessibilityValidationEngine.evidence?.labeledCtaCount ?? 0}/${generatedAccessibilityValidationEngine.evidence?.visibleCtaCount ?? 0}`,
        },
        {
          title: "Readable baseline",
          body: `font ${generatedAccessibilityValidationEngine.evidence?.baseFontSize ?? 0}px | previewable ${generatedAccessibilityValidationEngine.evidence?.previewable ? "yes" : "no"}`,
        },
      ]
    : [];
  const generatedPerformanceBudgetItems = generatedSurfacePerformanceBudgetValidator.performanceBudgetValidatorId
    ? [
        {
          title: `budget ${generatedSurfacePerformanceBudgetValidator.summary?.budgetStatus ?? "unknown"} | failed ${generatedSurfacePerformanceBudgetValidator.summary?.failedCheckCount ?? 0}`,
          body: `warnings ${generatedSurfacePerformanceBudgetValidator.summary?.warningCheckCount ?? 0} | performance ${generatedSurfacePerformanceBudgetValidator.summary?.performanceStatus ?? "unknown"}`,
        },
        {
          title: "Surface load",
          body: `weight ${generatedSurfacePerformanceBudgetValidator.evidence?.weightedSurfaceLoad ?? 0}/${generatedSurfacePerformanceBudgetValidator.evidence?.weightBudget ?? 0} | regions ${generatedSurfacePerformanceBudgetValidator.evidence?.regionCount ?? 0}/${generatedSurfacePerformanceBudgetValidator.evidence?.regionBudget ?? 0}`,
        },
        {
          title: "CTA / preview",
          body: `ctas ${generatedSurfacePerformanceBudgetValidator.evidence?.visibleCtaCount ?? 0}/${generatedSurfacePerformanceBudgetValidator.evidence?.ctaBudget ?? 0} | previewable ${generatedSurfacePerformanceBudgetValidator.evidence?.previewable ? "yes" : "no"}`,
        },
      ]
    : [];
  const generatedBrandConsistencyItems = generatedBrandConsistencyValidator.brandConsistencyValidatorId
    ? [
        {
          title: `brand ${generatedBrandConsistencyValidator.summary?.brandStatus ?? "unknown"} | failed ${generatedBrandConsistencyValidator.summary?.failedCheckCount ?? 0}`,
          body: `warnings ${generatedBrandConsistencyValidator.summary?.warningCheckCount ?? 0} | proof ${generatedBrandConsistencyValidator.summary?.proofStatus ?? "unknown"}`,
        },
        {
          title: "Typography / accent",
          body: `font ${generatedBrandConsistencyValidator.evidence?.previewFontFamily ?? "unknown"} | accent ${generatedBrandConsistencyValidator.evidence?.previewPrimaryColor ?? "unknown"}`,
        },
        {
          title: "Coverage / copy",
          body: `regions ${generatedBrandConsistencyValidator.evidence?.accentMatchedRegions ?? 0}/${generatedBrandConsistencyValidator.evidence?.previewRegionCount ?? 0} | copy ${generatedBrandConsistencyValidator.evidence?.proposalCopyCount ?? 0}`,
        },
      ]
    : [];
  const generatedAssetProvenanceItems = generatedAssetProvenanceRecord.provenanceRecordId
    ? [
        {
          title: `lineage ${generatedAssetProvenanceRecord.status ?? "unknown"} | assets ${generatedAssetProvenanceRecord.summary?.assetCount ?? 0}`,
          body: `review ${generatedAssetProvenanceRecord.summary?.reviewStatus ?? "unknown"} | provider ${generatedAssetProvenanceRecord.summary?.providerId ?? "unknown"}`,
        },
        {
          title: "Selected task",
          body: generatedAssetProvenanceRecord.evidence?.selectedTaskSummary ?? "No selected task summary is linked.",
        },
        {
          title: "Region lineage",
          body:
            normalizeArray(generatedAssetProvenanceRecord.evidence?.regionSlots).join(" | ")
            || "No generated region lineage is recorded.",
        },
      ]
    : [];

  if (elements.proposalSectionTitleInput) {
    elements.proposalSectionTitleInput.value = firstSection.label ?? firstSection.title ?? "";
  }
  if (elements.proposalSectionSummaryInput) {
    elements.proposalSectionSummaryInput.value = firstSection.contentSummary ?? firstSection.body ?? "";
  }
  if (elements.proposalNextActionLabelInput) {
    elements.proposalNextActionLabelInput.value = nextAction.label ?? "";
  }
  if (elements.partialSectionDecisionSelect && !elements.partialSectionDecisionSelect.value) {
    elements.partialSectionDecisionSelect.value = "approved";
  }
  if (elements.partialComponentDecisionSelect && !elements.partialComponentDecisionSelect.value) {
    elements.partialComponentDecisionSelect.value = "rejected";
  }
  if (elements.partialCopyDecisionSelect && !elements.partialCopyDecisionSelect.value) {
    elements.partialCopyDecisionSelect.value = "approved";
  }

  if (elements.proposalReview) {
    elements.proposalReview.innerHTML = `
      ${metricHtml([
        { label: "Proposal", value: activeProposal.proposalType ?? editableProposal.proposalType ?? "generic" },
        { label: "Revision", value: String(editedProposal.revisionNumber ?? 1) },
        { label: "History", value: String(normalizeArray(history.entries).length || 1) },
        { label: "Partial status", value: partialAcceptanceDecision.status ?? "not-run" },
      ])}
      ${stackHtml("Current proposal scope", reviewScope, "עדיין אין scope זמין לעריכה.")}
      ${stackHtml("AI design chain", aiDesignItems, "עדיין אין שרשרת AI Design קנונית זמינה.")}
      ${stackHtml("AI generation observability", aiObservabilityItems, "עדיין אין observability קנוני לשרשרת ה־AI.")}
      ${stackHtml("Provider latency & failure", providerLatencyItems, "עדיין אין מעקב latency/failure קנוני עבור ספק ה־AI.")}
      ${stackHtml("Generation success & acceptance", generationSuccessItems, "עדיין אין מעקב קנוני להצלחה ולקבלה של generation.")}
      ${stackHtml("Prompt contract failures", promptContractFailureItems, "עדיין אין מעקב קנוני לכשלי prompt contract.")}
      ${stackHtml("AI generation review dashboard", aiGenerationDashboardItems, "עדיין אין dashboard קנוני ל־AI generation review.")}
      ${stackHtml("Surface proof", generatedSurfaceProofItems, "עדיין אין proof קנוני למשטח הפעיל.")}
      ${stackHtml("Accessibility validation", generatedAccessibilityItems, "עדיין אין accessibility validation קנוני למשטח הפעיל.")}
      ${stackHtml("Surface performance budget", generatedPerformanceBudgetItems, "עדיין אין performance budget קנוני למשטח הפעיל.")}
      ${stackHtml("Brand consistency", generatedBrandConsistencyItems, "עדיין אין brand consistency קנוני למשטח הפעיל.")}
      ${stackHtml("Asset provenance", generatedAssetProvenanceItems, "עדיין אין provenance קנוני לנכסים הפעילים.")}
      ${stackHtml("Preview surface", generatedPreviewItems, "עדיין אין משטח תצוגה פעיל להצגה.")}
      ${stackHtml("Edit history", historyEntries, "עדיין אין היסטוריית revisions מעבר ליצירה הראשונית.")}
      ${stackHtml("Partial acceptance", partialItems, "עדיין לא בוצע partial acceptance על ההצעה הזאת.")}
    `;
  }
}

function renderLoop(elements, project) {
  const developerWorkspace = normalizeObject(project.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const projectBrainWorkspace = normalizeObject(project.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const releaseWorkspace = normalizeObject(project.releaseWorkspace);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const aiDesignRequest = normalizeObject(project.aiDesignRequest ?? project.state?.aiDesignRequest);
  const generationIntent = normalizeObject(project.generationIntent ?? aiDesignRequest.generationIntent);
  const aiControlCenterSurface = normalizeObject(project.aiControlCenterSurface ?? project.state?.aiControlCenterSurface);
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision ?? project.state?.proposalApplyDecision);
  const partialAcceptanceDecision = normalizeObject(project.partialAcceptanceDecision ?? project.state?.partialAcceptanceDecision);
  const liveUpdateChannel = normalizeObject(project.liveUpdateChannel);
  const liveLogStream = normalizeObject(project.liveLogStream);
  const taskSignal = resolveLoopTaskSignal(project);
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const assignedTasks = roadmap.filter((task) => task.status === "assigned");
  const currentPhase = projectBrainWorkspace.overview?.currentPhase ?? "unknown";
  const releasePreviewId = aiControlCenterSurface.generatedSurfacePreview?.screenId ?? null;
  const primaryLoopAction = taskSignal.queueCount > 0
    ? {
        label: "Execute next task",
        target: "project-brain",
        kind: "execute",
        reason: taskSignal.reason,
        title: taskSignal.title,
      }
    : {
        label: "Continue onboarding",
        target: "onboarding",
        kind: "navigate",
        reason: "ה־loop צריך עוד context לפני שאפשר לקדם task ברור.",
        title: "Complete the project context",
      };
  const secondaryLoopAction = releasePreviewId || releaseValidation.status
    ? {
        label: "Open visible proof",
        target: "proof",
      }
    : {
        label: "Open execution lane",
        target: "developer",
      };
  const clickOutcome = primaryLoopAction.target === "project-brain"
    ? "It opens the task context so you can review the reasoning, blockers, and the execution lane behind this move."
    : "It returns you to onboarding so you can complete the missing context before the loop can continue.";
  const visibleOutcome = primaryLoopAction.kind === "execute" && /רכישת משתמשים|landing|ניסוי/i.test(primaryLoopAction.title)
    ? "ניצור Landing page קצרה עם מסר ברור כדי להתחיל לקבל לקוחות ראשונים."
    : primaryLoopAction.kind === "execute"
    ? "נריץ את המשימה בפועל ונעדכן את הפרויקט עם התוצאה וההוכחה הבאה."
    : "נחזור ל־onboarding כדי להשלים את ההקשר שחסר לפני שאפשר להתקדם.";
  const proofExpectation = releasePreviewId
    ? `Expect to review the visible proposal and proof lane for ${releasePreviewId}.`
    : "Expect to review the release proof lane that will show the visible result after execution.";
  const loopExplainItems = [
    {
      label: "What this task is",
      title: taskSignal.title,
      body: taskSignal.reason,
    },
    {
      label: "Why it is next",
      title: taskSignal.blocker,
      body: "This is the current blocker or highest-pressure move in the project loop.",
    },
    {
      label: "What happens when you click",
      title: primaryLoopAction.label,
      body: clickOutcome,
    },
    {
      label: "What proof to expect",
      title: secondaryLoopAction.label,
      body: proofExpectation,
    },
    ...(generationIntent.intentId
      ? [{
          label: "What generation is aiming to build",
          title: generationIntent.artifactTitle ?? "Artifact intent",
          body: generationIntent.generationGoal ?? generationIntent.framingLine ?? "The generation request now carries the onboarding artifact intent forward.",
        }]
      : []),
  ];

  const understandingItems = [
    {
      title: "What this is",
      body: project.goal ?? "The product goal is not clear yet.",
    },
    {
      title: "Why it matters",
      body: `The loop is currently in ${currentPhase} with ${brainSummary.blockerCount ?? 0} blockers.`,
    },
    {
      title: "What you can do now",
      body: "Continue onboarding if the project context still feels incomplete or too shallow.",
    },
  ];

  const nextTaskItems = [
    {
      title: "What this is",
      body: taskSignal.title,
    },
    {
      title: "Why it matters",
      body: taskSignal.reason,
    },
    {
      title: "What you can do now",
      body: `Open task details to see why this move is next. Queue state: total ${taskSignal.queueCount} | active ${taskSignal.activeCount} | blocked ${taskSignal.blockedCount}.`,
    },
  ];

  const executionItems = [
    {
      title: "What this is",
      body: developerSummary.nextAction ?? "There is no current execution action yet.",
    },
    {
      title: "Why it matters",
      body: `Execution status is ${developerSummary.progressStatus ?? "idle"} with progress ${developerSummary.progressPercent ?? 0}%. Live channel: ${liveUpdateChannel.transportMode ?? "polling"}.`,
    },
    {
      title: "What you can do now",
      body: assignedTasks[0]
        ? "Open the execution lane to watch the assigned task run in real time."
        : `Open the execution lane to inspect the live runtime path. Current log count: ${liveLogStream.summary?.totalEntries ?? 0}.`,
    },
  ];

  const proofItems = [
    {
      title: "What this is",
      body: `The proof lane is currently ${releaseValidation.status ?? "unknown"} and ${releaseSummary.isBlocked ? "blocked" : "moving"}.`,
    },
    {
      title: "Why it matters",
      body: aiControlCenterSurface.generatedSurfacePreview?.screenId
        ? `The visible review target is ${aiControlCenterSurface.generatedSurfacePreview.screenId}.`
        : "The release proof lane is where the visible result will be reviewed after execution.",
    },
    {
      title: "What you can do now",
      body: `Open the proof lane to inspect the result and review status. Apply: ${proposalApplyDecision.status ?? "unknown"} | partial: ${partialAcceptanceDecision.status ?? "not-run"}.`,
    },
  ];

  const stages = [
    {
      step: "01",
      title: "הבנה",
      status: brainSummary.blockerCount > 0 ? "done" : "done",
      body: currentPhase,
      target: "onboarding",
    },
    {
      step: "02",
      title: "משימה",
      status: taskSignal.queueCount > 0 ? "active" : "pending",
      body: taskSignal.title,
      target: "project-brain",
    },
    {
      step: "03",
      title: "ביצוע",
      status: assignedTasks.length > 0 ? "active" : "pending",
      body: developerSummary.nextAction ?? "waiting",
      target: "execution",
    },
    {
      step: "04",
      title: "הוכחה",
      status: aiDesignRequest.requestId || releaseValidation.status ? "active" : "pending",
      body: releaseValidation.status ?? "unknown",
      target: "proof",
    },
    {
      step: "05",
      title: "אישור",
      status: proposalApplyDecision.status === "approved" ? "active" : "pending",
      body: proposalApplyDecision.status ?? "pending",
      target: "confirmation",
    },
    {
      step: "06",
      title: "עדכון",
      status: project?.status === "working" ? "active" : "pending",
      body: project?.status ?? "pending",
      target: "state-update",
    },
    {
      step: "07",
      title: "הבא",
      status: taskSignal.queueCount > 1 ? "active" : "pending",
      body: taskSignal.queueCount > 1 ? "next queued" : "pending",
      target: "next-task",
    },
  ];

  if (elements.loopScreenIntro) {
    elements.loopScreenIntro.textContent =
      "This screen is the single working loop: understand the next move, open it, and end in one visible proof lane.";
  }
  if (elements.loopPrimaryTitle) {
    elements.loopPrimaryTitle.textContent = primaryLoopAction.title;
  }
  if (elements.loopPrimaryReason) {
    elements.loopPrimaryReason.textContent = primaryLoopAction.reason;
  }
  if (elements.loopWhatHappensBody) {
    elements.loopWhatHappensBody.textContent = visibleOutcome;
  }
  if (elements.loopPrimaryActionButton) {
    elements.loopPrimaryActionButton.textContent = "בצע את המשימה ⚡";
    elements.loopPrimaryActionButton.dataset.loopTarget = primaryLoopAction.target;
    elements.loopPrimaryActionButton.dataset.loopActionKind = primaryLoopAction.kind;
    elements.loopPrimaryActionButton.disabled = false;
    elements.loopPrimaryActionButton.title = primaryLoopAction.reason;
  }
  if (elements.loopSecondaryActionButton) {
    elements.loopSecondaryActionButton.textContent = "ראה הוכחה 👁";
    elements.loopSecondaryActionButton.dataset.loopTarget = secondaryLoopAction.target;
    elements.loopSecondaryActionButton.disabled = false;
    elements.loopSecondaryActionButton.title =
      secondaryLoopAction.target === "proof"
        ? "Open the visible proof and review lane."
        : "Open the current execution lane.";
  }
  if (elements.loopOpenOnboardingButton) {
    elements.loopOpenOnboardingButton.textContent = "Refine project context";
    elements.loopOpenOnboardingButton.disabled = false;
    elements.loopOpenOnboardingButton.title = "Open the onboarding step to refine project understanding.";
  }
  if (elements.loopOpenProjectBrainButton) {
    elements.loopOpenProjectBrainButton.textContent = "Review task reasoning";
    elements.loopOpenProjectBrainButton.disabled = false;
    elements.loopOpenProjectBrainButton.title = "Open the task context and breakdown lane.";
  }
  if (elements.loopOpenDeveloperButton) {
    elements.loopOpenDeveloperButton.textContent = "Watch execution path";
    elements.loopOpenDeveloperButton.disabled = false;
    elements.loopOpenDeveloperButton.title = assignedTasks[0]
      ? "Open the active execution lane."
      : "Open the execution lane even though no task is assigned yet.";
  }
  if (elements.loopOpenReleaseButton) {
    elements.loopOpenReleaseButton.textContent = "Review visible proof";
    elements.loopOpenReleaseButton.disabled = false;
    elements.loopOpenReleaseButton.title = releasePreviewId
      ? "Open the visible proof and proposal review lane."
      : "Open the proof lane even though the visible preview is still limited.";
  }
  if (elements.loopStageRail) {
    elements.loopStageRail.innerHTML = loopStageRailHtml(stages);
  }
  if (elements.loopWorkspaceSummary) {
    elements.loopWorkspaceSummary.innerHTML = loopExplainHtml(loopExplainItems);
  }
  if (elements.loopUnderstanding) {
    elements.loopUnderstanding.innerHTML = stackHtml("Understanding", understandingItems, "עדיין אין understanding route זמין.");
  }
  if (elements.loopNextTask) {
    elements.loopNextTask.innerHTML = stackHtml("Next task", nextTaskItems, "עדיין אין next task זמין.");
  }
  if (elements.loopExecution) {
    elements.loopExecution.innerHTML = stackHtml("Execution", executionItems, "עדיין אין execution state זמין.");
  }
  if (elements.loopProof) {
    elements.loopProof.innerHTML = stackHtml("Proof", proofItems, "עדיין אין proof path זמין.");
  }
}

function renderWorkspaceSummaries(elements, project) {
  const developerWorkspace = normalizeObject(project.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const projectBrainWorkspace = normalizeObject(project.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const releaseWorkspace = normalizeObject(project.releaseWorkspace);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const growthSummary = normalizeObject(growthWorkspace.summary);
  const loopTask = resolveLoopTaskSignal(project);

  elements.developerWorkspaceSummary.innerHTML = metricHtml([
    { label: "Progress", value: `${developerSummary.progressPercent ?? 0}%` },
    { label: "Status", value: developerSummary.progressStatus ?? "idle" },
    { label: "Next action", value: developerSummary.nextAction ?? "not-set" },
    { label: "Incident", value: developerSummary.incidentStatus ?? "clear" },
  ]);

  elements.projectBrainSummary.innerHTML = metricHtml([
    { label: "Domain", value: projectBrainWorkspace.overview?.domain ?? "generic" },
    { label: "Phase", value: projectBrainWorkspace.overview?.currentPhase ?? "unknown" },
    { label: "Blockers", value: String(brainSummary.blockerCount ?? 0) },
    { label: "Approval", value: brainSummary.requiresApproval ? "required" : "clear" },
  ]);

  elements.releaseWorkspaceSummary.innerHTML = metricHtml([
    { label: "Target", value: releaseWorkspace.releaseTarget ?? "not-set" },
    { label: "Stage", value: releaseWorkspace.buildAndDeploy?.currentStage ?? "planned" },
    { label: "Validation", value: releaseValidation.status ?? "unknown" },
    { label: "Blocked", value: releaseSummary.isBlocked ? "yes" : "no" },
  ]);

  elements.growthWorkspaceSummary.innerHTML = metricHtml([
    { label: "Pillars", value: String(growthSummary.totalPillars ?? 0) },
    { label: "Channels", value: String(growthSummary.totalChannels ?? 0) },
    { label: "KPIs", value: String(growthSummary.totalKpis ?? 0) },
    { label: "Plan", value: growthSummary.hasGrowthPlan ? "active" : "not-set" },
  ]);
}

function renderPrimitivePreview(component) {
  const preview = normalizeObject(component.preview);
  const escapedLabel = escapeHtml(preview.label ?? component.componentType ?? "Primitive");

  if (component.componentType === "button") {
    return `
      <div class="primitive-preview-row">
        <button type="button" class="primitive-button-preview">${escapeHtml(preview.text ?? "Primary action")}</button>
        <button type="button" class="primitive-button-preview secondary">${escapeHtml(preview.secondaryText ?? "Secondary action")}</button>
      </div>
    `;
  }

  if (component.componentType === "input") {
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <input type="text" value="${escapeHtml(preview.value ?? "")}" placeholder="${escapeHtml(preview.placeholder ?? "")}" />
      </label>
    `;
  }

  if (component.componentType === "textarea") {
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <textarea rows="4" placeholder="${escapeHtml(preview.placeholder ?? "")}">${escapeHtml(preview.value ?? "")}</textarea>
      </label>
    `;
  }

  if (component.componentType === "select") {
    const options = normalizeArray(preview.options);
    const selectedOption = preview.selectedOption ?? options[0] ?? "";
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <select>
          ${options
            .map(
              (option) =>
                `<option value="${escapeHtml(option)}"${option === selectedOption ? " selected" : ""}>${escapeHtml(option)}</option>`,
            )
            .join("")}
        </select>
      </label>
    `;
  }

  if (component.componentType === "badge") {
    return `
      <div class="primitive-preview-row">
        ${normalizeArray(preview.items)
          .map((item, index) => `<span class="primitive-badge-preview tone-${index % 3}">${escapeHtml(item)}</span>`)
          .join("")}
      </div>
    `;
  }

  if (component.componentType === "icon-button") {
    return `
      <div class="primitive-preview-row">
        <button type="button" class="primitive-icon-button-preview" aria-label="${escapeHtml(preview.assistiveLabel ?? "Icon action")}">
          <span aria-hidden="true">${escapeHtml(preview.icon ?? "⋯")}</span>
        </button>
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderPrimitiveComponents(elements, project) {
  if (!elements.primitiveComponents) {
    return;
  }

  const primitiveLibrary = normalizeObject(project.primitiveComponents);
  const components = normalizeArray(primitiveLibrary.components);
  const summary = normalizeObject(primitiveLibrary.summary);

  if (!components.length) {
    elements.primitiveComponents.innerHTML = `<p class="empty">עדיין אין ספריית primitive components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="primitive-card">
          <header class="primitive-card-header">
            <strong>${escapeHtml(component.componentType ?? "primitive")}</strong>
            <span class="mini-label">${escapeHtml(component.interactive ? "interactive" : "display")}</span>
          </header>
          <p class="primitive-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderPrimitivePreview(component)}
          <p class="primitive-card-meta">${escapeHtml(normalizeArray(component.variants).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.primitiveComponents.innerHTML = `
    ${metricHtml([
      { label: "Primitives", value: String(summary.totalComponents ?? components.length) },
      { label: "Interactive", value: String(summary.interactiveComponents ?? 0) },
      { label: "Form ready", value: summary.includesFormPrimitives ? "yes" : "no" },
      { label: "Base contract", value: primitiveLibrary.baseContractId ?? "not-set" },
    ])}
    <div class="primitive-grid">${cards}</div>
  `;
}

function renderLayoutPreview(component) {
  const preview = normalizeObject(component.preview);
  const items = normalizeArray(preview.items);
  const columns = normalizeArray(preview.columns);

  if (component.componentType === "container") {
    return `
      <div class="layout-preview-shell layout-preview-container">
        <div class="layout-preview-outline">
          <div class="layout-preview-inner">${escapeHtml(items[1] ?? "Inner content")}</div>
        </div>
      </div>
    `;
  }

  if (component.componentType === "section" || component.componentType === "panel") {
    return `
      <div class="layout-preview-shell layout-preview-section">
        ${items.map((item) => `<div class="layout-preview-block">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "stack") {
    return `
      <div class="layout-preview-shell layout-preview-stack">
        ${items.map((item) => `<div class="layout-preview-block">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "grid") {
    return `
      <div class="layout-preview-shell layout-preview-grid">
        ${columns.map((column) => `<div class="layout-preview-grid-cell">span ${escapeHtml(String(column))}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "divider") {
    return `
      <div class="layout-preview-shell layout-preview-divider">
        <span>${escapeHtml(items[0] ?? "Section A")}</span>
        <div class="layout-preview-divider-line"></div>
        <span>${escapeHtml(items[1] ?? "Section B")}</span>
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderLayoutComponents(elements, project) {
  if (!elements.layoutComponents) {
    return;
  }

  const layoutLibrary = normalizeObject(project.layoutComponents);
  const components = normalizeArray(layoutLibrary.components);
  const summary = normalizeObject(layoutLibrary.summary);

  if (!components.length) {
    elements.layoutComponents.innerHTML = `<p class="empty">עדיין אין ספריית layout components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="layout-card">
          <header class="layout-card-header">
            <strong>${escapeHtml(component.componentType ?? "layout")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.anatomy).join(" · "))}</span>
          </header>
          <p class="layout-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderLayoutPreview(component)}
          <p class="layout-card-meta">${escapeHtml(
            Object.entries(normalizeObject(component.layoutRules))
              .map(([key, value]) => `${key}:${value}`)
              .join(" · "),
          )}</p>
        </article>
      `,
    )
    .join("");

  elements.layoutComponents.innerHTML = `
    ${metricHtml([
      { label: "Layouts", value: String(summary.totalComponents ?? components.length) },
      { label: "Workbench ready", value: summary.supportsWorkbenchLayouts ? "yes" : "no" },
      { label: "Responsive", value: summary.hasResponsiveCoverage ? "yes" : "no" },
      { label: "Library", value: layoutLibrary.layoutComponentLibraryId ?? "not-set" },
    ])}
    <div class="layout-grid">${cards}</div>
  `;
}

function renderFeedbackPreview(component) {
  const preview = normalizeObject(component.preview);

  if (component.componentType === "loading-state") {
    return `
      <div class="feedback-preview-shell">
        <div class="feedback-loading-row">
          <div class="feedback-spinner"></div>
          <div>
            <strong>${escapeHtml(preview.headline ?? "Loading")}</strong>
            <p>${escapeHtml(preview.description ?? "")}</p>
          </div>
        </div>
        <div class="feedback-progress-track">
          <div class="feedback-progress-indicator" style="width:${escapeHtml(preview.progressLabel ?? "64%")}"></div>
        </div>
      </div>
    `;
  }

  if (component.componentType === "empty-state" || component.componentType === "error-state") {
    return `
      <div class="feedback-preview-shell">
        <strong>${escapeHtml(preview.headline ?? "Feedback state")}</strong>
        <p>${escapeHtml(preview.description ?? "")}</p>
        <button type="button" class="feedback-action-preview">${escapeHtml(preview.actionLabel ?? "Continue")}</button>
      </div>
    `;
  }

  if (component.componentType === "toast") {
    return `
      <div class="feedback-preview-stack">
        ${normalizeArray(preview.items).map((item, index) => `<div class="feedback-toast-preview tone-${index % 3}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "banner") {
    return `
      <div class="feedback-banner-preview">
        <strong>${escapeHtml(preview.headline ?? "Banner")}</strong>
        <p>${escapeHtml(preview.description ?? "")}</p>
      </div>
    `;
  }

  if (component.componentType === "progress") {
    const percent = Number(preview.percent ?? 0);
    return `
      <div class="feedback-preview-shell">
        <div class="feedback-progress-meta">
          <strong>${escapeHtml(preview.label ?? "Progress")}</strong>
          <span>${escapeHtml(String(percent))}%</span>
        </div>
        <div class="feedback-progress-track">
          <div class="feedback-progress-indicator" style="width:${Math.max(0, Math.min(100, percent))}%"></div>
        </div>
        <p>${escapeHtml(preview.meta ?? "")}</p>
      </div>
    `;
  }

  if (component.componentType === "skeleton") {
    return `
      <div class="feedback-preview-stack">
        ${Array.from({ length: Number(preview.rows ?? 3) }, (_, index) => `<div class="feedback-skeleton-row tone-${index % 3}"></div>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderFeedbackComponents(elements, project) {
  if (!elements.feedbackComponents) {
    return;
  }

  const feedbackLibrary = normalizeObject(project.feedbackComponents);
  const components = normalizeArray(feedbackLibrary.components);
  const summary = normalizeObject(feedbackLibrary.summary);

  if (!components.length) {
    elements.feedbackComponents.innerHTML = `<p class="empty">עדיין אין ספריית feedback components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="feedback-card">
          <header class="feedback-card-header">
            <strong>${escapeHtml(component.componentType ?? "feedback")}</strong>
            <span class="mini-label">${escapeHtml(component.tone ?? "neutral")}</span>
          </header>
          <p class="feedback-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderFeedbackPreview(component)}
          <p class="feedback-card-meta">${escapeHtml(normalizeArray(component.supportedStates).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.feedbackComponents.innerHTML = `
    ${metricHtml([
      { label: "Feedback", value: String(summary.totalComponents ?? components.length) },
      { label: "Screen states", value: summary.coversScreenStates ? "yes" : "no" },
      { label: "Inline feedback", value: summary.coversInlineFeedback ? "yes" : "no" },
      { label: "Library", value: feedbackLibrary.feedbackComponentLibraryId ?? "not-set" },
    ])}
    <div class="feedback-grid">${cards}</div>
  `;
}

function renderNavigationPreview(component) {
  const preview = normalizeObject(component.preview);
  const items = normalizeArray(preview.items);

  if (component.componentType === "sidebar") {
    return `
      <div class="navigation-preview-shell navigation-preview-sidebar">
        ${items.map((item, index) => `<div class="navigation-chip${index === 0 ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "tabs") {
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="navigation-preview-shell navigation-preview-tabs">
        ${items.map((item) => `<div class="navigation-tab${item === activeItem ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "breadcrumb") {
    return `
      <div class="navigation-preview-shell navigation-preview-breadcrumb">
        ${items.map((item, index) => `<span>${escapeHtml(item)}${index < items.length - 1 ? " / " : ""}</span>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "topbar") {
    return `
      <div class="navigation-preview-shell navigation-preview-topbar">
        <strong>${escapeHtml(preview.title ?? "Workspace")}</strong>
        <div class="navigation-preview-actions">
          ${normalizeArray(preview.actions).map((action) => `<span class="navigation-chip">${escapeHtml(action)}</span>`).join("")}
        </div>
        <span class="mini-label">${escapeHtml(preview.status ?? "Live")}</span>
      </div>
    `;
  }

  if (component.componentType === "stepper") {
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="navigation-preview-shell navigation-preview-stepper">
        ${items.map((item, index) => `<div class="navigation-step${item === activeItem ? " active" : ""}"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderNavigationComponents(elements, project) {
  if (!elements.navigationComponents) {
    return;
  }

  const navigationLibrary = normalizeObject(project.navigationComponents);
  const components = normalizeArray(navigationLibrary.components);
  const summary = normalizeObject(navigationLibrary.summary);

  if (!components.length) {
    elements.navigationComponents.innerHTML = `<p class="empty">עדיין אין ספריית navigation components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="navigation-card">
          <header class="navigation-card-header">
            <strong>${escapeHtml(component.componentType ?? "navigation")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.anatomy).join(" · "))}</span>
          </header>
          <p class="navigation-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderNavigationPreview(component)}
          <p class="navigation-card-meta">${escapeHtml(Object.entries(normalizeObject(component.navigationRules)).map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(",") : value}`).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.navigationComponents.innerHTML = `
    ${metricHtml([
      { label: "Navigation", value: String(summary.totalComponents ?? components.length) },
      { label: "Flow types", value: String(summary.totalFlowTypes ?? 0) },
      { label: "Workspace ready", value: summary.supportsWorkspaceNavigation ? "yes" : "no" },
      { label: "Library", value: navigationLibrary.navigationComponentLibraryId ?? "not-set" },
    ])}
    <div class="navigation-grid">${cards}</div>
  `;
}

function renderDataDisplayPreview(component) {
  const preview = normalizeObject(component.preview);

  if (component.componentType === "table") {
    const headers = normalizeArray(preview.headers);
    const rows = normalizeArray(preview.rows);
    return `
      <div class="data-display-preview-shell">
        <div class="data-display-table-preview">
          <div class="data-display-table-row header">
            ${headers.map((header) => `<strong>${escapeHtml(header)}</strong>`).join("")}
          </div>
          ${rows.map((row) => `<div class="data-display-table-row">${normalizeArray(row).map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (component.componentType === "stat-card") {
    return `
      <div class="data-display-preview-shell data-display-stat-preview">
        <span class="mini-label">${escapeHtml(preview.headline ?? "Metric")}</span>
        <strong>${escapeHtml(preview.value ?? "0")}</strong>
        <span>${escapeHtml(preview.delta ?? "0%")}</span>
      </div>
    `;
  }

  if (component.componentType === "activity-log") {
    return `
      <div class="data-display-preview-shell data-display-stack">
        ${normalizeArray(preview.items).map((item) => `<div class="data-display-log-item">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "timeline") {
    const items = normalizeArray(preview.items);
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="data-display-preview-shell data-display-timeline">
        ${items.map((item) => `<div class="data-display-timeline-step${item === activeItem ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "key-value-panel") {
    return `
      <div class="data-display-preview-shell data-display-key-value">
        ${normalizeArray(preview.pairs).map((pair) => `<div class="data-display-kv-row"><span>${escapeHtml(pair?.[0] ?? "")}</span><strong>${escapeHtml(pair?.[1] ?? "")}</strong></div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "status-chip") {
    return `
      <div class="data-display-preview-shell">
        ${normalizeArray(preview.items).map((item, index) => `<span class="data-display-chip tone-${index % 3}">${escapeHtml(item)}</span>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderDataDisplayComponents(elements, project) {
  if (!elements.dataDisplayComponents) {
    return;
  }

  const displayLibrary = normalizeObject(project.dataDisplayComponents);
  const components = normalizeArray(displayLibrary.components);
  const summary = normalizeObject(displayLibrary.summary);

  if (!components.length) {
    elements.dataDisplayComponents.innerHTML = `<p class="empty">עדיין אין ספריית data display components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="data-display-card">
          <header class="data-display-card-header">
            <strong>${escapeHtml(component.componentType ?? "data-display")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.supportedScreenTypes).join(" · "))}</span>
          </header>
          <p class="data-display-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderDataDisplayPreview(component)}
          <p class="data-display-card-meta">${escapeHtml(Object.entries(normalizeObject(component.dataRules)).map(([key, value]) => `${key}:${value}`).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.dataDisplayComponents.innerHTML = `
    ${metricHtml([
      { label: "Display", value: String(summary.totalComponents ?? components.length) },
      { label: "Screen types", value: String(summary.totalSupportedScreenTypes ?? 0) },
      { label: "Dashboards", value: summary.supportsOperationalDashboards ? "yes" : "no" },
      { label: "Library", value: displayLibrary.dataDisplayLibraryId ?? "not-set" },
    ])}
    <div class="data-display-grid">${cards}</div>
  `;
}

function renderScreenReview(elements, project) {
  const report = normalizeObject(project.screenReviewReport);
  const reportSummary = normalizeObject(report.summary);
  const checklistSummary = normalizeObject(project.screenValidationChecklist?.summary);
  const screens = normalizeArray(report.screens);
  const readyItems = screens
    .filter((screen) => screen.summary?.isReady)
    .slice(0, 2)
    .map((screen) => ({
      title: `${screen.screenType ?? screen.screenId} מוכן`,
      body: "עבר את כל הולידטורים",
    }));
  const blockedItems = screens
    .filter((screen) => !screen.summary?.isReady)
    .slice(0, 3)
    .map((screen) => ({
      title: `${screen.screenType ?? screen.screenId} חסום`,
      body: normalizeArray(screen.summary?.blockingIssues).join(" | ") || "נדרשת בדיקה נוספת",
    }));

  elements.screenReview.innerHTML = `
    ${metricHtml([
      { label: "מסכים מוכנים", value: String(reportSummary.readyScreens ?? 0) },
      { label: "מסכים חסומים", value: String(reportSummary.blockedScreens ?? 0) },
      { label: "סה״כ מסכים", value: String(checklistSummary.totalScreens ?? reportSummary.totalScreens ?? 0) },
      { label: "מצב gate", value: (reportSummary.blockedScreens ?? 0) === 0 ? "Ready" : "Needs review" },
    ])}
    ${stackHtml("Pass", readyItems, "עדיין אין מסכים שסומנו כמוכנים.")}
    ${stackHtml("Blocking issues", blockedItems, "אין כרגע חסימות פתוחות ברמת screen review.")}
  `;
}

function extractLearningItems(project) {
  const insightViewModel = normalizeObject(project.learningInsightViewModel);
  const explicitInsights = normalizeArray(insightViewModel.insights);
  if (explicitInsights.length > 0) {
    return explicitInsights.map((insight) => ({
      title: insight.title ?? insight.insightId ?? "Learning insight",
      body: insight.summary ?? insight.reason ?? "",
    }));
  }

  const fallbackItems = normalizeArray(insightViewModel.items);
  return fallbackItems.map((item) => ({
    title: item.title ?? item.id ?? "Learning insight",
    body: item.summary ?? item.reason ?? "",
  }));
}

function renderLearning(elements, project) {
  const template = normalizeObject(project.aiLearningWorkspaceTemplate);
  const composition = normalizeObject(template.composition);
  const summary = normalizeObject(template.summary);
  const confidence = normalizeObject(project.confidenceIndicator);
  const items = extractLearningItems(project).slice(0, 3);

  elements.learning.innerHTML = `
    ${metricHtml([
      { label: "Insights", value: String(composition.insightCount ?? items.length) },
      { label: "Sections", value: String(summary.enabledSections ?? 0) },
      { label: "Confidence", value: confidence.level ?? confidence.confidenceLevel ?? "not-set" },
      { label: "Reasoning", value: summary.supportsRecommendationReasoning ? "enabled" : "basic" },
    ])}
    ${stackHtml("Top insights", items, "עדיין אין learning insights זמינים.")}
  `;
}

function renderCompanion(elements, project) {
  const state = normalizeObject(project.companionState);
  const dock = normalizeObject(project.companionDock);
  const panel = normalizeObject(project.companionPanel);
  const settings = normalizeObject(project.companionModeSettings);
  const suggestionItems = normalizeArray(panel.sections?.suggestions?.items).slice(0, 3).map((item) => ({
    title: item,
    body: "Companion signal",
  }));
  const actionItems = normalizeArray(panel.sections?.nextActions?.items).slice(0, 3).map((item) => ({
    title: item,
    body: "Next action",
  }));

  elements.companion.innerHTML = `
    ${metricHtml([
      { label: "State", value: state.state ?? "idle" },
      { label: "Priority", value: dock.priority ?? "advisory" },
      { label: "Mode", value: settings.selectedMode ?? "assistive" },
      { label: "Dock", value: dock.visible ? "visible" : "hidden" },
    ])}
    ${stackHtml(
      "Companion summary",
      [
        {
          title: dock.summary?.headline ?? "The AI companion is available if you need help.",
          body: normalizeArray(state.reasons).join(" | ") || "אין כרגע איתותים מיוחדים.",
        },
      ],
      "אין כרגע companion summary.",
    )}
    ${stackHtml("Suggestions", suggestionItems, "אין כרגע suggestions פתוחות.")}
    ${stackHtml("Next actions", actionItems, "אין כרגע next actions ל־companion.")}
  `;
}

function renderCollaboration(elements, project) {
  const feed = normalizeObject(project.collaborationFeed);
  const summary = normalizeObject(feed.summary);
  const presenceSummary = normalizeObject(project.projectPresenceState?.summary);
  const reviewThreadState = normalizeObject(project.reviewThreadState);
  const reviewThreadSummary = normalizeObject(reviewThreadState.summary);
  const items = normalizeArray(feed.items).slice(0, 4).map((item) => ({
    title: item.headline ?? item.itemType ?? "Collaboration event",
    body: `${item.actorName ?? "Nexus"} | ${item.workspaceArea ?? "workspace"} | ${t(item.status ?? "active")}`,
  }));
  const threadItems = normalizeArray(reviewThreadState.threads).slice(0, 3).map((thread) => ({
    title: thread.title ?? thread.threadType ?? "Review thread",
    body: `${thread.contextTarget?.resourceType ?? "comment"} | ${thread.messages?.[thread.messages.length - 1]?.body ?? "No messages yet"}`,
  }));

  elements.collaboration.innerHTML = `
    ${metricHtml([
      { label: "Feed items", value: String(summary.totalItems ?? 0) },
      { label: "Active participants", value: String(project.projectPresenceState?.activeParticipantCount ?? presenceSummary.totalParticipants ?? 0) },
      { label: "Shared presence", value: presenceSummary.hasSharedPresence ? "yes" : "no" },
      { label: "Open threads", value: String(reviewThreadSummary.openThreads ?? 0) },
    ])}
    ${stackHtml("Latest activity", items, "עדיין אין activity שיתופית זמינה.")}
    ${stackHtml("Review threads", threadItems, "עדיין אין review threads פתוחים.")}
  `;
}

function renderVersioning(elements, project) {
  const state = normalizeObject(project.state);
  const snapshot = normalizeObject(project.snapshotRecord ?? state.snapshotRecord);
  const schedule = normalizeObject(project.snapshotSchedule ?? state.snapshotSchedule);
  const worker = normalizeObject(project.snapshotBackupWorker ?? state.snapshotBackupWorker);
  const snapshotJobState = normalizeObject(project.snapshotJobState ?? state.snapshotJobState);
  const retentionPolicy = normalizeObject(project.snapshotRetentionPolicy ?? state.snapshotRetentionPolicy);
  const retentionDecision = normalizeObject(project.snapshotRetentionDecision ?? state.snapshotRetentionDecision);
  const continuityPlan = normalizeObject(project.continuityPlan ?? state.continuityPlan);
  const disasterRecoveryChecklist = normalizeObject(project.disasterRecoveryChecklist ?? state.disasterRecoveryChecklist);
  const businessContinuityState = normalizeObject(project.businessContinuityState ?? state.businessContinuityState);
  const restore = normalizeObject(project.restoreDecision ?? state.restoreDecision);
  const rollback = normalizeObject(project.rollbackExecutionResult ?? state.rollbackExecutionResult);
  const versions = normalizeObject(snapshot.versions);
  const scheduleExecution = normalizeObject(schedule.execution);
  const preChangeTriggers = normalizeArray(schedule.preChangeTriggers).join(", ");
  const checklistSummary = normalizeObject(disasterRecoveryChecklist.summary);
  const checklistPrerequisites = normalizeArray(disasterRecoveryChecklist.prerequisites);
  const checklistSteps = normalizeArray(disasterRecoveryChecklist.steps);
  const continuitySummary = normalizeObject(businessContinuityState.summary);
  const continuityOrchestration = normalizeObject(businessContinuityState.orchestration);
  const continuityDecisionTrace = normalizeObject(continuityPlan.decisionTrace);
  const continuityActions = normalizeArray(businessContinuityState.availableActions).map((action) => ({
    title: action,
    body: `continuity action`,
  }));
  const details = [
    {
      title: snapshot.snapshotId ?? snapshot.snapshotRecordId ?? "No snapshot yet",
      body: `state v${versions.stateVersion ?? "?"} | graph v${versions.executionGraphVersion ?? "?"}`,
    },
    {
      title: `Schedule: ${schedule.summary?.scheduleStatus ?? "not-configured"}`,
      body: `Every ${schedule.intervalSeconds ?? "?"}s | pre-change: ${preChangeTriggers || "none"}`,
    },
    {
      title: `Retention: ${retentionPolicy.summary?.policyStatus ?? "active"}`,
      body: `max ${retentionPolicy.maxSnapshots ?? "?"} | pruned ${retentionDecision.summary?.pruneCount ?? 0}`,
    },
    {
      title: `Worker: ${snapshotJobState.lastExecutionStatus ?? worker.lastExecutionStatus ?? "not-run"}`,
      body: `status ${snapshotJobState.status ?? worker.status ?? "idle"} | errors ${worker.errorCount ?? 0}`,
    },
    {
      title: `Restore mode: ${restore.restoreMode ?? "unknown"}`,
      body: restore.blockedReason ?? `Safe to execute: ${restore.summary?.isSafeToExecute ? "yes" : "no"}`,
    },
    {
      title: `Rollback: ${rollback.executionStatus ?? "not-run"}`,
      body: `Targets restored: ${rollback.summary?.restoredTargetCount ?? 0}`,
    },
    {
      title: `Recovery readiness: ${checklistSummary.readinessScore ?? 0}%`,
      body: `missing ${checklistSummary.missingPrerequisites ?? 0} | steps ${checklistSteps.length} | traces ${disasterRecoveryChecklist.observability?.totalTraces ?? 0}`,
    },
    {
      title: `Continuity: ${businessContinuityState.lifecycleState ?? "unknown"}`,
      body: `${businessContinuityState.continuityStatus ?? "unknown"} | mode ${continuityPlan.recommendedMode ?? "n/a"} | failover ${continuitySummary.failoverReady ? "ready" : "partial"}`,
    },
  ];
  const prerequisiteItems = checklistPrerequisites.slice(0, 5).map((item) => ({
    title: `${item.label ?? item.key ?? "Prerequisite"} | ${item.status ?? "unknown"}`,
    body: item.reason ?? "No reason provided.",
  }));
  const recoveryStepItems = checklistSteps.slice(0, 5).map((step) => ({
    title: `${step.order ?? "?"}. ${step.title ?? "Recovery step"}`,
    body: `${step.phase ?? "phase"} | ${step.ready === false ? "blocked" : "ready"} | ${step.description ?? ""}`,
  }));
  const continuityItems = [
    {
      title: `Backup orchestration`,
      body: `schedule ${continuityOrchestration.backup?.scheduleId ?? "n/a"} | worker ${continuityOrchestration.backup?.workerEnabled ? "enabled" : "disabled"}`,
    },
    {
      title: `Retention orchestration`,
      body: `policy ${continuityOrchestration.retention?.retentionPolicyId ?? "n/a"} | max ${continuityOrchestration.retention?.maxSnapshots ?? "?"}`,
    },
    {
      title: `Failover integration`,
      body: `${continuityOrchestration.failover?.integrationStatus ?? "placeholder"} | ${continuityOrchestration.failover?.note ?? "n/a"}`,
    },
    {
      title: `Continuity plan`,
      body: `${continuityPlan.affectedLayer ?? "runtime"} | ${continuityPlan.summary?.planStatus ?? "missing"} | ${continuityDecisionTrace.reliabilitySource ?? "n/a"}`,
    },
  ];

  elements.versioning.innerHTML = `
    ${metricHtml([
      { label: "Snapshot stored", value: snapshot.summary?.isStored ? "yes" : "no" },
      { label: "Schedule", value: schedule.summary?.scheduleStatus ?? "not-configured" },
      { label: "Worker", value: worker.enabled ? (worker.status ?? "active") : "disabled" },
      { label: "Worker next run", value: worker.nextRunAt ?? scheduleExecution.nextRunAt ?? "n/a" },
      { label: "Max snapshots", value: String(retentionPolicy.maxSnapshots ?? 20) },
      { label: "Last cleanup", value: retentionPolicy.lastCleanupAt ?? "never" },
      { label: "Last backup", value: scheduleExecution.lastRunAt ?? "never" },
      { label: "Rollback status", value: rollback.executionStatus ?? "not-run" },
      { label: "Recovery ready", value: checklistSummary.canExecuteRecovery ? "yes" : "no" },
      { label: "Recovery score", value: `${checklistSummary.readinessScore ?? 0}%` },
      { label: "Continuity state", value: businessContinuityState.lifecycleState ?? "unknown" },
      { label: "Continuity risk", value: businessContinuityState.continuityStatus ?? "unknown" },
      { label: "Plan mode", value: continuityPlan.recommendedMode ?? "n/a" },
    ])}
    ${stackHtml("State control", details, "עדיין אין נתוני versioning זמינים.")}
    ${stackHtml("Recovery prerequisites", prerequisiteItems, "אין כרגע prerequisites של recovery.")}
    ${stackHtml("Recovery steps", recoveryStepItems, "אין כרגע recovery steps זמינים.")}
    ${stackHtml("Business continuity", continuityItems, "אין כרגע business continuity state זמין.")}
    ${stackHtml("Continuity actions", continuityActions, "אין כרגע continuity actions זמינות.")}
  `;

  if (elements.snapshotIntervalInput && schedule.intervalSeconds) {
    elements.snapshotIntervalInput.value = String(schedule.intervalSeconds);
  }

  if (elements.snapshotTriggersInput) {
    elements.snapshotTriggersInput.value = preChangeTriggers || "bootstrap,migration,deploy";
  }

  if (elements.snapshotMaxInput && retentionPolicy.maxSnapshots) {
    elements.snapshotMaxInput.value = String(retentionPolicy.maxSnapshots);
  }

  if (elements.snapshotWorkerToggleButton) {
    elements.snapshotWorkerToggleButton.textContent = worker.enabled ? "Disable worker" : "Enable worker";
  }
}

function renderProjectAudit(elements, payload) {
  if (!elements.projectAudit) {
    return;
  }

  const projectAuditPayload = normalizeObject(payload);
  const summary = normalizeObject(projectAuditPayload.summary);
  const filters = normalizeObject(projectAuditPayload.filters);
  const entries = normalizeArray(projectAuditPayload.entries).map((entry) => ({
    title: `${entry.actionType ?? "project.observed"} | ${entry.actorLabel ?? entry.actorId ?? "system"} | ${entry.sensitivity ?? "low"}`,
    body: `${entry.timestamp ?? "no-timestamp"} | ${entry.outcomeStatus ?? "recorded"}`,
  }));

  elements.projectAudit.innerHTML = `
    ${metricHtml([
      { label: "Entries", value: String(summary.totalEntries ?? entries.length) },
      { label: "Filtered", value: summary.filtered ? "yes" : "no" },
      { label: "Actor filter", value: filters.actorId ?? "all" },
      { label: "Sensitivity", value: filters.sensitivity ?? "all" },
    ])}
    ${stackHtml("Audit history", entries, projectAuditPayload.viewerModel?.emptyState ?? "No matching audit activity found.")}
  `;
}

function renderAccessIsolation(elements, project) {
  if (!elements.accessIsolation) {
    return;
  }

  const state = normalizeObject(project.state);
  const projectAuthorizationDecision = normalizeObject(project.projectAuthorizationDecision ?? state.projectAuthorizationDecision);
  const privilegedAuthorityDecision = normalizeObject(project.privilegedAuthorityDecision ?? state.privilegedAuthorityDecision);
  const workspaceIsolationDecision = normalizeObject(project.workspaceIsolationDecision ?? state.workspaceIsolationDecision);
  const leakageAlert = normalizeObject(project.leakageAlert ?? state.leakageAlert);

  const hasSignals = Boolean(
    projectAuthorizationDecision.authorizationDecisionId
    || privilegedAuthorityDecision.privilegedAuthorityDecisionId
    || workspaceIsolationDecision.workspaceIsolationDecisionId
    || leakageAlert.leakageAlertId,
  );

  if (!hasSignals) {
    elements.accessIsolation.innerHTML = `<p class="empty">עדיין אין החלטות authorization/isolation זמינות.</p>`;
    return;
  }

  const checks = [
    ...normalizeArray(projectAuthorizationDecision.checks),
    ...normalizeArray(privilegedAuthorityDecision.checks),
    ...normalizeArray(workspaceIsolationDecision.checks),
    ...normalizeArray(leakageAlert.checks),
  ].slice(0, 8);

  elements.accessIsolation.innerHTML = `
    ${metricHtml([
      { label: "Authorization", value: projectAuthorizationDecision.decision ?? "unknown" },
      { label: "Privileged", value: privilegedAuthorityDecision.decision ?? "unknown" },
      { label: "Isolation", value: workspaceIsolationDecision.decision ?? "unknown" },
      { label: "Leakage", value: leakageAlert.severity ?? "clear" },
    ])}
    ${stackHtml(
      "Guard decisions",
      [
        {
          title: projectAuthorizationDecision.reason ?? "Authorization decision available",
          body: `${projectAuthorizationDecision.projectAction ?? "view"} | ${projectAuthorizationDecision.requiredCapability ?? "view"}`,
        },
        {
          title: privilegedAuthorityDecision.reason ?? "Privileged authority decision available",
          body: `${privilegedAuthorityDecision.projectAction ?? "view"} | approval ${privilegedAuthorityDecision.requiresApproval ? "required" : "not-required"}`,
        },
        {
          title: workspaceIsolationDecision.reason ?? "Workspace isolation decision available",
          body: `${workspaceIsolationDecision.resourceType ?? "resource"} | ${workspaceIsolationDecision.requestWorkspaceId ?? "workspace"}`,
        },
        {
          title: leakageAlert.reason ?? "Leak detector evaluated",
          body: `${normalizeArray(leakageAlert.leakSignals).join(" | ") || "no leak signals"}`,
        },
      ],
      "אין כרגע guard decisions.",
    )}
    ${stackHtml(
      "Checks",
      checks.map((check) => ({ title: check, body: "policy signal" })),
      "אין checks זמינים.",
    )}
  `;
}

function renderGrowth(elements, project) {
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const strategy = normalizeObject(growthWorkspace.strategy);
  const campaigns = normalizeObject(growthWorkspace.campaigns);
  const analytics = normalizeObject(growthWorkspace.analytics);
  const pillarItems = normalizeArray(strategy.pillars).slice(0, 3).map((pillar) => ({
    title: pillar.title ?? pillar.name ?? pillar,
    body: pillar.summary ?? strategy.contentGoal ?? "",
  }));
  const campaignItems = normalizeArray(campaigns.tasks).slice(0, 3).map((task) => ({
    title: task.title ?? task.summary ?? task.taskId ?? "Campaign task",
    body: `${task.status ?? "planned"} | ${task.channel ?? task.owner ?? "growth"}`,
  }));
  const kpiItems = normalizeArray(analytics.kpis).slice(0, 3).map((kpi) => ({
    title: kpi.label ?? kpi.name ?? "KPI",
    body: `${kpi.value ?? kpi.current ?? "n/a"}${kpi.unit ? ` ${kpi.unit}` : ""}`,
  }));

  elements.growth.innerHTML = `
    ${stackHtml(
      "Strategy",
      [
        {
          title: strategy.targetAudience ?? "No target audience yet",
          body: `${strategy.gtmStage ?? "unknown"} | ${strategy.contentGoal ?? "no content goal"}`,
        },
      ],
      "אין כרגע growth strategy זמינה.",
    )}
    ${stackHtml("Pillars", pillarItems, "אין כרגע pillars מוגדרים.")}
    ${stackHtml("Campaigns", campaignItems, "אין כרגע משימות campaign פתוחות.")}
    ${stackHtml("KPIs", kpiItems, "אין כרגע KPI נתונים להצגה.")}
  `;
}

function renderExternal(elements, project) {
  const repositoryDiagnosis = normalizeObject(
    project.repositoryImportAndCodebaseDiagnosis ?? project.state?.repositoryImportAndCodebaseDiagnosis,
  );
  const liveWebsiteDiagnosis = normalizeObject(
    project.liveWebsiteIngestionAndFunnelDiagnosis ?? project.state?.liveWebsiteIngestionAndFunnelDiagnosis,
  );
  const importedAnalyticsNormalization = normalizeObject(
    project.importedAnalyticsNormalization ?? project.state?.importedAnalyticsNormalization,
  );
  const importedAssetTaskExtraction = normalizeObject(
    project.importedAssetTaskExtraction ?? project.state?.importedAssetTaskExtraction,
  );
  const importAndContinueRoadmap = normalizeObject(
    project.importAndContinueRoadmap ?? project.state?.importAndContinueRoadmap,
  );

  if (
    !project.externalSnapshot
    && !project.gitSnapshot
    && !project.runtimeSnapshot
    && !repositoryDiagnosis.status
    && !liveWebsiteDiagnosis.status
    && !importedAnalyticsNormalization.status
    && !importedAssetTaskExtraction.status
    && !importAndContinueRoadmap.status
  ) {
    elements.external.innerHTML = `<p class="empty">עדיין לא בוצע חיבור חיצוני.</p>`;
    return;
  }

  const items = [];

  if (project.externalSnapshot) {
    const snapshot = project.externalSnapshot;
    items.push(
      { title: `מצב הקזינו: ${snapshot.health?.status ?? "unknown"}` },
      {
        title: "מסד נתונים",
        body:
          snapshot.health?.databaseConnected === null
            ? snapshot.health?.databaseConnectedReason
            : snapshot.health?.databaseConnected
              ? "מחובר"
              : "לא מחובר",
      },
      {
        title: "זרימות חסומות",
        body: normalizeArray(snapshot.blockedFlows).slice(0, 3).join(" | ") || "אין כרגע",
      },
    );
  }

  if (project.gitSnapshot) {
    items.push(
      {
        title: `חיבור Git: ${project.gitSnapshot.repo?.fullName ?? project.gitSnapshot.repo?.name ?? "unknown"}`,
        body: `${project.gitSnapshot.provider ?? "git"} | ענף ראשי: ${project.gitSnapshot.repo?.defaultBranch ?? "unknown"}`,
      },
      {
        title: "Branches / PRs",
        body: `${normalizeArray(project.gitSnapshot.branches).length} branches | ${normalizeArray(project.gitSnapshot.pullRequests).length} PR/MR`,
      },
      {
        title: "Commit אחרון",
        body: project.gitSnapshot.commits?.[0]?.title ?? "אין commits זמינים",
      },
    );
  }

  if (repositoryDiagnosis.status === "ready") {
    items.push(
      {
        title: `Repository diagnosis: ${repositoryDiagnosis.summary?.diagnosisStatus ?? "ready"}`,
        body: repositoryDiagnosis.summary?.codebaseSummary ?? "Codebase diagnosis available",
      },
      {
        title: "Architecture / gaps",
        body: `${repositoryDiagnosis.summary?.architectureSummary ?? "No architecture summary"} | ${(normalizeArray(repositoryDiagnosis.diagnosisReadout?.blockingGaps).slice(0, 2).join(" | ") || "No blocking gaps")}`,
      },
      {
        title: "Next import action",
        body: repositoryDiagnosis.summary?.nextAction ?? "Review repository diagnosis findings",
      },
    );
  }

  if (liveWebsiteDiagnosis.status === "ready") {
    items.push(
      {
        title: `Website diagnosis: ${liveWebsiteDiagnosis.summary?.diagnosisStatus ?? "ready"}`,
        body: liveWebsiteDiagnosis.summary?.websiteSummary ?? "Live website diagnosis available",
      },
      {
        title: "Funnel / blockers",
        body:
          `${liveWebsiteDiagnosis.summary?.funnelSummary ?? "No funnel summary"} | ${(
            normalizeArray(liveWebsiteDiagnosis.funnelDiagnosis?.criticalDependencies).slice(0, 2).join(" | ")
            || "No critical dependencies"
          )}`,
      },
      {
        title: "Next website action",
        body: liveWebsiteDiagnosis.summary?.nextAction ?? "Review live website diagnosis findings",
      },
    );
  }

  if (importedAnalyticsNormalization.status === "ready") {
    items.push(
      {
        title: `Imported analytics: ${importedAnalyticsNormalization.summary?.normalizationStatus ?? "ready"}`,
        body: `${importedAnalyticsNormalization.summary?.importedAssetCount ?? 0} imported assets | ${importedAnalyticsNormalization.summary?.providerCount ?? 0} providers`,
      },
      {
        title: "Analytics evidence",
        body:
          normalizeArray(importedAnalyticsNormalization.evidenceSources?.providers).join(" | ")
          || "Imported analytics evidence available",
      },
      {
        title: "Next analytics action",
        body: importedAnalyticsNormalization.summary?.nextAction ?? "Review normalized imported analytics",
      },
    );
  }

  if (importedAssetTaskExtraction.status === "ready") {
    items.push(
      {
        title: `Imported tasks: ${importedAssetTaskExtraction.summary?.totalExtractedTasks ?? 0}`,
        body: `${importedAssetTaskExtraction.summary?.highPriorityCount ?? 0} high priority | ${normalizeArray(importedAssetTaskExtraction.summary?.sourceCoverage).join(" | ")}`,
      },
      {
        title: "Next extracted action",
        body: importedAssetTaskExtraction.summary?.nextAction ?? "Review extracted imported tasks",
      },
      {
        title: "Extraction coverage",
        body:
          normalizeArray(importedAssetTaskExtraction.extractedTasks)
            .slice(0, 2)
            .map((task) => task.title)
            .join(" | ") || "Imported task extraction available",
      },
    );
  }

  if (importAndContinueRoadmap.status === "ready") {
    items.push(
      {
        title: `Import roadmap: ${importAndContinueRoadmap.summary?.roadmapItemCount ?? 0} tasks`,
        body: `${importAndContinueRoadmap.summary?.sourceCount ?? 0} sources | highest priority: ${importAndContinueRoadmap.summary?.highestPriorityAction ?? "n/a"}`,
      },
      {
        title: "Next import-and-continue action",
        body: importAndContinueRoadmap.summary?.nextAction ?? "Review import-and-continue roadmap",
      },
      {
        title: "Roadmap dependency chain",
        body:
          normalizeArray(importAndContinueRoadmap.roadmapItems)
            .slice(0, 2)
            .map((task) => task.title)
            .join(" | ") || "Import-and-continue roadmap available",
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
        body: `${normalizeArray(project.runtimeSnapshot.errorLogs).reduce((sum, item) => sum + (item.count ?? 0), 0)} שגיאות | ${normalizeArray(project.runtimeSnapshot.monitoring).filter((item) => item.status !== "ok").length} התראות`,
      },
    );
  }

  elements.external.innerHTML = listHtml(items, "אין מידע חיצוני.");
}

function renderScanner(elements, project) {
  elements.scanPathInput.value = project.path ?? "";
  if (!project.scan) {
    elements.scanner.innerHTML = `<p class="empty">עדיין לא בוצעה סריקה.</p>`;
    return;
  }

  const scan = project.scan;
  elements.scanner.innerHTML = listHtml(
    [
      { title: scan.summary ?? "אין סיכום סריקה" },
      { title: "חוסרים", body: normalizeArray(scan.gaps).join(" | ") || "לא זוהו" },
      { title: "בדיקות", body: normalizeArray(scan.evidence?.testFiles).join(", ") || "לא זוהו" },
    ],
    "אין נתוני סריקה.",
  );
}

function renderAnalysis(elements, project) {
  if (!project.analysis) {
    elements.analysis.innerHTML = `<p class="empty">עדיין לא בוצע ניתוח AI.</p>`;
    return;
  }

  const analysis = project.analysis;
  elements.analysis.innerHTML = listHtml(
    [
      { title: analysis.summary ?? "אין סיכום ניתוח" },
      { title: "סיכונים", body: normalizeArray(analysis.risks).join(" | ") || "אין כרגע" },
      { title: "צעדים מומלצים", body: normalizeArray(analysis.nextActions).join(" | ") || "אין כרגע" },
    ],
    "אין ניתוח.",
  );
}

function renderGraph(elements, project) {
  const tasks = normalizeArray(project.cycle?.roadmap);
  elements.graph.innerHTML = listHtml(
    tasks.map((task) => ({
      title: task.summary,
      body: `${t(task.lane)} | ${t(task.status)}`,
    })),
    "אין זרימת ביצוע.",
  );
}

function renderAgents(elements, project) {
  elements.agents.innerHTML = listHtml(
    normalizeArray(project.agents).map((agent) => ({
      title: `${agent.name} - ${t(agent.status)}`,
      body: agent.currentTask ?? "אין כרגע משימה",
    })),
    "אין סוכנים.",
  );
}

function renderEvents(elements, project) {
  elements.events.innerHTML = listHtml(
    normalizeArray(project.events).slice().reverse().slice(0, 6).map((event) => ({
      title: t(event.type),
      body: event.payload?.task?.summary ?? event.payload?.taskId ?? event.payload?.projectId ?? "",
    })),
    "אין אירועים.",
  );
}

export function renderProject(elements, project) {
  if (!elements.screenWorkspace || !elements.workspaceBoard) {
    return;
  }
  renderTop(elements, project);
  renderWorkspaceTabs(elements, project);
  renderWorkspaceSummaries(elements, project);
  renderLoop(elements, project);
  renderCritical(elements, project);
  renderMissing(elements, project);
  renderExisting(elements, project);
  renderLive(elements, project);
  renderProofScreen(elements, project);
  renderDecision(elements, project);
  renderPrimitiveComponents(elements, project);
  renderLayoutComponents(elements, project);
  renderFeedbackComponents(elements, project);
  renderNavigationComponents(elements, project);
  renderDataDisplayComponents(elements, project);
  renderScreenReview(elements, project);
  renderProposalReview(elements, project);
  renderLearning(elements, project);
  renderCompanion(elements, project);
  renderCollaboration(elements, project);
  renderVersioning(elements, project);
  renderProjectAudit(elements, project.projectAuditPayload ?? project.state?.projectAuditPayload);
  renderAccessIsolation(elements, project);
  renderGrowth(elements, project);
  renderExternal(elements, project);
  renderScanner(elements, project);
  renderAnalysis(elements, project);
  renderGraph(elements, project);
  renderAgents(elements, project);
  renderEvents(elements, project);
}

export function createCockpitApp({
  doc = globalThis.document,
  fetchImpl = globalThis.fetch,
  EventSourceImpl = globalThis.EventSource,
  storageImpl = globalThis.localStorage,
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
} = {}) {
  if (!doc) {
    throw new Error("Document is required to initialize the cockpit app.");
  }

  const elements = queryElements(doc);
  const createScreenElementKeys = [
    "emptyAppState",
    "createScreenTitle",
    "createScreenStatus",
    "projectCreateStage",
    "createProjectNameInput",
    "createProjectVisionInput",
    "createProjectLinkInput",
    "createProjectFilePickerButton",
    "createProjectFilePickerTitle",
    "createProjectFilePickerMeta",
    "createProjectFileUploadInput",
    "createProjectFileNameInput",
    "createProjectFileContentInput",
    "createProjectButton",
  ];
  applyDevModeVisibility(elements);
  const mainGrid = doc.querySelector(".main-grid");
  if (mainGrid && !doc.querySelector("#screen-execution")) {
    const executionScreenHost = doc.createElement("section");
    executionScreenHost.id = "screen-execution";
    executionScreenHost.className = "app-screen app-screen-execution";
    executionScreenHost.hidden = true;
    mainGrid.appendChild(executionScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-loop")) {
    const loopScreenHost = doc.createElement("section");
    loopScreenHost.id = "screen-loop";
    loopScreenHost.className = "app-screen app-screen-loop";
    loopScreenHost.hidden = true;
    mainGrid.appendChild(loopScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-understanding")) {
    const understandingScreenHost = doc.createElement("section");
    understandingScreenHost.id = "screen-understanding";
    understandingScreenHost.className = "app-screen app-screen-understanding";
    understandingScreenHost.hidden = true;
    mainGrid.appendChild(understandingScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-home")) {
    const homeScreenHost = doc.createElement("section");
    homeScreenHost.id = "screen-home";
    homeScreenHost.className = "app-screen app-screen-home";
    homeScreenHost.hidden = true;
    mainGrid.appendChild(homeScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-files")) {
    const filesScreenHost = doc.createElement("section");
    filesScreenHost.id = "screen-files";
    filesScreenHost.className = "app-screen app-screen-files";
    filesScreenHost.hidden = true;
    mainGrid.appendChild(filesScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-settings")) {
    const settingsScreenHost = doc.createElement("section");
    settingsScreenHost.id = "screen-settings";
    settingsScreenHost.className = "app-screen app-screen-settings";
    settingsScreenHost.hidden = true;
    mainGrid.appendChild(settingsScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-qa")) {
    const qaScreenHost = doc.createElement("section");
    qaScreenHost.id = "screen-qa";
    qaScreenHost.className = "app-screen app-screen-qa";
    qaScreenHost.hidden = true;
    mainGrid.appendChild(qaScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-proof")) {
    const proofScreenHost = doc.createElement("section");
    proofScreenHost.id = "screen-proof";
    proofScreenHost.className = "app-screen app-screen-proof";
    proofScreenHost.hidden = true;
    mainGrid.appendChild(proofScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-artifact")) {
    const artifactScreenHost = doc.createElement("section");
    artifactScreenHost.id = "screen-artifact";
    artifactScreenHost.className = "app-screen app-screen-artifact";
    artifactScreenHost.hidden = true;
    mainGrid.appendChild(artifactScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-confirmation")) {
    const confirmationScreenHost = doc.createElement("section");
    confirmationScreenHost.id = "screen-confirmation";
    confirmationScreenHost.className = "app-screen app-screen-confirmation";
    confirmationScreenHost.hidden = true;
    mainGrid.appendChild(confirmationScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-state-update")) {
    const stateUpdateScreenHost = doc.createElement("section");
    stateUpdateScreenHost.id = "screen-state-update";
    stateUpdateScreenHost.className = "app-screen app-screen-state-update";
    stateUpdateScreenHost.hidden = true;
    mainGrid.appendChild(stateUpdateScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-next-task")) {
    const nextTaskScreenHost = doc.createElement("section");
    nextTaskScreenHost.id = "screen-next-task";
    nextTaskScreenHost.className = "app-screen app-screen-next-task";
    nextTaskScreenHost.hidden = true;
    mainGrid.appendChild(nextTaskScreenHost);
  }
  if (mainGrid && !doc.querySelector("#screen-timeline")) {
    const timelineScreenHost = doc.createElement("section");
    timelineScreenHost.id = "screen-timeline";
    timelineScreenHost.className = "app-screen app-screen-timeline";
    timelineScreenHost.hidden = true;
    mainGrid.appendChild(timelineScreenHost);
  }
  elements.screenExecution = doc.querySelector("#screen-execution");
  elements.screenLoop = doc.querySelector("#screen-loop");
  elements.screenUnderstanding = doc.querySelector("#screen-understanding");
  elements.screenHome = doc.querySelector("#screen-home");
  elements.screenFiles = doc.querySelector("#screen-files");
  elements.screenSettings = doc.querySelector("#screen-settings");
  elements.screenHelp = doc.querySelector("#screen-help");
  elements.screenQa = doc.querySelector("#screen-qa");
  elements.screenProof = doc.querySelector("#screen-proof");
  elements.screenArtifact = doc.querySelector("#screen-artifact");
  elements.screenConfirmation = doc.querySelector("#screen-confirmation");
  elements.screenStateUpdate = doc.querySelector("#screen-state-update");
  elements.screenNextTask = doc.querySelector("#screen-next-task");
  elements.screenTimeline = doc.querySelector("#screen-timeline");
  function clearCreateScreenElementBindings() {
    for (const key of createScreenElementKeys) {
      elements[key] = null;
    }
  }

  function bindCreateScreenElements() {
    clearCreateScreenElementBindings();
    bindProjectCreateScreenElements(doc, elements);
  }

  function bindHelpScreenElements() {
    bindHelpSupportScreenElements(doc, elements);
  }

  function renderCreateScreenView(viewModel = buildProjectCreateViewModel()) {
    if (!elements.screenCreate) {
      return;
    }
    elements.screenCreate.innerHTML = renderProjectCreateScreen(viewModel);
    bindCreateScreenElements();
  }

  function ensureOnboardingScreenView({ force = false } = {}) {
    if (!elements.screenOnboarding) {
      return;
    }
    const hasConversationSurface = Boolean(
      elements.screenOnboarding.querySelector("#onboarding-current-question-title")
      && elements.screenOnboarding.querySelector("#onboarding-progress-pill")
      && elements.screenOnboarding.querySelector("#onboarding-chat-thread"),
    );
    if (force || !elements.screenOnboarding.innerHTML.trim() || !hasConversationSurface) {
      const viewModel = buildSmartOnboardingViewModel({
        onboardingConversation,
        onboardingFlow,
        currentProject,
      });
      elements.screenOnboarding.innerHTML = renderSmartOnboardingScreen(viewModel);
    }
    bindSmartOnboardingScreenElements(doc, elements);
  }

  function buildCanonicalSupportSidebar(currentRoute) {
    return {
      currentRoute,
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
  }

  function renderTruthfulBlockedRouteScreen(routeKey, {
    title = "המסך הזה עוד לא מוכן לשחזור",
    body = "חסר כרגע ההקשר שצריך כדי לפתוח את המסלול הזה בצורה אמיתית.",
    primaryLabel = "חזור ליצירה",
    primaryTarget = "create",
    secondaryLabel = "פתח בית",
    secondaryTarget = "home",
  } = {}) {
    const screenMap = {
      onboarding: elements.screenOnboarding,
      loop: elements.screenLoop,
      execution: elements.screenExecution,
      proof: elements.screenProof,
      artifact: elements.screenArtifact,
      confirmation: elements.screenConfirmation,
      "state-update": elements.screenStateUpdate,
      "next-task": elements.screenNextTask,
      timeline: elements.screenTimeline,
    };
    const host = screenMap[routeKey];
    if (!host) {
      return;
    }

    const projectName = currentProject?.name ?? "Nexus";
    host.innerHTML = renderWorkspaceLayout({
      sidebar: buildCanonicalSupportSidebar(routeKey === "onboarding" ? "/onboarding" : "/loop"),
      topbar: {
        projectName,
        avatar: projectName.slice(0, 1) || "N",
      },
      content: `
        <section class="nexus-route-blocked-screen">
          <div class="nexus-route-blocked-screen__hero">
            <span class="nexus-route-blocked-screen__badge">Route state</span>
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(body)}</p>
          </div>
          <div class="nexus-route-blocked-screen__grid">
            ${renderNexusCard({
              className: "nexus-route-blocked-screen__card",
              padding: "lg",
              content: `
                <h2>מה חסר עכשיו</h2>
                <ul class="nexus-route-blocked-screen__list">
                  <li>פרויקט פעיל או session שניתן לשחזר באמת.</li>
                  <li>context שמאפשר להמשיך במסלול בלי ליפול ל־QA mock.</li>
                  <li>state שמחובר לשרת החי ולא רק ל־URL.</li>
                </ul>
              `,
            })}
            ${renderNexusCard({
              className: "nexus-route-blocked-screen__card",
              padding: "lg",
              content: `
                <h2>מה אפשר לעשות עכשיו</h2>
                <div class="nexus-route-blocked-screen__actions">
                  ${renderNexusButton({
                    label: primaryLabel,
                    variant: "primary",
                    size: "lg",
                    attrs: { "data-nexus-ui-target": primaryTarget },
                  })}
                  ${renderNexusButton({
                    label: secondaryLabel,
                    variant: "secondary",
                    size: "lg",
                    attrs: { "data-nexus-ui-target": secondaryTarget },
                  })}
                </div>
              `,
            })}
          </div>
        </section>
      `,
    });
  }

  function renderDeferredSupportScreenView(route) {
    if (!elements.screenCreate) {
      return;
    }

    elements.screenCreate.innerHTML = `
      <section class="deferred-support-route">
        <section id="empty-app-state" class="create-main-card deferred-support-card" data-mode="${escapeHtml(route.key)}">
          <div class="create-card-header">
            <div class="empty-app-copy">
              <p class="eyebrow deferred-support-card__eyebrow">Deferred</p>
              <h2 id="create-screen-title">${escapeHtml(route.title)}</h2>
              <p id="create-screen-status">${escapeHtml(route.subtitle)}</p>
            </div>
          </div>
          <div class="deferred-support-card__body">
            <p>${escapeHtml(route.explanation)}</p>
          </div>
        </section>
      </section>
    `;
    bindCreateScreenElements();
  }

  function renderBlockedRouteFallback(routeKey) {
    const route = buildShellRouteModel(routeKey);
    currentShellRouteKey = route.key;
    closeLiveUpdates();
    currentProjectAuditPayload = null;
    if (routeKey === "onboarding") {
      renderTruthfulBlockedRouteScreen("onboarding", {
        title: "אין onboarding פעיל לשחזור",
        body: "הגענו למסלול /onboarding בלי session או פרויקט פעיל. המסך נשאר בתוך Nexus, אבל צריך להתחיל פרויקט חדש או לחזור לבית כדי להמשיך truthfully.",
        primaryLabel: "פתח יצירה",
        primaryTarget: "create",
        secondaryLabel: "פתח בית",
        secondaryTarget: "home",
      });
      setAppScreen("onboarding");
      renderShellChrome(route.key, activeWorkspace);
      persistFlowState(route.key);
      scrollViewportToTop();
      return;
    }
    if (routeKey === "loop") {
      renderTruthfulBlockedRouteScreen("loop", {
        title: "אין לופ פעיל לשחזור",
        body: "הגענו למסלול /loop בלי פרויקט פעיל. במקום QA fallback או create שקט, Nexus מציג חסימה אמיתית בתוך המסך הקנוני.",
        primaryLabel: "פתח בית",
        primaryTarget: "home",
        secondaryLabel: "צור פרויקט",
        secondaryTarget: "create",
      });
      setAppScreen("loop");
      renderShellChrome(route.key, activeWorkspace);
      persistFlowState(route.key);
      scrollViewportToTop();
      return;
    }
    renderQaFallbackRoute(route.key);
    renderShellChrome(route.key, activeWorkspace);
    persistFlowState(route.key);
    scrollViewportToTop();
  }

  let currentProjectId = null;
  let currentProject = null;
  let cachedProjects = [];
  let refreshTimer = null;
  let liveEventSource = null;
  let activeWorkspace = "loop";
  let currentShellRouteKey = "create";
  let qaPreviewRouteKey = null;
  let onboardingFlow = null;
  let onboardingConversation = null;
  let currentProjectAuditPayload = null;
  let activeAppUser = null;
  let currentSettingsProfileSurface = null;
  let currentSettingsPanel = "profile";
  let currentSettingsFlashMessage = "";
  let currentSettingsErrorMessage = "";
  let currentSettingsSavingState = "idle";
  let currentHelpSearchQuery = "";
  let currentHelpCategory = "";
  let currentHelpArticleId = "";
  let currentHelpSupportPanelOpen = false;
  let currentHelpSupportCopyMessage = "";
  const presenceParticipantId = `presence-${Math.random().toString(36).slice(2, 10)}`;
  const hasNativeAppStorage = Boolean(
    storageImpl
    && typeof storageImpl.getItem === "function"
    && typeof storageImpl.setItem === "function",
  );
  const appStorage = hasNativeAppStorage
    ? storageImpl
    : {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      };
  const locationHost = globalThis.location?.hostname ?? "";
  let suppressShellRouteHistorySync = false;

  function readUrlBackedFlowState() {
    const locationApi = globalThis.location;
    if (!locationApi) {
      return null;
    }
    try {
      const searchParams = new URLSearchParams(locationApi.search ?? "");
      const raw = searchParams.get("qaState");
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch {
        return JSON.parse(decodeURIComponent(raw));
      }
    } catch {
      return null;
    }
  }

  function writeUrlBackedFlowState(flowState) {
    const historyApi = globalThis.history;
    const locationApi = globalThis.location;
    if (!historyApi || !locationApi || typeof historyApi.replaceState !== "function") {
      return;
    }
    try {
      const url = new URL(locationApi.href);
      url.searchParams.set("qaState", JSON.stringify(flowState));
      historyApi.replaceState(historyApi.state ?? {}, "", url.toString());
    } catch {}
  }

  function resolveCurrentShellRouteKey(screen = null, workspaceKey = null) {
    if (qaPreviewRouteKey) {
      return qaPreviewRouteKey;
    }
    const activeScreen = screen ?? doc?.body?.dataset?.appScreen ?? currentShellRouteKey;

    if (activeScreen === "workspace") {
      return normalizeShellRouteKey(workspaceKey ?? activeWorkspace ?? currentShellRouteKey);
    }

    if (activeScreen === "onboarding") {
      return elements.onboardingFormStage?.hidden === false ? "understanding" : "onboarding";
    }

    return normalizeShellRouteKey(activeScreen ?? currentShellRouteKey);
  }

  function syncBrowserShellRoute(routeKey, options = {}) {
    if (suppressShellRouteHistorySync) {
      return;
    }
    const historyApi = globalThis.history;
    const locationApi = globalThis.location;
    if (!historyApi || !locationApi || typeof historyApi.pushState !== "function" || typeof historyApi.replaceState !== "function") {
      return;
    }

    const normalizedRouteKey = normalizeShellRouteKey(routeKey);
    const targetPath = shellRoutePathMap[normalizedRouteKey] ?? "/";
    const currentPath = normalizeString(locationApi.pathname) || "/";
    if (currentPath === targetPath) {
      return;
    }

    const mode = options.replace === true ? "replaceState" : "pushState";
    historyApi[mode]({ nexusRoute: normalizedRouteKey }, "", targetPath);
  }

  function buildShellRouteModel(routeKey) {
    const hasProject = Boolean(currentProjectId || currentProject?.id);
    const hasContinuationPreview = currentProject?.onboardingContinuationPreview === true;
    const hasLoopAccess = hasProject || hasContinuationPreview;
    const canResumeOnboarding = Boolean(hasProject || onboardingFlow?.sessionId || onboardingConversation);
    const routeMap = {
      create: {
        key: "create",
        label: "Primary flow",
        title: "Project Create",
        subtitle: "פותחים פרויקט חדש ומתחילים את הלופ במקום אחד ברור.",
        explanation: "זה מסך הכניסה הרשמי של Nexus. מכאן יוצרים פרויקט חדש בלי לעבור דרך dashboard מפוצל.",
        navButton: elements.navCreateButton,
        stepButton: elements.flowStepCreateButton,
        stepKey: "create",
        enabled: true,
      },
      onboarding: {
        key: "onboarding",
        label: "Primary flow",
        title: "Smart Onboarding",
        subtitle: "מחדדים את הפרויקט בשיחה לפני שנכנסים לעבודה עצמה.",
        explanation: "זה שלב האיסוף והחידוד. ממשיכים לכאן רק כשיש draft אמיתי או פרויקט קיים לעבוד עליו.",
        navButton: elements.navOnboardingButton,
        stepButton: elements.flowStepOnboardingButton,
        stepKey: "onboarding",
        enabled: canResumeOnboarding,
        disabledReason: "Onboarding נפתח רק אחרי יצירת draft או פרויקט פעיל.",
      },
      loop: {
        key: "loop",
        label: "Primary flow",
        title: "Nexus Loop",
        subtitle: "זה הצעד הבא, למה הוא הבא, ומה תראה אחרי שתבצע אותו.",
        explanation: "זה לב המוצר: משימה אחת ברורה, סיבה אחת ברורה, ויציאה אחת להוכחה ויזואלית.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasLoopAccess,
        disabledReason: "Loop נפתח רק כשיש פרויקט פעיל או כשההבנה כבר אושרה וממתינים רק לחומר תומך.",
      },
      execution: {
        key: "execution",
        label: "Primary flow",
        title: "Execution / Live Run",
        subtitle: "כאן רואים את שלב הביצוע החי של המשימה, בזמן אמת.",
        explanation: "זה מסך הביצוע של הלופ: סטטוס המשימה, פעולות שרצות עכשיו, ולוג עדכני של מה שהמערכת עושה.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject,
        disabledReason: "Execution נפתח רק כשיש פרויקט פעיל.",
      },
      proof: {
        key: "proof",
        label: "Primary flow",
        title: "Result / Proof",
        subtitle: "כאן רואים מה נוצר בפועל, יחד עם proof ונתוני התוצאה.",
        explanation: "זה מסך ההוכחה של הלופ: תצוגת התוצר, bullet proof, וסטטיסטיקות התוצאה לפני שעוברים לאישור.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject,
        disabledReason: "Proof נפתח רק כשיש פרויקט פעיל.",
      },
      artifact: {
        key: "artifact",
        label: "Primary flow",
        title: "Artifact Preview",
        subtitle: "כאן התוצר נפתח כמשטח עצמאי וקנוני, לא רק כחלק מכרטיס ה־proof.",
        explanation: "זה route ה־artifact הראשון: אותו תוצר שנבנה בלופ, עכשיו כמשטח פתוח בפני עצמו בתוך Nexus.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject,
        disabledReason: "Artifact route זמין רק כשיש פרויקט פעיל עם proof artifact.",
      },
      confirmation: {
        key: "confirmation",
        label: "Primary flow",
        title: "Confirmation",
        subtitle: "כאן מחליטים אם לאשר את התוצאה ולהמשיך, או לחזור לתיקון ממוקד.",
        explanation: "זה מסך ההחלטה של הלופ: אשר והמשך לעדכון מצב, או בקש שינויים וחזור למשימה.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject || resolveDevFlowControlsEnabled(),
        disabledReason: "Confirmation זמין אחרי proof.",
      },
      "state-update": {
        key: "state-update",
        label: "Primary flow",
        title: "State Update",
        subtitle: "כאן רואים איך מצב הפרויקט השתנה אחרי אישור התוצאה.",
        explanation: "זה מסך המעבר בין review מאושר לבין המשך הלולאה. ממנו רואים מה נסגר, מה נפתח, ומה המשמעות קדימה.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject || resolveDevFlowControlsEnabled(),
        disabledReason: "State Update זמין אחרי proof ו־confirmation.",
      },
      "next-task": {
        key: "next-task",
        label: "Primary flow",
        title: "Next Task",
        subtitle: "כאן רואים מה הצעד הבא שמומלץ לפתוח אחרי עדכון המצב.",
        explanation: "זה מסך המעבר מה־state החדש אל המשימה הבאה. ממנו אפשר להיכנס ישירות לביצוע או לפתוח פירוט.",
        navButton: elements.navLoopButton,
        stepButton: elements.flowStepLoopButton,
        stepKey: "loop",
        enabled: hasProject || resolveDevFlowControlsEnabled(),
        disabledReason: "Next Task זמין אחרי state update.",
      },
      developer: {
        key: "developer",
        label: "Advanced lane",
        title: "Developer Workspace",
        subtitle: "מסלול מתקדם לצפייה ב־runtime, execution ו־code scan.",
        explanation: "זה מסך עבודה משני, לא תחליף ל־loop הראשי.",
        navButton: elements.navDeveloperButton,
        enabled: hasProject,
        disabledReason: "Developer workspace זמין רק לפרויקט פעיל.",
      },
      "project-brain": {
        key: "project-brain",
        label: "Advanced lane",
        title: "Project Brain",
        subtitle: "כאן בודקים reasoning, blockers והבנת הפרויקט מאחורי הלופ.",
        explanation: "זה מסך משני לבדיקת הקשרים והחלטות, לא המסך הראשי של המשתמש.",
        navButton: elements.navProjectBrainButton,
        enabled: hasProject,
        disabledReason: "Project Brain זמין רק לפרויקט פעיל.",
      },
      release: {
        key: "release",
        label: "Advanced lane",
        title: "Release Workspace",
        subtitle: "כאן רואים proof, proposal review ו־apply state.",
        explanation: "זה מסלול ההוכחה וה־review. ב־NLP-001 הוא נשאר secondary lane.",
        navButton: elements.navReleaseButton,
        enabled: hasProject,
        disabledReason: "Release זמין רק לפרויקט פעיל.",
      },
      growth: {
        key: "growth",
        label: "Advanced lane",
        title: "Growth Workspace",
        subtitle: "כאן עובדים על ערוצי צמיחה, KPI ותוכניות שיווק משניות.",
        explanation: "Growth נשאר secondary lane ולא חלק מהלופ הראשי בשלב הזה.",
        navButton: elements.navGrowthButton,
        enabled: hasProject,
        disabledReason: "Growth workspace זמין רק לפרויקט פעיל.",
      },
      timeline: {
        key: "timeline",
        label: "Primary flow",
        title: "Timeline / History",
        subtitle: "כאן רואים את היסטוריית הפרויקט, אבני הדרך, והמעברים שעברנו.",
        explanation: "זה מסך הזיכרון של הלופ: מה קרה, מתי זה קרה, ואיך זה מחבר בין המשימות לבין שינויי המצב.",
        navButton: elements.navTimelineButton,
        enabled: hasProject || resolveDevFlowControlsEnabled(),
        disabledReason: "Timeline זמין כשיש פרויקט פעיל או במצב QA מקומי.",
      },
      home: {
        key: "home",
        label: "Support screen",
        title: "Home",
        subtitle: "כאן רואים את כל הפרויקטים הפעילים ובוחרים מאיפה להמשיך.",
        explanation: "זה מסך הבית של המערכת: כניסה לפרויקט קיים או פתיחת פרויקט חדש.",
        enabled: true,
      },
      files: {
        key: "files",
        label: "Support screen",
        title: "Files",
        subtitle: "כאן רואים את הקבצים שכבר ידועים לפרויקט או ל־draft הנוכחי, בלי להמציא פעולות backend שעוד לא קיימות.",
        explanation: "זה מסך קבצים בטוח: תצוגה מרוכזת של assets שכבר זמינים במצב הפרויקט או ב־draft המקומי.",
        enabled: true,
      },
      settings: {
        key: "settings",
        label: "Support screen",
        title: "Settings",
        subtitle: "כאן מנהלים פרופיל, התראות והעדפות עבודה של המשתמש.",
        explanation: "זה מסך ההגדרות הפעיל של Nexus: פרופיל, התראות, אבטחה ומראה.",
        navButton: elements.navSettingsButton,
        enabled: true,
      },
      help: {
        key: "help",
        label: "Support screen",
        title: "Help",
        subtitle: "כאן פותחים מדריכי מוצר, מסננים שאלות נפוצות, ומכינים פנייה אמיתית לתמיכה.",
        explanation: "מסך העזרה של Nexus מציג רק תוכן ופעולות שכבר קיימים עכשיו: חיפוש מקומי, מאמרי מוצר, וקיצור דרך אמיתי לתמיכה.",
        navButton: elements.navHelpButton,
        enabled: true,
      },
      understanding: {
        key: "understanding",
        label: "Primary flow",
        title: "Understanding Summary",
        subtitle: "כאן מאשרים שהמערכת באמת הבינה את הפרויקט לפני המעבר ללופ.",
        explanation: "זה מסך הסיכום בין ה־Onboarding לבין ה־Loop. ממנו מתקנים או ממשיכים למשימה הבאה.",
        stepButton: elements.flowStepUnderstandingButton,
        stepKey: "understanding",
        enabled: canResumeOnboarding || resolveDevFlowControlsEnabled(),
        disabledReason: "Understanding Summary זמין רק אחרי שיש הקשר התחלתי לפרויקט.",
      },
    };

    return routeMap[routeKey] ?? routeMap.create;
  }

  function setShellButtonState(button, { active = false, enabled = true, reason = "", target = "" } = {}) {
    if (!button) {
      return;
    }

    button.classList?.toggle("active", active);
    button.disabled = !enabled;
    if ("ariaSelected" in button) {
      button.ariaSelected = active ? "true" : "false";
    }
    if (target) {
      button.dataset.shellTarget = target;
    }
    button.title = reason || "";
  }

  function renderShellChrome(screen = null, workspaceKey = null) {
    const currentRouteKey = resolveCurrentShellRouteKey(screen, workspaceKey);
    const currentRoute = buildShellRouteModel(currentRouteKey);
    currentShellRouteKey = currentRouteKey;
    const isLoopFamilyRoute = currentRouteKey === "execution" || currentRouteKey === "proof" || currentRouteKey === "artifact" || currentRouteKey === "confirmation" || currentRouteKey === "state-update" || currentRouteKey === "next-task" || currentRouteKey === "timeline";
    const routeModels = [
      buildShellRouteModel("create"),
      buildShellRouteModel("onboarding"),
      buildShellRouteModel("loop"),
      buildShellRouteModel("timeline"),
      buildShellRouteModel("home"),
      buildShellRouteModel("files"),
      buildShellRouteModel("developer"),
      buildShellRouteModel("project-brain"),
      buildShellRouteModel("release"),
      buildShellRouteModel("growth"),
      buildShellRouteModel("settings"),
      buildShellRouteModel("help"),
      buildShellRouteModel("understanding"),
    ];

    if (elements.shellRouteLabel) {
      elements.shellRouteLabel.textContent = currentRoute.label;
    }
    if (elements.shellRouteTitle) {
      elements.shellRouteTitle.textContent = currentRoute.title;
    }
    if (elements.shellRouteSubtitle) {
      elements.shellRouteSubtitle.textContent = currentRoute.subtitle;
    }

    for (const model of routeModels) {
      if (model.navButton) {
        setShellButtonState(model.navButton, {
          active: model.key === currentRouteKey || (isLoopFamilyRoute && model.key === "loop"),
          enabled: model.enabled,
          reason: model.enabled ? model.explanation : model.disabledReason,
          target: model.key,
        });
      }

      if (model.stepButton) {
        setShellButtonState(model.stepButton, {
          active: model.stepKey === currentRoute.stepKey || (shellPrimaryStepKeys.includes(model.key) && model.key === currentRouteKey),
          enabled: model.enabled,
          reason: model.enabled ? model.explanation : model.disabledReason,
          target: model.key,
        });
      }
    }

    if (elements.topbarNotificationsButton) {
      elements.topbarNotificationsButton.disabled = true;
      elements.topbarNotificationsButton.title = "Notifications screen lands in NLP-013.";
    }
    if (elements.topbarProfileButton) {
      elements.topbarProfileButton.disabled = false;
      elements.topbarProfileButton.title = "פתח את מסך ההגדרות והפרופיל.";
      elements.topbarProfileButton.dataset.shellTarget = "settings";
    }
    if (elements.projectSelect) {
      elements.projectSelect.title = currentProjectId
        ? "בחר פרויקט פעיל אחר בלי לצאת ממערכת המסכים."
        : "ה־project switcher המלא נבנה ב־NLP-012, אבל כבר אפשר לבחור פרויקט קיים מהרשימה.";
    }
    if (elements.heroActions) {
      elements.heroActions.hidden = !["developer", "project-brain", "release", "growth"].includes(currentRouteKey);
    }

    if (doc?.body?.dataset) {
      doc.body.dataset.shellRoute = currentRouteKey;
    }

    renderQaRouteControls();
  }

  function shouldBypassToQaRoute(target) {
    if (!isQaModeEnabled() || !isPrimaryQaRoute(target)) {
      return false;
    }

    if (target === "create") {
      return false;
    }

    if (target === "onboarding") {
      return !(currentProjectId || currentProject || onboardingFlow?.sessionId);
    }

    if (target === "understanding") {
      return !(currentProjectId || currentProject || onboardingFlow?.sessionId || onboardingConversation);
    }

    return !(currentProjectId || currentProject);
  }

  function openShellRoute(target, options = {}) {
    if (shouldBypassToQaRoute(target)) {
      openQaScreen(target);
      return;
    }

    const route = buildShellRouteModel(target);
    if (!route.enabled) {
      renderBlockedRouteFallback(target);
      return;
    }

    if (target === "create") {
      enterCreateProjectScreen();
      renderShellChrome("create", activeWorkspace);
      syncBrowserShellRoute("create", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "home") {
      renderHomeSupportScreenView();
      syncBrowserShellRoute("home", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "files") {
      renderFilesSupportScreenView();
      syncBrowserShellRoute("files", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "help") {
      renderHelpSupportScreenView();
      syncBrowserShellRoute("help", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "settings") {
      void renderSettingsScreenView();
      syncBrowserShellRoute("settings", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "onboarding") {
      if (currentProjectId || currentProject || onboardingFlow?.sessionId) {
        reopenOnboardingFromWorkspace();
      } else {
        ensureOnboardingScreenView();
        renderEmptyAppState({
          mode: "onboarding",
          message: "אין onboarding פעיל לשחזור",
          status: "המסלול נשאר בתוך Nexus, אבל כדי להמשיך צריך פרויקט פעיל או session onboarding שמור.",
        });
      }
      renderShellChrome("onboarding", activeWorkspace);
      syncBrowserShellRoute("onboarding", { replace: options.replace === true });
      scrollViewportToTop();
      return;
    }

    if (target === "understanding") {
      openUnderstandingPreviewScreen();
      syncBrowserShellRoute("understanding", { replace: options.replace === true });
      return;
    }

    if (target === "loop") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderLoopCoreScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openLoopPreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("loop", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("loop", { replace: options.replace === true });
      return;
    }

    if (target === "execution") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderExecutionLiveScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openExecutionPreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("execution", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("execution", { replace: options.replace === true });
      return;
    }

    if (target === "proof") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderProofResultScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openProofPreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("proof", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("proof", { replace: options.replace === true });
      return;
    }

    if (target === "artifact") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("artifact", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("artifact", { replace: options.replace === true });
      return;
    }

    if (target === "confirmation") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderConfirmationDecisionScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openConfirmationPreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("confirmation", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("confirmation", { replace: options.replace === true });
      return;
    }

    if (target === "state-update") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderStateUpdateScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openStateUpdatePreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("state-update", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("state-update", { replace: options.replace === true });
      return;
    }

    if (target === "next-task") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderNextTaskScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openNextTaskPreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("next-task", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("next-task", { replace: options.replace === true });
      return;
    }

    if (target === "timeline") {
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderTimelineHistoryScreenView(currentProject);
      } else if (isQaModeEnabled()) {
        openTimelinePreviewScreen();
      } else {
        renderBlockedRouteFallback(target);
        syncBrowserShellRoute("timeline", { replace: options.replace === true });
        return;
      }
      syncBrowserShellRoute("timeline", { replace: options.replace === true });
      return;
    }

    if (target === "developer" || target === "project-brain" || target === "release" || target === "growth") {
      activeWorkspace = target;
      setAppScreen("workspace");
      setActiveWorkspace(elements, activeWorkspace);
      renderShellChrome("workspace", activeWorkspace);
      syncBrowserShellRoute(target, { replace: options.replace === true });
      scrollViewportToTop();
      updatePresence().catch(() => {});
    }
  }

  function applyRequestedShellRouteFromLocation(options = {}) {
    const searchParams = new URLSearchParams(globalThis.location?.search ?? "");
    const requestedQaScreen = normalizeString(searchParams.get("qaScreen") ?? searchParams.get("qa-screen"));
    if (requestedQaScreen && isQaModeEnabled() && isPrimaryQaRoute(requestedQaScreen)) {
      suppressShellRouteHistorySync = true;
      try {
        openQaScreen(requestedQaScreen);
      } finally {
        suppressShellRouteHistorySync = false;
      }
      return;
    }

    const requestedRoute = resolveShellRouteKeyFromPath(globalThis.location?.pathname ?? "/");
    if (!requestedRoute) {
      return;
    }

    suppressShellRouteHistorySync = true;
    try {
      openShellRoute(requestedRoute, { replace: options.replace !== false });
    } finally {
      suppressShellRouteHistorySync = false;
    }
  }

  function primeInitialShellRoute() {
    const requestedRouteKey = resolveShellRouteKeyFromPath(globalThis.location?.pathname ?? "/") ?? "create";
    const primableRouteKeys = new Set([
      "create",
      "home",
      "files",
      "settings",
      "help",
      "onboarding",
      "understanding",
      "loop",
      "execution",
      "proof",
      "artifact",
      "confirmation",
      "state-update",
      "next-task",
      "timeline",
    ]);
    const primedRouteKey = primableRouteKeys.has(requestedRouteKey)
      ? requestedRouteKey
      : "create";

    currentShellRouteKey = primedRouteKey;

    if (doc?.body?.dataset) {
      doc.body.dataset.appScreen = primedRouteKey;
      doc.body.dataset.shellRoute = primedRouteKey;
    }
    if (doc?.documentElement?.dataset) {
      doc.documentElement.dataset.appScreen = primedRouteKey;
    }

    setAppScreen(primedRouteKey, { persist: false });
    if (primedRouteKey === "create") {
      renderCreateScreenView();
    } else if (primedRouteKey === "home") {
      renderHomeSupportScreenView([]);
    } else if (primedRouteKey === "files") {
      renderFilesSupportScreenView();
    } else if (primedRouteKey === "settings") {
      void renderSettingsScreenView();
    } else if (primedRouteKey === "help") {
      renderHelpSupportScreenView();
    } else if (primedRouteKey === "onboarding") {
      ensureOnboardingScreenView();
      renderEmptyAppState({
        mode: "onboarding",
        message: "בודקים אם יש onboarding פעיל",
        status: "אנחנו טוענים את ה־session החי. אם אין כזה, נשאיר כאן blocked state אמיתי בתוך Nexus.",
      });
    } else if (
      primedRouteKey === "loop"
      || primedRouteKey === "execution"
      || primedRouteKey === "proof"
      || primedRouteKey === "artifact"
      || primedRouteKey === "confirmation"
      || primedRouteKey === "state-update"
      || primedRouteKey === "next-task"
      || primedRouteKey === "timeline"
    ) {
      renderTruthfulBlockedRouteScreen("loop", {
        title: "בודקים אם יש פרויקט פעיל לשחזור",
        body: "אנחנו טוענים את הפרויקט החי. אם אין כזה, המסלול יישאר כאן עם blocked state אמיתי בתוך ה־shell הקנוני.",
        primaryLabel: "פתח בית",
        primaryTarget: "home",
        secondaryLabel: "צור פרויקט",
        secondaryTarget: "create",
      });
    }
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome(primedRouteKey, activeWorkspace);
  }

  function resolveDevFlowControlsEnabled() {
    if (globalThis.location === undefined) {
      return true;
    }

    const searchParams = new URLSearchParams(globalThis.location.search ?? "");
    return searchParams.get("qa") === "1";
  }

  const qaScreenSequence = ["create", "onboarding", "understanding", "loop", "execution", "proof", "confirmation", "state-update", "next-task", "timeline"];

  function isQaModeEnabled() {
    return resolveDevFlowControlsEnabled();
  }

  function isPrimaryQaRoute(target) {
    return qaScreenSequence.includes(target);
  }

  function resolveCurrentQaScreenKey() {
    if (qaPreviewRouteKey) {
      return qaPreviewRouteKey;
    }
    const activeRoute = resolveCurrentShellRouteKey();
    return qaScreenSequence.includes(activeRoute) ? activeRoute : "create";
  }

  function seedCreatePreviewInputs() {
    if (elements.createProjectNameInput && !elements.createProjectNameInput.value.trim()) {
      elements.createProjectNameInput.value = currentProject?.name ?? "My SaaS App";
    }
    if (elements.createProjectVisionInput && !elements.createProjectVisionInput.value.trim()) {
      elements.createProjectVisionInput.value = currentProject?.goal ?? "מערכת לניהול לקוחות עם AI";
    }
    if (elements.createProjectLinkInput && !elements.createProjectLinkInput.value.trim()) {
      elements.createProjectLinkInput.value = "https://example.com";
    }
  }

  function ensureCompletedOnboardingPreviewState() {
    if (onboardingConversation?.isComplete === true && Object.keys(normalizeObject(onboardingConversation?.answers)).length > 0) {
      return;
    }

    const baseAnswers = {
      "target-audience": getOnboardingAnswer("target-audience") || "בעלי עסקים קטנים",
      "core-problem": getOnboardingAnswer("core-problem") || "קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
      "successful-solution": getOnboardingAnswer("successful-solution") || "כלי לקוחות פשוט ונוח עם התראות",
    };

    const completeConversation = createOnboardingConversationState();
    completeConversation.answers = baseAnswers;
    completeConversation.currentIndex = Object.keys(baseAnswers).length;
    completeConversation.currentQuestion = null;
    completeConversation.isComplete = true;
    completeConversation.completionReason = buildLocalOnboardingCompletionReason(baseAnswers, {
      visionText: currentProject?.goal ?? onboardingFlow?.visionText?.trim?.() ?? "",
      projectTypeHint: currentProject?.artifactExpectation?.projectType
        ?? currentProject?.onboardingStateHandoff?.artifactExpectation?.projectType
        ?? "",
    });
    completeConversation.transcript = [
      { speaker: "agent", text: "למי המערכת הזאת נבנית?", time: "10:30" },
      { speaker: "user", text: baseAnswers["target-audience"], time: "10:30" },
      { speaker: "agent", text: "מה הבעיה המרכזית שהם מתמודדים איתה?", time: "10:31" },
      { speaker: "user", text: baseAnswers["core-problem"], time: "10:31" },
      { speaker: "agent", text: "איך נראה פתרון מוצלח מבחינתם?", time: "10:32" },
      { speaker: "user", text: baseAnswers["successful-solution"], time: "10:32" },
    ];
    completeConversation.summary = buildLocalOnboardingSummary(baseAnswers, {
      visionText: currentProject?.goal ?? onboardingFlow?.visionText?.trim?.() ?? "",
      projectTypeHint: currentProject?.artifactExpectation?.projectType
        ?? currentProject?.onboardingStateHandoff?.artifactExpectation?.projectType
        ?? "",
    });
    completeConversation.totalQuestions = Math.max(
      buildLocalAdaptiveQuestionPlan(baseAnswers, {
        visionText: currentProject?.goal ?? onboardingFlow?.visionText?.trim?.() ?? "",
        projectTypeHint: currentProject?.artifactExpectation?.projectType
          ?? currentProject?.onboardingStateHandoff?.artifactExpectation?.projectType
          ?? "",
      }).length,
      completeConversation.currentIndex,
    );
    onboardingConversation = completeConversation;
  }

  function openCreatePreviewScreen() {
    qaPreviewRouteKey = "create";
    onboardingConversation = null;
    seedCreatePreviewInputs();
    renderEmptyAppState({
      mode: "create",
      message: "מה אתה רוצה לבנות?",
      status: "ספר לנו על הרעיון שלך כדי שנוכל להפוך אותו למציאות",
    });
    persistFlowState("create");
    scrollViewportToTop();
  }

  function openOnboardingPreviewScreen() {
    qaPreviewRouteKey = "onboarding";
    const storedFlowState = readStoredFlowState();
    const shouldSeedFreshPreviewConversation = (
      storedFlowState?.screen === "create"
      && !onboardingFlow?.sessionId
      && !currentProjectId
      && !currentProject?.id
    );
    ensureOnboardingScreenView({ force: true });
    if (storedFlowState?.onboardingConversation && typeof storedFlowState.onboardingConversation === "object") {
      onboardingConversation = storedFlowState.onboardingConversation.currentQuestion || storedFlowState.onboardingConversation.summary
        ? refreshOnboardingConversationPresentation(storedFlowState.onboardingConversation, buildOnboardingConversationOptions({
          visionTextOverride: storedFlowState?.onboardingFlow?.visionText?.trim?.() ?? currentProject?.goal ?? "",
        }))
        : createOnboardingConversationState();
    } else if (shouldSeedFreshPreviewConversation) {
      onboardingConversation = createOnboardingConversationState();
    } else {
      onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    }
    renderEmptyAppState({
      mode: "onboarding",
      message: "רוצה להבין את הפרויקט שלך 👋",
      status: "זה מצב בדיקה למסך ה־Onboarding, אבל עכשיו הוא צריך לרוץ דרך provider-backed agent runtime ולא להישאר flow מקומי בלבד.",
    });
    renderOnboardingNotes();
    renderOnboardingConversation();
    persistFlowState("onboarding");
    scrollViewportToTop();
    if (isQaModeEnabled()) {
      void ensureQaProviderBackedOnboardingSession({
        selectedProviderId: storedFlowState?.onboardingFlow?.selectedProviderId ?? resolveSelectedOnboardingProviderId(),
      }).catch((error) => {
        if (elements.onboardingScreenStatus) {
          elements.onboardingScreenStatus.textContent = `לא הצלחנו לפתוח provider-backed onboarding session כרגע. ${formatOnboardingRetryStatus(error)}`;
        }
      });
    }
  }

  function openUnderstandingPreviewScreen() {
    qaPreviewRouteKey = "understanding";
    ensureCompletedOnboardingPreviewState();
    renderUnderstandingSummaryScreenView();
    renderShellChrome("understanding", activeWorkspace);
    scrollViewportToTop();
  }

  function openLoopPreviewScreen() {
    qaPreviewRouteKey = "loop";
    const previewProject = ensureQaProjectPreviewState();
    renderLoopCoreScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openExecutionPreviewScreen() {
    qaPreviewRouteKey = "execution";
    const previewProject = ensureQaProjectPreviewState();
    renderExecutionLiveScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openProofPreviewScreen() {
    qaPreviewRouteKey = "proof";
    const previewProject = ensureQaProjectPreviewState();
    renderProofResultScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openConfirmationPreviewScreen() {
    qaPreviewRouteKey = "confirmation";
    const previewProject = ensureQaProjectPreviewState();
    renderConfirmationDecisionScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openStateUpdatePreviewScreen() {
    qaPreviewRouteKey = "state-update";
    const previewProject = ensureQaProjectPreviewState();
    renderStateUpdateScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openNextTaskPreviewScreen() {
    qaPreviewRouteKey = "next-task";
    const previewProject = ensureQaProjectPreviewState();
    renderNextTaskScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function openTimelinePreviewScreen() {
    qaPreviewRouteKey = "timeline";
    const previewProject = ensureQaProjectPreviewState();
    renderTimelineHistoryScreenView(previewProject, { qaMode: true });
    scrollViewportToTop();
  }

  function buildQaPreviewProject() {
    return {
      id: "qa-preview-project",
      name: "My SaaS App",
      goal: "להכין ניסוי ראשון לרכישת משתמשים",
      status: "working",
      overview: {
        bottleneck: "חסר ערוץ משתמשים ראשון שאפשר למדוד",
      },
      cycle: {
        roadmap: [
          {
            summary: "להכין ניסוי ראשון לרכישת משתמשים",
            status: "assigned",
            lane: "growth",
          },
          {
            summary: "הגדרת מעקב וניתוח",
            status: "blocked",
            lane: "analytics",
          },
        ],
      },
      developerWorkspace: {
        contextSummary: {
          progressPercent: 72,
          progressStatus: "running",
          nextAction: "יצירת Landing page",
          incidentStatus: "clear",
        },
      },
      projectBrainWorkspace: {
        overview: {
          currentPhase: "understanding-complete",
        },
        summary: {
          blockerCount: 1,
          requiresApproval: false,
        },
      },
      releaseWorkspace: {
        summary: {
          isBlocked: false,
        },
        validation: {
          status: "ready",
        },
      },
      aiControlCenterSurface: {
        aiControlCenterSurfaceId: "qa-proof-surface",
        generatedSurfacePreview: {
          screenId: "Landing page",
          regionCount: 3,
          hasCtaAnchors: true,
        },
        liveRuntimeBinding: {
          activeScreenId: "landing-page-preview",
        },
        summary: {
          deliveryStatus: "ready",
        },
      },
      generatedSurfaceProofSchema: {
        proofId: "qa-proof",
        summary: {
          proofStatus: "ready",
          failedCheckCount: 0,
          warningCheckCount: 1,
          previewStatus: "available",
          validationStatus: "passed",
        },
        evidence: {
          regionCount: 3,
          visibleCtaCount: 1,
          hasCtaAnchors: true,
          isPreviewable: true,
          sourceProposalId: "proposal-qa",
        },
      },
      artifactExpectation: {
        expectationId: "artifact-expectation:landing-page:landing-page",
        projectType: "landing-page",
        projectTypeLabel: "דף נחיתה / שיווק",
        proofArtifactType: "generated-surface",
        title: "Landing page",
        summary: "Landing page חד עם הבטחת ערך, אזור אמון, ו־CTA אחד ברור.",
        continuityLine: "ב־Proof נרצה לראות Landing page שמחזיק את הבטחת הערך, האמון, והפעולה הראשונה בלי drift.",
        proofFocus: [
          "הבטחה ראשית מעל הקפל",
          "הוכחת אמון שתומכת בהחלטה",
          "CTA מרכזי אחד שקל להבין",
        ],
      },
      proofArtifact: {
        artifactId: "proof-artifact:qa-preview",
        artifactType: "generated-surface",
        title: "Landing page",
        status: "ready",
        previewKind: "generated-surface",
        previewPayload: {
          kind: "generated-surface",
          title: "Landing page",
          subtitle: "Landing page חד עם הבטחת ערך, אזור אמון, ו־CTA אחד ברור.",
          statusLine: "ה־Proof הבא צריך להוכיח שהבטחת הערך, האמון וה־CTA כבר יציבים לפני הרחבת המסר.",
          proofMeta: {
            previewable: true,
            regionCount: 3,
          },
        },
        provenance: {
          proofId: "qa-proof",
          screenId: "landing-page-preview",
        },
        actions: {
          open: { supported: true },
          download: { supported: false },
        },
        artifactExpectation: {
          expectationId: "artifact-expectation:landing-page:landing-page",
          projectType: "landing-page",
          projectTypeLabel: "דף נחיתה / שיווק",
          proofArtifactType: "generated-surface",
          title: "Landing page",
          summary: "Landing page חד עם הבטחת ערך, אזור אמון, ו־CTA אחד ברור.",
          continuityLine: "ב־Proof נרצה לראות Landing page שמחזיק את הבטחת הערך, האמון, והפעולה הראשונה בלי drift.",
          proofFocus: [
            "הבטחה ראשית מעל הקפל",
            "הוכחת אמון שתומכת בהחלטה",
            "CTA מרכזי אחד שקל להבין",
          ],
        },
      },
      generationIntent: {
        intentId: "generation-intent:landing-page:landing-page",
        source: "learning-aware-generation-contract",
        status: "ready",
        projectType: "landing-page",
        projectTypeLabel: "דף נחיתה / שיווק",
        artifactTitle: "Landing page",
        artifactSummary: "Landing page חד עם הבטחת ערך, אזור אמון, ו־CTA אחד ברור.",
        proofArtifactType: "generated-marketing-surface",
        framingLine: "ב־Proof נרצה לראות Landing page שמחזיק את הבטחת הערך, האמון, והפעולה הראשונה בלי drift.",
        generationGoal: "Landing page should make the promise, trust proof, and one clear CTA visible before Proof. Stabilize value proof, trust, and CTA clarity before expanding the landing surface.",
        focusAreas: [
          "headline promise",
          "trust proof",
          "single CTA",
          "לחזק את הוכחת הערך לפני הרחבת המסר",
          "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
        ],
        primaryAction: {
          label: "Stabilize value proof before expanding CTA",
          actionIntent: "convert",
        },
        weakClass: true,
        generationMode: "conversion-surface",
        surfaceMutationModel: "section-sequence",
        learningAware: true,
        learningStatus: "live",
        learningStrategy: "repair-before-expand",
        learningStrategyLabel: "הלמידה מזיזה את ה־generation לייצוב לפני הרחבה",
        learningReason: "כשלונות, retries, או friction מהסבב האחרון מחזירים את היצירה ל־repair ממוקד במקום לפתוח הרחבה גנרית.",
        learnedSignals: [
          "failure-signals:3",
          "feedback:attention-required",
          "trend:stalled",
          "approval:approved",
          "pattern:Keep the primary CTA singular",
        ],
        learnedFocusAreas: [
          "לחזק את הוכחת הערך לפני הרחבת המסר",
          "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
          "לקבע CTA אחד ברור לפני הרחבת המשפך",
        ],
        learnedProofRequirement: "ה־Proof הבא צריך להוכיח שהבטחת הערך, האמון וה־CTA כבר יציבים לפני הרחבת המסר.",
      },
      proposalApplyDecision: {
        status: "approved",
      },
      partialAcceptanceDecision: {
        status: "not-run",
      },
      growthWorkspace: {
        analytics: {
          summaryCards: [
            { label: "ביקורים", value: "128" },
            { label: "הרשמות", value: "23" },
            { label: "שיעור המרה", value: "18%" },
            { label: "עלות ליד", value: "₪0.45" },
          ],
        },
      },
      repeatedLoopContinuation: {
        active: true,
        artifactTitle: "Landing page",
        missionTitle: "לחדד את ה־Landing page סביב הוכחת הערך הראשית",
        missionDescription: "אחרי ה־release האחרון Nexus פותחת סבב המשך מוצרי שמחזק את ה־Landing page, מהדקת את ה־CTA, ומבהירה את מסלול ההמרה הבא.",
        upcomingItems: [
          "לחדד את ההבטחה הראשית מעל הקפל",
          "לחזק את בלוק האמון שמצדיק את ההמשך",
          "לקבע CTA אחד ברור למסלול ההמרה הבא",
        ],
        proofIncrement: {
          reason: "ה־release האחרון אושר ולכן אפשר לפתוח עכשיו סבב המשך אמיתי על גבי אותו תוצר.",
        },
      },
      postReleaseContinuationLoop: {
        loopId: "post-release-continuation:qa-preview",
        loopFamily: "post-release-continuation",
        status: "active",
        statusLabel: "סבב ההמשך כבר פתוח",
        originArtifactTitle: "Landing page",
        originReleaseTarget: "private-deployment",
        nextMoveTitle: "לחדד את ה־Landing page סביב הוכחת הערך הראשית",
        nextMoveDescription: "הסבב הבא נשאר מחובר ישירות לתוצר שאושר: לחזק את ההבטחה, להבהיר את ההמשך, ולהדק את פעולת ההמרה הראשונה.",
        nextMoveFamily: "explicit-loop-move",
        visibleContinuationRule: "release is not a terminal end state; the next fixes, improvements, or growth moves must emerge visibly inside Nexus",
        continuationMoves: [
          "לחדד את ההבטחה הראשית מעל הקפל",
          "לחזק את בלוק האמון שמצדיק את ההמשך",
          "לקבע CTA אחד ברור למסלול ההמרה הבא",
        ],
        boundedGrowthRule: "continuation may surface only product-connected moves, not fake autonomous company behavior",
        continuityRule: "post-release continuation must survive revisit, route restore, and transition back into execution",
      },
      growthOpportunitySurfacingBoundary: {
        boundaryId: "growth-opportunity-boundary:qa-preview",
        boundaryFamily: "wave4-growth-opportunity-boundary",
        status: "bounded",
        statusLabel: "הצעות ההמשך נשארות bounded",
        visibleBoundaryRule: "Wave 4 may surface only meaningful next product moves, never fake autonomous company behavior or implied Wave 7 autonomy",
        allowedMoves: [
          "לחדד את ההבטחה הראשית מעל הקפל",
          "לחזק את בלוק האמון שמצדיק את ההמשך",
          "לקבע CTA אחד ברור למסלול ההמרה הבא",
        ],
        deferredOpportunityFamilies: [
          "broad-autonomous-growth-ops",
          "portfolio-optimization",
          "self-directed-company-strategy",
        ],
        disallowedMoves: [
          "inventing company goals disconnected from the released product",
          "implying autonomous GTM ownership beyond the current product loop",
          "opening broad experimentation programs without product-connected proof",
        ],
        credibilityRule: "every surfaced next move must stay directly attached to the last approved artifact, release target, and current product bottleneck",
        continuityRule: "opportunity state must survive revisit, route restore, and handoff back into execution without changing scope silently",
      },
      classAwareDeploymentReleasePath: {
        modelId: "deployment-release-path:qa-preview",
        pathFamily: "product-web-release-path",
        providerType: "render",
        releaseStatus: "active",
        primaryTarget: "web-deployment",
        boundedTargets: ["web-deployment", "private-deployment"],
        environmentPath: "staging -> production",
        previewPath: "product-workspace-preview -> product-workspace-preview",
        packagePath: "saas-package -> web-deployment",
        operationalPath: "product-workspace-preview -> product-workspace-preview -> saas-package -> web-deployment -> web-deployment",
        deploymentArtifactType: "deployable-product-web-bundle",
        nextGate: "verify-runtime-and-promote-service",
        visibleReleaseRule: "SaaS delivery must stay visible as one bounded product release path",
        continuityRule: "deployment/release path status must survive reopen, route restore, and handoff into deployment feedback",
      },
      deploymentStateFeedbackContract: {
        contractId: "deployment-feedback:qa-preview",
        feedbackFamily: "deployment-state-feedback",
        status: "active",
        statusLabel: "מצב ה־deploy גלוי ומתקדם",
        providerType: "render",
        primaryTarget: "web-deployment",
        environment: "staging",
        currentStepLabel: "verify-runtime-and-promote-service",
        policyDecision: "allowed",
        deploymentOutcome: "accepted",
        launchDecision: "blocked",
        latestProviderStatus: "published",
        nextPollInSeconds: null,
        visibleFeedbackRule: "deployment/release progress must stay visible on product surfaces rather than hiding in backend events or logs",
        feedbackItems: [
          { label: "Policy decision", value: "allowed" },
          { label: "Deployment outcome", value: "accepted" },
          { label: "Launch decision", value: "blocked" },
          { label: "Provider status", value: "published" },
        ],
        blockedReasons: [
          "production-health-unconfirmed",
        ],
        continuityRule: "deployment state must survive refresh, route restore, and the handoff from execution into later release feedback",
      },
      learningDecisionImpact: {
        impactId: "learning-decision-impact:qa-preview",
        impactFamily: "deep-adaptive-learning-decision-impact",
        status: "ready",
        strategy: "repair-before-expand",
        statusLabel: "הלמידה כבר משנה את ההמשך לכיוון repair לפני expansion",
        drivingSignals: [
          "outcome:attention-required",
          "trend:stalled",
          "adaptive:stabilize",
          "deploy:allowed",
          "provider:published",
          "approval:approved",
        ],
        runtimeDecision: {
          status: "live-stabilize",
          label: "לייצב את runtime/package הנוכחי לפני הרחבה",
          currentEffect: "Nexus שומרת על web-static ו־static-web-build עד שהסימנים הבעייתיים יירדו.",
        },
        releaseDecision: {
          status: "live-hold",
          label: "להחזיק את קידום ה־release עד שהלמידה תאשר יציבות",
          currentEffect: "ה־release הבא לא מקודם אוטומטית; learning מחייב עוד proof, אישור, או יציבות deploy לפני promotion.",
        },
        continuationDecision: {
          status: "live-repair",
          title: "לייצב את Landing page לפני הרחבה נוספת",
          description: "הסבב הבא משתנה עכשיו truthfully בגלל חסימות, כשלונות, או friction שנצברו. לפני הרחבה, Nexus מחזירה את ההמשך לצעד repair שמחזק את מה שכבר נבנה.",
          nextMoveFamily: "learning-repair-move",
          moves: [
            "לחזק את הוכחת הערך לפני הרחבת המסר",
            "לייצב את אזור האמון וה־CTA לפני מהלך צמיחה נוסף",
            "לאסוף עוד proof חי עבור Landing page",
          ],
        },
        nextTaskDecision: {
          title: "לייצב את Landing page לפני הרחבה נוספת",
          description: "הסבב הבא משתנה עכשיו truthfully בגלל חסימות, כשלונות, או friction שנצברו.",
          lane: "stabilization",
          dependencyStatus: "הלמידה זיהתה שצריך repair לפני move נוסף",
          whyNow: "זה הצעד הנכון עכשיו כי outcome feedback ו־adaptive execution כבר מראים שהפרויקט צריך repair לפני expansion.",
        },
        continuityRule: "learning-driven decisions must survive revisit, rerun, route restore, and return into execution without silently resetting to generic defaults",
      },
      crossSurfaceContinuityContract: {
        contractId: "cross-surface-continuity:qa-preview",
        continuityFamily: "cross-surface-continuity",
        status: "connected",
        statusLabel: "הרצף בין המסכים נשאר מחובר",
        visibleContinuityRule: "build, proof, release, deployment feedback, timeline, and continuation must read like one connected product loop inside Nexus",
        explainablePath: "execution:build -> proof:artifact -> proof:release-evidence -> execution:deployment-feedback -> next-task:continuation -> timeline:timeline",
        continuityChecks: [
          "same-project-identity-across-surfaces",
          "route-restore-survives-refresh",
          "proof-and-release-remain-connected",
          "continuation-opens-from-approved-surface",
          "timeline-preserves-the-loop-story",
        ],
        continuitySteps: [
          {
            surfaceId: "build",
            routeKey: "execution",
            title: "Build / execution",
            status: "active",
            visibleAnchor: "השלב הפעיל עוד לא ננעל",
            continuityRule: "build progression must stay visible before the user moves into proof or release truth",
          },
          {
            surfaceId: "artifact",
            routeKey: "proof",
            title: "Proof / artifact",
            status: "ready",
            visibleAnchor: "Landing page",
            continuityRule: "the product artifact must remain the same visible reference when the user moves into proof",
          },
          {
            surfaceId: "release-evidence",
            routeKey: "proof",
            title: "Release evidence / handoff",
            status: "active",
            visibleAnchor: "product-workspace-preview -> product-workspace-preview -> saas-package -> web-deployment",
            continuityRule: "release evidence and handoff must survive proof revisit, route restore, and the next confirmation step",
          },
          {
            surfaceId: "deployment-feedback",
            routeKey: "execution",
            title: "Deployment feedback",
            status: "active",
            visibleAnchor: "מצב ה־deploy גלוי ומתקדם",
            continuityRule: "deployment state must survive refresh, route restore, and the handoff from execution into later release feedback",
          },
          {
            surfaceId: "continuation",
            routeKey: "next-task",
            title: "Post-release continuation",
            status: "active",
            visibleAnchor: "לחדד את ה־Landing page סביב הוכחת הערך הראשית",
            continuityRule: "post-release continuation must survive revisit, route restore, and transition back into execution",
          },
          {
            surfaceId: "timeline",
            routeKey: "timeline",
            title: "Timeline continuity",
            status: "connected",
            visibleAnchor: "timeline-keeps-the-loop-connected",
            continuityRule: "timeline must preserve the visible story from build to proof to release to continuation without disconnect",
          },
        ],
        restoreRule: "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution without changing product truth silently",
      },
      wave4LiveVerificationMatrix: {
        matrixId: "wave4-live-verification:qa-preview",
        matrixFamily: "wave4-live-verification-matrix",
        status: "ready",
        statusLabel: "ל־Wave 4 יש מטריצת אימות חיה אחת",
        matrixRule: "every major Wave 4 capability must declare one visible route, one visible anchor, pass/fail truth, and restore/continuity checks before later live reruns can close the wave truthfully",
        strongerPreviewRule: "use the stronger preview path when available; do not rely on hidden state, test output, or contract text alone",
        restoreRule: "the live verification matrix must include refresh, route restore, revisit, and transition checks wherever the capability changes user-facing product truth",
        summary: {
          totalLanes: 10,
          executionRoutes: 4,
          proofRoutes: 2,
          restoreChecks: 20,
        },
        verificationLanes: [
          {
            laneId: "product-understanding-and-class-resolution",
            title: "Product understanding and class resolution",
            routeKey: "understanding",
            visibleAnchor: "landing-page · bootstrap",
            verificationFocus: ["class is explicit", "runtime direction is explainable"],
            passCriteria: ["pass if class and stage are visible before execution"],
            restoreChecks: ["class identity survives route restore"],
            strongerPreviewPath: "understanding-summary-route",
          },
          {
            laneId: "automatic-product-bootstrap",
            title: "Automatic product bootstrap",
            routeKey: "execution",
            visibleAnchor: "השלב הפעיל עוד לא ננעל",
            verificationFocus: ["build progression is visible"],
            passCriteria: ["pass if build progression is visible before proof"],
            restoreChecks: ["build route survives refresh"],
            strongerPreviewPath: "execution-route",
          },
          {
            laneId: "live-build-surfaces",
            title: "Live build surfaces",
            routeKey: "execution",
            visibleAnchor: "surface-evolving",
            verificationFocus: ["stage-to-stage product evolution is visible"],
            passCriteria: ["pass if visible build states map to product-facing change"],
            restoreChecks: ["current build state survives restore"],
            strongerPreviewPath: "execution-route",
          },
          {
            laneId: "class-aware-product-generation",
            title: "Class-aware product generation",
            routeKey: "proof",
            visibleAnchor: "generated-marketing-surface",
            verificationFocus: ["class-specific artifact intent", "section-sequence mutation"],
            passCriteria: ["pass if proof shows class-specific artifact intent instead of generic output"],
            restoreChecks: ["artifact expectation survives proof reopen"],
            strongerPreviewPath: "proof-route",
          },
          {
            laneId: "releaseable-output",
            title: "Releaseable output",
            routeKey: "proof",
            visibleAnchor: "product-workspace-preview -> product-workspace-preview -> saas-package -> web-deployment",
            verificationFocus: ["release target", "package artifact", "next handoff action"],
            passCriteria: ["pass if releaseability and handoff are visible from the built product surface"],
            restoreChecks: ["release evidence survives revisit"],
            strongerPreviewPath: "proof-route",
          },
          {
            laneId: "local-workspace-electron-shell",
            title: "Local workspace continuity",
            routeKey: "execution",
            visibleAnchor: "workspace",
            verificationFocus: ["workspace identity remains explicit", "resume path remains visible"],
            passCriteria: ["pass if workspace continuity is visible before any desktop-shell claim"],
            restoreChecks: ["workspace route is resumable"],
            strongerPreviewPath: "execution-route",
          },
          {
            laneId: "runtime-packaging-resolver",
            title: "Runtime and packaging resolver",
            routeKey: "execution",
            visibleAnchor: "web-static -> web-deployment",
            verificationFocus: ["runtime family", "preview mode", "package mode"],
            passCriteria: ["pass if runtime, preview, and package direction are visible and class-aware"],
            restoreChecks: ["preview/package mode survives reopen"],
            strongerPreviewPath: "execution-route",
          },
          {
            laneId: "continuation-growth-loop",
            title: "Continuation and growth boundary",
            routeKey: "next-task",
            visibleAnchor: "לחדד את ה־Landing page סביב הוכחת הערך הראשית",
            verificationFocus: ["continuation stays product-connected", "growth boundary stays bounded"],
            passCriteria: ["pass if continuation opens from approved product state and stays bounded"],
            restoreChecks: ["continuation survives revisit"],
            strongerPreviewPath: "next-task-route",
          },
          {
            laneId: "deployment-release-path",
            title: "Deployment and release path",
            routeKey: "execution",
            visibleAnchor: "web-deployment",
            verificationFocus: ["deployment path", "provider status", "policy decision"],
            passCriteria: ["pass if deployment path and deployment feedback are visible in Nexus"],
            restoreChecks: ["deployment feedback survives refresh"],
            strongerPreviewPath: "execution-route",
          },
          {
            laneId: "live-orchestration-continuity",
            title: "Live orchestration continuity",
            routeKey: "timeline",
            visibleAnchor: "הרצף בין המסכים נשאר מחובר",
            verificationFocus: ["cross-surface loop is explainable", "restore checks are explicit"],
            passCriteria: ["pass if the visible matrix includes continuity and restore checks across the loop"],
            restoreChecks: ["route-restore-survives-refresh", "timeline-preserves-the-loop-story"],
            strongerPreviewPath: "timeline-route",
          },
        ],
      },
      canonicalLearningSystemContract: {
        contractId: "canonical-learning-system-contract:qa-preview",
        contractFamily: "canonical-learning-system",
        status: "defined",
        statusLabel: "מערכת הלמידה מוגדרת עכשיו כחוזה קנוני אחד",
        contractRule: "Nexus must separate project memory, user preference memory, and system learning, and only call it learning where stored signals change later decisions truthfully.",
        memoryLayers: [
          {
            layerId: "project-memory",
            title: "Project memory",
            status: "live",
            scope: "Stores project-specific outcomes, approvals, release state, deployment state, and continuation state without pretending it is global learning.",
            storedInputs: ["execution history", "approval records", "release evidence", "deployment feedback"],
            decisionImpact: ["next-task framing", "continuation quality", "project-specific context reuse"],
            continuityRule: "Project memory must stay attached to the same project identity across restore, revisit, rerun, and route transitions.",
          },
          {
            layerId: "user-preference-memory",
            title: "User preference memory",
            status: "live",
            scope: "Separates user preference signals from project truth so approvals and corrections remain reusable without blurring scopes.",
            storedInputs: ["approval feedback memory", "explicit user corrections", "stable preference signals"],
            decisionImpact: ["approval-facing explanation style", "visible preference reuse"],
            continuityRule: "User preference memory may influence later decisions, but it may not silently overwrite approved project truth.",
          },
          {
            layerId: "system-learning",
            title: "System learning",
            status: "partial",
            scope: "Cross-project patterns are visible, but they remain bounded until they change later Nexus decisions visibly and canonically.",
            storedInputs: ["cross-project patterns", "recommendation hints", "aggregated outcome signals"],
            decisionImpact: ["future class-specific behavior", "future generation focus", "future runtime and release quality improvements"],
            continuityRule: "System learning may not mutate active project truth without visible explanation and must stay distinct from per-project memory.",
          },
        ],
        decisionImpacts: [
          {
            impactId: "next-task-selection",
            label: "next-task selection",
            status: "live",
            currentEffect: "זה הצעד הנכון עכשיו כי outcome feedback ו־adaptive execution כבר מראים שהפרויקט צריך repair לפני expansion.",
            nextRequirement: "Later next-task selection must keep exposing visible learning effects instead of resetting to generic continuation copy.",
          },
          {
            impactId: "continuation-quality",
            label: "continuation quality",
            status: "live",
            currentEffect: "הסבב הבא משתנה עכשיו truthfully בגלל חסימות, כשלונות, או friction שנצברו.",
            nextRequirement: "Later continuation moves must preserve the visible learning trace while improving through new release, deployment, and rerun outcomes.",
          },
          {
            impactId: "release-decisions",
            label: "release decisions",
            status: "live",
            currentEffect: "ה־release הבא לא מקודם אוטומטית; learning מחייב עוד proof, אישור, או יציבות deploy לפני promotion.",
            nextRequirement: "Release gating must keep using stored release and deployment outcomes visibly instead of falling back to generic promotion.",
          },
          {
            impactId: "runtime-decisions",
            label: "runtime decisions",
            status: "live",
            currentEffect: "Nexus שומרת על web-static ו־static-web-build עד שהסימנים הבעייתיים יירדו.",
            nextRequirement: "Later runtime decisions must keep reusing stored runtime/package outcomes without resetting to generic defaults.",
          },
          {
            impactId: "generation-quality",
            label: "generation quality",
            status: "live",
            currentEffect: "כשלונות, retries, ו־friction מהסבב האחרון כבר מחזירים את ה־generation לייצוב הבטחת הערך, האמון, וה־CTA לפני הרחבה.",
            nextRequirement: "Later generation must keep reusing stored failure signals and class lessons without resetting to static class defaults.",
          },
        ],
        continuityRules: [
          "learning state may not silently reset across restore, revisit, rerun, or route transitions",
          "project memory must stay attached to project identity",
          "system learning may not overwrite active project truth silently",
        ],
        generationIntegrationRules: [
          "generation must later consume learned class signals, failure signals, and outcome patterns from this contract",
          "runtime and release decisions may not claim learning-driven improvement until the visible product proves it",
        ],
        explicitProhibitions: [
          "no hidden AI intuition without canonical trace",
          "no feedback summary treated as proof of learning",
          "no cross-project pattern may silently mutate active project truth",
        ],
        visibleProductExpectations: [
          "smarter generation direction",
          "reduced drift",
          "better continuation decisions",
          "better runtime and release choices where canonically allowed",
        ],
        summary: {
          memoryLayers: 3,
          liveInputs: 5,
          partialInputs: 6,
          nextInputs: 2,
          liveImpacts: 4,
          partialImpacts: 0,
          nextImpacts: 1,
          crossProjectPatterns: 2,
        },
      },
      progressState: {
        status: "active",
        percent: 72,
      },
      reactiveWorkspaceState: {
        progressBar: {
          percent: 72,
        },
      },
      liveUpdateChannel: {
        transportMode: "polling",
        refreshStrategy: "scheduled-refresh",
      },
      realtimeEventStream: {
        events: [
          { message: "יצירת טיוטה ראשונית", timestamp: "10:42", status: "active" },
          { message: "הוספת טופס הרשמה", timestamp: "10:41", status: "active" },
          { message: "חיבור Google Analytics", timestamp: "10:40", status: "done" },
        ],
      },
      liveLogStream: {
        summary: {
          totalEntries: 6,
        },
        commandOutputs: [
          { message: "בניית תוכנית פעולה", timestamp: "10:39" },
          { message: "מחקר ואיסוף מידע", timestamp: "10:38" },
        ],
        streams: {
          stdout: [
            { message: "יוצר Landing page...", timestamp: "10:42" },
            { message: "מוסיף טופס הרשמה...", timestamp: "10:41" },
            { message: "מחבר מעקב...", timestamp: "10:40" },
            { message: "בודק תקינות...", timestamp: "10:39" },
          ],
          stderr: [],
        },
      },
    };
  }

  function ensureQaProjectPreviewState() {
    const needsPreviewProject = !currentProject
      || currentProject.id === "qa-preview-project"
      || !currentProject.learningDecisionImpact
      || !currentProject.generationIntent
      || !normalizeString(currentProject?.artifactExpectation?.projectType, "");
    if (needsPreviewProject) {
      currentProject = buildQaPreviewProject();
    }
    return currentProject;
  }

  function openWorkspacePreviewScreen(workspaceKey) {
    qaPreviewRouteKey = workspaceKey;
    closeLiveUpdates();
    const previewProject = ensureQaProjectPreviewState();
    renderProject(elements, previewProject);
    activeWorkspace = workspaceKey;
    setAppScreen("workspace");
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    persistFlowState("workspace");
    scrollViewportToTop();
  }

  function renderQaRouteControls() {
    if (!isQaModeEnabled()) {
      if (elements.qaRouteSwitcher) {
        elements.qaRouteSwitcher.hidden = true;
      }
      return;
    }

    if (elements.qaRouteSwitcher) {
      elements.qaRouteSwitcher.hidden = false;
    }

    const currentKey = resolveCurrentQaScreenKey();
    const currentIndex = Math.max(0, qaScreenSequence.indexOf(currentKey));
    const buttonMap = [
      { key: "create", button: elements.qaScreenCreateButton },
      { key: "onboarding", button: elements.qaScreenOnboardingButton },
      { key: "understanding", button: elements.qaScreenUnderstandingButton },
      { key: "loop", button: elements.qaScreenLoopButton },
      { key: "execution", button: elements.qaScreenExecutionButton },
      { key: "proof", button: elements.qaScreenProofButton },
    ];

    for (const entry of buttonMap) {
      if (!entry.button) {
        continue;
      }
      entry.button.dataset.qaScreen = entry.key;
      entry.button.classList?.toggle("active", entry.key === currentKey);
      entry.button.disabled = false;
    }

    if (elements.qaPrevScreenButton) {
      elements.qaPrevScreenButton.disabled = currentIndex <= 0;
    }
    if (elements.qaNextScreenButton) {
      elements.qaNextScreenButton.disabled = currentIndex >= qaScreenSequence.length - 1;
    }
  }

  function renderQaFallbackRoute(target) {
    if (!elements.screenQa) {
      return;
    }

    qaPreviewRouteKey = target;
    elements.screenQa.innerHTML = renderQaFallbackScreen(target);
    setAppScreen("qa");
    scrollViewportToTop();
  }

  function openQaScreen(target) {
    if (!isQaModeEnabled()) {
      return;
    }

    if (target === "create") {
      qaPreviewRouteKey = "create";
      openCreatePreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "onboarding") {
      qaPreviewRouteKey = "onboarding";
      openOnboardingPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "understanding") {
      qaPreviewRouteKey = "understanding";
      openUnderstandingPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "loop") {
      openLoopPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "execution") {
      openExecutionPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "proof") {
      openProofPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "confirmation") {
      openConfirmationPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "state-update") {
      openStateUpdatePreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "next-task") {
      openNextTaskPreviewScreen();
      renderQaRouteControls();
      return;
    }

    if (target === "timeline") {
      openTimelinePreviewScreen();
      renderQaRouteControls();
      return;
    }
  }

  function resolveQaTargetFromButton(button) {
    const explicitTarget = button?.dataset?.qaScreen;
    if (explicitTarget) {
      return explicitTarget;
    }

    const fallbackMap = {
      "qa-screen-create-button": "create",
      "qa-screen-onboarding-button": "onboarding",
      "qa-screen-understanding-button": "understanding",
      "qa-screen-loop-button": "loop",
      "qa-screen-execution-button": "execution",
      "qa-screen-proof-button": "proof",
    };

    return fallbackMap[button?.id ?? ""] ?? "";
  }

  function readStoredFlowState() {
    if (isQaModeEnabled()) {
      const urlBackedState = readUrlBackedFlowState();
      if (urlBackedState) {
        return urlBackedState;
      }
    }
    try {
      const raw = appStorage.getItem("nexus.flowState");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fall through to the QA route fallback below.
    }
    return isQaModeEnabled() ? readUrlBackedFlowState() : null;
  }

  function writeStoredFlowState(flowState) {
    let wroteToAppStorage = false;
    try {
      appStorage.setItem("nexus.flowState", JSON.stringify(flowState));
      wroteToAppStorage = true;
    } catch {
      wroteToAppStorage = false;
    }
    if (isQaModeEnabled() || wroteToAppStorage !== true) {
      writeUrlBackedFlowState(flowState);
    }
  }

  function buildStoredProjectSnapshot(project) {
    const normalizedProject = normalizeObject(project);
    const state = normalizeObject(normalizedProject.state);
    const onboardingStateHandoff = normalizeObject(normalizedProject.onboardingStateHandoff ?? state.onboardingStateHandoff);
    const artifactExpectation = normalizeObject(normalizedProject.artifactExpectation ?? onboardingStateHandoff.artifactExpectation);
    const repeatedLoopContinuation = normalizeObject(
      normalizedProject.repeatedLoopContinuation
      ?? state.repeatedLoopContinuation
      ?? normalizedProject.context?.repeatedLoopContinuation,
    );

    if (!normalizedProject.id) {
      return null;
    }

    return {
      id: normalizedProject.id,
      name: normalizeString(normalizedProject.name),
      goal: normalizeString(normalizedProject.goal),
      status: normalizeString(normalizedProject.status),
      artifactExpectation: Object.keys(artifactExpectation).length > 0
        ? {
            projectType: normalizeString(artifactExpectation.projectType),
            deliverableLabel: normalizeString(artifactExpectation.deliverableLabel),
          }
        : null,
      repeatedLoopContinuation: Object.keys(repeatedLoopContinuation).length > 0
        ? {
            artifactTitle: normalizeString(repeatedLoopContinuation.artifactTitle),
            requiresClarification: repeatedLoopContinuation.requiresClarification === true,
          }
        : null,
      proofArtifact: normalizedProject.proofArtifact && typeof normalizedProject.proofArtifact === "object"
        ? {
            artifactId: normalizeString(normalizedProject.proofArtifact.artifactId),
            title: normalizeString(normalizedProject.proofArtifact.title),
            kind: normalizeString(normalizedProject.proofArtifact.kind),
          }
        : null,
      timelinePreview: Array.isArray(normalizedProject.timelineEntries)
        ? normalizedProject.timelineEntries.slice(0, 3).map((entry) => ({
            label: normalizeString(entry?.label),
            status: normalizeString(entry?.status),
          }))
        : [],
    };
  }

  function buildPersistedDraftInputs(screen, draftInputs) {
    const safeDrafts = normalizeObject(draftInputs);
    const preserveFullDraftPayload = screen === "create" || screen === "onboarding" || screen === "understanding";

    if (preserveFullDraftPayload) {
      return safeDrafts;
    }

    return {
      projectName: safeDrafts.projectName ?? "",
      visionText: safeDrafts.visionText ?? "",
      supportingLink: safeDrafts.supportingLink ?? "",
      fileName: "",
      fileContent: "",
    };
  }

  function resolvePersistedProjectContext(storedFlowState = null, options = {}) {
    const persistedState = storedFlowState ?? readStoredFlowState();
    const storedProjectSnapshot = normalizeObject(persistedState?.currentProjectSnapshot);
    const storedConversation = normalizeObject(persistedState?.onboardingConversation);
    const conversationProjectId = storedConversation.projectId ?? null;
    const snapshotProjectId = storedProjectSnapshot.id ?? null;
    const selectedProjectId = elements.projectSelect?.value?.trim?.() || null;
    const preserveStoredProject = options.preserveStoredProject !== false;
    const liveProjectId = currentProject?.id ?? null;
    const resolvedProjectId = currentProjectId
      ?? liveProjectId
      ?? selectedProjectId
      ?? conversationProjectId
      ?? (preserveStoredProject ? snapshotProjectId : null)
      ?? null;
    const resolvedProject = currentProject?.id
      ? currentProject
      : (
        resolvedProjectId
          ? (
            normalizeArray(cachedProjects).find((project) => project?.id === resolvedProjectId)
            ?? (
              preserveStoredProject && storedProjectSnapshot.id === resolvedProjectId
                ? storedProjectSnapshot
                : null
            )
          )
          : null
      )
      ?? (
        (preserveStoredProject && storedProjectSnapshot.id)
          ? storedProjectSnapshot
          : null
      );

    return {
      resolvedProjectId,
      resolvedProject,
      storedProjectSnapshot,
      storedConversation,
    };
  }

  function toSerializableStoredValue(value, seen = new WeakSet()) {
    if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value ?? null;
    }

    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
      return null;
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => toSerializableStoredValue(entry, seen))
        .filter((entry) => entry !== undefined);
    }

    if (typeof value === "object") {
      if (seen.has(value)) {
        return null;
      }
      seen.add(value);

      const serialized = {};
      for (const [key, entry] of Object.entries(value)) {
        const normalizedEntry = toSerializableStoredValue(entry, seen);
        if (normalizedEntry !== undefined) {
          serialized[key] = normalizedEntry;
        }
      }
      seen.delete(value);
      return serialized;
    }

    return undefined;
  }

  function captureDraftInputs() {
    return {
      projectName: readCurrentCreateFieldValue("create-project-name-input"),
      visionText: readCurrentCreateFieldValue("create-project-vision-input"),
      supportingLink: readCurrentCreateFieldValue("create-project-link-input"),
      fileName: readCurrentCreateFieldValue("create-project-file-name-input"),
      fileContent: readCurrentCreateFieldValue("create-project-file-content-input"),
    };
  }

  function applyDraftInputs(draftInputs = {}) {
    if (elements.createProjectNameInput) elements.createProjectNameInput.value = draftInputs.projectName ?? "";
    if (elements.createProjectVisionInput) elements.createProjectVisionInput.value = draftInputs.visionText ?? "";
    if (elements.createProjectLinkInput) elements.createProjectLinkInput.value = draftInputs.supportingLink ?? "";
    if (elements.createProjectFileNameInput) elements.createProjectFileNameInput.value = draftInputs.fileName ?? "";
    if (elements.createProjectFileContentInput) elements.createProjectFileContentInput.value = draftInputs.fileContent ?? "";
    updateCreateFileSelectionUi();
  }

  function parseStoredCreateProjectFiles() {
    const fileName = readCurrentCreateFieldValue("create-project-file-name-input").trim();
    const fileContent = readCurrentCreateFieldValue("create-project-file-content-input");

    if (fileContent.trim()) {
      try {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((file) => file && typeof file === "object")
            .map((file) => ({
              name: typeof file.name === "string" && file.name.trim() ? file.name.trim() : "supporting-notes.txt",
              type: typeof file.type === "string" && file.type.trim() ? file.type.trim() : "text",
              content: typeof file.content === "string" ? file.content : "",
              size: typeof file.size === "number" ? file.size : null,
            }))
            .filter((file) => file.name || file.content.trim());
        }
      } catch {
        // Fall back to the legacy single-file shape stored in the hidden fields.
      }
    }

    if (!fileName && !fileContent.trim()) {
      return [];
    }

    return [
      {
        name: fileName || "supporting-notes.txt",
        type: fileName.endsWith(".md") ? "markdown" : "text",
        content: fileContent,
        size: null,
      },
    ];
  }

  function persistFlowState(screen) {
    const normalizedScreen = typeof screen === "string" ? screen : "";
    const preserveOnboardingPayload = normalizedScreen === "create" || normalizedScreen === "onboarding" || normalizedScreen === "understanding";
    const resolvedConversation = normalizeObject(onboardingConversation);
    const preserveStoredProject = !(
      (normalizedScreen === "create" || normalizedScreen === "onboarding")
      && !currentProjectId
      && !currentProject?.id
      && !resolvedConversation.projectId
    );
    const persistedContext = resolvePersistedProjectContext(null, {
      preserveStoredProject,
    });
    const preservedConversation = Object.keys(resolvedConversation).length > 0
      ? {
          ...resolvedConversation,
          projectId: resolvedConversation.projectId
            ?? persistedContext.resolvedProjectId
            ?? null,
        }
      : null;
    const persistedDraftInputs = buildPersistedDraftInputs(normalizedScreen, captureDraftInputs());
    const serializableProjectSnapshot = persistedContext.resolvedProject
      ? buildStoredProjectSnapshot(persistedContext.resolvedProject)
      : null;
    writeStoredFlowState({
      screen,
      currentProjectId: persistedContext.resolvedProjectId,
      activeWorkspace,
      currentProjectSnapshot: serializableProjectSnapshot,
      currentProjectAuditPayload: currentProjectAuditPayload ?? null,
      onboardingFlow: preserveOnboardingPayload ? onboardingFlow : null,
      onboardingConversation: preserveOnboardingPayload ? preservedConversation : null,
      draftInputs: persistedDraftInputs,
    });
  }

  function scrollViewportToTop() {
    try {
      globalThis.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    } catch {
      globalThis.scrollTo?.(0, 0);
    }
  }

  async function fetchJson(url, options) {
    const storedAppUser = readStoredAppUser();
    const headers = {
      ...(options?.headers ?? {}),
    };

    if (
      typeof url === "string"
      && url.startsWith("/api/")
      && storedAppUser?.userId
      && !headers["x-user-id"]
    ) {
      headers["x-user-id"] = storedAppUser.userId;
    }

    const response = await fetchImpl(url, {
      ...options,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async function ensureQaProviderBackedOnboardingSession({ selectedProviderId = resolveSelectedOnboardingProviderId() } = {}) {
    if (!isQaModeEnabled()) {
      return null;
    }

    if (onboardingFlow?.sessionId) {
      await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
      return onboardingFlow.sessionId;
    }

    const previewProject = ensureQaProjectPreviewState();
    const projectName = readCurrentCreateFieldValue("create-project-name-input").trim() || previewProject.name || "My SaaS App";
    const visionText = readCurrentCreateFieldValue("create-project-vision-input").trim() || previewProject.goal || "להכין ניסוי ראשון לרכישת משתמשים";
    const appUser = await ensureAppUser();
    const draftResult = await fetchJson("/api/project-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: {
          email: appUser.email,
        },
        projectCreationInput: {
          projectName,
          visionText,
        },
      }),
    });

    const session = await fetchJson("/api/onboarding/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: appUser.userId,
        projectDraftId: draftResult.projectDraftId,
        initialInput: {
          projectName,
          visionText,
          providerChoice: selectedProviderId,
          learningContext: {
            learningDecisionImpact: previewProject.learningDecisionImpact ?? null,
            generationIntent: previewProject.generationIntent ?? null,
          },
        },
      }),
    });

    onboardingFlow = {
      mode: "onboarding",
      sessionId: session.onboardingSession?.sessionId ?? null,
      projectDraftId: draftResult.projectDraftId,
      projectName,
      visionText,
      supportingLink: elements.createProjectLinkInput?.value?.trim() ?? "",
      selectedProviderId,
      providerRuntime: normalizeObject(session.onboardingSession?.providerRuntime)
        .selectedProviderId
        ? session.onboardingSession.providerRuntime
        : createOnboardingProviderRuntime({
          selectedProviderId,
          sessionId: session.onboardingSession?.sessionId ?? null,
        }),
    };

    await syncOnboardingIntakeToSession({
      sessionId: onboardingFlow.sessionId,
      projectName,
      visionText,
      supportingLink: onboardingFlow.supportingLink,
      uploadedFiles: buildOnboardingUploadedFiles(),
    }).catch(() => {});
    await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
    renderOnboardingNotes();
    renderOnboardingConversation();
    persistFlowState("onboarding");
    return onboardingFlow.sessionId;
  }

  async function updateOnboardingProviderSelection(providerId = "openai") {
    const selectedProvider = resolveOnboardingAgentProvider(providerId);
    onboardingFlow = {
      ...(onboardingFlow ?? {}),
      selectedProviderId: selectedProvider.providerId,
      providerRuntime: createOnboardingProviderRuntime({
        selectedProviderId: selectedProvider.providerId,
        sessionId: onboardingFlow?.sessionId ?? null,
        currentQuestionPath: normalizeArray(onboardingConversation?.summary?.learnedQuestionPath),
        learningStatus: normalizeString(onboardingConversation?.summary?.learningStatus, "partial"),
      }),
    };

    if (!onboardingFlow?.sessionId && isQaModeEnabled()) {
      await ensureQaProviderBackedOnboardingSession({ selectedProviderId: selectedProvider.providerId });
      return;
    }

    if (!onboardingFlow?.sessionId) {
      renderOnboardingProviderRuntime();
      persistFlowState("onboarding");
      return;
    }

    await fetchJson("/api/onboarding/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: onboardingFlow.sessionId,
        actionType: "select-provider",
        payload: {
          providerId: selectedProvider.providerId,
        },
      }),
    });
    await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
    renderOnboardingNotes();
    renderOnboardingConversation();
    persistFlowState("onboarding");
  }

  function setFlowButtonState({
    target = "create",
    disabled = false,
    label = null,
  } = {}) {
    const button = target === "finish" ? elements.finishOnboardingButton : elements.createProjectButton;
    if (!button) {
      return;
    }

    button.disabled = disabled;
    button.textContent = label ?? (target === "finish" ? "סיים Onboarding" : "צור פרויקט והתחל");
  }

  function buildLocalOnboardingSummary(answers = {}, options = {}) {
    const { audience, problem, solution } = resolveCanonicalOnboardingAnswers(answers);
    const classification = resolveLocalOnboardingClassification(answers, options);
    const projectType = classification.projectType;
    const learningDecision = resolveLearningGuidedOnboardingDecision({
      answers,
      classification,
      learningContext: resolveLocalLearningContext(options, projectType),
    });
    const understoodItems = [];
    const missingItems = [];

    if (audience) {
      understoodItems.push(`קהל יעד: ${audience}`);
    }
    if (problem) {
      understoodItems.push(`בעיה מרכזית: ${problem}`);
    }
    if (solution) {
      understoodItems.push(`כיוון לפתרון: ${solution}`);
    }

    if (!audience) {
      missingItems.push("מי קהל היעד המרכזי");
    } else if (!problem && projectType === "landing-page") {
      missingItems.push("מה גורם לקהל לא לעצור ולהשאיר פרטים היום");
    } else if (!problem && projectType === "internal-tool") {
      missingItems.push("איזה צוואר בקבוק תפעולי פוגע בעבודה היומית");
    } else if (!problem && projectType === "commerce-ops") {
      missingItems.push("איפה הזמנות, קטלוג או מלאי נופלים בין בעלי תפקידים");
    } else if (!problem) {
      missingItems.push("מה הבעיה הכי כואבת של קהל היעד");
    } else if (projectType === "landing-page") {
      missingItems.push("מה ההבטחה הראשית שחייבת להופיע מעל הקפל");
    } else if (projectType === "internal-tool") {
      missingItems.push("איפה הבעלות על התור חייבת להיות גלויה");
    } else if (projectType === "commerce-ops") {
      missingItems.push("איפה חריגות הזמנה או מלאי חייבות להיות גלויות מיד");
    } else {
      missingItems.push("איך הם משתמשים היום");
    }

    if (!problem) {
      missingItems.push("מה עוצר אותם היום מלהתקדם");
    } else if (!solution && (projectType !== "landing-page" || learningDecision.requiresLandingSolution)) {
      missingItems.push("איך נראה פתרון מוצלח מבחינתם");
    } else if (projectType !== "landing-page" || learningDecision.requiresLandingSolution) {
      missingItems.push("כמה מכירות קיימות");
    }

    if (solution && (projectType !== "landing-page" || learningDecision.requiresLandingSolution)) {
      missingItems.push("כמה לקוחות יש להם");
    }

    return {
      understoodTitle: "מה הבנתי עד עכשיו",
      understoodItems,
      missingTitle: "מה חסר לי",
      missingItems,
      projectType,
      projectTypeLabel: projectType === "landing-page"
        ? "דף נחיתה / שיווק"
        : projectType === "commerce-ops"
          ? "מערכת מסחר ותפעול"
          : projectType === "internal-tool"
            ? "כלי פנימי"
            : projectType === "saas"
              ? "מוצר SaaS / follow-up"
              : projectType === "mobile-app"
                ? "אפליקציה"
                : "הפרויקט",
      learningStatus: learningDecision.learningStatus,
      learningStrategy: learningDecision.learningStrategy,
      learningStrategyLabel: learningDecision.learningStrategyLabel,
      learningReason: learningDecision.learningReason,
      learningSignals: learningDecision.learningSignals,
      learnedQuestionPath: learningDecision.questionPlan,
      learnedQuestionPathLabel: learningDecision.questionPlan.join(" -> "),
      readinessLine: learningDecision.readinessLine,
      handoffStrengthLine: learningDecision.handoffStrengthLine,
      clarificationMode: learningDecision.clarificationMode,
    };
  }

  function resolveActiveOnboardingProject() {
    if (isQaModeEnabled()) {
      return ensureQaProjectPreviewState();
    }
    return currentProject ?? null;
  }

  function buildOnboardingConversationOptions({
    projectOverride = null,
    visionTextOverride = null,
    projectTypeHintOverride = null,
  } = {}) {
    const sourceProject = projectOverride ?? resolveActiveOnboardingProject();
    return {
      visionText: visionTextOverride ?? elements.createProjectVisionInput?.value?.trim() ?? onboardingFlow?.visionText?.trim?.() ?? sourceProject?.goal ?? "",
      projectTypeHint: projectTypeHintOverride
        ?? sourceProject?.artifactExpectation?.projectType
        ?? sourceProject?.onboardingStateHandoff?.artifactExpectation?.projectType
        ?? "",
      learningDecisionImpact: sourceProject?.learningDecisionImpact ?? null,
      generationIntent: sourceProject?.generationIntent ?? null,
    };
  }

  function resolveSelectedOnboardingProviderId() {
    return normalizeString(
      onboardingConversation?.providerRuntime?.selectedProviderId
        ?? onboardingFlow?.providerRuntime?.selectedProviderId
        ?? onboardingFlow?.selectedProviderId
        ?? "openai",
    ).toLowerCase() || "openai";
  }

  function resolveOnboardingProviderRuntime() {
    const availableRuntime = normalizeObject(
      onboardingConversation?.providerRuntime
        ?? onboardingFlow?.providerRuntime
        ?? null,
    );
    if (availableRuntime.selectedProviderId) {
      return availableRuntime;
    }
    return createOnboardingProviderRuntime({
      selectedProviderId: resolveSelectedOnboardingProviderId(),
      sessionId: onboardingFlow?.sessionId ?? null,
      currentQuestionPath: normalizeArray(onboardingConversation?.summary?.learnedQuestionPath),
      learningStatus: normalizeString(onboardingConversation?.summary?.learningStatus, "partial"),
    });
  }

  function createOnboardingConversationState() {
    const answers = {};
    const conversationOptions = buildOnboardingConversationOptions();
    const openingQuestionId = resolveLocalNextQuestionId(answers, conversationOptions);
    const openingPrompt = buildLocalOnboardingPromptForQuestion(openingQuestionId, answers, conversationOptions);
    const openingQuestion = openingQuestionId
      ? resolveOnboardingQuestionPresentation(openingQuestionId, answers, conversationOptions)
      : null;
    const totalQuestions = Math.max(
      buildLocalAdaptiveQuestionPlan(answers, conversationOptions).length,
      openingQuestionId ? 1 : 0,
    );
    return {
      mode: "local",
      currentIndex: 0,
      totalQuestions,
      isComplete: openingQuestionId === null,
      answers,
      transcript: openingPrompt
        ? [
            {
              id: "ai-1",
              speaker: "ai",
              text: openingPrompt,
              time: "10:30",
            },
          ]
        : [],
      summary: buildLocalOnboardingSummary(answers, conversationOptions),
      currentQuestion: openingPrompt
        ? {
            id: openingQuestionId ?? null,
            title: openingQuestion.title || openingPrompt,
            placeholder: openingQuestion.placeholder || "",
            reason: buildLocalOnboardingQuestionReason(openingQuestionId, answers, conversationOptions) || openingQuestion.reason || "",
          }
        : null,
      completionReason: openingQuestionId === null ? buildLocalOnboardingCompletionReason(answers, conversationOptions) : "",
      draftAnswer: "",
      pendingAdvance: false,
      pendingAnswer: "",
      advanceTimer: null,
    };
  }

  function normalizeOnboardingConversationPayload(payload) {
    const conversation = normalizeObject(payload?.onboardingConversation);
    const providerRuntime = normalizeObject(payload?.providerRuntime);
    const transcript = normalizeArray(conversation.transcript)
      .filter((entry) => entry && typeof entry === "object")
      .map((entry, index) => ({
        id: entry.id ?? `entry-${index + 1}`,
        speaker: entry.speaker === "user" ? "user" : "ai",
        text: typeof entry.text === "string" ? entry.text : "",
        time: typeof entry.time === "string" ? entry.time : "",
        providerId: typeof entry.providerId === "string" ? entry.providerId : null,
        providerLabel: typeof entry.providerLabel === "string" ? entry.providerLabel : null,
        runtimeLabel: typeof entry.runtimeLabel === "string" ? entry.runtimeLabel : null,
      }));
    const summary = normalizeObject(conversation.summary);
    const currentQuestion = normalizeObject(conversation.currentQuestion);
    const answers = normalizeObject(conversation.answers);
    const conversationOptions = buildOnboardingConversationOptions({
      visionTextOverride: payload?.goal ?? currentProject?.goal ?? onboardingFlow?.visionText?.trim?.() ?? "",
      projectTypeHintOverride: payload?.artifactExpectation?.projectType
        ?? currentProject?.artifactExpectation?.projectType
        ?? currentProject?.onboardingStateHandoff?.artifactExpectation?.projectType
        ?? "",
    });

    const normalizedConversation = refreshOnboardingConversationPresentation({
      mode: "backend",
      sessionId: conversation.sessionId ?? onboardingFlow?.sessionId ?? null,
      transcript,
      summary: {
        understoodTitle: summary.understoodTitle ?? "מה הבנתי עד עכשיו",
        understoodItems: normalizeArray(summary.understoodItems),
        missingTitle: summary.missingTitle ?? "מה חסר לי",
        missingItems: normalizeArray(summary.missingItems),
        projectType: summary.projectType ?? null,
        projectTypeLabel: summary.projectTypeLabel ?? null,
        learningStatus: summary.learningStatus ?? null,
        learningStrategy: summary.learningStrategy ?? null,
        learningStrategyLabel: summary.learningStrategyLabel ?? null,
        learningReason: summary.learningReason ?? null,
        learningSignals: normalizeArray(summary.learningSignals),
        learnedQuestionPath: normalizeArray(summary.learnedQuestionPath),
        learnedQuestionPathLabel: summary.learnedQuestionPathLabel ?? null,
        readinessLine: summary.readinessLine ?? null,
        handoffStrengthLine: summary.handoffStrengthLine ?? null,
        clarificationMode: summary.clarificationMode ?? null,
      },
      currentQuestion: currentQuestion.id
        ? {
            id: currentQuestion.id,
            title: resolveOnboardingQuestionPresentation(currentQuestion.id, answers, conversationOptions).title || currentQuestion.title || "",
            placeholder: resolveOnboardingQuestionPresentation(currentQuestion.id, answers, conversationOptions).placeholder || currentQuestion.placeholder || "",
            reason: resolveOnboardingQuestionPresentation(currentQuestion.id, answers, conversationOptions).reason || currentQuestion.reason || "",
          }
        : null,
      currentIndex: Number(conversation.currentIndex ?? 0),
      totalQuestions: Number(conversation.totalQuestions ?? (Number(conversation.currentIndex ?? 0) + (currentQuestion.id ? 1 : 0))),
      isComplete: conversation.isComplete === true,
      completionReason: typeof conversation.completionReason === "string" ? conversation.completionReason : "",
      answers,
      providerRuntime,
      draftAnswer: "",
      pendingAdvance: false,
      pendingAnswer: "",
      advanceTimer: null,
    }, conversationOptions);
    onboardingFlow = {
      ...(onboardingFlow ?? {}),
      sessionId: normalizedConversation.sessionId ?? onboardingFlow?.sessionId ?? null,
      selectedProviderId: providerRuntime.selectedProviderId ?? onboardingFlow?.selectedProviderId ?? resolveSelectedOnboardingProviderId(),
      providerRuntime: Object.keys(providerRuntime).length > 0
        ? providerRuntime
        : resolveOnboardingProviderRuntime(),
    };
    return normalizedConversation;
  }

  async function syncOnboardingConversationFromBackend(sessionId) {
    if (!sessionId) {
      onboardingConversation = createOnboardingConversationState();
      return onboardingConversation;
    }

    const payload = await fetchJson(`/api/onboarding/sessions/${sessionId}/conversation`);
    onboardingConversation = normalizeOnboardingConversationPayload(payload);
    return onboardingConversation;
  }

  async function submitOnboardingConversationAnswerToBackend(answer) {
    if (!onboardingFlow?.sessionId) {
      return null;
    }

    const payload = await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/conversation-turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    onboardingConversation = normalizeOnboardingConversationPayload(payload);
    return onboardingConversation;
  }

  async function restartOnboardingConversationFromBackend() {
    if (!onboardingFlow?.sessionId) {
      onboardingConversation = createOnboardingConversationState();
      return onboardingConversation;
    }

    const payload = await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/conversation-restart`, {
      method: "POST",
    });
    onboardingConversation = normalizeOnboardingConversationPayload(payload);
    return onboardingConversation;
  }

  function buildWorkspaceLandingFeedback({ projectName = "", answers = {} } = {}) {
    const resolvedProjectName = projectName.trim() || "הפרויקט שלך";
    const targetUser = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
    const coreFlow = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
    const successOutcome = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";

    const title = "הפרויקט שלך מוכן";
    const messageParts = [`נכנסת עכשיו ל־workspace של ${resolvedProjectName}.`];

    if (targetUser && coreFlow) {
      messageParts.push(`בנינו פתיחה שמכוונת ל־${targetUser} סביב ${coreFlow}.`);
    } else if (successOutcome) {
      messageParts.push(`הצעד הבא כאן בנוי כדי להביא אותך מהר ל־${successOutcome}.`);
    } else {
      messageParts.push("עכשיו אפשר להתחיל לעבוד מתוך המרחב הראשי של הפרויקט.");
    }

    return {
      title,
      message: messageParts.join(" "),
    };
  }

  function resolveOnboardingContinuationGate(finished = {}) {
    return normalizeObject(
      finished?.onboardingStateHandoff?.continuationGate
        ?? finished?.onboardingCompletionDecision?.continuationGate,
    );
  }

  function buildOnboardingContinuationFeedback({
    projectName = "",
    answers = {},
    finished = {},
    previewOnly = false,
  } = {}) {
    const continuationGate = resolveOnboardingContinuationGate(finished);
    const artifactExpectation = normalizeObject(
      finished?.project?.artifactExpectation
        ?? finished?.onboardingStateHandoff?.artifactExpectation,
    );

    if (previewOnly) {
      const artifactTitle = (artifactExpectation.title ?? projectName.trim()) || "התוצר הראשון";
      const previewMessageParts = [`ההבנה כבר אושרה, והלופ ננעל סביב ${artifactTitle}.`];
      if (continuationGate.title) {
        previewMessageParts.push(continuationGate.title);
      }
      const requestedMaterial = continuationGate.requestedMaterialLabel ?? continuationGate.detail ?? "";
      if (requestedMaterial) {
        previewMessageParts.push(requestedMaterial);
      }

      return {
        title: "ההבנה אושרה, הלופ מוכן",
        message: previewMessageParts.join(" ").trim(),
      };
    }

    const base = buildWorkspaceLandingFeedback({ projectName, answers });
    if (!continuationGate.gateType) {
      return base;
    }

    return {
      title: base.title,
      message: `${base.message} ${continuationGate.title}. ${continuationGate.requestedMaterialLabel ?? continuationGate.detail ?? ""}`.trim(),
    };
  }

  function shouldUseOnboardingContinuationPreview(finished = {}) {
    const completionDecision = normalizeObject(finished.onboardingCompletionDecision);
    const handoff = normalizeObject(finished.onboardingStateHandoff);
    const continuationGate = resolveOnboardingContinuationGate(finished);
    if (!continuationGate.gateType) {
      return false;
    }

    return completionDecision.isComplete === true
      || completionDecision.supportingMaterialDeferred === true
      || handoff.summary?.canBuildProjectState === true
      || handoff.completionDecision?.supportingMaterialDeferred === true;
  }

  function buildOnboardingContinuationPreviewProject({
    projectName = "",
    visionText = "",
    finished = {},
  } = {}) {
    const continuationGate = resolveOnboardingContinuationGate(finished);
    const onboardingStateHandoff = normalizeObject(finished.onboardingStateHandoff);
    const onboardingCompletionDecision = normalizeObject(finished.onboardingCompletionDecision);
    const derivedArtifactExpectation = buildOnboardingArtifactExpectationPreview({
      onboardingFlow: {
        ...(onboardingFlow ?? {}),
        projectName,
        visionText,
      },
      onboardingConversation,
    });
    const artifactExpectation = normalizeObject(
      onboardingStateHandoff.artifactExpectation?.title
        ? onboardingStateHandoff.artifactExpectation
        : derivedArtifactExpectation,
    );
    const generationIntent = buildOnboardingGenerationIntentPreview({
      currentProject: {
        artifactExpectation,
      },
      onboardingFlow: {
        ...(onboardingFlow ?? {}),
        projectName,
        visionText,
      },
      onboardingConversation,
    });
    const artifactTitle = (artifactExpectation.title ?? projectName.trim()) || "התוצר הראשון";

    return {
      onboardingContinuationPreview: true,
      name: projectName.trim() || onboardingFlow?.projectName?.trim?.() || "Project",
      goal: visionText.trim() || onboardingFlow?.visionText?.trim?.() || "",
      onboardingStateHandoff: {
        ...onboardingStateHandoff,
        artifactExpectation,
        continuationGate,
      },
      onboardingCompletionDecision: {
        ...onboardingCompletionDecision,
        continuationGate,
      },
      artifactExpectation,
      generationIntent,
      overview: {
        bottleneck: continuationGate.requestedMaterialLabel ?? continuationGate.title ?? "חומר תומך עדיין חסר",
      },
      cycle: {
        roadmap: [
          {
            summary: `לקדם את ${artifactTitle}`,
            status: "assigned",
          },
        ],
      },
      projectBrainWorkspace: {
        overview: {
          currentPhase: "understanding-approved-awaiting-supporting-material",
        },
        summary: {
          blockerCount: 1,
        },
      },
      developerWorkspace: {
        contextSummary: {
          progressStatus: "pending",
          nextAction: continuationGate.requestedMaterialLabel ?? "צרף חומר תומך כדי לדייק את ההמשך",
        },
      },
      releaseWorkspace: {
        validation: {},
      },
      aiControlCenterSurface: {
        generatedSurfacePreview: {},
      },
    };
  }

  function buildWorkspaceContinuitySnapshot(project) {
    const normalizedProject = normalizeObject(project);
    const status = t(normalizedProject.status ?? "idle");
    const bottleneck = normalizedProject.overview?.bottleneck ?? "לא זוהה";
    const nextAction = normalizedProject.developerWorkspace?.contextSummary?.nextAction
      ?? normalizeArray(normalizedProject.cycle?.roadmap).find((task) => task.status === "assigned")?.summary
      ?? "לא הוגדרה פעולה";

    return {
      status,
      bottleneck,
      nextAction,
    };
  }

  function resetCreateProjectInputs() {
    if (elements.createProjectNameInput) elements.createProjectNameInput.value = "";
    if (elements.createProjectVisionInput) elements.createProjectVisionInput.value = "";
    if (elements.createProjectLinkInput) elements.createProjectLinkInput.value = "";
    if (elements.createProjectFileNameInput) elements.createProjectFileNameInput.value = "";
    if (elements.createProjectFileContentInput) elements.createProjectFileContentInput.value = "";
    if (elements.createProjectFileUploadInput) elements.createProjectFileUploadInput.value = "";
    updateCreateFileSelectionUi();
  }

  function updateCreateFileSelectionUi() {
    const selectedFiles = parseStoredCreateProjectFiles();
    const hasSelectedFile = selectedFiles.length > 0;
    const primaryFileName = selectedFiles[0]?.name ?? "";
    const selectedCount = selectedFiles.length;

    if (elements.createProjectFilePickerButton) {
      elements.createProjectFilePickerButton.classList?.toggle("has-file", hasSelectedFile);
    }
    if (elements.createProjectFilePickerTitle) {
      elements.createProjectFilePickerTitle.textContent = hasSelectedFile
        ? selectedCount === 1
          ? primaryFileName || "קובץ פרויקט נבחר"
          : `${selectedCount} קבצי פרויקט נבחרו`
        : "גרור קבצים לכאן או לחץ להעלאה";
    }
    if (elements.createProjectFilePickerMeta) {
      elements.createProjectFilePickerMeta.textContent = hasSelectedFile
        ? CREATE_PROJECT_UPLOAD_SELECTED_META
        : CREATE_PROJECT_UPLOAD_EMPTY_META;
    }
  }

  async function hydrateSelectedSupportFiles(fileList) {
    const selectedFiles = Array.from(fileList ?? []).filter(Boolean);
    if (selectedFiles.length === 0) {
      return;
    }

    const hydratedFiles = [];
    for (const file of selectedFiles) {
      const normalizedName = typeof file.name === "string" && file.name.trim() ? file.name.trim() : "supporting-notes.txt";
      let content = "";

      try {
        if (typeof file.text === "function") {
          const fileText = await file.text();
          content = typeof fileText === "string" ? fileText : "";
        }
      } catch {
        content = "";
      }

      if (!content.trim()) {
        content = `Selected project asset: ${normalizedName}${file.type ? ` (${file.type})` : ""}.`;
      }

      hydratedFiles.push({
        name: normalizedName,
        type: typeof file.type === "string" && file.type.trim()
          ? file.type
          : normalizedName.endsWith(".md")
            ? "markdown"
            : "text",
        content,
        size: typeof file.size === "number" ? file.size : null,
      });
    }

    if (elements.createProjectFileNameInput) {
      elements.createProjectFileNameInput.value = hydratedFiles.map((file) => file.name).join(", ");
    }
    if (elements.createProjectFileContentInput) {
      elements.createProjectFileContentInput.value = JSON.stringify(hydratedFiles);
    }

    updateCreateFileSelectionUi();
    persistFlowState(resolveCurrentShellRouteKey());

    if (onboardingFlow?.sessionId) {
      try {
        await syncOnboardingIntakeToSession({
          sessionId: onboardingFlow.sessionId,
          uploadedFiles: hydratedFiles,
        });
      } catch {
        // Keep the local file hydration even if the backend sync fails here.
      }
    }
  }

  function enterCreateProjectScreen({ preserveProjectContext = true } = {}) {
    closeLiveUpdates();
    const persistedContext = preserveProjectContext
      ? resolvePersistedProjectContext()
      : {
          resolvedProjectId: null,
          resolvedProject: null,
        };
    const preservedProjectId = persistedContext.resolvedProjectId ?? null;
    const preservedProject = persistedContext.resolvedProject ?? null;

    currentProjectId = null;
    currentProject = null;
    currentProjectAuditPayload = null;
    onboardingFlow = null;
    onboardingConversation = null;
    renderCreateScreenView();
    resetCreateProjectInputs();
    renderEmptyAppState({
      mode: "create",
      message: "מה אתה רוצה לבנות?",
      status: "ספר לנו על הרעיון שלך ונעזור לך להפוך אותו למציאות",
    });

    if (preserveProjectContext && (preservedProjectId || preservedProject?.id)) {
      const liveProjectId = currentProjectId;
      const liveProject = currentProject;
      currentProjectId = preservedProjectId;
      currentProject = preservedProject;
      persistFlowState("create");
      currentProjectId = liveProjectId;
      currentProject = liveProject;
    } else {
      persistFlowState("create");
    }
    scrollViewportToTop();
  }

  function buildRunCycleFeedback(previousProject, nextProject) {
    const before = buildWorkspaceContinuitySnapshot(previousProject);
    const after = buildWorkspaceContinuitySnapshot(nextProject);
    const changedParts = [];

    if (before.status !== after.status) {
      changedParts.push(`המצב עבר ל־${after.status}`);
    }
    if (before.bottleneck !== after.bottleneck) {
      changedParts.push(`החסם המרכזי עכשיו הוא ${after.bottleneck}`);
    }
    if (before.nextAction !== after.nextAction) {
      changedParts.push(`הפעולה הבאה עודכנה ל־${after.nextAction}`);
    }

    if (changedParts.length > 0) {
      return {
        title: "הפרויקט התקדם",
        message: changedParts.join(" · "),
      };
    }

    return {
      title: "ה־workspace עודכן",
      message: "אתה עדיין באותו פרויקט. רעננו את המצב בלי לאפס את ההקשר שלך.",
    };
  }

  function pulseWorkspaceContinuity() {
    if (!elements.workspaceTopShell?.classList) {
      return;
    }

    elements.workspaceTopShell.classList.remove("continuity-refresh");
    elements.workspaceTopShell.classList.add("continuity-refresh");
    setTimeoutImpl(() => {
      elements.workspaceTopShell?.classList?.remove("continuity-refresh");
    }, 520);
  }

  function clearFlowFeedback() {
    if (elements.flowFeedbackBanner) {
      elements.flowFeedbackBanner.hidden = true;
    }
    if (elements.flowFeedbackTitle) {
      elements.flowFeedbackTitle.textContent = "";
    }
    if (elements.flowFeedbackMessage) {
      elements.flowFeedbackMessage.textContent = "";
    }
  }

  function showFlowFeedback({ title = "", message = "" } = {}) {
    if (elements.flowFeedbackTitle) {
      elements.flowFeedbackTitle.textContent = title;
    }
    if (elements.flowFeedbackMessage) {
      elements.flowFeedbackMessage.textContent = message;
    }
    if (elements.flowFeedbackBanner) {
      elements.flowFeedbackBanner.hidden = false;
    }
  }

  function setAppScreen(screen, options = {}) {
    const normalizedScreen = screen === "workspace" || screen === "onboarding" || screen === "understanding" || screen === "loop" || screen === "execution" || screen === "proof" || screen === "artifact" || screen === "confirmation" || screen === "state-update" || screen === "next-task" || screen === "timeline" || screen === "home" || screen === "files" || screen === "settings" || screen === "help" || screen === "qa" ? screen : "create";

    if (elements.screenCreate) {
      elements.screenCreate.hidden = normalizedScreen !== "create";
    }
    if (elements.screenHome) {
      elements.screenHome.hidden = normalizedScreen !== "home";
    }
    if (elements.screenFiles) {
      elements.screenFiles.hidden = normalizedScreen !== "files";
    }
    if (elements.screenSettings) {
      elements.screenSettings.hidden = normalizedScreen !== "settings";
    }
    if (elements.screenHelp) {
      elements.screenHelp.hidden = normalizedScreen !== "help";
    }
    if (elements.screenOnboarding) {
      elements.screenOnboarding.hidden = normalizedScreen !== "onboarding";
    }
    if (elements.screenUnderstanding) {
      elements.screenUnderstanding.hidden = normalizedScreen !== "understanding";
    }
    if (elements.screenLoop) {
      elements.screenLoop.hidden = normalizedScreen !== "loop";
    }
    if (elements.screenExecution) {
      elements.screenExecution.hidden = normalizedScreen !== "execution";
    }
    if (elements.screenProof) {
      elements.screenProof.hidden = normalizedScreen !== "proof";
    }
    if (elements.screenArtifact) {
      elements.screenArtifact.hidden = normalizedScreen !== "artifact";
    }
    if (elements.screenConfirmation) {
      elements.screenConfirmation.hidden = normalizedScreen !== "confirmation";
    }
    if (elements.screenStateUpdate) {
      elements.screenStateUpdate.hidden = normalizedScreen !== "state-update";
    }
    if (elements.screenNextTask) {
      elements.screenNextTask.hidden = normalizedScreen !== "next-task";
    }
    if (elements.screenTimeline) {
      elements.screenTimeline.hidden = normalizedScreen !== "timeline";
    }
    if (elements.screenQa) {
      elements.screenQa.hidden = normalizedScreen !== "qa";
    }
    if (elements.screenWorkspace) {
      elements.screenWorkspace.hidden = normalizedScreen !== "workspace";
    }
    if (elements.emptyAppState) {
      elements.emptyAppState.hidden = normalizedScreen !== "create";
    }
    if (elements.onboardingStage) {
      elements.onboardingStage.hidden = normalizedScreen !== "onboarding";
    }
    if (elements.workspaceBoard) {
      elements.workspaceBoard.hidden = normalizedScreen !== "workspace";
    }
    if (normalizedScreen !== "workspace") {
      clearFlowFeedback();
    }
    const body = doc?.body;
    if (body?.dataset) {
      body.dataset.appScreen = normalizedScreen;
    }
    const root = doc?.documentElement;
    if (root?.dataset) {
      root.dataset.appScreen = normalizedScreen;
    }
    renderShellChrome(normalizedScreen, activeWorkspace);
    if (options.persist !== false) {
      persistFlowState(normalizedScreen);
    }
  }

  async function loadProject(projectId, transitionFeedback = null, preloadedProject = null) {
    const project = preloadedProject ?? await fetchJson(`/api/projects/${projectId}`);
    const workspaceBackedScreens = new Set([
      "loop",
      "execution",
      "proof",
      "artifact",
      "confirmation",
      "state-update",
      "next-task",
      "timeline",
    ]);
    currentProjectId = projectId;
    currentProject = project;
    qaPreviewRouteKey = null;
    onboardingFlow = null;
    onboardingConversation = null;
    currentProjectAuditPayload = project.projectAuditPayload ?? project.state?.projectAuditPayload ?? null;
    applyDesignSystem(doc, project);
    renderProject(elements, project);
    if (activeWorkspace === "loop") {
      renderLoopCoreScreenView(project);
    } else if (activeWorkspace === "execution") {
      renderExecutionLiveScreenView(project);
    } else if (activeWorkspace === "proof") {
      renderProofResultScreenView(project);
    } else if (activeWorkspace === "artifact") {
      renderArtifactPreviewScreenView(project);
    } else if (activeWorkspace === "confirmation") {
      renderConfirmationDecisionScreenView(project);
    } else if (activeWorkspace === "state-update") {
      renderStateUpdateScreenView(project);
    } else if (activeWorkspace === "next-task") {
      renderNextTaskScreenView(project);
    } else if (activeWorkspace === "timeline") {
      renderTimelineHistoryScreenView(project);
    } else {
      setAppScreen("workspace");
    }
    if (transitionFeedback?.title || transitionFeedback?.message) {
      showFlowFeedback({
        title: transitionFeedback.title ?? "ה־workspace נטען",
        message: transitionFeedback.message ?? "הפרויקט מוכן לעבודה.",
      });
    } else {
      clearFlowFeedback();
    }
    if (transitionFeedback?.pulseWorkspace === true) {
      pulseWorkspaceContinuity();
    }
    const resolvedScreen = workspaceBackedScreens.has(activeWorkspace) ? activeWorkspace : "workspace";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome(resolvedScreen, activeWorkspace);
    persistFlowState(resolvedScreen);
    updatePresence().catch(() => {});
    connectLiveUpdates();
    return project;
  }

  function buildProjectAuditQueryParams() {
    const params = new URLSearchParams();
    const actorId = elements.projectAuditActorInput?.value?.trim() ?? "";
    const actionType = elements.projectAuditActionInput?.value?.trim() ?? "";
    const sensitivity = elements.projectAuditSensitivitySelect?.value?.trim() ?? "";
    if (actorId) {
      params.set("actorId", actorId);
    }
    if (actionType) {
      params.set("actionType", actionType);
    }
    if (sensitivity) {
      params.set("sensitivity", sensitivity);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  async function refreshProjectAudit() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/audit${buildProjectAuditQueryParams()}`);
    currentProjectAuditPayload = payload;
    renderProjectAudit(elements, currentProjectAuditPayload);
  }

  function readStoredAppUser() {
    if (activeAppUser?.userId || activeAppUser?.email) {
      return activeAppUser;
    }

    try {
      const raw = appStorage.getItem("nexus.appUser");
      activeAppUser = raw ? JSON.parse(raw) : null;
      return activeAppUser;
    } catch {
      return activeAppUser;
    }
  }

  function writeStoredAppUser(appUser) {
    activeAppUser = appUser ?? null;
    try {
      appStorage.setItem("nexus.appUser", JSON.stringify(appUser));
    } catch {}
  }

  function clearStoredAppUser() {
    activeAppUser = null;
    try {
      appStorage.removeItem("nexus.appUser");
    } catch {}
  }

  function formatVisionText(projectName, visionText) {
    const normalizedName = String(projectName ?? "").trim();
    const normalizedVision = String(visionText ?? "").trim();
    if (!normalizedName && !normalizedVision) {
      return "";
    }
    return `שם הפרויקט: ${normalizedName}\n${normalizedVision}`.trim();
  }

  function resolveRepeatedLoopContinuation(project = null) {
    const safeProject = normalizeObject(project);
    return normalizeObject(
      safeProject.repeatedLoopContinuation
        ?? safeProject.state?.repeatedLoopContinuation
        ?? safeProject.context?.repeatedLoopContinuation,
    );
  }

  function reopenOnboardingFromWorkspace() {
    if (currentProject) {
      if (elements.createProjectNameInput) {
        elements.createProjectNameInput.value = currentProject.name ?? elements.createProjectNameInput.value ?? "";
      }
      if (elements.createProjectVisionInput && !elements.createProjectVisionInput.value.trim()) {
        elements.createProjectVisionInput.value = currentProject.goal ?? "";
      }
    }

    const repeatedLoopContinuation = resolveRepeatedLoopContinuation(currentProject);
    const repeatedLoopClarification = normalizeObject(repeatedLoopContinuation.clarification);
    const isRepeatedLoopClarification = repeatedLoopContinuation.requiresClarification === true;
    const isContinuationPreview = currentProject?.onboardingContinuationPreview === true;
    renderEmptyAppState({
      mode: "onboarding",
      message: isRepeatedLoopClarification
        ? "חוזרים לדייק את הסבב הבא"
        : isContinuationPreview
          ? "חוזרים להשלים חומר תומך"
          : "פתחת מחדש את מסך ה־Onboarding",
      status: isRepeatedLoopClarification
        ? `${repeatedLoopClarification.title ?? "צריך עוד הבהרה לפני סבב ההמשך"}. ${repeatedLoopClarification.detail ?? ""}`.trim()
        : isContinuationPreview
        ? formatOnboardingBlockedStatus({
            onboardingCompletionDecision: currentProject?.onboardingCompletionDecision,
            onboardingStateHandoff: currentProject?.onboardingStateHandoff,
          })
        : "זה מצב בדיקה מתוך ה־workspace כדי לעבוד על ה־UI של ה־onboarding בלי ליצור פרויקט חדש.",
    });
    if (isRepeatedLoopClarification) {
      onboardingConversation = {
        mode: "repeated-loop-clarification",
        projectId: currentProjectId ?? currentProject?.id ?? null,
        currentIndex: 0,
        totalQuestions: 1,
        isComplete: false,
        answers: {},
        transcript: [
          {
            id: "ai-clarification-1",
            speaker: "ai",
            text: repeatedLoopClarification.promptTitle
              ?? `מה חסר כדי לפתוח סבב המשך אמיתי של ${repeatedLoopContinuation.artifactTitle ?? currentProject?.name ?? "התוצר שאושר"}?`,
            time: "10:30",
          },
        ],
        summary: {
          understoodTitle: "מה כבר סגור",
          understoodItems: [
            `התוצר שאושר נשמר: ${repeatedLoopContinuation.artifactTitle ?? currentProject?.name ?? "הפרויקט הפעיל"}`,
          ],
          missingTitle: "מה צריך עכשיו כדי לא למחזר את אותו artifact",
          missingItems: [
            repeatedLoopClarification.requestedMaterialLabel ?? repeatedLoopClarification.detail ?? "חומר תומך שידייק את הסבב הבא",
          ],
        },
        currentQuestion: {
          id: "repeated-loop-clarification",
          title: repeatedLoopClarification.promptTitle ?? "איזה חומר תומך יחזק את הסבב הבא?",
          placeholder: repeatedLoopClarification.promptPlaceholder ?? "הדבק כאן קישור, מסך, spec או דוגמה רלוונטית",
          reason: repeatedLoopClarification.promptBody ?? "",
        },
        draftAnswer: "",
        pendingAdvance: false,
        pendingAnswer: "",
        advanceTimer: null,
      };
      renderOnboardingNotes();
      renderOnboardingConversation();
    } else {
      const hasRestorableLocalConversation = (
        onboardingConversation
        && typeof onboardingConversation === "object"
        && (
          onboardingConversation.currentQuestion
          || onboardingConversation.summary
          || normalizeArray(onboardingConversation.transcript).length > 0
        )
      );

      if (onboardingFlow?.sessionId) {
        syncOnboardingConversationFromBackend(onboardingFlow.sessionId)
          .then(() => {
            renderOnboardingNotes();
            renderOnboardingConversation();
          })
          .catch(() => {
            onboardingConversation = createOnboardingConversationState();
            renderOnboardingNotes();
            renderOnboardingConversation();
          });
      } else if (hasRestorableLocalConversation) {
        onboardingConversation = refreshOnboardingConversationPresentation(
          onboardingConversation,
          buildOnboardingConversationOptions(),
        );
        onboardingConversation.projectId = onboardingConversation.projectId
          ?? currentProjectId
          ?? currentProject?.id
          ?? null;
        renderOnboardingNotes();
        renderOnboardingConversation();
      } else {
        onboardingConversation = createOnboardingConversationState();
        renderOnboardingNotes();
        renderOnboardingConversation();
      }
    }
    renderShellChrome("onboarding", activeWorkspace);
    persistFlowState("onboarding");
  }

  function navigateLoopTarget(target) {
    openShellRoute(target);
  }

  async function exitOnboardingScreen() {
    const storedFlowState = readStoredFlowState();
    const persistedContext = resolvePersistedProjectContext(storedFlowState);
    const fallbackProjectName = currentProject?.name?.trim?.()
      || elements.createProjectNameInput?.value?.trim()
      || persistedContext.resolvedProject?.name?.trim?.()
      || "";
    const cachedFallbackProject = normalizeArray(cachedProjects).find((project) => (
      project?.id === persistedContext.resolvedProjectId
      || (
        fallbackProjectName
        && typeof project?.name === "string"
        && project.name.trim() === fallbackProjectName
      )
    ));
    const resolvedWorkspaceProjectId = persistedContext.resolvedProjectId ?? cachedFallbackProject?.id ?? null;

    if (resolvedWorkspaceProjectId) {
      onboardingConversation = null;
      const storedProjectSnapshot = persistedContext.storedProjectSnapshot;
      const fallbackProject = currentProject?.id
        ? currentProject
        : (
          persistedContext.resolvedProject?.id
            ? persistedContext.resolvedProject
            : (
              storedProjectSnapshot.id
                ? storedProjectSnapshot
                : (cachedFallbackProject?.id ? cachedFallbackProject : null)
            )
        );
      const workspaceBackedRoute = normalizeString(storedFlowState?.activeWorkspace);
      if (workspaceKeys.includes(workspaceBackedRoute)) {
        activeWorkspace = workspaceBackedRoute;
      }

      try {
        await loadProject(resolvedWorkspaceProjectId, {
          title: "חזרת ל־workspace שלך",
          message: "יצאת ממסך ה־Onboarding וחזרת לאותו פרויקט בלי לאבד את ההקשר.",
        }, fallbackProject?.id ? fallbackProject : null);
        return;
      } catch {
        const cachedFallback = normalizeArray(cachedProjects).find((project) => (
          project?.id === fallbackProject?.id
          || (
            fallbackProject?.name
            && typeof project?.name === "string"
            && project.name.trim() === fallbackProject.name.trim()
          )
        ));
        const resolvedFallbackId = cachedFallback?.id ?? fallbackProject?.id ?? cachedFallbackProject?.id ?? null;

        if (resolvedFallbackId) {
          await loadProject(resolvedFallbackId, {
            title: "חזרת ל־workspace שלך",
            message: "יצאת ממסך ה־Onboarding וחזרת לאותו פרויקט בלי לאבד את ההקשר.",
          }, fallbackProject?.id === resolvedFallbackId ? fallbackProject : null);
          return;
        }
      }
    }

    onboardingFlow = null;
    onboardingConversation = null;
    renderEmptyAppState({
      mode: "create",
      message: "חזרת ליצירת הפרויקט",
      status: "אפשר לעדכן את שם הפרויקט או התיאור, ואז להמשיך שוב ל־Onboarding.",
    });
  }

  function buildOnboardingUploadedFiles() {
    return parseStoredCreateProjectFiles();
  }

  function readCurrentCreateFieldValue(fieldId) {
    const liveField = doc.querySelector(`#${fieldId}`);
    const value = typeof liveField?.value === "string" ? liveField.value : "";
    if (value.trim()) {
      return value;
    }

    const elementKeyById = {
      "create-project-name-input": "createProjectNameInput",
      "create-project-vision-input": "createProjectVisionInput",
      "create-project-link-input": "createProjectLinkInput",
      "create-project-file-name-input": "createProjectFileNameInput",
      "create-project-file-content-input": "createProjectFileContentInput",
    };
    const elementKey = elementKeyById[fieldId];
    if (!elementKey) {
      return value;
    }
    return typeof elements[elementKey]?.value === "string" ? elements[elementKey].value : "";
  }

  async function syncOnboardingIntakeToSession({
    sessionId = onboardingFlow?.sessionId ?? null,
    projectName = elements.createProjectNameInput?.value?.trim() || onboardingFlow?.projectName?.trim?.() || "",
    visionText = elements.createProjectVisionInput?.value?.trim() || onboardingFlow?.visionText?.trim?.() || "",
    supportingLink = elements.createProjectLinkInput?.value?.trim() || onboardingFlow?.supportingLink?.trim?.() || "",
    uploadedFiles = buildOnboardingUploadedFiles(),
  } = {}) {
    if (!sessionId || !projectName || !visionText) {
      return null;
    }

    const result = await fetchJson(`/api/onboarding/sessions/${sessionId}/intake`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName,
        visionText: formatVisionText(projectName, visionText),
        uploadedFiles,
        externalLinks: supportingLink ? [supportingLink] : [],
      }),
    });

    onboardingFlow = {
      ...(onboardingFlow ?? {}),
      sessionId,
      projectName,
      visionText,
      supportingLink,
    };

    return result;
  }

  function getOnboardingAnswer(questionId) {
    const answers = normalizeObject(onboardingConversation?.answers);
    if (questionId === "target-audience") {
      return resolveCanonicalOnboardingAnswers(answers).audience;
    }
    if (questionId === "core-problem") {
      return resolveCanonicalOnboardingAnswers(answers).problem;
    }
    const answer = answers[questionId];
    return typeof answer === "string" ? answer.trim() : "";
  }

  function buildOnboardingLeadSummary() {
    const audience = getOnboardingAnswer("target-audience");
    const problem = getOnboardingAnswer("core-problem");
    const solution = getOnboardingAnswer("successful-solution");

    if (audience && problem && solution) {
      return `כרגע אני מבין שאנחנו בונים עבור ${audience}, הכאב המרכזי הוא ${problem}, והפתרון צריך להרגיש כמו ${solution}.`;
    }

    if (audience && problem) {
      return `יש כבר תמונה ראשונית: הפרויקט מכוון ל־${audience}, והכאב המרכזי שלהם הוא ${problem}.`;
    }

    if (audience) {
      return `הבנתי שהפרויקט מכוון קודם כל ל־${audience}. עכשיו נחדד את הבעיה המרכזית שהם חייבים לפתור.`;
    }

    return "ברגע שתענה על השאלות, ה־AI יסכם כאן בצורה חיה מה כבר הובן על הפרויקט.";
  }

  function formatOnboardingRetryStatus(error, fallback = "נסה שוב בעוד רגע.") {
    const rawMessage = typeof error?.message === "string" ? error.message.trim() : "";
    if (!rawMessage) {
      return fallback;
    }
    if (/^Request failed:\s*\d+/i.test(rawMessage)) {
      return fallback;
    }
    if (/(network|fetch|transport|timeout|failed to fetch)/i.test(rawMessage)) {
      return fallback;
    }
    return fallback;
  }

  function buildOnboardingWorkingMemory() {
    const summary = normalizeObject(onboardingConversation?.summary);
    const understood = normalizeArray(summary.understoodItems);
    const missing = normalizeArray(summary.missingItems);
    const refining = [];
    const supportingLink = elements.createProjectLinkInput?.value?.trim() ?? "";
    const uploadedFiles = buildOnboardingUploadedFiles();

    if (understood.length >= 2) {
      refining.push(buildOnboardingLeadSummary());
    }
    if (supportingLink) {
      refining.push("כבר הוזן קישור תומך, כך שאפשר יהיה לחבר את ההבנה הזו גם לחומר חיצוני.");
    }
    if (uploadedFiles.length > 0) {
      refining.push(
        uploadedFiles.length === 1
          ? `נוסף גם קובץ פרויקט (${uploadedFiles[0].name}) שיכול להעשיר את ההבנה לפני פתיחת משטח העבודה.`
          : `נוספו ${uploadedFiles.length} קבצי פרויקט שיכולים לבסס הקשר חזק יותר לפני פתיחת משטח העבודה.`,
      );
    }
    if (normalizeString(summary.learningReason, "")) {
      refining.push(summary.learningReason);
    }
    if (normalizeString(summary.handoffStrengthLine, "")) {
      refining.push(summary.handoffStrengthLine);
    }
    if (normalizeString(summary.readinessLine, "")) {
      refining.push(summary.readinessLine);
    }
    if (!understood.length && !missing.length) {
      missing.push("עדיין לא נאסף מספיק מידע. ה־AI מחכה לתשובה הראשונה כדי להתחיל לבנות תמונת מצב אמיתית.");
    }

    return { understood, missing, refining };
  }

  function deriveUnderstandingSummaryModel() {
    const audience = getOnboardingAnswer("target-audience");
    const problem = getOnboardingAnswer("core-problem");
    const solution = getOnboardingAnswer("successful-solution");
    const visionText = elements.createProjectVisionInput?.value?.trim() ?? onboardingFlow?.visionText?.trim?.() ?? "";

    const audienceTitle = audience || "קהל היעד עדיין לא הושלם";
    const audienceBody = audience
      ? "הקבוצה המרכזית שעבורה אנחנו בונים את החוויה הראשונה"
      : "צריך לחדד מי המשתמש המרכזי של המוצר.";

    const problemTitle = problem || "הבעיה עדיין לא חודדה";
    const problemBody = problem
      ? "זה הכאב המרכזי שהמוצר צריך לפתור כבר בגרסה הראשונה"
      : "צריך להבין מה הכאב המרכזי שחוזר אצל המשתמש הזה.";

    const solutionTitle = solution || "הפתרון עדיין לא הוגדר";
    const solutionBody = solution
      ? "כך צריך להרגיש פתרון שעובד טוב עבור המשתמש"
      : "צריך לחדד איך נראה פתרון מוצלח מבחינת המשתמש.";

    const goalTitle = visionText
      ? (visionText.length > 38 ? `${visionText.slice(0, 38)}...` : visionText)
      : "להוציא את הפרויקט לפעולה";
    const goalBody = solution
      ? "השלב הבא הוא להפוך את ההבנה הזו למשימה ישימה בתוך הלופ."
      : "אחרי אישור הסיכום נתקדם למשימה הבאה שנגזרת מההבנה הזו.";

    return {
      audienceTitle,
      audienceBody,
      problemTitle,
      problemBody,
      solutionTitle,
      solutionBody,
      goalTitle,
      goalBody,
    };
  }

  function renderUnderstandingSummaryStage() {
    const model = deriveUnderstandingSummaryModel();
    if (elements.understandingAudienceTitle) elements.understandingAudienceTitle.textContent = model.audienceTitle;
    if (elements.understandingAudienceBody) elements.understandingAudienceBody.textContent = model.audienceBody;
    if (elements.understandingProblemTitle) elements.understandingProblemTitle.textContent = model.problemTitle;
    if (elements.understandingProblemBody) elements.understandingProblemBody.textContent = model.problemBody;
    if (elements.understandingSolutionTitle) elements.understandingSolutionTitle.textContent = model.solutionTitle;
    if (elements.understandingSolutionBody) elements.understandingSolutionBody.textContent = model.solutionBody;
    if (elements.understandingGoalTitle) elements.understandingGoalTitle.textContent = model.goalTitle;
    if (elements.understandingGoalBody) elements.understandingGoalBody.textContent = model.goalBody;
  }

  function renderUnderstandingSummaryScreenView() {
    const viewModel = buildUnderstandingSummaryViewModel({
      currentProject,
      onboardingFlow,
      onboardingConversation,
    });

    if (elements.screenUnderstanding) {
      elements.screenUnderstanding.innerHTML = renderUnderstandingSummaryScreen(viewModel);
      bindUnderstandingSummaryScreenElements(doc, elements);
    }

    if (elements.understandingContinueButton) {
      elements.understandingContinueButton.onclick = async (event) => {
        event.preventDefault?.();
        await finishFirstProjectOnboarding();
      };
    }
    if (elements.understandingCorrectButton) {
      elements.understandingCorrectButton.onclick = async (event) => {
        event.preventDefault?.();
        await correctOnboardingUnderstanding();
      };
    }

    renderUnderstandingSummaryStage();
    setAppScreen("understanding");
  }

  function buildHomeProjectSource(projectsOverride = null) {
    const baseProjects = normalizeArray(projectsOverride ?? cachedProjects);
    const current = normalizeObject(currentProject);
    const storedFlowState = readStoredFlowState();
    const storedProjectSnapshot = normalizeObject(storedFlowState?.currentProjectSnapshot);
    const projectMap = new Map();

    for (const project of baseProjects) {
      if (project?.id) {
        projectMap.set(String(project.id), project);
      }
    }

    if (current.id && !projectMap.has(String(current.id))) {
      projectMap.set(String(current.id), current);
    }

    if (storedProjectSnapshot.id && !projectMap.has(String(storedProjectSnapshot.id))) {
      projectMap.set(String(storedProjectSnapshot.id), storedProjectSnapshot);
    }

    return Array.from(projectMap.values());
  }

  function renderHomeSupportScreenView(projectsOverride = null) {
    const storedFlowState = readStoredFlowState();
    const storedProjectSnapshot = normalizeObject(storedFlowState?.currentProjectSnapshot);
    const resolvedCurrentProjectId = currentProjectId
      ?? currentProject?.id
      ?? storedFlowState?.currentProjectId
      ?? storedProjectSnapshot.id
      ?? null;
    currentProjectId = resolvedCurrentProjectId;

    const viewModel = buildHomeSupportViewModel({
      projects: buildHomeProjectSource(projectsOverride),
      currentProjectId: resolvedCurrentProjectId,
    });

    if (elements.screenHome) {
      elements.screenHome.innerHTML = renderHomeSupportScreen(viewModel);
      bindHomeSupportScreenElements(doc, elements);
    }

    qaPreviewRouteKey = null;
    setAppScreen("home");
    renderShellChrome("home", activeWorkspace);
    persistFlowState("home");
  }

  function renderHelpSupportScreenView() {
    if (!elements.screenHelp) {
      return;
    }

    currentShellRouteKey = "help";
    const viewModel = buildHelpSupportViewModel({
      currentRouteKey: "help",
      currentProjectName: currentProject?.name ?? "",
      currentPathname: globalThis.location?.pathname ?? "/help",
      searchQuery: currentHelpSearchQuery,
      selectedCategory: currentHelpCategory,
      selectedArticleId: currentHelpArticleId,
      supportPanelOpen: currentHelpSupportPanelOpen,
      supportCopyMessage: currentHelpSupportCopyMessage,
    });

    currentHelpCategory = viewModel.selectedCategory || currentHelpCategory;
    currentHelpArticleId = viewModel.selectedArticle?.id || currentHelpArticleId;

    elements.screenHelp.innerHTML = renderHelpSupportScreen(viewModel);
    bindHelpScreenElements();

    qaPreviewRouteKey = null;
    setAppScreen("help");
    renderShellChrome("help", activeWorkspace);
    persistFlowState("help");
  }

  function openHelpCategory(categoryKey) {
    currentHelpCategory = normalizeString(categoryKey);
    currentHelpArticleId = "";
    currentHelpSupportCopyMessage = "";
    renderHelpSupportScreenView();
  }

  function openHelpArticle(articleId) {
    currentHelpArticleId = normalizeString(articleId);
    currentHelpSupportCopyMessage = "";
    renderHelpSupportScreenView();
  }

  function toggleHelpSupportPanel() {
    currentHelpSupportPanelOpen = !currentHelpSupportPanelOpen;
    currentHelpSupportCopyMessage = "";
    renderHelpSupportScreenView();
  }

  async function copyHelpSupportSummary() {
    const summary = elements.helpSupportSummary?.textContent?.trim?.() ?? "";
    if (!summary) {
      currentHelpSupportCopyMessage = "אין כרגע פרטי תמיכה להעתקה.";
      renderHelpSupportScreenView();
      return;
    }

    try {
      if (globalThis.navigator?.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(summary);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      currentHelpSupportCopyMessage = "פרטי התמיכה הועתקו ללוח.";
    } catch {
      currentHelpSupportCopyMessage = "לא הצלחנו להעתיק אוטומטית. אפשר לסמן ולהעתיק ידנית מהתקציר.";
    }

    renderHelpSupportScreenView();
  }

  async function hydrateStoredProjectContextForSupportRoute({
    storedWorkspaceProjectId = null,
    storedProjectSnapshot = null,
    projects = [],
  } = {}) {
    const snapshot = normalizeObject(storedProjectSnapshot);
    const normalizedProjects = normalizeArray(projects);
    const resolvedProjectId = currentProjectId
      ?? currentProject?.id
      ?? storedWorkspaceProjectId
      ?? snapshot.id
      ?? null;

    if (!resolvedProjectId) {
      return;
    }

    currentProjectId = resolvedProjectId;

    if (currentProject?.id === resolvedProjectId) {
      return;
    }

    currentProject = normalizedProjects.find((project) => project?.id === resolvedProjectId) ?? null;

    if (!currentProject) {
      try {
        currentProject = await fetchJson(`/api/projects/${resolvedProjectId}`);
      } catch {
        currentProject = snapshot.id === resolvedProjectId ? snapshot : null;
      }
    }

    if (!currentProject && snapshot.id === resolvedProjectId) {
      currentProject = snapshot;
    }
  }

  function renderDeferredShellRoute(routeKey) {
    const route = buildShellRouteModel(routeKey);
    currentShellRouteKey = route.key;
    closeLiveUpdates();
    currentProjectAuditPayload = null;
    renderDeferredSupportScreenView(route);
    setAppScreen(route.key);
    renderShellChrome(route.key, activeWorkspace);
    syncBrowserShellRoute(route.key);
    persistFlowState(route.key);
    scrollViewportToTop();
  }

  function renderBootstrapFailureScreen(error) {
    const requestedRouteKey = resolveShellRouteKeyFromPath(globalThis.location?.pathname ?? "/") ?? "create";
    const normalizedMessage = error?.message === "Request failed: 429"
      ? "המערכת עמוסה כרגע"
      : "טעינת Nexus נכשלה כרגע";
    const normalizedStatus = error?.message === "Request failed: 429"
      ? "ניסינו לטעון פרויקטים ולשחזר את ה־session, אבל השרת החי החזיר 429. המסך נשאר זמין ואפשר לרענן שוב בעוד רגע."
      : `לא הצלחנו להשלים את טעינת ה־bootstrap החיה. ${error?.message ?? "נסה לרענן שוב."}`;

    currentProjectId = null;
    currentProject = null;
    currentProjectAuditPayload = null;

    if (requestedRouteKey === "home") {
      renderHomeSupportScreenView([]);
      if (elements.screenHome) {
        const host = elements.screenHome.querySelector(".nexus-home-screen__intro-main > div p");
        if (host) {
          host.textContent = normalizedStatus;
        }
      }
      return;
    }

    if (requestedRouteKey === "files") {
      renderFilesSupportScreenView();
      return;
    }

    if (requestedRouteKey === "help") {
      renderHelpSupportScreenView();
      return;
    }

    if (
      requestedRouteKey !== "create"
      && requestedRouteKey !== "settings"
    ) {
      renderBlockedRouteFallback(requestedRouteKey);
      return;
    }

    renderEmptyAppState({
      mode: "create",
      message: normalizedMessage,
      status: normalizedStatus,
    });
  }

  function canTruthfullyRestoreDirectRoute(routeKey, storedFlowState = null) {
    const persistedContext = resolvePersistedProjectContext(storedFlowState);
    const hasPersistedProjectContext = Boolean(persistedContext.resolvedProjectId || persistedContext.resolvedProject?.id);

    if (routeKey === "onboarding") {
      return true;
    }

    if (routeKey === "understanding") {
      return Boolean(currentProjectId || currentProject || onboardingFlow?.sessionId || hasPersistedProjectContext);
    }

    if (routeKey === "loop") {
      return true;
    }

    if (
      routeKey === "execution"
      || routeKey === "proof"
      || routeKey === "artifact"
      || routeKey === "confirmation"
      || routeKey === "state-update"
      || routeKey === "next-task"
      || routeKey === "timeline"
    ) {
      return Boolean(currentProjectId || currentProject || hasPersistedProjectContext);
    }

    return true;
  }

  function renderFilesSupportScreenView() {
    const viewModel = buildFilesSupportViewModel({
      project: currentProject,
      draftInputs: captureDraftInputs(),
    });

    if (elements.screenFiles) {
      elements.screenFiles.innerHTML = renderFilesSupportScreen(viewModel);
    }

    qaPreviewRouteKey = null;
    setAppScreen("files");
  }

  function readSettingsToggleValue(toggleButton, fallback = false) {
    if (!toggleButton) {
      return fallback;
    }
    return toggleButton.dataset.enabled === "true";
  }

  function readSettingsFormDraft() {
    return {
      profileInput: {
        displayName: elements.settingsDisplayNameInput?.value?.trim() ?? "",
        email: elements.settingsEmailInput?.value?.trim() ?? "",
      },
      settingsInput: {
        preferredLanguage: elements.settingsLanguageSelect?.value?.trim() ?? "he",
        themePreference: elements.settingsThemeSelect?.value?.trim()
          ?? elements.settingsThemeSelectClone?.value?.trim()
          ?? "light",
      },
      notificationInput: {
        emailEnabled: readSettingsToggleValue(elements.settingsEmailToggle, true),
        inAppEnabled: readSettingsToggleValue(elements.settingsInAppToggle, true),
      },
    };
  }

  async function fetchSettingsProfileSurface() {
    const payload = await fetchJson("/api/settings-profile");
    currentSettingsProfileSurface = normalizeObject(payload?.settingsProfileSurface);
    if (currentSettingsProfileSurface.actorProfile?.userId) {
      writeStoredAppUser({
        ...(readStoredAppUser() ?? {}),
        userId: currentSettingsProfileSurface.actorProfile.userId,
        displayName: currentSettingsProfileSurface.actorProfile.displayName ?? null,
        email: currentSettingsProfileSurface.actorProfile.email ?? null,
      });
    }
    return currentSettingsProfileSurface;
  }

  async function renderSettingsScreenView(settingsProfileSurfaceOverride = null) {
    currentShellRouteKey = "settings";
    setAppScreen("settings");
    renderShellChrome("settings", activeWorkspace);
    persistFlowState("settings");

    const renderFromSurface = (surface, override = {}) => {
      const viewModel = buildSettingsViewModel({
        settingsProfileSurface: surface,
        activePanel: currentSettingsPanel,
        savingState: currentSettingsSavingState,
        flashMessage: currentSettingsFlashMessage,
        errorMessage: currentSettingsErrorMessage,
        ...override,
      });

      if (elements.screenSettings) {
        elements.screenSettings.innerHTML = renderSettingsScreen(viewModel);
        bindSettingsScreenElements(doc, elements);
      }
    };

    renderFromSurface(settingsProfileSurfaceOverride ?? currentSettingsProfileSurface);

    if (settingsProfileSurfaceOverride) {
      currentSettingsProfileSurface = settingsProfileSurfaceOverride;
      return;
    }

    try {
      const freshSurface = await fetchSettingsProfileSurface();
      currentSettingsErrorMessage = "";
      renderFromSurface(freshSurface);
    } catch (error) {
      currentSettingsErrorMessage = `טעינת ההגדרות נכשלה: ${error.message}`;
      renderFromSurface(currentSettingsProfileSurface, {
        errorMessage: currentSettingsErrorMessage,
      });
    }
  }

  async function saveSettingsProfileSurface() {
    const draft = readSettingsFormDraft();
    currentSettingsSavingState = "saving";
    currentSettingsFlashMessage = "";
    currentSettingsErrorMessage = "";
    await renderSettingsScreenView(currentSettingsProfileSurface);

    try {
      const payload = await fetchJson("/api/settings-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      currentSettingsProfileSurface = normalizeObject(payload?.settingsProfileSurface);
      currentSettingsSavingState = "idle";
      currentSettingsFlashMessage = "ההגדרות נשמרו בהצלחה.";
      currentSettingsErrorMessage = "";
      writeStoredAppUser({
        ...(readStoredAppUser() ?? {}),
        userId: currentSettingsProfileSurface.actorProfile?.userId ?? readStoredAppUser()?.userId ?? null,
        displayName: currentSettingsProfileSurface.actorProfile?.displayName ?? null,
        email: currentSettingsProfileSurface.actorProfile?.email ?? null,
      });
      await renderSettingsScreenView(currentSettingsProfileSurface);
    } catch (error) {
      currentSettingsSavingState = "idle";
      currentSettingsErrorMessage = `שמירת ההגדרות נכשלה: ${error.message}`;
      await renderSettingsScreenView(currentSettingsProfileSurface);
    }
  }

  function renderLoopCoreScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildLoopCoreViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenLoop) {
      elements.screenLoop.innerHTML = renderLoopCoreScreen(viewModel);
    }

    activeWorkspace = "loop";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("loop");
  }

  function renderExecutionLiveScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildExecutionLiveViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenExecution) {
      elements.screenExecution.innerHTML = renderExecutionLiveScreen(viewModel);
      bindExecutionLiveScreenElements(doc, elements);
    }

    if (sourceProject) {
      renderLive(elements, sourceProject);
    }

    activeWorkspace = "execution";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("execution");
    persistFlowState("execution");
  }

  function renderProofResultScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildProofResultViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenProof) {
      elements.screenProof.innerHTML = renderProofResultScreen(viewModel);
      bindProofResultScreenElements(doc, elements);
    }

    if (sourceProject) {
      renderProofScreen(elements, sourceProject);
    }

    activeWorkspace = "proof";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("proof");
    persistFlowState("proof");
  }

  function renderArtifactPreviewScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildArtifactPreviewViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenArtifact) {
      elements.screenArtifact.innerHTML = renderArtifactPreviewScreen(viewModel);
      bindArtifactPreviewScreenElements(doc, elements);
    }

    if (elements.artifactDownloadButton) {
      elements.artifactDownloadButton.disabled = viewModel.downloadAction.supported !== true;
      elements.artifactDownloadButton.title = viewModel.downloadAction.supported === true
        ? "הורד artifact קנוני self-contained שאפשר להראות גם מחוץ ל־Nexus."
        : "ה־artifact הנוכחי עדיין לא מוכן לייצוא עצמי בלי metadata בלבד.";
    }

    activeWorkspace = "artifact";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("artifact");
    persistFlowState("artifact");
  }

  function renderConfirmationDecisionScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildConfirmationViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenConfirmation) {
      elements.screenConfirmation.innerHTML = renderConfirmationDecisionScreen(viewModel);
      bindConfirmationDecisionScreenElements(doc, elements);
    }

    activeWorkspace = "confirmation";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("confirmation");
    persistFlowState("confirmation");
  }

  function renderStateUpdateScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildStateUpdateViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenStateUpdate) {
      elements.screenStateUpdate.innerHTML = renderStateUpdateScreen(viewModel);
      bindStateUpdateScreenElements(doc, elements);
    }

    activeWorkspace = "state-update";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("state-update");
    persistFlowState("state-update");
  }

  function renderNextTaskScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride ?? currentProject ?? (qaMode ? ensureQaProjectPreviewState() : null);
    const viewModel = buildNextTaskViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenNextTask) {
      elements.screenNextTask.innerHTML = renderNextTaskScreen(viewModel);
      bindNextTaskScreenElements(doc, elements);
    }

    activeWorkspace = "next-task";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("next-task");
    persistFlowState("next-task");
  }

  function renderTimelineHistoryScreenView(projectOverride = null, { qaMode = false } = {}) {
    const sourceProject = projectOverride
      ?? currentProject
      ?? ((qaMode || isQaModeEnabled()) ? ensureQaProjectPreviewState() : null);
    const viewModel = buildTimelineViewModel({
      project: sourceProject,
      qaMode,
    });

    if (elements.screenTimeline) {
      elements.screenTimeline.innerHTML = renderTimelineHistoryScreen(viewModel);
      bindTimelineHistoryScreenElements(doc, elements);
    }

    activeWorkspace = "timeline";
    setActiveWorkspace(elements, activeWorkspace);
    setAppScreen("timeline");
    persistFlowState("timeline");
  }

  function renderBootstrapRestoredScreen() {
    const storedFlowState = readStoredFlowState();
    const storedProjectSnapshot = normalizeObject(storedFlowState?.currentProjectSnapshot);
    const storedProjectAuditPayload = normalizeObject(storedFlowState?.currentProjectAuditPayload);
    const storedScreen = normalizeString(storedFlowState?.screen);
    const requestedRouteKey = resolveShellRouteKeyFromPath(globalThis.location?.pathname ?? "/");
    const workspaceBackedScreens = new Set([
      "loop",
      "execution",
      "proof",
      "artifact",
      "confirmation",
      "state-update",
      "next-task",
      "timeline",
    ]);
    const bootstrapScreen = workspaceBackedScreens.has(requestedRouteKey)
      ? requestedRouteKey
      : storedScreen;

    if (requestedRouteKey === "create") {
      return false;
    }

    if (!storedProjectSnapshot.id || !workspaceBackedScreens.has(bootstrapScreen)) {
      return false;
    }

    currentProjectId = storedFlowState?.currentProjectId ?? storedProjectSnapshot.id;
    currentProject = storedProjectSnapshot;
    currentProjectAuditPayload = Object.keys(storedProjectAuditPayload).length > 0 ? storedProjectAuditPayload : null;
    activeWorkspace = workspaceKeys.includes(storedFlowState?.activeWorkspace)
      ? storedFlowState.activeWorkspace
      : bootstrapScreen;
    if (workspaceKeys.includes(bootstrapScreen)) {
      activeWorkspace = bootstrapScreen;
    }

    if (bootstrapScreen === "loop") {
      renderLoopCoreScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "execution") {
      renderExecutionLiveScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "proof") {
      renderProofResultScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "artifact") {
      renderArtifactPreviewScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "confirmation") {
      renderConfirmationDecisionScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "state-update") {
      renderStateUpdateScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "next-task") {
      renderNextTaskScreenView(storedProjectSnapshot);
    } else if (bootstrapScreen === "timeline") {
      renderTimelineHistoryScreenView(storedProjectSnapshot);
    }

    return true;
  }

  function renderOnboardingNotes() {
    if (!elements.onboardingNotesList && !elements.onboardingUnderstoodList && !elements.onboardingMissingList) {
      return;
    }

    const memory = buildOnboardingWorkingMemory();
    const sections = [
      {
        title: "מה הובן",
        key: "understood",
        items: memory.understood,
      },
      {
        title: "מה עדיין חסר",
        key: "missing",
        items: memory.missing,
      },
      {
        title: "מה מתחדד עכשיו",
        key: "refining",
        items: memory.refining,
      },
    ];

    elements.onboardingNotesList.innerHTML = sections
      .map((section) => {
        const body = section.items.length
          ? section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")
          : `<p>כרגע אין עדכון חדש באזור הזה.</p>`;

        return `
          <section class="onboarding-memory-section ${escapeHtml(section.key)}">
            <strong>${escapeHtml(section.title)}</strong>
            <div class="onboarding-memory-body">
              ${body}
            </div>
          </section>
        `;
      })
      .join("");

    if (elements.onboardingUnderstoodList) {
      elements.onboardingUnderstoodList.innerHTML = (memory.understood.length ? memory.understood : ["עדיין אין מסקנות."])
        .map((item) => `<p>${escapeHtml(item)}</p>`)
        .join("");
    }

    if (elements.onboardingMissingList) {
      elements.onboardingMissingList.innerHTML = (memory.missing.length ? memory.missing : ["כרגע אין פערים פתוחים."])
        .map((item) => `<p>${escapeHtml(item)}</p>`)
        .join("");
    }
  }

  function renderAdaptiveOnboardingContract() {
    if (
      !elements.onboardingAdaptiveContractStatus
      && !elements.onboardingAdaptiveContractProjectType
      && !elements.onboardingAdaptiveContractPath
      && !elements.onboardingAdaptiveContractGate
      && !elements.onboardingAdaptiveContractBehaviors
      && !elements.onboardingAdaptiveContractProhibitions
    ) {
      return;
    }

    const viewModel = buildSmartOnboardingViewModel({
      currentProject,
      onboardingFlow,
      onboardingConversation,
    });
    const contract = normalizeObject(viewModel.adaptiveOnboardingAgentContract);

    if (elements.onboardingAdaptiveContractStatus) {
      elements.onboardingAdaptiveContractStatus.textContent = contract.statusLabel ?? "";
    }
    if (elements.onboardingAdaptiveContractProjectType) {
      elements.onboardingAdaptiveContractProjectType.textContent = contract.currentProjectTypeLabel ?? "";
    }
    if (elements.onboardingAdaptiveContractPath) {
      elements.onboardingAdaptiveContractPath.textContent = contract.currentQuestionPathLabel ?? "";
    }
    if (elements.onboardingAdaptiveContractGate) {
      elements.onboardingAdaptiveContractGate.textContent = `handoff: ${contract.handoffStatus ?? "needs-clarification"} · readiness: ${contract.readinessLevel ?? "blocked"}`;
    }
    if (elements.onboardingAdaptiveContractBehaviors) {
      const items = normalizeArray(contract.behaviors).length
        ? normalizeArray(contract.behaviors).map((item) => `${item.label} · ${item.status}`)
        : ["adaptive-intake behaviors are not yet exposed"];
      elements.onboardingAdaptiveContractBehaviors.innerHTML = items
        .map((item) => `<p>${escapeHtml(item)}</p>`)
        .join("");
    }
    if (elements.onboardingAdaptiveContractProhibitions) {
      const items = normalizeArray(contract.explicitProhibitions).length
        ? normalizeArray(contract.explicitProhibitions)
        : ["no explicit prohibitions are available yet."];
      elements.onboardingAdaptiveContractProhibitions.innerHTML = items
        .map((item) => `<p>${escapeHtml(item)}</p>`)
        .join("");
    }
  }

  function buildOnboardingCurrentPrompt() {
    const currentQuestion = onboardingConversation?.currentQuestion ?? null;
    const audience = getOnboardingAnswer("target-audience");
    const problem = getOnboardingAnswer("core-problem");

    if (!currentQuestion) {
      return {
        title: "השיחה הושלמה",
        body: onboardingConversation?.completionReason || "יש לנו תמונה ראשונית טובה. עכשיו אפשר להוסיף חומר תומך ידני לפני סיום onboarding.",
      };
    }

    if (currentQuestion.reason) {
      return {
        title: currentQuestion.title ?? "",
        body: currentQuestion.reason,
      };
    }

    if (currentQuestion.id === "core-problem" && audience) {
      return {
        title: "מעולה, עכשיו נחדד את הכאב המרכזי",
        body: `אם המערכת נבנית עבור ${audience}, מה הבעיה המרכזית שהם מתמודדים איתה?`,
      };
    }

    if (currentQuestion.id === "successful-solution" && audience && problem) {
      return {
        title: "יש לי כבר תמונה כמעט שלמה",
        body: `אז אנחנו מכוונים ל־${audience}, והכאב המרכזי הוא ${problem}. עכשיו נשאר לחדד איך נראה פתרון מוצלח מבחינתם.`,
      };
    }

    return {
      title: currentQuestion.title ?? "",
      body: currentQuestion.title ?? "",
    };
  }

  function focusOnboardingAnswerInput() {
    if (typeof elements.onboardingAnswerInput?.focus === "function" && !elements.onboardingAnswerInput.hidden) {
      elements.onboardingAnswerInput.focus();
    }
  }

  function resolveOnboardingDraftAnswer(currentQuestion) {
    if (!currentQuestion) {
      return "";
    }

    if (typeof onboardingConversation?.draftAnswer === "string" && onboardingConversation.draftAnswer.length > 0) {
      return onboardingConversation.draftAnswer;
    }

    return onboardingConversation?.answers?.[currentQuestion.id] ?? elements.onboardingAnswerInput?.value ?? "";
  }

  function resolveOnboardingComposerValue(currentQuestion) {
    if (!currentQuestion) {
      return "";
    }

    if (typeof onboardingConversation?.draftAnswer === "string" && onboardingConversation.draftAnswer.length > 0) {
      return onboardingConversation.draftAnswer;
    }

    return "";
  }

  function renderOnboardingConversation() {
    onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    const currentQuestion = onboardingConversation.currentQuestion ?? null;
    const hasActiveQuestion = Boolean(currentQuestion?.id);
    const isComplete = onboardingConversation.isComplete === true || hasActiveQuestion !== true;
    const currentPrompt = buildOnboardingCurrentPrompt();
    const isAwaitingAiReply = onboardingConversation.pendingAdvance === true;
    const totalQuestions = Math.max(
      Number(onboardingConversation.totalQuestions ?? ((onboardingConversation.currentIndex ?? 0) + (hasActiveQuestion ? 1 : 0))),
      (onboardingConversation.currentIndex ?? 0) + (hasActiveQuestion ? 1 : 0),
    );

    if (elements.onboardingProgressPill) {
      elements.onboardingProgressPill.textContent = isComplete
        ? "השיחה הושלמה"
        : `שאלה ${(onboardingConversation.currentIndex ?? 0) + 1} במסלול אדפטיבי · עד ${totalQuestions} צעדים כרגע`;
    }

    if (elements.onboardingChatThread) {
      elements.onboardingChatThread.innerHTML = normalizeArray(onboardingConversation.transcript)
        .map((entry) => {
          if (entry.speaker === "user") {
            return `
              <div class="onboarding-route-message-row user">
                <div class="onboarding-route-bubble user">
                  ${escapeHtml(entry.text)}
                  ${entry.time ? `<span class="onboarding-route-time">${escapeHtml(entry.time)}</span>` : ""}
                </div>
              </div>
            `;
          }

          return `
            <div class="onboarding-route-message-row ai">
              <div class="onboarding-route-bot-icon">♙</div>
              <div class="onboarding-route-bubble ai">
                ${entry.providerLabel ? `<span class="onboarding-route-provider-label">${escapeHtml(entry.providerLabel)}</span>` : ""}
                ${escapeHtml(entry.text)}
                ${entry.time ? `<span class="onboarding-route-time">${escapeHtml(entry.time)}</span>` : ""}
              </div>
            </div>
          `;
        })
        .join("");
    }

    if (elements.onboardingCurrentQuestionTitle) {
      elements.onboardingCurrentQuestionTitle.textContent = isAwaitingAiReply ? "ה־AI מגיב למה שכתבת" : currentPrompt.title;
    }
    if (elements.onboardingCurrentQuestionBody) {
      elements.onboardingCurrentQuestionBody.textContent = isAwaitingAiReply
        ? "עוד רגע מופיעה השאלה הבאה. אפשר להמשיך מיד כשהתגובה תעלה."
        : currentPrompt.body;
    }
    renderOnboardingProviderRuntime();
    renderAdaptiveOnboardingContract();
    if (elements.onboardingAnswerInput) {
      elements.onboardingAnswerInput.hidden = isComplete || isAwaitingAiReply;
      elements.onboardingAnswerInput.placeholder = currentQuestion?.placeholder ?? "";
      elements.onboardingAnswerInput.value = isComplete || isAwaitingAiReply
        ? ""
        : resolveOnboardingComposerValue(currentQuestion);
    }
    if (elements.onboardingNextButton) {
      elements.onboardingNextButton.hidden = isComplete || isAwaitingAiReply;
      elements.onboardingNextButton.disabled = isAwaitingAiReply;
      elements.onboardingNextButton.textContent = "המשך ←";
    }
    if (elements.onboardingBackButton) {
      elements.onboardingBackButton.textContent = currentProjectId ? "חזור למשטח העבודה" : "חזור ליצירת הפרויקט";
      elements.onboardingBackButton.disabled = isAwaitingAiReply;
    }
    if (elements.onboardingForwardButton) {
      elements.onboardingForwardButton.disabled = isAwaitingAiReply;
      elements.onboardingForwardButton.textContent = isComplete ? "לסיכום ההבנה" : "קדימה";
    }
    if (elements.onboardingMaterialStage) {
      elements.onboardingMaterialStage.hidden = true;
    }
    if (elements.onboardingFormStage) {
      elements.onboardingFormStage.hidden = true;
    }
    if (elements.finishOnboardingButton) {
      elements.finishOnboardingButton.hidden = true;
    }
    if (elements.understandingCorrectButton) {
      elements.understandingCorrectButton.disabled = isAwaitingAiReply;
    }
    if (elements.understandingContinueButton) {
      elements.understandingContinueButton.disabled = isAwaitingAiReply;
    }
    if (isComplete) {
      renderUnderstandingSummaryStage();
    }
    focusOnboardingAnswerInput();
  }

  function renderOnboardingProviderRuntime() {
    const providerRuntime = resolveOnboardingProviderRuntime();
    const selectedProvider = resolveOnboardingAgentProvider(providerRuntime.selectedProviderId);

    if (elements.onboardingProviderRuntimePill) {
      elements.onboardingProviderRuntimePill.textContent = selectedProvider.companyLabel;
    }
    if (elements.onboardingProviderRuntimeLabel) {
      elements.onboardingProviderRuntimeLabel.textContent = providerRuntime.selectedRuntimeLabel ?? selectedProvider.runtimeLabel;
    }
    if (elements.onboardingProviderRuleLine) {
      elements.onboardingProviderRuleLine.textContent = providerRuntime.enforcementLine
        ?? "אותם כללי Nexus נשארים פעילים גם כשמחליפים provider.";
    }
    if (elements.onboardingProviderSummaryLine) {
      elements.onboardingProviderSummaryLine.textContent = providerRuntime.summaryLine
        ?? `${selectedProvider.companyLabel} פעיל עכשיו למסלול ה־onboarding.`;
    }
    if (elements.onboardingProviderCanonicalRule) {
      elements.onboardingProviderCanonicalRule.textContent = `rules: ${providerRuntime.canonicalRuleLayer ?? "nexus-onboarding-rules-v1"} · mode: ${providerRuntime.runtimeMode ?? "provider-backed"}`;
    }
    if (elements.onboardingProviderSelect) {
      const availableProviders = normalizeArray(providerRuntime.availableProviders);
      if (availableProviders.length > 0 && !elements.onboardingProviderSelect.dataset.optionsBound) {
        elements.onboardingProviderSelect.innerHTML = availableProviders
          .map((provider) => `<option value="${escapeHtml(provider.providerId)}">${escapeHtml(provider.companyLabel)}</option>`)
          .join("");
        elements.onboardingProviderSelect.dataset.optionsBound = "true";
      }
      elements.onboardingProviderSelect.value = selectedProvider.providerId;
      elements.onboardingProviderSelect.disabled = onboardingConversation?.pendingAdvance === true;
    }
  }

  async function advanceOnboardingConversation() {
    onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    if (onboardingConversation.pendingAdvance) {
      return;
    }
    const currentQuestion = onboardingConversation.currentQuestion ?? null;
    if (!currentQuestion) {
      renderOnboardingConversation();
      return;
    }

    const answer = resolveOnboardingDraftAnswer(currentQuestion).trim();
    if (!answer) {
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = "כדי להתקדם בשיחה צריך לענות על השאלה הנוכחית.";
      }
      return;
    }

    onboardingConversation.answers[currentQuestion.id] = answer;
    onboardingConversation.pendingAnswer = answer;
    onboardingConversation.draftAnswer = "";
    onboardingConversation.pendingAdvance = true;

    if (elements.onboardingScreenStatus) {
      elements.onboardingScreenStatus.textContent = "ה־AI מעבד את מה שכתבת וממשיך את השיחה.";
    }

    renderOnboardingNotes();
    renderOnboardingConversation();
    persistFlowState("onboarding");

    try {
      if (onboardingConversation.mode === "repeated-loop-clarification") {
        onboardingConversation.pendingAdvance = false;
        onboardingConversation.pendingAnswer = "";
        onboardingConversation.isComplete = true;
        onboardingConversation.currentQuestion = null;
        onboardingConversation.summary = {
          understoodTitle: "מה נשמר עכשיו",
          understoodItems: [
            `נשמרה הבהרה שמחזקת את ${resolveRepeatedLoopContinuation(currentProject).artifactTitle ?? currentProject?.name ?? "התוצר שאושר"}`,
          ],
          missingTitle: "מה עוד חסר כדי לפתוח את הסבב הבא",
          missingItems: [
            "ההבהרה נשמרה רק במסלול הלייב של Wave 3. צריך עדיין חומר תומך מחובר runtime כדי לפתוח increment אמיתי בלי replay.",
          ],
        };
        onboardingConversation.transcript = [
          ...normalizeArray(onboardingConversation.transcript),
          {
            id: `user-clarification-${Date.now()}`,
            speaker: "user",
            text: answer,
            time: "10:32",
          },
          {
            id: `ai-clarification-${Date.now() + 1}`,
            speaker: "ai",
            text: "ההבהרה נשמרה. Nexus עצר כאן truthfully כדי לא למחזר את אותו artifact לפני שיש מספיק הקשר לסבב הבא.",
            time: "10:32",
          },
        ];
        if (elements.onboardingScreenStatus) {
          elements.onboardingScreenStatus.textContent = "ההבהרה נשמרה, והלופ נשאר מושהה truthfully עד שיחובר חומר תומך שפותח את הסבב הבא.";
        }
        renderOnboardingNotes();
        renderOnboardingConversation();
        persistFlowState("onboarding");
        return;
      }

      if (onboardingFlow?.sessionId) {
        await submitOnboardingConversationAnswerToBackend(answer);
      } else {
        if (onboardingConversation.advanceTimer) {
          clearTimeoutImpl(onboardingConversation.advanceTimer);
        }

        await new Promise((resolve) => {
          onboardingConversation.advanceTimer = setTimeoutImpl(resolve, 420);
        });

        onboardingConversation.pendingAdvance = false;
        onboardingConversation.pendingAnswer = "";
        const conversationOptions = buildOnboardingConversationOptions();
        const nextQuestionId = resolveLocalNextQuestionId(onboardingConversation.answers, conversationOptions);
        const nextPrompt = buildLocalOnboardingPromptForQuestion(
          nextQuestionId,
          onboardingConversation.answers,
          conversationOptions,
        );
        const nextQuestionPresentation = nextQuestionId
          ? resolveOnboardingQuestionPresentation(nextQuestionId, onboardingConversation.answers, conversationOptions)
          : null;
        onboardingConversation.currentIndex = Object.values(onboardingConversation.answers ?? {})
          .filter((value) => typeof value === "string" && value.trim())
          .length;
        onboardingConversation.isComplete = nextQuestionId === null;
        onboardingConversation.totalQuestions = Math.max(
          buildLocalAdaptiveQuestionPlan(onboardingConversation.answers, conversationOptions).length,
          onboardingConversation.currentIndex + (nextQuestionId ? 1 : 0),
        );
        onboardingConversation.currentQuestion = nextPrompt
          ? {
              id: nextQuestionId ?? null,
              title: nextQuestionPresentation.title || nextPrompt,
              placeholder: nextQuestionPresentation?.placeholder || "",
              reason: buildLocalOnboardingQuestionReason(
                nextQuestionId,
                onboardingConversation.answers,
                conversationOptions,
              ) || nextQuestionPresentation?.reason || "",
            }
          : null;
        onboardingConversation.completionReason = onboardingConversation.isComplete
          ? buildLocalOnboardingCompletionReason(onboardingConversation.answers, conversationOptions)
          : "";
        if (nextPrompt) {
          onboardingConversation.transcript = [
            ...normalizeArray(onboardingConversation.transcript),
            {
              id: `ai-${onboardingConversation.currentIndex + 1}`,
              speaker: "ai",
              text: nextPrompt,
              time: "10:32",
            },
          ];
        }
        onboardingConversation.summary = buildLocalOnboardingSummary(onboardingConversation.answers, conversationOptions);
      }

      onboardingConversation.pendingAdvance = false;
      onboardingConversation.pendingAnswer = "";
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = onboardingConversation.isComplete
          ? "השיחה הושלמה. עכשיו אפשר להוסיף חומר תומך ולסיים onboarding."
          : "מעולה. ה־AI עדכן את ההבנה שלו על הפרויקט וממשיך להוביל את השיחה.";
      }
      renderOnboardingNotes();
      renderOnboardingConversation();
      persistFlowState("onboarding");
    } catch (error) {
      onboardingConversation.pendingAdvance = false;
      onboardingConversation.pendingAnswer = "";
      onboardingConversation.draftAnswer = answer;
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = `לא הצלחנו לשלוח את התשובה כרגע. ${formatOnboardingRetryStatus(error)}`;
      }
      renderOnboardingConversation();
      persistFlowState("onboarding");
    }
  }

  function formatOnboardingBlockedStatus(finished = {}) {
    const completionDecision = normalizeObject(finished.onboardingCompletionDecision);
    const continuationGate = resolveOnboardingContinuationGate(finished);
    if (continuationGate.gateType) {
      return `${continuationGate.title}. ${continuationGate.detail ?? ""}`.trim();
    }
    const clarificationPrompts = normalizeArray(completionDecision.clarificationPrompts)
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim());
    const missingInputs = normalizeArray(completionDecision.missingInputs)
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim());

    if (clarificationPrompts.length > 0) {
      return `אי אפשר להמשיך עדיין. צריך להשלים קודם: ${clarificationPrompts.join(" | ")}`;
    }

    if (missingInputs.length > 0) {
      return `אי אפשר להמשיך עדיין כי חסרים שדות חובה: ${missingInputs.join(", ")}`;
    }

    return finished.error ?? "אי אפשר להמשיך עדיין כי חסר מידע שמספיק לבניית פרויקט אמיתי.";
  }

  function renderEmptyAppState({
    mode = "create",
    message = "אין פרויקטים",
    status = "כדי להתחיל צריך ליצור פרויקט ראשון ולעבור onboarding קצר.",
  } = {}) {
    clearFlowFeedback();
    const normalizedMode = mode === "onboarding" || mode === "settings" || mode === "help" ? mode : "create";
    if (normalizedMode === "create") {
      renderCreateScreenView(buildProjectCreateViewModel({ draftInputs: captureDraftInputs() }));
    }
    if (normalizedMode === "onboarding") {
      ensureOnboardingScreenView();
    }
    setAppScreen(normalizedMode);
    if (mode === "onboarding") {
      if (elements.onboardingScreenMessage) {
        elements.onboardingScreenMessage.textContent = message;
      }
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.hidden = false;
        elements.onboardingScreenStatus.textContent = status;
      }
    } else {
      if (elements.createScreenTitle) {
        elements.createScreenTitle.textContent = message;
      }
      if (elements.createScreenStatus) {
        elements.createScreenStatus.textContent = status;
      }
    }
    if (elements.createScreenTitle && mode !== "onboarding") {
      elements.createScreenTitle.textContent = message;
    }
    if (elements.createScreenStatus && mode !== "onboarding") {
      elements.createScreenStatus.textContent = status;
    }
    if (elements.emptyAppState) {
      elements.emptyAppState.dataset.mode = normalizedMode;
    }
    if (elements.projectCreateStage) {
      elements.projectCreateStage.hidden = mode !== "create";
    }
    if (mode === "onboarding") {
      onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
      if (elements.onboardingStageTitle) {
        elements.onboardingStageTitle.textContent = "עכשיו מחדדים את הפרויקט עם onboarding";
      }
      if (elements.onboardingStageDescription) {
        elements.onboardingStageDescription.textContent =
          "זה שלב נפרד מיצירת הפרויקט הראשונית. כאן מבהירים למערכת מה אתה בונה, למה זה חשוב, ואיזה חומרים תומכים כבר יש.";
      }
      if (elements.onboardingNotesList) {
        renderOnboardingNotes();
      }
      renderOnboardingConversation();
    }
    setFlowButtonState({
      target: "create",
      disabled: false,
      label: "צור פרויקט והתחל",
    });
    setFlowButtonState({
      target: "finish",
      disabled: false,
      label: "סיים Onboarding",
    });
    if (elements.heroProjectName && !currentProject) {
      elements.heroProjectName.textContent = "אין פרויקטים";
    }
    if (elements.heroGoal && !currentProject) {
      elements.heroGoal.textContent =
        mode === "onboarding"
          ? "השלב הבא הוא להשלים onboarding ורק אז לפתוח את ה־workspace."
          : mode === "create"
            ? "צריך ליצור פרויקט ראשון כדי להיכנס ל־workspace."
            : status;
    }
    if (elements.now && !currentProject) {
      elements.now.innerHTML = `<p class="empty">אין פרויקטים פעילים כרגע.</p>`;
    }
    if (elements.critical && !currentProject) {
      elements.critical.innerHTML = `<p class="empty">הפעולה הבאה היא ליצור פרויקט ראשון.</p>`;
    }
    persistFlowState(normalizedMode);
  }

  async function ensureAppUser() {
    const stored = readStoredAppUser();
    if (stored?.email) {
      if (!stored.userId) {
        clearStoredAppUser();
      } else {
        try {
          await fetchJson("/api/projects");
          return stored;
        } catch (error) {
          if (error?.message === "Request failed: 401" || error?.message === "Request failed: 403") {
            clearStoredAppUser();
          } else {
            throw error;
          }
        }
      }
    }

    const email = `local-operator-${Date.now()}@nexus.local`;
    const password = `nexus-${Math.random().toString(36).slice(2, 10)}`;
    const signup = await fetchJson("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: {
          email,
          displayName: "Local operator",
        },
        credentials: {
          password,
        },
      }),
    });
    const appUser = {
      email,
      password,
      userId: signup.authPayload?.userIdentity?.userId ?? null,
      displayName: signup.authPayload?.userIdentity?.displayName ?? "Local operator",
    };
    writeStoredAppUser(appUser);
    return appUser;
  }

  async function createFirstProjectFlow() {
    const projectName = readCurrentCreateFieldValue("create-project-name-input").trim();
    const visionText = readCurrentCreateFieldValue("create-project-vision-input").trim();
    if (!projectName || !visionText) {
      renderEmptyAppState({
        mode: "create",
        message: "אין פרויקטים",
        status: "צריך להזין שם פרויקט ותיאור קצר לפני היצירה.",
      });
      return;
    }

    let appUser = await ensureAppUser();
    let draftResult = null;

    currentProjectId = null;
    currentProject = null;
    activeWorkspace = "create";

    try {
      draftResult = await fetchJson("/api/project-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            email: appUser.email,
          },
          projectCreationInput: {
            projectName,
            visionText,
          },
        }),
      });
    } catch {
      clearStoredAppUser();
      appUser = await ensureAppUser();
      draftResult = await fetchJson("/api/project-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            email: appUser.email,
          },
          projectCreationInput: {
            projectName,
            visionText,
          },
        }),
      });
    }

    const session = await fetchJson("/api/onboarding/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: appUser.userId,
        projectDraftId: draftResult.projectDraftId,
        initialInput: {
          projectName,
          visionText,
          providerChoice: resolveSelectedOnboardingProviderId(),
          learningContext: isQaModeEnabled()
            ? {
                learningDecisionImpact: ensureQaProjectPreviewState().learningDecisionImpact ?? null,
                generationIntent: ensureQaProjectPreviewState().generationIntent ?? null,
              }
            : null,
        },
      }),
    });

    onboardingFlow = {
      mode: draftResult.projectCreationRedirect?.target === "onboarding" ? "onboarding" : "create",
      sessionId: session.onboardingSession?.sessionId ?? null,
      projectDraftId: draftResult.projectDraftId,
      projectName,
      visionText,
      supportingLink: elements.createProjectLinkInput?.value?.trim() ?? "",
      selectedProviderId: session.onboardingSession?.providerRuntime?.selectedProviderId ?? resolveSelectedOnboardingProviderId(),
      providerRuntime: session.onboardingSession?.providerRuntime ?? createOnboardingProviderRuntime({
        selectedProviderId: resolveSelectedOnboardingProviderId(),
        sessionId: session.onboardingSession?.sessionId ?? null,
      }),
    };
    try {
      await syncOnboardingIntakeToSession({
        sessionId: onboardingFlow.sessionId,
      });
    } catch {
      // Let onboarding continue even if the first canonical intake sync fails.
    }
    try {
      await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
    } catch {
      onboardingConversation = createOnboardingConversationState();
    }

    renderEmptyAppState({
      mode: "onboarding",
      message: "עברנו ל־onboarding של הפרויקט",
      status: "זה שלב נפרד מיצירת הפרויקט. עכשיו מוסיפים הקשר וחומר תומך לפני פתיחת משטח העבודה.",
    });
    persistFlowState("onboarding");
  }

  async function finishFirstProjectOnboarding() {
    if (!onboardingFlow?.sessionId) {
      if (currentProjectId) {
        await loadProject(currentProjectId, {
          title: "חזרת למשטח העבודה שלך",
          message: "מסך ה־Onboarding נפתח במצב בדיקה מתוך משטח העבודה, אז החזרנו אותך לאותו פרויקט בלי לפתוח זרימה חדשה.",
        });
        return;
      }

      renderEmptyAppState({
        mode: "onboarding",
        message: "אי אפשר לסיים onboarding עדיין",
        status: "אין כרגע session פעיל ל־onboarding, ולכן אי אפשר לבנות משטח עבודה חדש מהשלב הזה.",
      });
      return;
    }

    try {
      await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
    } catch {
      // Keep the current local conversation if the refresh fails; the finish path
      // still needs to surface the live blocker truthfully.
    }

    if (onboardingConversation?.isComplete !== true) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: "לפני שסוגרים את השלב הזה Nexus חייבת להגיע ל־readiness אמיתי ולא רק לספור שאלות.",
      });
      return;
    }

    const projectName = elements.createProjectNameInput?.value?.trim() || onboardingFlow?.projectName?.trim?.() || "";
    const visionText = elements.createProjectVisionInput?.value?.trim() || onboardingFlow?.visionText?.trim?.() || "";
    const supportingLink = elements.createProjectLinkInput?.value?.trim()
      || onboardingFlow?.supportingLink?.trim?.()
      || "";
    const uploadedFiles = buildOnboardingUploadedFiles();

    if (!projectName || !visionText) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: "כדי לסיים onboarding צריך שם פרויקט ותיאור ברור של מה שאתה רוצה לבנות.",
      });
      return;
    }

    setFlowButtonState({
      target: "finish",
      disabled: true,
      label: "מסיים Onboarding...",
    });
    renderEmptyAppState({
      mode: "onboarding",
      message: "מסיימים onboarding",
      status: "הבקשה נשלחה. בודק readiness, משלים intake וטוען את משטח העבודה ברגע שהפרויקט מוכן.",
    });
    setFlowButtonState({
      target: "finish",
      disabled: true,
      label: "מסיים Onboarding...",
    });

    try {
      await syncOnboardingIntakeToSession({
        sessionId: onboardingFlow.sessionId,
        projectName,
        visionText,
        supportingLink,
        uploadedFiles,
      });

      try {
        await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
      } catch {
        // If the backend conversation refresh fails here, let the finish request
        // surface the blocker from the authoritative session state.
      }

      const finished = await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/finish`, {
        method: "POST",
      });
      const continuationPreview = !finished.project?.id && shouldUseOnboardingContinuationPreview(finished)
        ? buildOnboardingContinuationPreviewProject({
            projectName,
            visionText,
            finished,
          })
        : null;

      if (finished.project?.id) {
        activeWorkspace = "loop";
        onboardingFlow = null;
        onboardingConversation = null;
        const loadedProject = await loadProject(finished.project.id, {
          ...buildOnboardingContinuationFeedback({
            projectName,
            answers: onboardingConversation?.answers ?? {},
            finished,
          }),
        });
        renderLoopCoreScreenView(loadedProject);
        renderShellChrome("workspace", activeWorkspace);
        syncBrowserShellRoute("loop");
        scrollViewportToTop();
        persistFlowState("loop");
        return;
      }

      if (continuationPreview) {
        currentProjectId = null;
        currentProject = continuationPreview;
        activeWorkspace = "loop";
        showFlowFeedback(
          buildOnboardingContinuationFeedback({
            projectName,
            answers: onboardingConversation?.answers ?? {},
            finished: {
              ...finished,
              onboardingStateHandoff: continuationPreview.onboardingStateHandoff,
              onboardingCompletionDecision: continuationPreview.onboardingCompletionDecision,
            },
            previewOnly: true,
          }),
        );
        renderLoopCoreScreenView(continuationPreview);
        renderShellChrome("loop", activeWorkspace);
        syncBrowserShellRoute("loop");
        scrollViewportToTop();
        persistFlowState("loop");
        return;
      }

      if (finished.blocked || !finished.project?.id) {
        renderEmptyAppState({
          mode: "onboarding",
          message: "Onboarding דורש השלמה",
          status: formatOnboardingBlockedStatus(finished),
        });
        return;
      }
    } catch (error) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "סיום onboarding נכשל",
        status: `לא הצלחנו לסיים onboarding כרגע. ${formatOnboardingRetryStatus(error, "נסה שוב בעוד רגע או השלם את שדות החובה.")}`,
      });
    }
  }

  async function executeCurrentLoopTask() {
    if (!currentProjectId) {
      return;
    }

    const previousProject = currentProject;
    await fetchJson(`/api/projects/${currentProjectId}/run-cycle`, { method: "POST" });
    const nextProject = await fetchJson(`/api/projects/${currentProjectId}`);
    activeWorkspace = "execution";
    const refreshedProject = await loadProject(currentProjectId, {
      ...buildRunCycleFeedback(previousProject, nextProject),
      pulseWorkspace: true,
    }, nextProject);
    currentProject = refreshedProject;
  }

  async function correctOnboardingUnderstanding() {
    if (elements.onboardingScreenStatus) {
      elements.onboardingScreenStatus.hidden = false;
      elements.onboardingScreenStatus.textContent = "מחזיר את השיחה לעריכה כדי לדייק את ההבנה לפני שממשיכים.";
    }

    try {
      await restartOnboardingConversationFromBackend();
    } catch {
      onboardingConversation = createOnboardingConversationState();
    }

    renderOnboardingNotes();
    renderOnboardingConversation();
    setAppScreen("onboarding");
    renderShellChrome("onboarding", activeWorkspace);
    scrollViewportToTop();
    persistFlowState("onboarding");
  }

  async function submitProposalEditsFromUi() {
    const state = normalizeObject(currentProject?.state);
    const editableProposal = normalizeObject(currentProject?.editableProposal ?? state.editableProposal);
    const editedProposal = normalizeObject(currentProject?.editedProposal ?? state.editedProposal);
    if (!currentProjectId || !editableProposal.proposalId) {
      return;
    }

    const activeProposal = normalizeObject(
      editedProposal.revisionId ? editedProposal : editableProposal,
    );
    const firstSection = normalizeObject(normalizeArray(activeProposal.sections)[0]);
    const revisionNumber = Number(editedProposal.revisionNumber ?? 1) + 1;
    const annotationNote = elements.proposalAnnotationInput?.value?.trim() ?? "";
    const userEditInput = {
      revisionNumber,
      sectionEdits: firstSection.sectionId
        ? [
            {
              sectionId: firstSection.sectionId,
              label: elements.proposalSectionTitleInput?.value?.trim() || firstSection.label,
              contentSummary: elements.proposalSectionSummaryInput?.value?.trim() || firstSection.contentSummary,
            },
          ]
        : [],
      nextActionEdit: {
        label: elements.proposalNextActionLabelInput?.value?.trim() || activeProposal.nextAction?.label || "Review proposal",
      },
    };

    if (annotationNote) {
      userEditInput.annotations = [
        {
          targetType: "section",
          targetId: firstSection.sectionId ?? "overview",
          note: annotationNote,
          severity: "warning",
        },
      ];
    }

    await fetchJson(`/api/projects/${currentProjectId}/proposal-edits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEditInput }),
    });
    activeWorkspace = "release";
    await loadProject(currentProjectId);
    if (elements.proposalAnnotationInput) {
      elements.proposalAnnotationInput.value = "";
    }
  }

  async function submitPartialAcceptanceFromUi() {
    const state = normalizeObject(currentProject?.state);
    const editableProposal = normalizeObject(currentProject?.editableProposal ?? state.editableProposal);
    const editedProposal = normalizeObject(currentProject?.editedProposal ?? state.editedProposal);
    if (!currentProjectId || !editableProposal.proposalId) {
      return;
    }

    const activeProposal = normalizeObject(
      editedProposal.revisionId ? editedProposal : editableProposal,
    );
    const firstSection = normalizeObject(normalizeArray(activeProposal.sections)[0]);
    const firstComponent = normalizeObject(normalizeArray(activeProposal.components)[0]);
    const firstCopy = normalizeObject(normalizeArray(activeProposal.copy)[0]);
    const note = elements.partialAcceptanceNoteInput?.value?.trim() ?? "";
    const approvalOutcome = {
      sectionOutcomes: firstSection.sectionId
        ? [
            {
              sectionId: firstSection.sectionId,
              decision: elements.partialSectionDecisionSelect?.value ?? "approved",
              note,
            },
          ]
        : [],
      componentOutcomes: firstComponent.componentId
        ? [
            {
              componentId: firstComponent.componentId,
              decision: elements.partialComponentDecisionSelect?.value ?? "rejected",
              note,
            },
          ]
        : [],
      copyOutcomes: firstCopy.copyId
        ? [
            {
              copyId: firstCopy.copyId,
              decision: elements.partialCopyDecisionSelect?.value ?? "approved",
              note,
            },
          ]
        : [],
    };

    await fetchJson(`/api/projects/${currentProjectId}/partial-acceptance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalOutcome }),
    });
    activeWorkspace = "release";
    await loadProject(currentProjectId);
    if (elements.partialAcceptanceNoteInput) {
      elements.partialAcceptanceNoteInput.value = "";
    }
  }

  async function executeRollbackFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/rollback-executions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await loadProject(currentProjectId);
  }

  async function saveSnapshotScheduleFromUi() {
    if (!currentProjectId) {
      return;
    }

    const intervalSeconds = Number(elements.snapshotIntervalInput?.value ?? 300);
    const preChangeTriggers = (elements.snapshotTriggersInput?.value ?? "bootstrap,migration,deploy")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleInput: {
          enabled: true,
          intervalSeconds: Number.isFinite(intervalSeconds) ? intervalSeconds : 300,
          preChangeTriggers,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  async function runSnapshotBackupFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backups/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function saveSnapshotRetentionFromUi() {
    if (!currentProjectId) {
      return;
    }

    const maxSnapshots = Number(elements.snapshotMaxInput?.value ?? 20);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-retention-policy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retentionInput: {
          enabled: true,
          maxSnapshots: Number.isFinite(maxSnapshots) ? maxSnapshots : 20,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  async function runSnapshotCleanupFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-retention-cleanup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual-cleanup",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function toggleSnapshotWorkerFromUi() {
    if (!currentProjectId) {
      return;
    }

    const currentWorker = normalizeObject(currentProject?.snapshotBackupWorker ?? currentProject?.state?.snapshotBackupWorker);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerInput: {
          enabled: !currentWorker.enabled,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

async function runSnapshotWorkerTickFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-worker/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual-worker-run",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function refreshDisasterRecoveryChecklistFromUi() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/disaster-recovery-checklist?refresh=1`);
    const refreshedProject = payload?.project ?? null;
    if (refreshedProject && typeof refreshedProject === "object") {
      currentProject = refreshedProject;
      renderProject(elements, currentProject);
      return;
    }

    await loadProject(currentProjectId);
  }

  async function refreshBusinessContinuityFromUi() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/business-continuity?refresh=1`);
    const refreshedProject = payload?.project ?? null;
    if (refreshedProject && typeof refreshedProject === "object") {
      currentProject = refreshedProject;
      renderProject(elements, currentProject);
      return;
    }

    await loadProject(currentProjectId);
  }

  async function applyBusinessContinuityActionFromUi() {
    if (!currentProjectId) {
      return;
    }

    const actionType = elements.continuityActionSelect?.value ?? "trigger-continuity-health-check";
    await fetchJson(`/api/projects/${currentProjectId}/business-continuity/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionInput: {
          actionType,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  function mergeLiveState(liveState) {
    if (!currentProject) {
      return;
    }

    currentProject = {
      ...currentProject,
      progressState: liveState.progressState ?? currentProject.progressState,
      reactiveWorkspaceState: liveState.reactiveWorkspaceState ?? currentProject.reactiveWorkspaceState,
      realtimeEventStream: liveState.realtimeEventStream ?? currentProject.realtimeEventStream,
      liveUpdateChannel: liveState.liveUpdateChannel ?? currentProject.liveUpdateChannel,
      liveLogStream: liveState.liveLogStream ?? currentProject.liveLogStream,
      formattedLogs: liveState.formattedLogs ?? currentProject.formattedLogs,
      commandConsoleView: liveState.commandConsoleView ?? currentProject.commandConsoleView,
      projectPresenceState: liveState.projectPresenceState ?? currentProject.projectPresenceState,
      reviewThreadState: liveState.reviewThreadState ?? currentProject.reviewThreadState,
      collaborationFeed: liveState.collaborationFeed ?? currentProject.collaborationFeed,
      continuityPlan: liveState.continuityPlan ?? currentProject.continuityPlan,
      businessContinuityState: liveState.businessContinuityState ?? currentProject.businessContinuityState,
      events: liveState.events ?? currentProject.events,
    };
    renderLive(elements, currentProject);
    renderCollaboration(elements, currentProject);
    renderEvents(elements, currentProject);
  }

  async function refreshLiveState() {
    if (!currentProjectId) {
      return;
    }

    try {
      const liveState = await fetchJson(`/api/projects/${currentProjectId}/live-state`);
      mergeLiveState(liveState);
    } finally {
      scheduleLiveRefresh();
    }
  }

  async function updatePresence() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: presenceParticipantId,
        sessionId: presenceParticipantId,
        userId: presenceParticipantId,
        displayName: "Local operator",
        role: "owner",
        status: "active",
        workspaceArea: `${activeWorkspace}-workspace`,
        currentSurface: `${activeWorkspace}-workspace`,
        currentTask: currentProject?.progressState?.status ?? null,
      }),
    });
  }

  function closeLiveUpdates() {
    if (refreshTimer) {
      clearTimeoutImpl(refreshTimer);
      refreshTimer = null;
    }

    if (liveEventSource && typeof liveEventSource.close === "function") {
      liveEventSource.close();
    }

    liveEventSource = null;
  }

  function resolveRefreshDelay(channel) {
    const normalizedChannel = normalizeObject(channel);
    const reconnectPolicy = normalizeObject(normalizedChannel.reconnectPolicy);
    const mode = normalizedChannel.transportMode ?? "polling";

    if (mode === "sse") {
      return reconnectPolicy.initialDelayMs ?? 1500;
    }

    return reconnectPolicy.initialDelayMs ?? 5000;
  }

  function scheduleLiveRefresh() {
    if (refreshTimer) {
      clearTimeoutImpl(refreshTimer);
      refreshTimer = null;
    }

    if (!currentProjectId || !currentProject) {
      return;
    }

    const channel = normalizeObject(currentProject.liveUpdateChannel);
    const delay = resolveRefreshDelay(channel);
    refreshTimer = setTimeoutImpl(() => {
      refreshLiveState().catch((error) => {
        elements.events.innerHTML = `<p class="empty">Live refresh failed: ${escapeHtml(error.message)}</p>`;
        scheduleLiveRefresh();
      });
    }, delay);
  }

  function resolveLiveEndpoint(projectId, channel) {
    const normalizedChannel = normalizeObject(channel);
    return normalizedChannel.deliveryEndpoint ?? `/api/projects/${projectId}/live-events`;
  }

  function connectLiveUpdates() {
    closeLiveUpdates();

    if (!currentProjectId || !currentProject) {
      return;
    }

    const channel = normalizeObject(currentProject.liveUpdateChannel);
    const serverTransport = channel.serverTransport ?? (channel.transportMode === "polling" ? "polling" : "sse");
    if (serverTransport === "polling" || typeof EventSourceImpl !== "function") {
      scheduleLiveRefresh();
      return;
    }

    const eventSource = new EventSourceImpl(resolveLiveEndpoint(currentProjectId, channel));
    liveEventSource = eventSource;

    eventSource.onmessage = (event) => {
      try {
        mergeLiveState(JSON.parse(event.data));
      } catch (error) {
        elements.events.innerHTML = `<p class="empty">Live stream parse failed: ${escapeHtml(error.message)}</p>`;
      }
    };
    eventSource.addEventListener?.("live-state", (event) => {
      try {
        mergeLiveState(JSON.parse(event.data));
      } catch (error) {
        elements.events.innerHTML = `<p class="empty">Live stream parse failed: ${escapeHtml(error.message)}</p>`;
      }
    });
    eventSource.onerror = () => {
      if (liveEventSource === eventSource) {
        eventSource.close?.();
        liveEventSource = null;
        scheduleLiveRefresh();
      }
    };
  }

  async function loadProjects() {
    await ensureAppUser();
    const storedFlowState = readStoredFlowState();
    const storedProjectSnapshot = normalizeObject(storedFlowState?.currentProjectSnapshot);
    const storedProjectAuditPayload = normalizeObject(storedFlowState?.currentProjectAuditPayload);
    const requestedRouteKey = resolveShellRouteKeyFromPath(globalThis.location?.pathname ?? "/");
    const storedWorkspaceProjectId = storedFlowState?.currentProjectId
      ?? storedProjectSnapshot.id
      ?? storedFlowState?.onboardingConversation?.projectId
      ?? null;
    let projects = [];
    let projectListLoaded = false;

    try {
      const payload = await fetchJson("/api/projects");
      projects = normalizeArray(payload.projects);
      projectListLoaded = true;
    } catch (error) {
      if (storedProjectSnapshot.id) {
        projects = [storedProjectSnapshot];
      } else {
        throw error;
      }
    }

    cachedProjects = projects;
    if (elements.projectSelect) {
      elements.projectSelect.innerHTML = projects
        .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}${projectListLoaded !== true && project.id === storedProjectSnapshot.id ? " (restore)" : ""}</option>`)
        .join("");
    }

    if (storedFlowState?.activeWorkspace) {
      activeWorkspace = workspaceKeys.includes(storedFlowState.activeWorkspace)
        ? storedFlowState.activeWorkspace
        : activeWorkspace;
    } else if (workspaceKeys.includes(storedFlowState?.screen)) {
      activeWorkspace = storedFlowState.screen;
    } else if (storedFlowState?.screen === "workspace") {
      activeWorkspace = "loop";
    }

    if (workspaceKeys.includes(requestedRouteKey)) {
      activeWorkspace = requestedRouteKey;
    }

    if (storedFlowState?.draftInputs) {
      applyDraftInputs(storedFlowState.draftInputs);
    }

    if (storedFlowState?.onboardingFlow && typeof storedFlowState.onboardingFlow === "object") {
      onboardingFlow = storedFlowState.onboardingFlow;
    }

    if (storedFlowState?.onboardingConversation && typeof storedFlowState.onboardingConversation === "object") {
      onboardingConversation = storedFlowState.onboardingConversation.currentQuestion || storedFlowState.onboardingConversation.summary
        ? refreshOnboardingConversationPresentation(storedFlowState.onboardingConversation, buildOnboardingConversationOptions({
          visionTextOverride: storedFlowState?.onboardingFlow?.visionText?.trim?.() ?? currentProject?.goal ?? "",
        }))
        : createOnboardingConversationState();
    }

    if (
      requestedRouteKey
      && requestedRouteKey !== "create"
      && requestedRouteKey !== "home"
      && requestedRouteKey !== "files"
      && requestedRouteKey !== "settings"
      && requestedRouteKey !== "help"
      && !canTruthfullyRestoreDirectRoute(requestedRouteKey, storedFlowState)
    ) {
      renderBlockedRouteFallback(requestedRouteKey);
      return projects;
    }

    if (storedFlowState?.screen === "home") {
      currentProjectId = storedFlowState.currentProjectId ?? storedProjectSnapshot.id ?? null;
      currentProject = null;
      if (currentProjectId) {
        try {
          currentProject = await fetchJson(`/api/projects/${currentProjectId}`);
        } catch {
          currentProject = storedProjectSnapshot.id ? storedProjectSnapshot : null;
        }
      } else if (storedProjectSnapshot.id) {
        currentProject = storedProjectSnapshot;
      }
      renderHomeSupportScreenView(cachedProjects);
    } else if (storedFlowState?.screen === "files") {
      currentProjectId = storedFlowState.currentProjectId ?? null;
      currentProject = null;
      if (currentProjectId) {
        try {
          currentProject = await fetchJson(`/api/projects/${currentProjectId}`);
        } catch {
          currentProject = null;
        }
      }
      renderFilesSupportScreenView();
    } else if ((storedFlowState?.screen === "workspace" || storedFlowState?.screen === "loop" || storedFlowState?.screen === "execution" || storedFlowState?.screen === "proof" || storedFlowState?.screen === "artifact" || storedFlowState?.screen === "confirmation" || storedFlowState?.screen === "state-update" || storedFlowState?.screen === "next-task" || storedFlowState?.screen === "timeline") && storedWorkspaceProjectId) {
      if (storedProjectAuditPayload && Object.keys(storedProjectAuditPayload).length > 0) {
        currentProjectAuditPayload = storedProjectAuditPayload;
      }
      try {
        await loadProject(storedWorkspaceProjectId);
      } catch {
        await loadProject(storedWorkspaceProjectId, null, storedProjectSnapshot.id ? storedProjectSnapshot : null);
      }
    } else if (storedFlowState?.screen === "understanding") {
      currentProjectId = storedFlowState.currentProjectId ?? null;
      currentProject = null;
      if (currentProjectId) {
        try {
          currentProject = await fetchJson(`/api/projects/${currentProjectId}`);
        } catch {
          currentProject = null;
        }
      }
      openUnderstandingPreviewScreen();
    } else if (storedFlowState?.screen === "loop") {
      openLoopPreviewScreen();
    } else if (storedFlowState?.screen === "execution") {
      openExecutionPreviewScreen();
    } else if (storedFlowState?.screen === "proof") {
      openProofPreviewScreen();
    } else if (storedFlowState?.screen === "artifact") {
      renderArtifactPreviewScreenView(null, { qaMode: true });
    } else if (storedFlowState?.screen === "confirmation") {
      openConfirmationPreviewScreen();
    } else if (storedFlowState?.screen === "state-update") {
      openStateUpdatePreviewScreen();
    } else if (storedFlowState?.screen === "next-task") {
      openNextTaskPreviewScreen();
    } else if (storedFlowState?.screen === "timeline") {
      openTimelinePreviewScreen();
    } else if (storedFlowState?.screen === "onboarding") {
      let onboardingSessionMissing = false;
      if (onboardingFlow?.sessionId) {
        try {
          await syncOnboardingConversationFromBackend(onboardingFlow.sessionId);
        } catch (error) {
          if (error?.message === "Request failed: 404") {
            onboardingSessionMissing = true;
          } else {
            throw error;
          }
        }
      }

      if (onboardingSessionMissing) {
        currentProjectId = null;
        currentProject = null;
        currentProjectAuditPayload = null;
        onboardingFlow = null;
        onboardingConversation = createOnboardingConversationState();
        renderBlockedRouteFallback("onboarding", {
          title: "ה־Onboarding הקודם כבר לא זמין",
          body: "שמרנו את פרטי הטיוטה שמילאת, אבל ה־session הקודם כבר לא קיים בשרת ולכן אי אפשר לשחזר את /onboarding truthfully מתוך השרת החי.",
        });
        return projects;
      }

      currentProjectId = storedFlowState.currentProjectId
        ?? storedFlowState?.onboardingConversation?.projectId
        ?? storedProjectSnapshot.id
        ?? null;
      currentProject = storedProjectSnapshot.id ? storedProjectSnapshot : null;
      if (!currentProject && currentProjectId) {
        currentProject = normalizeArray(cachedProjects).find((project) => project?.id === currentProjectId) ?? null;
      }
      if (!currentProject && currentProjectId) {
        try {
          currentProject = await fetchJson(`/api/projects/${currentProjectId}`);
        } catch {
          currentProject = null;
        }
      }
      if (!currentProject && storedProjectSnapshot.id) {
        currentProject = storedProjectSnapshot;
      }
      if (!currentProjectId && currentProject?.id) {
        currentProjectId = currentProject.id;
      }
      if (storedProjectAuditPayload && Object.keys(storedProjectAuditPayload).length > 0) {
        currentProjectAuditPayload = storedProjectAuditPayload;
      }
      if (currentProjectId && currentProject) {
        reopenOnboardingFromWorkspace();
      } else {
        renderBlockedRouteFallback("onboarding", {
          title: "אי אפשר לשחזר את ה־Onboarding כרגע",
          body: "ה־URL חזר ל־/onboarding אבל אין כרגע project/session חי שמאפשר להמשיך את המסלול הזה בלי ליפול למסך יצירה כללי.",
        });
      }
    } else if (requestedRouteKey === "create" || storedFlowState?.screen === "create") {
      currentProjectId = null;
      currentProject = null;
      renderEmptyAppState({
        mode: "create",
        message: "מה אתה רוצה לבנות?",
        status: "המשכנו בדיוק מהמקום שבו היית לפני הרענון.",
      });
    } else if (projects?.[0]) {
      await loadProject(projects[0].id);
    } else {
      currentProjectId = null;
      currentProject = null;
      renderEmptyAppState();
    }

    if ((requestedRouteKey === "home" || requestedRouteKey === "files") && storedWorkspaceProjectId) {
      await hydrateStoredProjectContextForSupportRoute({
        storedWorkspaceProjectId,
        storedProjectSnapshot,
        projects: cachedProjects,
      });
    }

    applyRequestedShellRouteFromLocation({ replace: true });

    return projects;
  }

  elements.projectSelect?.addEventListener("change", async (event) => {
    await loadProject(event.target.value);
  });

  elements.createNewProjectButton?.addEventListener("click", () => {
    enterCreateProjectScreen();
  });

  for (const routeButton of [
    elements.navCreateButton,
    elements.navOnboardingButton,
    elements.navLoopButton,
    elements.navTimelineButton,
    elements.navDeveloperButton,
    elements.navProjectBrainButton,
    elements.navReleaseButton,
    elements.navGrowthButton,
    elements.navSettingsButton,
    elements.navHelpButton,
    elements.topbarProfileButton,
    elements.flowStepCreateButton,
    elements.flowStepOnboardingButton,
    elements.flowStepUnderstandingButton,
    elements.flowStepLoopButton,
  ]) {
    routeButton?.addEventListener("click", (event) => {
      const target = event.currentTarget?.dataset?.shellTarget;
      if (target) {
        openShellRoute(target);
      }
    });
  }

  for (const qaButton of [
    elements.qaScreenCreateButton,
    elements.qaScreenOnboardingButton,
    elements.qaScreenUnderstandingButton,
    elements.qaScreenLoopButton,
    elements.qaScreenExecutionButton,
    elements.qaScreenProofButton,
  ]) {
    qaButton?.addEventListener("click", (event) => {
      const target = resolveQaTargetFromButton(event.currentTarget);
      if (target) {
        openQaScreen(target);
      }
    });
  }

  if (typeof doc.addEventListener === "function") {
    doc.addEventListener("click", async (event) => {
      const settingsTabButton = event.target?.closest?.("[data-settings-tab]");
      if (settingsTabButton && doc?.body?.dataset?.appScreen === "settings") {
        event.preventDefault?.();
        currentSettingsPanel = settingsTabButton.dataset?.settingsTab?.trim() || "profile";
        await renderSettingsScreenView(currentSettingsProfileSurface);
        return;
      }

      const settingsSaveButton = event.target?.closest?.("#settings-save-button");
      if (settingsSaveButton && doc?.body?.dataset?.appScreen === "settings") {
        event.preventDefault?.();
        await saveSettingsProfileSurface();
        return;
      }

      const settingsCancelButton = event.target?.closest?.("#settings-cancel-button");
      if (settingsCancelButton && doc?.body?.dataset?.appScreen === "settings") {
        event.preventDefault?.();
        currentSettingsFlashMessage = "";
        currentSettingsErrorMessage = "";
        currentSettingsSavingState = "idle";
        await renderSettingsScreenView(currentSettingsProfileSurface);
        return;
      }

      const settingsToggleButton = event.target?.closest?.(
        "#settings-email-toggle, #settings-email-toggle-clone, #settings-inapp-toggle, #settings-inapp-toggle-clone",
      );
      if (settingsToggleButton && doc?.body?.dataset?.appScreen === "settings") {
        event.preventDefault?.();
        const nextEnabled = settingsToggleButton.dataset.enabled !== "true";
        const enabledValue = nextEnabled ? "true" : "false";
        const pressedValue = nextEnabled ? "true" : "false";
        const toggleKind = settingsToggleButton.id.includes("email") ? "email" : "inapp";
        for (const toggleCandidate of [
          elements.settingsEmailToggle,
          elements.settingsEmailToggleClone,
          elements.settingsInAppToggle,
          elements.settingsInAppToggleClone,
        ]) {
          if (!toggleCandidate) {
            continue;
          }
          const candidateKind = toggleCandidate.id.includes("email") ? "email" : "inapp";
          if (candidateKind !== toggleKind) {
            continue;
          }
          toggleCandidate.dataset.enabled = enabledValue;
          toggleCandidate.setAttribute("aria-pressed", pressedValue);
          const track = toggleCandidate.querySelector(".nexus-settings-screen__toggle-track");
          if (track) {
            track.dataset.enabled = enabledValue;
          }
        }
        return;
      }

      const settingsThemeMirror = event.target?.closest?.("#settings-theme-select, #settings-theme-select-clone");
      if (settingsThemeMirror && doc?.body?.dataset?.appScreen === "settings") {
        const nextValue = settingsThemeMirror.value;
        if (elements.settingsThemeSelect) {
          elements.settingsThemeSelect.value = nextValue;
        }
        if (elements.settingsThemeSelectClone) {
          elements.settingsThemeSelectClone.value = nextValue;
        }
      }

      const qaTargetButton = event.target?.closest?.("[data-nexus-ui-qa-target]");
      const qaTarget = qaTargetButton?.dataset?.nexusUiQaTarget;
      if (qaTarget) {
        event.preventDefault?.();
        openQaScreen(qaTarget);
        return;
      }

      const helpCategoryButton = event.target?.closest?.("[data-help-category]");
      if (helpCategoryButton) {
        event.preventDefault?.();
        openHelpCategory(helpCategoryButton.dataset.helpCategory ?? "");
        return;
      }

      const helpArticleButton = event.target?.closest?.("[data-help-article-id]");
      if (helpArticleButton) {
        event.preventDefault?.();
        openHelpArticle(helpArticleButton.dataset.helpArticleId ?? "");
        return;
      }

      const helpSupportToggleButton = event.target?.closest?.("[data-help-support-toggle]");
      if (helpSupportToggleButton) {
        event.preventDefault?.();
        toggleHelpSupportPanel();
        return;
      }

      const helpSupportCopyButton = event.target?.closest?.("[data-help-support-copy]");
      if (helpSupportCopyButton) {
        event.preventDefault?.();
        void copyHelpSupportSummary();
        return;
      }

      const helpSupportMailtoButton = event.target?.closest?.("[data-help-support-mailto]");
      if (helpSupportMailtoButton) {
        event.preventDefault?.();
        const href = helpSupportMailtoButton.dataset.helpSupportMailto ?? "";
        if (href) {
          globalThis.location.href = href;
        }
        return;
      }

      const targetButton = event.target?.closest?.("[data-nexus-ui-target]");
      const target = targetButton?.dataset?.nexusUiTarget;
      if (target) {
        event.preventDefault?.();
        if (shouldBypassToQaRoute(target)) {
          openQaScreen(target);
          return;
        }
        openShellRoute(target);
        return;
      }

      const supportRouteLink = event.target?.closest?.('.nexus-ui-sidebar__link[href^="/"]');
      const supportHref = supportRouteLink?.getAttribute?.("href") ?? "";
      const supportTarget = supportHref === "/home"
        ? "home"
        : supportHref === "/files"
          ? "files"
          : supportHref === "/settings"
            ? "settings"
            : supportHref === "/help"
              ? "help"
              : "";
      if (supportTarget) {
        event.preventDefault?.();
        openShellRoute(supportTarget);
      }
    });

    doc.addEventListener("change", async (event) => {
      const helpSearchInput = event.target?.closest?.("#help-search-input");
      if (helpSearchInput) {
        currentHelpSearchQuery = normalizeString(helpSearchInput.value);
        currentHelpSupportCopyMessage = "";
        renderHelpSupportScreenView();
        return;
      }

      const onboardingProviderSelect = event.target?.closest?.("#onboarding-provider-select");
      if (onboardingProviderSelect && doc?.body?.dataset?.appScreen === "onboarding") {
        try {
          await updateOnboardingProviderSelection(onboardingProviderSelect.value);
        } catch (error) {
          elements.onboardingScreenStatus.textContent = "לא הצלחתי להחליף provider כרגע. נסה שוב בעוד רגע.";
        }
        return;
      }

      if (doc?.body?.dataset?.appScreen !== "settings") {
        return;
      }

      const settingsThemeMirror = event.target?.closest?.("#settings-theme-select, #settings-theme-select-clone");
      if (settingsThemeMirror) {
        const nextValue = settingsThemeMirror.value;
        if (elements.settingsThemeSelect) {
          elements.settingsThemeSelect.value = nextValue;
        }
        if (elements.settingsThemeSelectClone) {
          elements.settingsThemeSelectClone.value = nextValue;
        }
      }
    });
  }

  elements.qaPrevScreenButton?.addEventListener("click", () => {
    const currentIndex = qaScreenSequence.indexOf(resolveCurrentQaScreenKey());
    if (currentIndex > 0) {
      openQaScreen(qaScreenSequence[currentIndex - 1]);
    }
  });

  elements.qaNextScreenButton?.addEventListener("click", () => {
    const currentIndex = qaScreenSequence.indexOf(resolveCurrentQaScreenKey());
    if (currentIndex >= 0 && currentIndex < qaScreenSequence.length - 1) {
      openQaScreen(qaScreenSequence[currentIndex + 1]);
    }
  });

  elements.loopTab?.addEventListener("click", () => {
    activeWorkspace = "loop";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.developerTab?.addEventListener("click", () => {
    activeWorkspace = "developer";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.projectBrainTab?.addEventListener("click", () => {
    activeWorkspace = "project-brain";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.releaseTab?.addEventListener("click", () => {
    activeWorkspace = "release";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.growthTab?.addEventListener("click", () => {
    activeWorkspace = "growth";
    setActiveWorkspace(elements, activeWorkspace);
    renderShellChrome("workspace", activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.runCycleButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    const previousProject = currentProject;
    await fetchJson(`/api/projects/${currentProjectId}/run-cycle`, { method: "POST" });
    const nextProject = await fetchJson(`/api/projects/${currentProjectId}`);
    const refreshedProject = await loadProject(currentProjectId, {
      ...buildRunCycleFeedback(previousProject, nextProject),
      pulseWorkspace: true,
    }, nextProject);
    currentProject = refreshedProject;
  });

  elements.analyzeButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/analyze`, { method: "POST" });
    await loadProject(currentProjectId);
  });

  elements.scanButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: elements.scanPathInput.value }),
    });
    await loadProject(currentProjectId);
  });

  elements.syncCasinoButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/sync-casino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl: elements.casinoBaseUrlInput.value }),
    });
    await loadProject(currentProjectId);
  });

  for (const draftInput of [
    elements.createProjectNameInput,
    elements.createProjectVisionInput,
    elements.createProjectLinkInput,
  ]) {
    draftInput?.addEventListener("input", () => {
      persistFlowState(resolveCurrentShellRouteKey());
    });
  }

  elements.createProjectFilePickerButton?.addEventListener("click", () => {
    elements.createProjectFileUploadInput?.click();
  });

  elements.createProjectFileUploadInput?.addEventListener("change", async (event) => {
    await hydrateSelectedSupportFiles(event.currentTarget?.files ?? []);
  });

  elements.createProjectFilePickerButton?.addEventListener("dragover", (event) => {
    event.preventDefault?.();
    elements.createProjectFilePickerButton?.classList?.add("drag-active");
  });

  elements.createProjectFilePickerButton?.addEventListener("dragleave", () => {
    elements.createProjectFilePickerButton?.classList?.remove("drag-active");
  });

  elements.createProjectFilePickerButton?.addEventListener("drop", async (event) => {
    event.preventDefault?.();
    elements.createProjectFilePickerButton?.classList?.remove("drag-active");
    await hydrateSelectedSupportFiles(event.dataTransfer?.files ?? []);
  });

  if (typeof doc.addEventListener === "function") {
    doc.addEventListener("click", async (event) => {
    const createProjectButton = event.target?.closest?.("#create-project-button");
    if (createProjectButton && doc?.body?.dataset?.appScreen === "create") {
      event.preventDefault?.();
      await createFirstProjectFlow();
      return;
    }

    const finishOnboardingButton = event.target?.closest?.("#finish-onboarding-button");
    if (finishOnboardingButton && doc?.body?.dataset?.appScreen === "onboarding") {
      event.preventDefault?.();
      await finishFirstProjectOnboarding();
      return;
    }

    const onboardingNextButton = event.target?.closest?.("#onboarding-next-button");
    if (onboardingNextButton && doc?.body?.dataset?.appScreen === "onboarding") {
      event.preventDefault?.();
      await advanceOnboardingConversation();
      return;
    }

    const onboardingBackButton = event.target?.closest?.("#onboarding-back-button");
    if (onboardingBackButton && doc?.body?.dataset?.appScreen === "onboarding") {
      event.preventDefault?.();
      await exitOnboardingScreen();
      return;
    }

    const onboardingForwardButton = event.target?.closest?.("#onboarding-forward-button");
    if (onboardingForwardButton && doc?.body?.dataset?.appScreen === "onboarding") {
      event.preventDefault?.();
      const isComplete = onboardingConversation?.isComplete === true || !onboardingConversation?.currentQuestion?.id;
      if (isComplete) {
        openUnderstandingPreviewScreen();
      } else {
        await advanceOnboardingConversation();
      }
      return;
    }

    const homeCreateProjectButton = event.target?.closest?.("#home-create-project-button");
    if (homeCreateProjectButton && doc?.body?.dataset?.appScreen === "home") {
      event.preventDefault?.();
      enterCreateProjectScreen();
      return;
    }

    const homeProjectButton = event.target?.closest?.("[data-home-project-id]");
    if (homeProjectButton && doc?.body?.dataset?.appScreen === "home") {
      event.preventDefault?.();
      const projectId = homeProjectButton.dataset?.homeProjectId?.trim();
      if (!projectId) {
        return;
      }
      activeWorkspace = "loop";
      await loadProject(projectId);
      syncBrowserShellRoute("loop");
      scrollViewportToTop();
      return;
    }

    const continueButton = event.target?.closest?.("#understanding-continue-button");
    if (continueButton) {
      event.preventDefault?.();
      await finishFirstProjectOnboarding();
      return;
    }

    const correctButton = event.target?.closest?.("#understanding-correct-button");
    if (correctButton) {
      event.preventDefault?.();
      await correctOnboardingUnderstanding();
      return;
    }

    const loopPrimaryButton = event.target?.closest?.("#loop-primary-action-button");
    if (loopPrimaryButton && doc?.body?.dataset?.appScreen === "loop") {
      event.preventDefault?.();
      const actionKind = loopPrimaryButton.dataset?.loopActionKind ?? "navigate";
      if (actionKind === "execute") {
        await executeCurrentLoopTask();
        return;
      }
      navigateLoopTarget(loopPrimaryButton.dataset?.loopTarget ?? "onboarding");
      return;
    }

    const loopSecondaryButton = event.target?.closest?.("#loop-secondary-action-button");
    if (loopSecondaryButton && doc?.body?.dataset?.appScreen === "loop") {
      event.preventDefault?.();
      navigateLoopTarget(loopSecondaryButton.dataset?.loopTarget ?? "proof");
      return;
    }

    const executionProofButton = event.target?.closest?.("#execution-proof-button");
    if (executionProofButton && doc?.body?.dataset?.appScreen === "execution") {
      event.preventDefault?.();
      openShellRoute("proof");
      return;
    }

    const executionRefreshButton = event.target?.closest?.("#execution-refresh-button");
    if (executionRefreshButton && doc?.body?.dataset?.appScreen === "execution") {
      event.preventDefault?.();
      if (!currentProjectId) {
        openExecutionPreviewScreen();
        return;
      }
      await loadProject(currentProjectId);
      return;
    }

    const proofForwardButton = event.target?.closest?.("#proof-full-button");
    if (proofForwardButton && doc?.body?.dataset?.appScreen === "proof") {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderConfirmationDecisionScreenView(currentProject);
        syncBrowserShellRoute("confirmation");
      } else {
        openConfirmationPreviewScreen();
      }
      return;
    }

    const confirmationApproveButton = event.target?.closest?.("#confirmation-approve-button");
    if (confirmationApproveButton) {
      event.preventDefault?.();
      const approvalRequestId = confirmationApproveButton.dataset?.approvalRequestId?.trim() ?? "";
      if (currentProjectId) {
        await fetchJson(`/api/projects/${currentProjectId}/approvals/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalRequestId: approvalRequestId || null,
            userInput: {
              actorRole: "owner",
              actorName: activeAppUser?.email ?? "QA owner",
            },
          }),
        });
        await loadProject(currentProjectId);
      }
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderStateUpdateScreenView(currentProject);
        syncBrowserShellRoute("state-update");
      } else {
        openStateUpdatePreviewScreen();
      }
      return;
    }

    const confirmationArtifactButton = event.target?.closest?.("#confirmation-artifact-button");
    if (confirmationArtifactButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
        syncBrowserShellRoute("artifact");
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      }
      return;
    }

    const proofOpenButton = event.target?.closest?.("#proof-open-button");
    if (proofOpenButton && doc?.body?.dataset?.appScreen === "proof") {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
        syncBrowserShellRoute("artifact");
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      }
      return;
    }

    const proofDownloadButton = event.target?.closest?.("#proof-download-button");
    if (proofDownloadButton && doc?.body?.dataset?.appScreen === "proof") {
      event.preventDefault?.();
      if (currentProject) {
        triggerArtifactDownload(doc, currentProject);
      }
      return;
    }

    const artifactBackToProofButton = event.target?.closest?.("#artifact-back-to-proof-button");
    if (artifactBackToProofButton && doc?.body?.dataset?.appScreen === "artifact") {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderProofResultScreenView(currentProject);
        syncBrowserShellRoute("proof");
      } else if (isQaModeEnabled()) {
        openProofPreviewScreen();
      }
      return;
    }

    const artifactDownloadButton = event.target?.closest?.("#artifact-download-button");
    if (artifactDownloadButton && doc?.body?.dataset?.appScreen === "artifact") {
      event.preventDefault?.();
      if (currentProject) {
        triggerArtifactDownload(doc, currentProject);
      }
      return;
    }

    const artifactContinueButton = event.target?.closest?.("#artifact-continue-button");
    if (artifactContinueButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderConfirmationDecisionScreenView(currentProject);
        syncBrowserShellRoute("confirmation");
      } else if (isQaModeEnabled()) {
        openConfirmationPreviewScreen();
      }
      return;
    }

    const confirmationReviseButton = event.target?.closest?.("#confirmation-revise-button");
    if (confirmationReviseButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderLoopCoreScreenView(currentProject);
        syncBrowserShellRoute("loop");
      } else {
        openLoopPreviewScreen();
      }
      return;
    }

    const stateUpdateNextButton = event.target?.closest?.("#state-update-next-button");
    if (stateUpdateNextButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderNextTaskScreenView(currentProject);
        syncBrowserShellRoute("next-task");
      } else {
        openNextTaskPreviewScreen();
      }
      return;
    }

    const stateUpdateHistoryButton = event.target?.closest?.("#state-update-history-button");
    if (stateUpdateHistoryButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderTimelineHistoryScreenView(currentProject);
        syncBrowserShellRoute("timeline");
      } else {
        openTimelinePreviewScreen();
      }
      return;
    }

    const stateUpdateArtifactButton = event.target?.closest?.("#state-update-artifact-button");
    if (stateUpdateArtifactButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
        syncBrowserShellRoute("artifact");
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      }
      return;
    }

    const nextTaskStartButton = event.target?.closest?.("#next-task-start-button");
    if (nextTaskStartButton) {
      event.preventDefault?.();
      const target = nextTaskStartButton.dataset?.nextTaskTarget ?? "execution";
      const actionKind = nextTaskStartButton.dataset?.nextTaskActionKind ?? "execute";
      if (actionKind === "navigate") {
        navigateLoopTarget(target);
      } else if (currentProject) {
        qaPreviewRouteKey = null;
        renderExecutionLiveScreenView(currentProject);
        syncBrowserShellRoute("execution");
      } else {
        openExecutionPreviewScreen();
      }
      return;
    }

    const nextTaskDetailsButton = event.target?.closest?.("#next-task-details-button");
    if (nextTaskDetailsButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderTimelineHistoryScreenView(currentProject);
        syncBrowserShellRoute("timeline");
      } else {
        openTimelinePreviewScreen();
      }
      return;
    }

    const nextTaskArtifactButton = event.target?.closest?.("#next-task-artifact-button");
    if (nextTaskArtifactButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
        syncBrowserShellRoute("artifact");
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      }
      return;
    }

    const timelineReturnButton = event.target?.closest?.("#timeline-return-button");
    if (timelineReturnButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderLoopCoreScreenView(currentProject);
        syncBrowserShellRoute("loop");
      } else {
        openLoopPreviewScreen();
      }
      return;
    }

    const timelineArtifactButton = event.target?.closest?.("#timeline-artifact-button");
    if (timelineArtifactButton) {
      event.preventDefault?.();
      if (currentProject) {
        qaPreviewRouteKey = null;
        renderArtifactPreviewScreenView(currentProject);
        syncBrowserShellRoute("artifact");
      } else if (isQaModeEnabled()) {
        renderArtifactPreviewScreenView(null, { qaMode: true });
      }
      return;
    }
    });
  }

  if (typeof doc.addEventListener === "function") {
    doc.addEventListener("input", (event) => {
      const target = event.target;
      if (target?.id === "help-search-input" && doc?.body?.dataset?.appScreen === "help") {
        currentHelpSearchQuery = normalizeString(target.value);
        currentHelpSupportCopyMessage = "";
        renderHelpSupportScreenView();
        return;
      }

      if (target?.id === "onboarding-answer-input" && doc?.body?.dataset?.appScreen === "onboarding") {
        onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
        onboardingConversation.draftAnswer = elements.onboardingAnswerInput?.value ?? "";
        persistFlowState("onboarding");
        return;
      }

      if (
        target?.id === "create-project-name-input"
        || target?.id === "create-project-vision-input"
        || target?.id === "create-project-file-name-input"
        || target?.id === "create-project-file-content-input"
      ) {
        persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
        return;
      }

      if (target?.id === "create-project-link-input") {
        if (onboardingFlow?.sessionId) {
          onboardingFlow = {
            ...onboardingFlow,
            supportingLink: elements.createProjectLinkInput?.value?.trim() ?? "",
          };
        }
        persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
      }
    });

    doc.addEventListener("keydown", (event) => {
      if (
        event.target?.id === "onboarding-answer-input"
        && doc?.body?.dataset?.appScreen === "onboarding"
        && event.key === "Enter"
        && !event.shiftKey
      ) {
        event.preventDefault?.();
        void advanceOnboardingConversation();
      }
    });
  }

  elements.reopenOnboardingButton?.addEventListener("click", () => {
    reopenOnboardingFromWorkspace();
  });

  elements.loopOpenOnboardingButton?.addEventListener("click", () => {
    reopenOnboardingFromWorkspace();
  });

  elements.loopStageRail?.addEventListener("click", (event) => {
    const target = event.target?.closest?.("[data-loop-target]")?.dataset?.loopTarget;
    if (target) {
      navigateLoopTarget(target);
    }
  });

  elements.loopOpenProjectBrainButton?.addEventListener("click", () => {
    navigateLoopTarget("project-brain");
  });

  elements.loopOpenDeveloperButton?.addEventListener("click", () => {
    navigateLoopTarget("developer");
  });

  elements.loopOpenReleaseButton?.addEventListener("click", () => {
    navigateLoopTarget("proof");
  });

  if (!resolveDevFlowControlsEnabled()) {
    if (elements.reopenOnboardingButton) {
      elements.reopenOnboardingButton.hidden = true;
    }
    if (elements.createNewProjectButton) {
      elements.createNewProjectButton.hidden = true;
    }
  }

  elements.proposalEditButton?.addEventListener("click", async () => {
    await submitProposalEditsFromUi();
  });

  elements.partialAcceptanceButton?.addEventListener("click", async () => {
    await submitPartialAcceptanceFromUi();
  });

  elements.executeRollbackButton?.addEventListener("click", async () => {
    await executeRollbackFromUi();
  });

  elements.snapshotScheduleButton?.addEventListener("click", async () => {
    await saveSnapshotScheduleFromUi();
  });

  elements.runSnapshotBackupButton?.addEventListener("click", async () => {
    await runSnapshotBackupFromUi();
  });

  elements.snapshotRetentionButton?.addEventListener("click", async () => {
    await saveSnapshotRetentionFromUi();
  });

  elements.snapshotCleanupButton?.addEventListener("click", async () => {
    await runSnapshotCleanupFromUi();
  });

  elements.snapshotWorkerToggleButton?.addEventListener("click", async () => {
    await toggleSnapshotWorkerFromUi();
  });

  elements.snapshotWorkerRunButton?.addEventListener("click", async () => {
    await runSnapshotWorkerTickFromUi();
  });

  elements.disasterRecoveryRefreshButton?.addEventListener("click", async () => {
    await refreshDisasterRecoveryChecklistFromUi();
  });

  elements.continuityActionButton?.addEventListener("click", async () => {
    await applyBusinessContinuityActionFromUi();
  });

  elements.continuityRefreshButton?.addEventListener("click", async () => {
    await refreshBusinessContinuityFromUi();
  });

  elements.projectAuditRefreshButton?.addEventListener("click", async () => {
    await refreshProjectAudit();
  });

  globalThis.addEventListener?.("popstate", () => {
    applyRequestedShellRouteFromLocation({ replace: true });
  });

  primeInitialShellRoute();
  renderBootstrapRestoredScreen();

  const ready = loadProjects().catch((error) => {
    if (error?.message === "Request failed: 401") {
      currentProjectId = null;
      currentProject = null;
      renderEmptyAppState({
        mode: "create",
        message: "אין פרויקטים",
        status: "כדי להתחיל צריך ליצור פרויקט ראשון ולעבור onboarding קצר.",
      });
      return [];
    }

    renderBootstrapFailureScreen(error);
    return [];
  });

  return {
    elements,
    loadProject,
    loadProjects,
    refreshLiveState,
    setActiveWorkspace(workspaceKey) {
      activeWorkspace = workspaceKey;
      setActiveWorkspace(elements, activeWorkspace);
      renderShellChrome("workspace", activeWorkspace);
    },
    closeLiveUpdates,
    ready,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  createCockpitApp();
}
