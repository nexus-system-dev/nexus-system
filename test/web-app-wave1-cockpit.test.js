import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createCockpitApp } from "../web/app.js";
import { ProjectService } from "../src/core/project-service.js";

function createProjectService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-web-service-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    hidden: false,
    disabled: false,
    dataset: {},
    ariaSelected: "false",
    listeners: {},
    classNames: new Set(),
    classList: {
      toggle() {},
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
  };
}

function createShortDelayTimers() {
  const timers = new Set();
  return {
    setTimeoutImpl(callback, delay = 0) {
      if (delay <= 500) {
        const timer = setTimeout(() => {
          timers.delete(timer);
          callback();
        }, 0);
        timers.add(timer);
        return timer;
      }
      return 0;
    },
    clearTimeoutImpl(timer) {
      if (timer && timers.has(timer)) {
        clearTimeout(timer);
        timers.delete(timer);
      }
    },
  };
}

function createFakeDocument() {
  const selectors = [
    ".hero-actions",
    "#project-select",
    "#sync-casino-button",
    "#analyze-button",
    "#run-cycle-button",
    "#screen-create",
    "#screen-onboarding",
    "#screen-workspace",
    "#workspace-board",
    "#flow-feedback-banner",
    "#flow-feedback-title",
    "#flow-feedback-message",
    "#create-new-project-button",
    "#reopen-onboarding-button",
    "#empty-app-state",
    "#empty-project-message",
    "#empty-project-status",
    "#project-create-stage",
    "#onboarding-stage",
    "#onboarding-screen-message",
    "#onboarding-screen-status",
    "#onboarding-stage-title",
    "#onboarding-stage-description",
    "#onboarding-progress-pill",
    "#onboarding-back-button",
    "#onboarding-forward-button",
    "#onboarding-notes-list",
    "#onboarding-chat-thread",
    "#onboarding-current-question-title",
    "#onboarding-current-question-body",
    "#onboarding-answer-input",
    "#onboarding-next-button",
    "#onboarding-material-stage",
    "#onboarding-form-stage",
    "#create-project-name-input",
    "#create-project-vision-input",
    "#create-project-link-input",
    "#create-project-file-name-input",
    "#create-project-file-content-input",
    "#create-project-button",
    "#finish-onboarding-button",
    "#tab-developer",
    "#tab-project-brain",
    "#tab-release",
    "#tab-growth",
    "#hero-project-name",
    "#hero-goal",
    "#now-content",
    "#critical-content",
    "#missing-content",
    "#existing-content",
    "#live-content",
    "#decision-content",
    "#developer-workspace-summary",
    "#workspace-developer",
    "#project-brain-summary",
    "#workspace-project-brain",
    "#release-workspace-summary",
    "#workspace-release",
    "#growth-workspace-summary",
    "#workspace-growth",
    "#screen-review-content",
    "#proposal-review-content",
    "#proposal-section-title-input",
    "#proposal-section-summary-input",
    "#proposal-next-action-label-input",
    "#proposal-annotation-input",
    "#proposal-edit-button",
    "#partial-section-decision-select",
    "#partial-component-decision-select",
    "#partial-copy-decision-select",
    "#partial-acceptance-note-input",
    "#partial-acceptance-button",
    "#snapshot-interval-input",
    "#snapshot-triggers-input",
    "#snapshot-schedule-button",
    "#run-snapshot-backup-button",
    "#snapshot-max-input",
    "#snapshot-retention-button",
    "#snapshot-cleanup-button",
    "#snapshot-worker-toggle-button",
    "#snapshot-worker-run-button",
    "#disaster-recovery-refresh-button",
    "#continuity-action-select",
    "#continuity-action-button",
    "#continuity-refresh-button",
    "#execute-rollback-button",
    "#project-audit-actor-input",
    "#project-audit-action-input",
    "#project-audit-sensitivity-select",
    "#project-audit-refresh-button",
    "#project-audit-content",
    "#access-isolation-content",
    "#learning-content",
    "#companion-content",
    "#collaboration-content",
    "#versioning-content",
    "#growth-content",
    "#casino-base-url-input",
    "#external-content",
    "#scan-path-input",
    "#scan-button",
    "#scanner-content",
    "#primitive-components-content",
    "#layout-components-content",
    "#feedback-components-content",
    "#navigation-components-content",
    "#data-display-components-content",
    "#analysis-content",
    "#graph-content",
    "#agents-content",
    "#events-content",
  ];

  const elements = new Map(selectors.map((selector) => [selector, createElement()]));
  const styleValues = new Map();

  for (const element of elements.values()) {
    element.classList = {
      toggle(className, force) {
        if (force) {
          element.classNames.add(className);
        } else {
          element.classNames.delete(className);
        }
      },
    };
  }

  return {
    documentElement: {
      style: {
        setProperty(name, value) {
          styleValues.set(name, value);
        },
        getPropertyValue(name) {
          return styleValues.get(name) ?? "";
        },
      },
    },
    querySelector(selector) {
      return elements.get(selector) ?? null;
    },
    elements,
    styleValues,
  };
}

test("cockpit renders Wave 1 sections from the canonical project payload", async () => {
  const fakeDocument = createFakeDocument();
  const projectPayload = {
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Ship a coherent Wave 1 cockpit",
    status: "active",
    source: { baseUrl: "http://localhost:4101" },
    overview: { bottleneck: "Screen review is blocking release" },
    cycle: {
      roadmap: [
        { summary: "Wire AI companion into cockpit", status: "assigned", lane: "build", dependencies: [] },
        { summary: "Review version restore states", status: "blocked", lane: "maintenance", dependencies: ["approval"] },
      ],
    },
    agents: [{ name: "Dev Agent", status: "working", currentTask: "Wire cockpit" }],
    approvals: ["Review the Wave 1 cockpit surface"],
    events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
    screenValidationChecklist: { summary: { totalScreens: 4 } },
    developerWorkspace: {
      contextSummary: {
        progressPercent: 36,
        progressStatus: "running",
        nextAction: "Wire cockpit layout",
        incidentStatus: "clear",
      },
    },
    projectBrainWorkspace: {
      overview: {
        domain: "saas",
        currentPhase: "validation",
      },
      summary: {
        blockerCount: 1,
        requiresApproval: true,
      },
    },
    cockpitRecommendationSurface: {
      surfaceId: "cockpit-recommendation-surface:giftwallet",
      headline: "Approve deploy",
      summary: "The system recommends approving the next deploy step.",
      whyNow: "This recommendation needs approval before it can move forward.",
      approval: {
        requiresApproval: true,
        whyApproval: "השינוי הזה דורש אישור לפני שנמשיך",
        whatIfRejected: "Stay on the safer path",
        riskLevel: "high",
      },
      recommendationPanel: {
        urgency: "high",
        expectedOutcome: "The release can continue",
        primaryCta: {
          label: "Approve deploy",
        },
      },
      summaryMeta: {
        blockerCount: 1,
      },
    },
    releaseWorkspace: {
      releaseTarget: "staging",
      buildAndDeploy: {
        currentStage: "validation",
      },
      validation: {
        status: "blocked",
      },
      summary: {
        isBlocked: true,
      },
    },
    growthWorkspace: {
      strategy: {
        targetAudience: "Product teams",
        gtmStage: "build",
        pillars: [{ title: "Launch copy" }],
        contentGoal: "Prepare Wave 2 story",
      },
      campaigns: {
        tasks: [{ title: "Draft Wave 2 teaser", status: "planned", channel: "email" }],
      },
      analytics: {
        kpis: [{ label: "Activation", value: "27%" }],
      },
      summary: {
        totalPillars: 1,
        totalChannels: 0,
        totalKpis: 1,
        hasGrowthPlan: true,
      },
    },
    screenReviewReport: {
      summary: { readyScreens: 3, blockedScreens: 1, totalScreens: 4 },
      screens: [
        { screenId: "screen-1", screenType: "dashboard", summary: { isReady: true, blockingIssues: [] } },
        { screenId: "screen-2", screenType: "workspace", summary: { isReady: false, blockingIssues: ["missing-component:badge"] } },
      ],
    },
    aiLearningWorkspaceTemplate: {
      composition: { insightCount: 2 },
      summary: { enabledSections: 5, supportsRecommendationReasoning: true },
    },
    learningInsightViewModel: {
      insights: [
        { insightId: "insight-1", title: "Approval-first rollout copy works better", summary: "Users respond faster when warnings are explicit." },
      ],
    },
    confidenceIndicator: { level: "high" },
    companionState: {
      state: "warning",
      reasons: ["Approval is still required before continuing."],
    },
    companionDock: {
      visible: true,
      priority: "warning",
      summary: {
        headline: "The AI companion is holding a warning for you.",
      },
    },
    companionPanel: {
      sections: {
        suggestions: {
          items: ["Approval is still required before continuing."],
        },
        nextActions: {
          items: ["review-warning"],
        },
      },
    },
    companionModeSettings: {
      selectedMode: "active",
    },
    collaborationFeed: {
      summary: { totalItems: 4, containsWorkspaceTransitions: true, containsApprovalCoordination: true },
      items: [
        {
          headline: "Please review the latest diff",
          actorName: "Owner",
          workspaceArea: "development-workspace",
          status: "active",
        },
        {
          headline: "reviewer marked approval as approved",
          actorName: "Reviewer",
          workspaceArea: "release-workspace",
          status: "approved",
        },
      ],
    },
    reviewThreadState: {
      threadStateId: "review-thread-state:giftwallet",
      threads: [
        {
          threadId: "thread:diff:exec-1",
          title: "Review pending changes",
          contextTarget: { resourceType: "diff" },
          messages: [{ body: "Please review the latest diff" }],
        },
      ],
      summary: { openThreads: 1 },
    },
    projectPresenceState: {
      activeParticipantCount: 2,
      summary: { totalParticipants: 2, hasSharedPresence: true },
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:giftwallet:v3",
      snapshotId: "project-state-snapshot:giftwallet:v3",
      versions: { stateVersion: 3, executionGraphVersion: 7 },
      summary: { isStored: true },
    },
    designTokens: {
      colors: {
        canvas: "#101820",
        surface: "#18212b",
        ink: "#f3f4f6",
        muted: "#9ca3af",
        accent: "#14b8a6",
        accentStrong: "#0f766e",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        border: "#334155",
      },
      spacing: {
        xs: 5,
        sm: 9,
        md: 13,
        lg: 21,
        xl: 34,
        xxl: 55,
      },
      typography: {
        familyDisplay: "\"Avenir Next\", sans-serif",
        familyBody: "\"IBM Plex Sans\", sans-serif",
        sizeDisplay: 42,
        sizeXl: 30,
        sizeLg: 22,
        sizeMd: 17,
        sizeXs: 11,
      },
      radius: {
        sm: 7,
        md: 14,
        lg: 24,
        pill: 999,
      },
      borders: {
        subtle: 1,
        strong: 2,
        focus: 3,
      },
      shadows: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.2)",
        medium: "0 14px 36px rgba(0, 0, 0, 0.28)",
        focus: "0 0 0 3px rgba(20, 184, 166, 0.25)",
      },
    },
    primitiveComponents: {
      componentLibraryId: "primitive-components:design-tokens:nexus",
      baseContractId: "component-contract:button",
      components: [
        {
          componentId: "primitive:button",
          componentType: "button",
          interactive: true,
          usage: "primary actions across onboarding, execution and approvals",
          variants: ["primary", "secondary", "destructive"],
          preview: {
            text: "שלח לאישור",
            secondaryText: "שמור כטיוטה",
          },
        },
        {
          componentId: "primitive:input",
          componentType: "input",
          interactive: true,
          usage: "single-line data entry for project setup and operational updates",
          variants: ["default", "inline", "dense"],
          preview: {
            label: "Input field",
            value: "Checkout dashboard",
            placeholder: "שם המסך הראשי",
          },
        },
        {
          componentId: "primitive:textarea",
          componentType: "textarea",
          interactive: true,
          usage: "multi-line product context, notes and explanation editing",
          variants: ["default", "autosize"],
          preview: {
            value: "מסך זה מרכז approvals, incidents ופעולות release.",
            placeholder: "הוסף כאן הסבר על המסך",
          },
        },
        {
          componentId: "primitive:select",
          componentType: "select",
          interactive: true,
          usage: "choice selection for execution mode, owner decisions and configuration",
          variants: ["single", "searchable"],
          preview: {
            options: ["Assistive", "Active", "Quiet"],
            selectedOption: "Active",
          },
        },
        {
          componentId: "primitive:badge",
          componentType: "badge",
          interactive: false,
          usage: "status chips for blockers, release state and approvals",
          variants: ["neutral", "success", "warning", "danger"],
          preview: {
            items: ["Ready", "Partial", "Blocked"],
          },
        },
        {
          componentId: "primitive:icon-button",
          componentType: "icon-button",
          interactive: true,
          usage: "dense actions in workbench panels, navigation and toolbars",
          variants: ["ghost", "subtle", "danger"],
          preview: {
            icon: "⋯",
            assistiveLabel: "פתח פעולות נוספות",
          },
        },
      ],
      summary: {
        totalComponents: 6,
        interactiveComponents: 5,
        includesFormPrimitives: true,
      },
    },
    layoutComponents: {
      layoutComponentLibraryId: "layout-components:layout-system:design-tokens:nexus",
      components: [
        {
          componentId: "layout:container",
          componentType: "container",
          anatomy: ["outerFrame", "innerContent"],
          usage: "page-level width control for dashboards, setup flows and workspaces",
          layoutRules: {
            maxWidth: 1180,
            wideWidth: 1360,
            paddingX: 21,
          },
          preview: {
            items: ["Outer frame", "Inner content"],
          },
        },
        {
          componentId: "layout:section",
          componentType: "section",
          anatomy: ["header", "body", "footer"],
          usage: "vertical content grouping with consistent spacing rhythm",
          layoutRules: {
            gap: 34,
            contentGap: 13,
            topOffset: 55,
          },
          preview: {
            items: ["Header", "Body", "Footer"],
          },
        },
        {
          componentId: "layout:grid",
          componentType: "grid",
          anatomy: ["gridFrame", "gridItems"],
          usage: "multi-column content arrangements across dashboards and workbench panels",
          layoutRules: {
            columns: 12,
            gutter: 24,
            maxContentWidth: 1360,
          },
          preview: {
            columns: [4, 4, 4],
          },
        },
      ],
      summary: {
        totalComponents: 3,
        supportsWorkbenchLayouts: true,
        hasResponsiveCoverage: true,
      },
    },
    feedbackComponents: {
      feedbackComponentLibraryId: "feedback-components:interaction-states:design-tokens:nexus",
      components: [
        {
          componentId: "feedback:loading-state",
          componentType: "loading-state",
          tone: "informative",
          usage: "full-screen or panel-level loading feedback while Nexus prepares data or execution context",
          supportedStates: ["loading"],
          preview: {
            headline: "טוען את סביבת העבודה",
            description: "Nexus מכינה context, state ו־next actions.",
            progressLabel: "64%",
          },
        },
        {
          componentId: "feedback:empty-state",
          componentType: "empty-state",
          tone: "guiding",
          usage: "guides users when a workspace or panel has no content yet",
          supportedStates: ["empty"],
          preview: {
            headline: "עדיין אין תוצאות",
            description: "אפשר להתחיל מסריקה, import או יצירת פרויקט חדש.",
            actionLabel: "התחל סריקה",
          },
        },
        {
          componentId: "feedback:toast",
          componentType: "toast",
          tone: "ephemeral",
          usage: "short-lived notifications for actions, completions and recoverable issues",
          supportedStates: ["success", "warning", "destructive"],
          preview: {
            items: ["השינויים נשמרו", "Approval חסר", "הפריסה נכשלה"],
          },
        },
      ],
      summary: {
        totalComponents: 3,
        coversScreenStates: true,
        coversInlineFeedback: true,
      },
    },
    navigationComponents: {
      navigationComponentLibraryId: "navigation-components:2",
      components: [
        {
          componentId: "navigation:sidebar",
          componentType: "sidebar",
          usage: "persistent workspace navigation across major Nexus surfaces",
          anatomy: ["brand", "primaryLinks", "secondaryLinks", "workspaceStatus"],
          navigationRules: {
            supportsFlowTypes: ["onboarding", "execution"],
            supportsProjectSwitching: true,
          },
          preview: {
            items: ["Developer", "Project Brain", "Release"],
          },
        },
        {
          componentId: "navigation:tabs",
          componentType: "tabs",
          usage: "switching between related views inside a single workspace or panel",
          anatomy: ["tabList", "tabTrigger", "tabIndicator"],
          navigationRules: {
            supportsFlowTypes: ["onboarding", "execution"],
            maxRecommendedTabs: 6,
          },
          preview: {
            items: ["Overview", "Activity", "Approvals"],
            activeItem: "Activity",
          },
        },
        {
          componentId: "navigation:stepper",
          componentType: "stepper",
          usage: "guides users through onboarding, release, and sequenced project flows",
          anatomy: ["steps", "activeStep", "completionState"],
          navigationRules: {
            supportsStepIds: ["intake", "workbench"],
            supportsLinearProgress: true,
          },
          preview: {
            items: ["Intake", "Analysis", "Workspace"],
            activeItem: "Analysis",
          },
        },
      ],
      summary: {
        totalComponents: 3,
        totalFlowTypes: 2,
        supportsWorkspaceNavigation: true,
      },
    },
    dataDisplayComponents: {
      dataDisplayLibraryId: "data-display-components:3",
      components: [
        {
          componentId: "data-display:table",
          componentType: "table",
          usage: "dense tabular views for entities, approvals, releases and operational datasets",
          supportedScreenTypes: ["dashboard", "workspace", "tracking"],
          dataRules: {
            supportsSorting: true,
            supportsEmptyRows: true,
            supportsInlineStatus: true,
          },
          preview: {
            headers: ["Service", "Status", "Owner"],
            rows: [
              ["API", "Healthy", "Ops"],
              ["Billing", "Pending", "Finance"],
            ],
          },
        },
        {
          componentId: "data-display:stat-card",
          componentType: "stat-card",
          usage: "single KPI summaries for dashboards, growth views and release overviews",
          supportedScreenTypes: ["dashboard", "workspace", "tracking"],
          dataRules: {
            highlightsSingleMetric: true,
            supportsTrendDelta: true,
            supportsStatusTone: true,
          },
          preview: {
            headline: "Weekly activation",
            value: "62%",
            delta: "+8%",
          },
        },
        {
          componentId: "data-display:status-chip",
          componentType: "status-chip",
          usage: "inline semantic state display for blockers, releases, health and approvals",
          supportedScreenTypes: ["dashboard", "workspace", "tracking"],
          dataRules: {
            supportsSemanticStates: true,
            supportsCompactDisplay: true,
            supportsInlineUsage: true,
          },
          preview: {
            items: ["Ready", "Partial", "Blocked"],
          },
        },
      ],
      summary: {
        totalComponents: 3,
        totalSupportedScreenTypes: 3,
        supportsOperationalDashboards: true,
      },
    },
    typographySystem: {
      baseFontFamily: "\"IBM Plex Sans\", sans-serif",
      displayFontFamily: "\"Avenir Next\", sans-serif",
      typeScale: {
        display: { fontSize: 42 },
        h1: { fontSize: 30, lineHeight: 1.08 },
        h2: { fontSize: 22 },
        body: { fontSize: 17, lineHeight: 1.6 },
        meta: { fontSize: 11 },
      },
    },
    layoutSystem: {
      grid: { maxContentWidth: 1360, gutter: 24 },
      spacingScale: { xs: 5, sm: 9, md: 13, lg: 21, xl: 34, xxl: 55 },
      sectionRhythm: { pageTop: 55, sectionGap: 34, panelGap: 21 },
    },
    colorRules: {
      roles: {
        canvas: { token: "#101820" },
        surface: { token: "#18212b" },
        textPrimary: { token: "#f3f4f6" },
        textMuted: { token: "#9ca3af" },
        accent: { token: "#14b8a6" },
        accentStrong: { token: "#0f766e" },
        border: { token: "#334155" },
      },
      states: {
        success: { token: "#22c55e" },
        warning: { token: "#f59e0b" },
        danger: { token: "#ef4444" },
      },
    },
    restoreDecision: {
      restoreMode: "partial",
      requiresManualConfirmation: true,
      summary: { isSafeToExecute: false },
    },
    rollbackExecutionResult: {
      executionStatus: "blocked",
      summary: { restoredTargetCount: 0 },
    },
    projectAuthorizationDecision: {
      authorizationDecisionId: "project-authorization:owner:deploy",
      projectAction: "deploy",
      requiredCapability: "deploy",
      decision: "requires-approval",
      reason: "Production deploy requires approval",
      checks: ["policy-requires-approval", "privileged-deploy-action"],
    },
    privilegedAuthorityDecision: {
      privilegedAuthorityDecisionId: "privileged-authority:deploy",
      projectAction: "deploy",
      decision: "requires-approval",
      requiresApproval: true,
      reason: "Privileged action requires approval",
      checks: ["authorization-requires-approval"],
    },
    workspaceIsolationDecision: {
      workspaceIsolationDecisionId: "workspace-isolation:workspace-1:deploy",
      requestWorkspaceId: "workspace-1",
      resourceType: "project-state",
      decision: "allowed",
      reason: "Request stays within the workspace isolation boundary",
      checks: ["tenant-schema-loaded", "boundary:workspace"],
    },
    leakageAlert: {
      leakageAlertId: "tenant-leakage:workspace-isolation:workspace-1:deploy",
      severity: "clear",
      reason: "Isolation checks and learning inputs remain inside the tenant boundary.",
      checks: ["workspace-isolation:allowed", "no-cross-tenant-leak-detected"],
      leakSignals: [],
    },
    projectAuditPayload: {
      projectAuditPayloadId: "project-audit-payload:giftwallet",
      projectId: "giftwallet",
      filters: {
        actorId: null,
        actionType: null,
        sensitivity: null,
      },
      entries: [
        {
          entryId: "actor-action-trace:1",
          actorLabel: "owner-1",
          actionType: "approval.granted",
          sensitivity: "high",
          outcomeStatus: "invoked",
          timestamp: "2026-03-30T08:00:00.000Z",
        },
      ],
      viewerModel: {
        supportsFiltering: true,
      },
      summary: {
        totalEntries: 1,
        filtered: false,
      },
    },
    repositoryImportAndCodebaseDiagnosis: {
      diagnosisId: "repository-import-diagnosis:giftwallet",
      status: "ready",
      repository: {
        fullName: "openai/giftwallet",
      },
      summary: {
        diagnosisStatus: "ready",
        codebaseSummary: "backend: Express, frontend: React, database/data: PostgreSQL, יש בדיקות.",
        architectureSummary: "Layered architecture, MVC-style routing",
        nextAction: "Audit the existing repository test coverage before import continuation.",
      },
      diagnosisReadout: {
        blockingGaps: ["לא זוהתה שכבת CI או workflow אוטומטי"],
      },
    },
    liveWebsiteIngestionAndFunnelDiagnosis: {
      diagnosisId: "live-website-diagnosis:giftwallet",
      status: "ready",
      website: {
        hostname: "giftwallet.app",
      },
      summary: {
        diagnosisStatus: "ready",
        websiteSummary: "giftwallet.app | health: degraded",
        funnelSummary: "registration: onboarding CTA missing",
        nextAction: "Unblock the live-site flow: registration: onboarding CTA missing.",
      },
      funnelDiagnosis: {
        criticalDependencies: ["analytics instrumentation"],
      },
    },
    importedAnalyticsNormalization: {
      normalizationId: "imported-analytics:giftwallet",
      status: "ready",
      summary: {
        normalizationStatus: "ready",
        importedAssetCount: 1,
        providerCount: 2,
        nextAction: "Map imported analytics export ga-export.csv into canonical growth signals.",
      },
      evidenceSources: {
        providers: ["google-analytics", "runtime-analytics"],
      },
    },
    importedAssetTaskExtraction: {
      extractionId: "imported-asset-task-extraction:giftwallet",
      status: "ready",
      summary: {
        totalExtractedTasks: 6,
        highPriorityCount: 2,
        sourceCoverage: ["repository", "website", "analytics", "documents"],
        nextAction: "Resolve repository gap: missing CI workflow",
      },
      extractedTasks: [
        { title: "Resolve repository gap: missing CI workflow" },
        { title: "Unblock website flow: registration: onboarding CTA missing" },
      ],
    },
  };

  async function fetchImpl(url) {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: [{ id: "giftwallet", name: "GiftWallet" }] };
        },
      };
    }

    if (url === "/api/projects/giftwallet") {
      return {
        ok: true,
        async json() {
          return projectPayload;
        },
      };
    }

    if (url === "/api/projects/giftwallet/presence") {
      return {
        ok: true,
        async json() {
          return projectPayload;
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });
  await app.ready;

  assert.match(fakeDocument.elements.get("#screen-review-content").innerHTML, /missing-component:badge/);
  assert.match(fakeDocument.elements.get("#learning-content").innerHTML, /Approval-first rollout copy works better/);
  assert.match(fakeDocument.elements.get("#companion-content").innerHTML, /review-warning/);
  assert.match(fakeDocument.elements.get("#collaboration-content").innerHTML, /Please review the latest diff/);
  assert.match(fakeDocument.elements.get("#collaboration-content").innerHTML, /Review pending changes/);
  assert.match(fakeDocument.elements.get("#collaboration-content").innerHTML, /reviewer marked approval as approved/);
  assert.match(fakeDocument.elements.get("#versioning-content").innerHTML, /project-state-snapshot:giftwallet:v3/);
  assert.match(fakeDocument.elements.get("#project-audit-content").innerHTML, /approval.granted/);
  assert.match(fakeDocument.elements.get("#access-isolation-content").innerHTML, /Guard decisions/);
  assert.match(fakeDocument.elements.get("#growth-content").innerHTML, /Draft Wave 2 teaser/);
  assert.match(fakeDocument.elements.get("#existing-content").innerHTML, /Diagnosis ready: openai\/giftwallet/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /Repository diagnosis: ready/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /Website diagnosis: ready/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /Imported analytics: ready/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /Imported tasks: 6/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /Resolve repository gap/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /google-analytics/);
  assert.match(fakeDocument.elements.get("#external-content").innerHTML, /giftwallet\.app/);
  assert.match(fakeDocument.elements.get("#developer-workspace-summary").innerHTML, /36%/);
  assert.match(fakeDocument.elements.get("#project-brain-summary").innerHTML, /saas/);
  assert.match(fakeDocument.elements.get("#decision-content").innerHTML, /Approve deploy/);
  assert.match(fakeDocument.elements.get("#decision-content").innerHTML, /This recommendation needs approval before it can move forward/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /שלח לאישור/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /Checkout dashboard/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /Ready/);
  assert.match(fakeDocument.elements.get("#layout-components-content").innerHTML, /page-level width control/);
  assert.match(fakeDocument.elements.get("#layout-components-content").innerHTML, /span 4/);
  assert.match(fakeDocument.elements.get("#layout-components-content").innerHTML, /maxWidth:1180/);
  assert.match(fakeDocument.elements.get("#feedback-components-content").innerHTML, /טוען את סביבת העבודה/);
  assert.match(fakeDocument.elements.get("#feedback-components-content").innerHTML, /Approval חסר/);
  assert.match(fakeDocument.elements.get("#feedback-components-content").innerHTML, /guides users when a workspace or panel has no content yet/);
  assert.match(fakeDocument.elements.get("#navigation-components-content").innerHTML, /persistent workspace navigation across major Nexus surfaces/);
  assert.match(fakeDocument.elements.get("#navigation-components-content").innerHTML, /Overview/);
  assert.match(fakeDocument.elements.get("#navigation-components-content").innerHTML, /Analysis/);
  assert.match(fakeDocument.elements.get("#data-display-components-content").innerHTML, /dense tabular views for entities/);
  assert.match(fakeDocument.elements.get("#data-display-components-content").innerHTML, /Weekly activation/);
  assert.match(fakeDocument.elements.get("#data-display-components-content").innerHTML, /Ready/);
  assert.match(fakeDocument.elements.get("#tab-developer").innerHTML, /Wire cockpit layout/);
  assert.match(fakeDocument.elements.get("#tab-release").innerHTML, /blocked/);
  assert.equal(fakeDocument.elements.get("#workspace-developer").hidden, false);
  assert.equal(fakeDocument.elements.get("#workspace-project-brain").hidden, true);
  assert.equal(fakeDocument.elements.get("#tab-developer").ariaSelected, "true");
  assert.equal(fakeDocument.documentElement.style.getPropertyValue("--bg"), "#101820");
  assert.equal(fakeDocument.documentElement.style.getPropertyValue("--font-body"), "\"IBM Plex Sans\", sans-serif");
  assert.equal(fakeDocument.documentElement.style.getPropertyValue("--layout-max-width"), "1360px");
  assert.equal(fakeDocument.documentElement.style.getPropertyValue("--space-lg"), "21px");

  app.setActiveWorkspace("release");

  assert.equal(fakeDocument.elements.get("#workspace-developer").hidden, true);
  assert.equal(fakeDocument.elements.get("#workspace-release").hidden, false);
  assert.equal(fakeDocument.elements.get("#tab-release").ariaSelected, "true");
});

test("cockpit refreshes live progress without manual clicks", async () => {
  const fakeDocument = createFakeDocument();
  const scheduled = [];
  const initialPayload = {
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Watch live progress",
    status: "active",
    source: { baseUrl: "http://localhost:4101" },
    overview: { bottleneck: "Execution in progress" },
    cycle: { roadmap: [{ summary: "Run build", status: "assigned", lane: "build", dependencies: [] }] },
    agents: [],
    approvals: [],
    events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
    collaborationFeed: {
      summary: { totalItems: 1, containsWorkspaceTransitions: false, containsApprovalCoordination: true },
      items: [
        {
          headline: "Approval is waiting for owner",
          actorName: "Nexus",
          workspaceArea: "release-workspace",
          status: "pending",
        },
      ],
    },
    realtimeEventStream: {
      events: [{ eventId: "evt-1", streamType: "progress", status: "active", message: "Build started" }],
      summary: { totalEvents: 1, progressEvents: 1 },
    },
    liveUpdateChannel: {
      transportMode: "polling",
      refreshStrategy: "scheduled-refresh",
      reconnectPolicy: { initialDelayMs: 25 },
    },
    liveLogStream: {
      streamId: "live-log-stream:giftwallet",
      streams: {
        stdout: [{ logId: "log-1", message: "npm install started", source: "runtime" }],
        stderr: [],
      },
      commandOutputs: [{ commandOutputId: "command-output:log-1", stream: "stdout", message: "npm install", timestamp: null }],
      summary: { totalEntries: 1 },
    },
    reactiveWorkspaceState: {
      progressBar: { percent: 12 },
    },
    progressState: { percent: 12 },
  };
  const livePayload = {
    progressState: { percent: 64 },
    reactiveWorkspaceState: { progressBar: { percent: 64 } },
    realtimeEventStream: {
      events: [{ eventId: "evt-2", streamType: "progress", status: "active", message: "Build almost done" }],
      summary: { totalEvents: 1, progressEvents: 1 },
    },
    liveUpdateChannel: {
      transportMode: "polling",
      refreshStrategy: "scheduled-refresh",
      reconnectPolicy: { initialDelayMs: 25 },
    },
    liveLogStream: {
      streamId: "live-log-stream:giftwallet",
      streams: {
        stdout: [{ logId: "log-2", message: "npm run build complete", source: "runtime" }],
        stderr: [{ logId: "log-3", message: "warning: skipped optional step", source: "runtime" }],
      },
      commandOutputs: [{ commandOutputId: "command-output:log-2", stream: "stdout", message: "npm run build", timestamp: null }],
      summary: { totalEntries: 2 },
    },
    projectPresenceState: { summary: { totalParticipants: 2, hasSharedPresence: true } },
    reviewThreadState: {
      threadStateId: "review-thread-state:giftwallet",
      threads: [
        {
          threadId: "thread:diff:exec-2",
          title: "Release diff review",
          contextTarget: { resourceType: "diff" },
          messages: [{ body: "Validate the release notes" }],
        },
      ],
      summary: { openThreads: 1 },
    },
    collaborationFeed: {
      summary: { totalItems: 1, containsWorkspaceTransitions: false, containsApprovalCoordination: true },
      items: [
        {
          headline: "Approval is waiting for owner",
          actorName: "Nexus",
          workspaceArea: "release-workspace",
          status: "pending",
        },
      ],
    },
    events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
  };

  async function fetchImpl(url) {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: [{ id: "giftwallet", name: "GiftWallet" }] };
        },
      };
    }

    if (url === "/api/projects/giftwallet") {
      return {
        ok: true,
        async json() {
          return initialPayload;
        },
      };
    }

    if (url === "/api/projects/giftwallet/live-state") {
      return {
        ok: true,
        async json() {
          return livePayload;
        },
      };
    }

    if (url === "/api/projects/giftwallet/presence") {
      return {
        ok: true,
        async json() {
          return initialPayload;
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    setTimeoutImpl(callback) {
      scheduled.push(callback);
      return callback;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /12%/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /npm install/);
  assert.equal(scheduled.length > 0, true);
  await app.refreshLiveState();

  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /64%/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /Build almost done/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /npm run build/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /warning: skipped optional step/);
  assert.match(fakeDocument.elements.get("#collaboration-content").innerHTML, /Release diff review/);
  assert.match(fakeDocument.elements.get("#collaboration-content").innerHTML, /Approval is waiting for owner/);
});

test("cockpit creates first project from empty app and lands in workspace", async () => {
  const fakeDocument = createFakeDocument();
  const storage = new Map();
  const requests = [];
  const timers = createShortDelayTimers();
  const projectPayload = {
    id: "launch-app",
    name: "Launch App",
    goal: "Ship the first usable workspace",
    status: "active",
    source: { baseUrl: "http://localhost:4101" },
    overview: { bottleneck: "Bootstrap is ready to continue" },
    cycle: {
      roadmap: [{ summary: "Review bootstrap output", status: "assigned", lane: "build", dependencies: [] }],
    },
    firstValueOutput: {
      outputId: "first-value:launch-app",
      preview: {
        headline: "Your starter app is ready",
        detail: "You already have a first app structure you can keep iterating on.",
      },
      summary: {
        feelsReal: true,
      },
    },
    firstValueSummary: {
      summaryId: "first-value-summary:launch-app",
      message: "Your starter app is ready and the project already has visible momentum.",
    },
    agents: [{ name: "Dev Agent", status: "working", currentTask: "Review bootstrap output" }],
    approvals: ["Review bootstrap output before the next rerun"],
    events: [{ type: "state.updated", payload: { projectId: "launch-app" } }],
    cockpitRecommendationSurface: {
      surfaceId: "cockpit-recommendation-surface:launch-app",
      headline: "Review bootstrap output",
      summary: "Review the generated starter structure before continuing.",
      whyNow: "The first usable output is ready and needs quick validation.",
      approval: {
        requiresApproval: false,
      },
      recommendationPanel: {
        urgency: "normal",
        expectedOutcome: "The next cycle can continue with less ambiguity.",
        primaryCta: {
          label: "Open review",
        },
      },
      summaryMeta: {
        blockerCount: 0,
      },
    },
    developerWorkspace: {
      contextSummary: {
        progressPercent: 18,
        progressStatus: "running",
        nextAction: "Review bootstrap output",
        incidentStatus: "clear",
      },
    },
    projectBrainWorkspace: {
      overview: { domain: "saas", currentPhase: "bootstrap" },
      summary: { blockerCount: 0, requiresApproval: false },
    },
    releaseWorkspace: {
      releaseTarget: "staging",
      buildAndDeploy: { currentStage: "planned" },
      validation: { status: "pending" },
      summary: { isBlocked: false },
    },
    growthWorkspace: {
      strategy: { targetAudience: "Product teams", gtmStage: "bootstrap", pillars: [], contentGoal: "Launch the first project" },
      campaigns: { tasks: [] },
      analytics: { kpis: [] },
      summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false },
    },
    designTokens: {
      colors: {
        canvas: "#101820",
        surface: "#18212b",
        ink: "#f3f4f6",
        muted: "#9ca3af",
        accent: "#14b8a6",
        accentStrong: "#0f766e",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        border: "#334155",
      },
      spacing: { xs: 5, sm: 9, md: 13, lg: 21, xl: 34, xxl: 55 },
      typography: {
        familyDisplay: "\"Avenir Next\", sans-serif",
        familyBody: "\"IBM Plex Sans\", sans-serif",
        sizeDisplay: 42,
        sizeXl: 30,
        sizeLg: 22,
        sizeMd: 17,
        sizeXs: 11,
      },
      radius: { sm: 7, md: 14, lg: 24, pill: 999 },
      borders: { subtle: 1, strong: 2, focus: 3 },
      shadows: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.2)",
        medium: "0 14px 36px rgba(0, 0, 0, 0.28)",
        focus: "0 0 0 3px rgba(20, 184, 166, 0.25)",
      },
    },
    typographySystem: {
      baseFontFamily: "\"IBM Plex Sans\", sans-serif",
      displayFontFamily: "\"Avenir Next\", sans-serif",
      typeScale: {
        display: { fontSize: 42 },
        h1: { fontSize: 30, lineHeight: 1.08 },
        h2: { fontSize: 22 },
        body: { fontSize: 17, lineHeight: 1.6 },
        meta: { fontSize: 11 },
      },
    },
    layoutSystem: {
      grid: { maxContentWidth: 1360, gutter: 24 },
      spacingScale: { xs: 5, sm: 9, md: 13, lg: 21, xl: 34, xxl: 55 },
      sectionRhythm: { pageTop: 55, sectionGap: 34, panelGap: 21 },
    },
    colorRules: {
      roles: {
        canvas: { token: "#101820" },
        surface: { token: "#18212b" },
        textPrimary: { token: "#f3f4f6" },
        textMuted: { token: "#9ca3af" },
        accent: { token: "#14b8a6" },
        accentStrong: { token: "#0f766e" },
        border: { token: "#334155" },
      },
      states: {
        success: { token: "#22c55e" },
        warning: { token: "#f59e0b" },
        danger: { token: "#ef4444" },
      },
    },
    primitiveComponents: {
      componentLibraryId: "primitive-components:design-tokens:nexus",
      baseContractId: "component-contract:button",
      components: [],
      summary: { totalComponents: 0, interactiveComponents: 0, includesFormPrimitives: false },
    },
  };

  async function fetchImpl(url, options = {}) {
    requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: [] };
        },
      };
    }

    if (url === "/api/auth/signup") {
      return {
        ok: true,
        async json() {
          return {
            authPayload: {
              userIdentity: {
                userId: "user-1",
                email: "local-operator@nexus.local",
                displayName: "Local operator",
              },
            },
          };
        },
      };
    }

    if (url === "/api/project-drafts") {
      return {
        ok: true,
        async json() {
          return {
            projectDraft: {
              id: "launch-app",
              owner: {
                userId: "user-1",
                email: "local-operator@nexus.local",
              },
            },
            projectDraftId: "launch-app",
            projectCreationRedirect: {
              target: "onboarding",
            },
          };
        },
      };
    }

    if (url === "/api/onboarding/sessions") {
      return {
        ok: true,
        async json() {
          return {
            onboardingSession: {
              sessionId: "onboarding-launch-app",
              projectDraftId: "launch-app",
            },
          };
        },
      };
    }

    if (url === "/api/onboarding/sessions/onboarding-launch-app/intake") {
      return {
        ok: true,
        async json() {
          return {
            updatedSession: {
              sessionId: "onboarding-launch-app",
            },
          };
        },
      };
    }

    if (url === "/api/onboarding/sessions/onboarding-launch-app/files") {
      return {
        ok: true,
        async json() {
          return {
            updatedSession: {
              sessionId: "onboarding-launch-app",
              projectIntake: {
                uploadedFiles: [
                  {
                    id: "file-1",
                    name: "brief.md",
                    type: "markdown",
                    content: "# Brief\nMain flow",
                  },
                ],
              },
            },
          };
        },
      };
    }

    if (url === "/api/onboarding/sessions/onboarding-launch-app/finish") {
      return {
        ok: true,
        async json() {
          return {
            blocked: false,
            project: {
              id: "launch-app",
            },
          };
        },
      };
    }

    if (url === "/api/projects/launch-app/run-cycle") {
      return {
        ok: true,
        async json() {
          return {
            ok: true,
          };
        },
      };
    }

    if (url === "/api/projects/launch-app") {
      return {
        ok: true,
        async json() {
          return projectPayload;
        },
      };
    }

    if (url === "/api/projects/launch-app/presence") {
      return {
        ok: true,
        async json() {
          return projectPayload;
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
  });

  await app.ready;

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, true);
  assert.equal(fakeDocument.elements.get("#create-project-button").textContent, "צור פרויקט");

  fakeDocument.elements.get("#create-project-name-input").value = "Launch App";
  fakeDocument.elements.get("#create-project-vision-input").value = "אפליקציה עם התחברות ו־approval flow";
  fakeDocument.elements.get("#create-project-file-name-input").value = "brief.md";
  fakeDocument.elements.get("#create-project-file-content-input").value = "# Brief\nMain flow";

  await fakeDocument.elements.get("#create-project-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#onboarding-stage").hidden, false);
  assert.equal(fakeDocument.elements.get("#onboarding-material-stage").hidden, true);
  assert.equal(fakeDocument.elements.get("#finish-onboarding-button").hidden, true);
  assert.equal(fakeDocument.elements.get("#onboarding-next-button").hidden, false);
  assert.match(fakeDocument.elements.get("#onboarding-screen-message").textContent, /עברנו ל־onboarding/);
  assert.match(fakeDocument.elements.get("#onboarding-screen-status").textContent, /שלב נפרד מיצירת הפרויקט/);
  assert.match(fakeDocument.elements.get("#onboarding-stage-title").textContent, /מחדדים את הפרויקט/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /מה הובן/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /מה עדיין חסר/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /מה מתחדד עכשיו/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /Launch App/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /עדיין חסר מי המשתמש המרכזי/);
  assert.match(fakeDocument.elements.get("#onboarding-current-question-title").textContent, /למי הפרויקט הזה מיועד/);

  fakeDocument.elements.get("#onboarding-answer-input").value = "מנהלי מוצר וצוותי פיתוח";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  assert.equal(fakeDocument.elements.get("#onboarding-answer-input").value, "");
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(fakeDocument.elements.get("#onboarding-answer-input").value, "");
  assert.match(fakeDocument.elements.get("#onboarding-current-question-title").textContent, /מעולה, עכשיו נחדד/);
  assert.match(fakeDocument.elements.get("#onboarding-current-question-body").textContent, /מנהלי מוצר וצוותי פיתוח/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /ה־AI כבר מבין שהמשתמש המרכזי הוא מנהלי מוצר וצוותי פיתוח/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /עדיין לא ברור מה הפעולה הראשונה/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /ה־AI מחדד את הזרימה הראשונית/);
  fakeDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט ולקבל next task";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.match(fakeDocument.elements.get("#onboarding-current-question-title").textContent, /יש לי כבר תמונה כמעט שלמה/);
  fakeDocument.elements.get("#onboarding-answer-input").value = "לראות project state usable";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));

  assert.equal(fakeDocument.elements.get("#onboarding-material-stage").hidden, false);
  assert.equal(fakeDocument.elements.get("#finish-onboarding-button").hidden, false);
  assert.match(fakeDocument.elements.get("#onboarding-progress-pill").textContent, /השיחה הושלמה/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /מדד הערך הראשוני מתבהר/);
  assert.match(fakeDocument.elements.get("#onboarding-notes-list").innerHTML, /כרגע אני מבין שאנחנו בונים עבור/);

  await fakeDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, false);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, false);
  assert.equal(fakeDocument.elements.get("#hero-project-name").textContent, "Launch App");
  assert.match(fakeDocument.elements.get("#developer-workspace-summary").innerHTML, /18%/);
  assert.match(fakeDocument.elements.get("#now-content").innerHTML, /Your starter app is ready/);
  assert.match(fakeDocument.elements.get("#graph-content").innerHTML, /Review bootstrap output/);
  assert.match(fakeDocument.elements.get("#decision-content").innerHTML, /Review bootstrap output/);
  assert.equal(fakeDocument.elements.get("#flow-feedback-banner").hidden, false);
  assert.match(fakeDocument.elements.get("#flow-feedback-title").textContent, /הפרויקט שלך מוכן/);
  assert.match(fakeDocument.elements.get("#flow-feedback-message").textContent, /נכנסת עכשיו ל־workspace של Launch App/);
  assert.match(fakeDocument.elements.get("#flow-feedback-message").textContent, /מנהלי מוצר וצוותי פיתוח/);
  assert.equal(requests.some((request) => request.url === "/api/project-drafts" && request.method === "POST"), true);
  assert.equal(requests.some((request) => request.url === "/api/onboarding/sessions/onboarding-launch-app/files" && request.method === "POST"), true);
  assert.equal(requests.some((request) => request.url === "/api/onboarding/sessions/onboarding-launch-app/finish" && request.method === "POST"), true);
  assert.equal(requests.some((request) => request.url === "/api/projects/launch-app" && request.method === "GET"), true);

  await fakeDocument.elements.get("#run-cycle-button").listeners.click();
  assert.equal(requests.some((request) => request.url === "/api/projects/launch-app/run-cycle" && request.method === "POST"), true);
  assert.equal(requests.filter((request) => request.url === "/api/projects/launch-app" && request.method === "GET").length >= 2, true);
  assert.match(fakeDocument.elements.get("#flow-feedback-title").textContent, /ה־workspace עודכן|הפרויקט התקדם/);
  assert.match(fakeDocument.elements.get("#flow-feedback-message").textContent, /אותו פרויקט|החסם המרכזי עכשיו הוא|הפעולה הבאה עודכנה|המצב עבר ל־/);
});

test("cockpit explains blocked onboarding finish instead of appearing stuck", async () => {
  const fakeDocument = createFakeDocument();
  const requests = [];
  const timers = createShortDelayTimers();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url, options = {}) => {
      requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return { projects: [] };
          },
        };
      }

      if (url === "/api/auth/signup") {
        return {
          ok: true,
          async json() {
            return {
              authPayload: {
                userIdentity: {
                  userId: "user-blocked",
                  email: "blocked@example.com",
                },
              },
            };
          },
        };
      }

      if (url === "/api/project-drafts") {
        return {
          ok: true,
          async json() {
            return {
              projectDraftId: "blocked-app",
              projectCreationRedirect: {
                target: "onboarding",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions") {
        return {
          ok: true,
          async json() {
            return {
              onboardingSession: {
                sessionId: "onboarding-blocked-app",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-blocked-app/intake") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-blocked-app" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-blocked-app/files") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-blocked-app" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-blocked-app/finish") {
        return {
          ok: true,
          async json() {
            return {
              blocked: true,
              error: "Onboarding is not ready to build project state",
              onboardingCompletionDecision: {
                readinessLevel: "blocked",
                missingInputs: ["supporting-material"],
                clarificationPrompts: ["העלה איפיון, קבצים או קישור חיצוני"],
              },
            };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
  });

  await app.ready;

  fakeDocument.elements.get("#create-project-name-input").value = "Blocked App";
  fakeDocument.elements.get("#create-project-vision-input").value = "אפליקציה כללית";
  fakeDocument.elements.get("#create-project-file-name-input").value = "brief.md";
  fakeDocument.elements.get("#create-project-file-content-input").value = "# Brief";

  await fakeDocument.elements.get("#create-project-button").listeners.click();
  fakeDocument.elements.get("#onboarding-answer-input").value = "צוותי מוצר";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לקבל first value";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  await fakeDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(requests.some((request) => request.url === "/api/onboarding/sessions/onboarding-blocked-app/finish" && request.method === "POST"), true);
  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, true);
  assert.match(fakeDocument.elements.get("#onboarding-screen-message").textContent, /דורש השלמה/i);
  assert.match(fakeDocument.elements.get("#onboarding-screen-status").textContent, /העלה איפיון, קבצים או קישור חיצוני/);
});

test("cockpit disables finish button and shows visible loading state while onboarding finish is pending", async () => {
  const fakeDocument = createFakeDocument();
  const requests = [];
  const timers = createShortDelayTimers();
  let resolveFinish;
  const finishPromise = new Promise((resolve) => {
    resolveFinish = resolve;
  });

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url, options = {}) => {
      requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return { projects: [] };
          },
        };
      }

      if (url === "/api/auth/signup") {
        return {
          ok: true,
          async json() {
            return {
              authPayload: {
                userIdentity: {
                  userId: "user-loading",
                  email: "loading@example.com",
                },
              },
            };
          },
        };
      }

      if (url === "/api/project-drafts") {
        return {
          ok: true,
          async json() {
            return {
              projectDraftId: "loading-app",
              projectCreationRedirect: {
                target: "onboarding",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions") {
        return {
          ok: true,
          async json() {
            return {
              onboardingSession: {
                sessionId: "onboarding-loading-app",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-loading-app/intake") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-loading-app" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-loading-app/files") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-loading-app" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-loading-app/finish") {
        await finishPromise;
        return {
          ok: true,
          async json() {
            return {
              blocked: false,
              project: {
                id: "loading-app",
                name: "Loading App",
                goal: "טוען workspace",
                cycle: { roadmap: [] },
                agents: [],
                events: [],
              },
            };
          },
        };
      }

      if (url === "/api/projects/loading-app") {
        return {
          ok: true,
          async json() {
            return {
              id: "loading-app",
              name: "Loading App",
              goal: "טוען workspace",
              cycle: { roadmap: [] },
              agents: [],
              events: [],
            };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
  });

  await app.ready;

  fakeDocument.elements.get("#create-project-name-input").value = "Loading App";
  fakeDocument.elements.get("#create-project-vision-input").value = "אפליקציה כללית";
  fakeDocument.elements.get("#create-project-file-name-input").value = "brief.md";
  fakeDocument.elements.get("#create-project-file-content-input").value = "# Brief";

  await fakeDocument.elements.get("#create-project-button").listeners.click();
  fakeDocument.elements.get("#onboarding-answer-input").value = "צוותי מוצר";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לקבל first value";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  const clickPromise = fakeDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#finish-onboarding-button").disabled, true);
  assert.match(fakeDocument.elements.get("#finish-onboarding-button").textContent, /מסיים Onboarding/);
  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.match(fakeDocument.elements.get("#onboarding-screen-message").textContent, /מסיימים onboarding/);
  assert.match(fakeDocument.elements.get("#onboarding-screen-status").textContent, /הבקשה נשלחה/);

  resolveFinish();
  await clickPromise;
});

test("cockpit can reopen onboarding screen from the workspace for live UI checks", async () => {
  const fakeDocument = createFakeDocument();
  const requests = [];

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url, options = {}) => {
      requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return {
              projects: [{ id: "giftwallet", name: "GiftWallet" }],
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet") {
        return {
          ok: true,
          async json() {
            return {
              id: "giftwallet",
              name: "GiftWallet",
              goal: "מחדדים את מסך ה-onboarding",
              status: "active",
              source: { baseUrl: "http://localhost:4101" },
              overview: { bottleneck: "Need clearer onboarding" },
              cycle: { roadmap: [] },
              agents: [],
              approvals: [],
              events: [],
              developerWorkspace: { contextSummary: { progressPercent: 10, progressStatus: "working", nextAction: "Refine onboarding", incidentStatus: "clear" } },
              projectBrainWorkspace: { overview: { domain: "saas", currentPhase: "setup" }, summary: { blockerCount: 0, requiresApproval: false } },
              releaseWorkspace: { releaseTarget: "staging", buildAndDeploy: { currentStage: "planned" }, validation: { status: "clear" }, summary: { isBlocked: false } },
              growthWorkspace: { summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false } },
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet/presence") {
        return {
          ok: true,
          async json() {
            return { ok: true };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;

  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);

  fakeDocument.elements.get("#reopen-onboarding-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.match(fakeDocument.elements.get("#onboarding-screen-message").textContent, /פתחת מחדש את מסך ה־Onboarding/);
  assert.match(fakeDocument.elements.get("#onboarding-screen-status").textContent, /מצב בדיקה מתוך ה־workspace/);
  assert.equal(fakeDocument.elements.get("#create-project-name-input").value, "GiftWallet");
});

test("cockpit does not get stuck when finishing dev-only onboarding reopened from the workspace", async () => {
  const fakeDocument = createFakeDocument();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url) => {
      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return {
              projects: [{ id: "giftwallet", name: "GiftWallet" }],
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet") {
        return {
          ok: true,
          async json() {
            return {
              id: "giftwallet",
              name: "GiftWallet",
              goal: "Validate onboarding return path",
              status: "active",
              source: { baseUrl: "http://localhost:4101" },
              overview: { bottleneck: "Need a safe finish fallback" },
              cycle: { roadmap: [] },
              agents: [],
              approvals: [],
              events: [],
              developerWorkspace: { contextSummary: { progressPercent: 10, progressStatus: "working", nextAction: "Continue in workspace", incidentStatus: "clear" } },
              projectBrainWorkspace: { overview: { domain: "saas", currentPhase: "setup" }, summary: { blockerCount: 0, requiresApproval: false } },
              releaseWorkspace: { releaseTarget: "staging", buildAndDeploy: { currentStage: "planned" }, validation: { status: "clear" }, summary: { isBlocked: false } },
              growthWorkspace: { summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false } },
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet/presence") {
        return {
          ok: true,
          async json() {
            return { ok: true };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;

  fakeDocument.elements.get("#reopen-onboarding-button").listeners.click();
  fakeDocument.elements.get("#create-project-link-input").value = "https://example.com/spec";
  fakeDocument.elements.get("#onboarding-answer-input").value = "מנהלי מוצר";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  fakeDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  fakeDocument.elements.get("#onboarding-answer-input").value = "לקבל next task";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();

  await fakeDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, false);
  assert.match(fakeDocument.elements.get("#flow-feedback-title").textContent, /חזרת ל־workspace שלך/);
});

test("cockpit can return from workspace to a clean create-project screen", async () => {
  const fakeDocument = createFakeDocument();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url) => {
      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return {
              projects: [{ id: "giftwallet", name: "GiftWallet" }],
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet") {
        return {
          ok: true,
          async json() {
            return {
              id: "giftwallet",
              name: "GiftWallet",
              goal: "Return to create-project",
              status: "active",
              source: { baseUrl: "http://localhost:4101" },
              overview: { bottleneck: "Need a new project entry path" },
              cycle: { roadmap: [] },
              agents: [],
              approvals: [],
              events: [],
              developerWorkspace: { contextSummary: { progressPercent: 10, progressStatus: "working", nextAction: "Create another project", incidentStatus: "clear" } },
              projectBrainWorkspace: { overview: { domain: "saas", currentPhase: "setup" }, summary: { blockerCount: 0, requiresApproval: false } },
              releaseWorkspace: { releaseTarget: "staging", buildAndDeploy: { currentStage: "planned" }, validation: { status: "clear" }, summary: { isBlocked: false } },
              growthWorkspace: { summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false } },
            };
          },
        };
      }

      if (url === "/api/projects/giftwallet/presence") {
        return {
          ok: true,
          async json() {
            return { ok: true };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;

  fakeDocument.elements.get("#create-project-name-input").value = "Old project";
  fakeDocument.elements.get("#create-project-vision-input").value = "Old vision";
  fakeDocument.elements.get("#create-project-link-input").value = "https://example.com";
  fakeDocument.elements.get("#create-project-file-name-input").value = "brief.md";
  fakeDocument.elements.get("#create-project-file-content-input").value = "# Brief";

  fakeDocument.elements.get("#create-new-project-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, true);
  assert.match(fakeDocument.elements.get("#empty-project-message").textContent, /צור פרויקט חדש/);
  assert.equal(fakeDocument.elements.get("#create-project-name-input").value, "");
  assert.equal(fakeDocument.elements.get("#create-project-vision-input").value, "");
  assert.equal(fakeDocument.elements.get("#create-project-link-input").value, "");
  assert.equal(fakeDocument.elements.get("#create-project-file-name-input").value, "");
  assert.equal(fakeDocument.elements.get("#create-project-file-content-input").value, "");
});

test("cockpit can exit real onboarding back to the create-project screen", async () => {
  const fakeDocument = createFakeDocument();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url) => {
      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return { projects: [] };
          },
        };
      }

      if (url === "/api/auth/signup") {
        return {
          ok: true,
          async json() {
            return {
              authPayload: {
                userIdentity: {
                  userId: "user-back",
                  email: "back@example.com",
                },
              },
            };
          },
        };
      }

      if (url === "/api/project-drafts") {
        return {
          ok: true,
          async json() {
            return {
              projectDraftId: "back-project",
              projectCreationRedirect: {
                target: "onboarding",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions") {
        return {
          ok: true,
          async json() {
            return {
              onboardingSession: {
                sessionId: "onboarding-back-project",
              },
            };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
  });

  await app.ready;

  fakeDocument.elements.get("#create-project-name-input").value = "Back Project";
  fakeDocument.elements.get("#create-project-vision-input").value = "Need a clear back path";
  await fakeDocument.elements.get("#create-project-button").listeners.click();
  await fakeDocument.elements.get("#onboarding-back-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.match(fakeDocument.elements.get("#empty-project-message").textContent, /חזרת ליצירת הפרויקט/);
});

test("cockpit restores onboarding screen after refresh using local app state", async () => {
  const storage = new Map();

  const createFetch = async (url, options = {}) => {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: [] };
        },
      };
    }

    if (url === "/api/auth/signup") {
      return {
        ok: true,
        async json() {
          return {
            authPayload: {
              userIdentity: {
                userId: "restore-user",
                email: "restore@example.com",
              },
            },
          };
        },
      };
    }

    if (url === "/api/project-drafts") {
      return {
        ok: true,
        async json() {
          return {
            projectDraftId: "restore-project",
            projectCreationRedirect: {
              target: "onboarding",
            },
          };
        },
      };
    }

    if (url === "/api/onboarding/sessions") {
      return {
        ok: true,
        async json() {
          return {
            onboardingSession: {
              sessionId: "onboarding-restore-project",
            },
          };
        },
      };
    }

    throw new Error(`Unexpected fetch ${url}`);
  };

  const firstDocument = createFakeDocument();
  const firstApp = createCockpitApp({
    doc: firstDocument,
    fetchImpl: createFetch,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
  });

  await firstApp.ready;
  firstDocument.elements.get("#create-project-name-input").value = "Restore Flow";
  firstDocument.elements.get("#create-project-vision-input").value = "Validate onboarding restore";
  await firstDocument.elements.get("#create-project-button").listeners.click();
  firstDocument.elements.get("#onboarding-answer-input").value = "מנהלי מוצר";
  firstDocument.elements.get("#onboarding-answer-input").listeners.input();

  const secondDocument = createFakeDocument();
  const secondApp = createCockpitApp({
    doc: secondDocument,
    fetchImpl: createFetch,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
  });

  await secondApp.ready;

  assert.equal(secondDocument.elements.get("#screen-create").hidden, true);
  assert.equal(secondDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(secondDocument.elements.get("#screen-workspace").hidden, true);
  assert.match(secondDocument.elements.get("#onboarding-screen-message").textContent, /חזרת ל־Onboarding/);
  assert.equal(secondDocument.elements.get("#create-project-name-input").value, "Restore Flow");
  assert.equal(secondDocument.elements.get("#create-project-vision-input").value, "Validate onboarding restore");
  assert.equal(secondDocument.elements.get("#onboarding-answer-input").value, "מנהלי מוצר");
});

test("cockpit restores workspace after refresh using local app state", async () => {
  const storage = new Map();

  const fetchWorkspace = async (url) => {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return {
            projects: [{ id: "giftwallet", name: "GiftWallet" }],
          };
        },
      };
    }

    if (url === "/api/projects/giftwallet") {
      return {
        ok: true,
        async json() {
          return {
            id: "giftwallet",
            name: "GiftWallet",
            goal: "Return to workspace after refresh",
            status: "active",
            source: { baseUrl: "http://localhost:4101" },
            overview: { bottleneck: "Need workspace persistence" },
            cycle: { roadmap: [] },
            agents: [],
            approvals: [],
            events: [],
            developerWorkspace: { contextSummary: { progressPercent: 12, progressStatus: "working", nextAction: "Continue in workspace", incidentStatus: "clear" } },
            projectBrainWorkspace: { overview: { domain: "saas", currentPhase: "setup" }, summary: { blockerCount: 0, requiresApproval: false } },
            releaseWorkspace: { releaseTarget: "staging", buildAndDeploy: { currentStage: "planned" }, validation: { status: "clear" }, summary: { isBlocked: false } },
            growthWorkspace: { summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false } },
          };
        },
      };
    }

    if (url === "/api/projects/giftwallet/presence") {
      return {
        ok: true,
        async json() {
          return { ok: true };
        },
      };
    }

    throw new Error(`Unexpected fetch ${url}`);
  };

  const firstDocument = createFakeDocument();
  const firstApp = createCockpitApp({
    doc: firstDocument,
    fetchImpl: fetchWorkspace,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await firstApp.ready;

  const secondDocument = createFakeDocument();
  const secondApp = createCockpitApp({
    doc: secondDocument,
    fetchImpl: fetchWorkspace,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await secondApp.ready;

  assert.equal(secondDocument.elements.get("#screen-create").hidden, true);
  assert.equal(secondDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(secondDocument.elements.get("#screen-workspace").hidden, false);
  assert.equal(secondDocument.elements.get("#workspace-board").hidden, false);
  assert.equal(secondDocument.elements.get("#hero-project-name").textContent, "GiftWallet");
});

test("cockpit restores reopened onboarding after refresh and can exit back to workspace", async () => {
  const storage = new Map();

  const fetchWorkspace = async (url) => {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return {
            projects: [{ id: "giftwallet", name: "GiftWallet" }],
          };
        },
      };
    }

    if (url === "/api/projects/giftwallet") {
      return {
        ok: true,
        async json() {
          return {
            id: "giftwallet",
            name: "GiftWallet",
            goal: "Return safely from reopened onboarding",
            status: "active",
            source: { baseUrl: "http://localhost:4101" },
            overview: { bottleneck: "Need safe exit after refresh" },
            cycle: { roadmap: [] },
            agents: [],
            approvals: [],
            events: [],
            developerWorkspace: { contextSummary: { progressPercent: 12, progressStatus: "working", nextAction: "Continue in workspace", incidentStatus: "clear" } },
            projectBrainWorkspace: { overview: { domain: "saas", currentPhase: "setup" }, summary: { blockerCount: 0, requiresApproval: false } },
            releaseWorkspace: { releaseTarget: "staging", buildAndDeploy: { currentStage: "planned" }, validation: { status: "clear" }, summary: { isBlocked: false } },
            growthWorkspace: { summary: { totalPillars: 0, totalChannels: 0, totalKpis: 0, hasGrowthPlan: false } },
          };
        },
      };
    }

    if (url === "/api/projects/giftwallet/presence") {
      return {
        ok: true,
        async json() {
          return { ok: true };
        },
      };
    }

    throw new Error(`Unexpected fetch ${url}`);
  };

  const firstDocument = createFakeDocument();
  const firstApp = createCockpitApp({
    doc: firstDocument,
    fetchImpl: fetchWorkspace,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await firstApp.ready;
  firstDocument.elements.get("#reopen-onboarding-button").listeners.click();

  const secondDocument = createFakeDocument();
  const secondApp = createCockpitApp({
    doc: secondDocument,
    fetchImpl: fetchWorkspace,
    storageImpl: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await secondApp.ready;

  assert.equal(secondDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(secondDocument.elements.get("#screen-workspace").hidden, true);

  secondDocument.elements.get("#create-project-link-input").value = "https://example.com/spec";
  secondDocument.elements.get("#onboarding-answer-input").value = "מנהלי מוצר";
  secondDocument.elements.get("#onboarding-next-button").listeners.click();
  secondDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט";
  secondDocument.elements.get("#onboarding-next-button").listeners.click();
  secondDocument.elements.get("#onboarding-answer-input").value = "לקבל next task";
  secondDocument.elements.get("#onboarding-next-button").listeners.click();

  await secondDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(secondDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(secondDocument.elements.get("#screen-workspace").hidden, false);
  assert.match(secondDocument.elements.get("#flow-feedback-title").textContent, /חזרת ל־workspace שלך/);
});

test("cockpit exposes explicit onboarding navigation controls", async () => {
  const fakeDocument = createFakeDocument();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url) => {
      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return { projects: [] };
          },
        };
      }

      if (url === "/api/auth/signup") {
        return {
          ok: true,
          async json() {
            return {
              authPayload: {
                userIdentity: {
                  userId: "user-nav",
                  email: "nav@example.com",
                },
              },
            };
          },
        };
      }

      if (url === "/api/project-drafts") {
        return {
          ok: true,
          async json() {
            return {
              projectDraftId: "nav-project",
              projectCreationRedirect: {
                target: "onboarding",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions") {
        return {
          ok: true,
          async json() {
            return {
              onboardingSession: {
                sessionId: "onboarding-nav-project",
              },
            };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
  });

  await app.ready;

  fakeDocument.elements.get("#create-project-name-input").value = "Nav Project";
  fakeDocument.elements.get("#create-project-vision-input").value = "Need explicit controls";
  await fakeDocument.elements.get("#create-project-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#onboarding-back-button").hidden, false);
  assert.equal(fakeDocument.elements.get("#onboarding-forward-button").hidden, false);
  assert.match(fakeDocument.elements.get("#onboarding-back-button").textContent, /חזור ליצירת הפרויקט/);
  assert.match(fakeDocument.elements.get("#onboarding-forward-button").textContent, /קדימה/);
});

test("product flow invariants keep create, onboarding, and workspace as exclusive screens", async () => {
  const fakeDocument = createFakeDocument();
  const requests = [];
  const timers = createShortDelayTimers();

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl: async (url, options = {}) => {
      requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

      if (url === "/api/projects") {
        return {
          ok: true,
          async json() {
            return { projects: [] };
          },
        };
      }

      if (url === "/api/auth/signup") {
        return {
          ok: true,
          async json() {
            return {
              authPayload: {
                userIdentity: {
                  userId: "user-invariants",
                  email: "invariants@example.com",
                },
              },
            };
          },
        };
      }

      if (url === "/api/project-drafts") {
        return {
          ok: true,
          async json() {
            return {
              projectDraftId: "flow-invariants",
              projectCreationRedirect: {
                target: "onboarding",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions") {
        return {
          ok: true,
          async json() {
            return {
              onboardingSession: {
                sessionId: "onboarding-flow-invariants",
              },
            };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-flow-invariants/intake") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-flow-invariants" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-flow-invariants/files") {
        return {
          ok: true,
          async json() {
            return { updatedSession: { sessionId: "onboarding-flow-invariants" } };
          },
        };
      }

      if (url === "/api/onboarding/sessions/onboarding-flow-invariants/finish") {
        return {
          ok: true,
          async json() {
            return {
              blocked: false,
              project: {
                id: "flow-invariants",
              },
            };
          },
        };
      }

      if (url === "/api/projects/flow-invariants") {
        return {
          ok: true,
          async json() {
            return {
              id: "flow-invariants",
              name: "Flow Invariants",
              goal: "Validate product flow contract",
              status: "active",
              source: { baseUrl: "http://localhost:4101" },
              overview: { bottleneck: "Need contract coverage" },
              cycle: { roadmap: [] },
              agents: [],
              approvals: [],
              events: [],
              developerWorkspace: {
                contextSummary: {
                  progressPercent: 20,
                  progressStatus: "working",
                  nextAction: "Review contract",
                  incidentStatus: "clear",
                },
              },
              projectBrainWorkspace: {
                overview: { domain: "saas", currentPhase: "setup" },
                summary: { blockerCount: 0, requiresApproval: false },
              },
              releaseWorkspace: {
                releaseTarget: "staging",
                buildAndDeploy: { currentStage: "planned" },
                validation: { status: "clear" },
                summary: { isBlocked: false },
              },
              growthWorkspace: {
                summary: {
                  totalPillars: 0,
                  totalChannels: 0,
                  totalKpis: 0,
                  hasGrowthPlan: false,
                },
              },
            };
          },
        };
      }

      if (url === "/api/projects/flow-invariants/presence") {
        return {
          ok: true,
          async json() {
            return { ok: true };
          },
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    },
    appStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
  });

  await app.ready;

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);

  fakeDocument.elements.get("#create-project-name-input").value = "Flow Invariants";
  fakeDocument.elements.get("#create-project-vision-input").value = "בדיקת חוזה flow";
  fakeDocument.elements.get("#create-project-file-name-input").value = "brief.md";
  fakeDocument.elements.get("#create-project-file-content-input").value = "# Brief";

  await fakeDocument.elements.get("#create-project-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, true);

  fakeDocument.elements.get("#onboarding-answer-input").value = "מנהלי מוצר";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לפתוח פרויקט";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  fakeDocument.elements.get("#onboarding-answer-input").value = "לקבל next task";
  fakeDocument.elements.get("#onboarding-next-button").listeners.click();
  await new Promise((resolve) => setTimeout(resolve, 10));

  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, false);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, true);

  await fakeDocument.elements.get("#finish-onboarding-button").listeners.click();

  assert.equal(fakeDocument.elements.get("#screen-create").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-onboarding").hidden, true);
  assert.equal(fakeDocument.elements.get("#screen-workspace").hidden, false);
  assert.equal(fakeDocument.elements.get("#workspace-board").hidden, false);
  assert.equal(fakeDocument.elements.get("#tab-developer").ariaSelected, "true");
  assert.equal(requests.some((request) => request.url === "/api/onboarding/sessions/onboarding-flow-invariants/finish" && request.method === "POST"), true);
});

test("cockpit supports proposal editing and partial acceptance through the release workspace", async () => {
  const fakeDocument = createFakeDocument();
  const service = createProjectService();
  const requests = [];
  const signedUp = service.signupUser({
    userInput: {
      email: "web-mutation@example.com",
      displayName: "Web Mutation",
    },
    credentials: {
      password: "secret123",
    },
  });
  const draft = service.createProjectDraft({
    userInput: {
      email: "web-mutation@example.com",
    },
    projectCreationInput: {
      projectName: "Mutation Flow",
      visionText: "מערכת שמקדמת proposals עם editing ו־partial acceptance",
      requestedDeliverables: ["auth", "workflow"],
    },
  });
  const session = service.createOnboardingSession({
    userId: signedUp.authPayload.userIdentity.userId,
    projectDraftId: draft.projectDraftId,
    initialInput: {
      projectName: "Mutation Flow",
    },
  });
  service.updateOnboardingIntake({
    sessionId: session.sessionId,
    visionText: "שם הפרויקט: Mutation Flow\nאפליקציה עם proposal review ו־approval flow",
    uploadedFiles: [{ name: "spec.md", type: "markdown", content: "# Spec" }],
    externalLinks: [],
  });
  const finished = service.finishOnboardingSession(session.sessionId);
  const projectId = finished.project.id;

  async function fetchImpl(url, options = {}) {
    requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: service.listProjects() };
        },
      };
    }

    if (url === `/api/projects/${projectId}`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/presence`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/proposal-edits`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.submitProposalEdits({
            projectId,
            userEditInput: body.userEditInput,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/partial-acceptance`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.submitPartialAcceptance({
            projectId,
            approvalOutcome: body.approvalOutcome,
          });
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;
  app.setActiveWorkspace("release");

  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /Current proposal scope/);
  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /AI design chain/);
  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /Generated preview/);

  fakeDocument.elements.get("#proposal-section-title-input").value = "Approval Handoff";
  fakeDocument.elements.get("#proposal-section-summary-input").value = "להבהיר מה עובר אישור ומה נשלח ל־regeneration.";
  fakeDocument.elements.get("#proposal-next-action-label-input").value = "אשר חלקית והמשך";
  fakeDocument.elements.get("#proposal-annotation-input").value = "צריך לחדד את מסלול האישור.";

  await fakeDocument.elements.get("#proposal-edit-button").listeners.click();

  const editedProject = service.getProject(projectId);
  assert.equal(editedProject.state.editedProposal.sections[0].label, "Approval Handoff");
  assert.equal(editedProject.state.editedProposal.nextAction.label, "אשר חלקית והמשך");
  assert.equal(editedProject.state.proposalEditHistory.entries.length >= 3, true);
  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /Revision/);

  fakeDocument.elements.get("#partial-section-decision-select").value = "approved";
  fakeDocument.elements.get("#partial-component-decision-select").value = "rejected";
  fakeDocument.elements.get("#partial-copy-decision-select").value = "approved";
  fakeDocument.elements.get("#partial-acceptance-note-input").value = "רק הרכיב צריך regeneration.";

  await fakeDocument.elements.get("#partial-acceptance-button").listeners.click();

  const partialProject = service.getProject(projectId);
  assert.equal(partialProject.state.partialAcceptanceDecision.status, "partially-accepted");
  assert.equal(partialProject.state.partialAcceptanceDecision.followUpAction, "regenerate-rejected-scope");
  assert.equal(Array.isArray(partialProject.state.remainingProposalScope.componentsNeedingRegeneration), true);
  assert.equal(partialProject.state.remainingProposalScope.componentsNeedingRegeneration.length >= 1, true);
  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /regenerate-rejected-scope/);
  assert.match(fakeDocument.elements.get("#proposal-review-content").innerHTML, /ready-for-state-integration/);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/proposal-edits` && request.method === "POST"), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/partial-acceptance` && request.method === "POST"), true);
});

test("cockpit supports rollback execution and project audit filtering from the workspace", async () => {
  const fakeDocument = createFakeDocument();
  const service = createProjectService();
  const requests = [];
  service.seedDemoProject();
  const projectId = "giftwallet";
  const project = service.projects.get(projectId);
  project.context = {
    ...(project.context ?? {}),
    restoreDecision: {
      restoreDecisionId: "restore-decision:giftwallet",
      canRestore: true,
      restoreMode: "full",
      restoreTargets: ["project-state", "execution-graph", "workspace-reference"],
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:giftwallet:v3",
      versions: {
        stateVersion: 3,
        executionGraphVersion: 9,
      },
      restorePayload: {
        projectState: {
          riskLevel: "low",
        },
        executionGraph: {
          nodes: [{ id: "restore-node" }],
          edges: [],
        },
        workspaceReference: {
          workspaceId: "workspace-giftwallet",
          workspacePath: "/restored/workspace",
          workspaceArea: "developer-workspace",
        },
      },
    },
    actorActionTrace: {
      actorActionTraceId: "actor-action-trace:giftwallet:1",
      projectId: "giftwallet",
      actor: {
        actorId: "owner-1",
        actorType: "user",
      },
      action: {
        actionType: "project.approval",
        category: "approval",
        summary: "Approval submitted",
        riskLevel: "high",
      },
      outcome: {
        status: "invoked",
      },
      timestamp: "2026-03-30T09:00:00.000Z",
    },
  };

  async function fetchImpl(url, options = {}) {
    requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: service.listProjects() };
        },
      };
    }

    if (url === `/api/projects/${projectId}`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/presence`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/rollback-executions`) {
      return {
        ok: true,
        async json() {
          return service.executeProjectRollback({ projectId });
        },
      };
    }

    if (url.startsWith(`/api/projects/${projectId}/audit`)) {
      const targetUrl = new URL(`http://localhost${url}`);
      return {
        ok: true,
        async json() {
          return service.getProjectAuditPayload(projectId, {
            actorId: targetUrl.searchParams.get("actorId") ?? null,
            actionType: targetUrl.searchParams.get("actionType") ?? null,
            sensitivity: targetUrl.searchParams.get("sensitivity") ?? null,
          });
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });

  await app.ready;
  app.setActiveWorkspace("release");

  await fakeDocument.elements.get("#execute-rollback-button").listeners.click();

  const rollbackProject = service.getProject(projectId);
  assert.equal(rollbackProject.context.rollbackExecutionResult.executed, true);
  assert.equal(rollbackProject.context.rollbackExecutionResult.summary.restoredTargetCount > 0, true);
  assert.equal(
    requests.some((request) => request.url === `/api/projects/${projectId}/rollback-executions` && request.method === "POST"),
    true,
  );

  fakeDocument.elements.get("#project-audit-action-input").value = "project.approval";
  fakeDocument.elements.get("#project-audit-sensitivity-select").value = "high";
  await fakeDocument.elements.get("#project-audit-refresh-button").listeners.click();

  assert.equal(
    requests.some((request) => request.url.includes(`/api/projects/${projectId}/audit`) && request.url.includes("actionType=project.approval")),
    true,
  );
  assert.match(fakeDocument.elements.get("#project-audit-content").innerHTML, /Audit history/);
  assert.match(fakeDocument.elements.get("#project-audit-content").innerHTML, /high/);
});

test("cockpit consumes sse live updates when push transport is available", async () => {
  const fakeDocument = createFakeDocument();
  const listeners = new Map();
  const eventSources = [];
  const initialPayload = {
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Watch live progress",
    status: "active",
    source: { baseUrl: "http://localhost:4101" },
    overview: { bottleneck: "Execution in progress" },
    cycle: { roadmap: [{ summary: "Run build", status: "assigned", lane: "build", dependencies: [] }] },
    agents: [],
    approvals: [],
    events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
    collaborationFeed: { summary: { totalItems: 0, containsWorkspaceTransitions: false }, items: [] },
    realtimeEventStream: {
      events: [{ eventId: "evt-1", streamType: "progress", status: "active", message: "Build started" }],
      summary: { totalEvents: 1, progressEvents: 1 },
    },
    liveUpdateChannel: {
      transportMode: "websocket",
      serverTransport: "sse",
      deliveryEndpoint: "/api/projects/giftwallet/live-events",
      refreshStrategy: "push",
      reconnectPolicy: { initialDelayMs: 25 },
    },
    liveLogStream: {
      streamId: "live-log-stream:giftwallet",
      streams: {
        stdout: [{ logId: "log-1", message: "build started", source: "runtime" }],
        stderr: [],
      },
      commandOutputs: [{ commandOutputId: "command-output:log-1", stream: "stdout", message: "npm run build", timestamp: null }],
      summary: { totalEntries: 1 },
    },
    reactiveWorkspaceState: {
      progressBar: { percent: 12 },
    },
    progressState: { percent: 12 },
  };

  async function fetchImpl(url) {
    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: [{ id: "giftwallet", name: "GiftWallet" }] };
        },
      };
    }

    if (url === "/api/projects/giftwallet") {
      return {
        ok: true,
        async json() {
          return initialPayload;
        },
      };
    }

    if (url === "/api/projects/giftwallet/presence") {
      return {
        ok: true,
        async json() {
          return initialPayload;
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  class FakeEventSource {
    constructor(url) {
      this.url = url;
      this.closed = false;
      this.onmessage = null;
      this.onerror = null;
      eventSources.push(this);
    }

    addEventListener(type, handler) {
      listeners.set(type, handler);
    }

    close() {
      this.closed = true;
    }
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    EventSourceImpl: FakeEventSource,
    setTimeoutImpl() {
      throw new Error("Polling fallback should not run while SSE transport is active");
    },
    clearTimeoutImpl() {},
  });

  await app.ready;
  assert.equal(eventSources.length, 1);
  assert.equal(eventSources[0].url, "/api/projects/giftwallet/live-events");

  listeners.get("live-state")?.({
    data: JSON.stringify({
      progressState: { percent: 64 },
      reactiveWorkspaceState: { progressBar: { percent: 64 } },
      realtimeEventStream: {
        events: [{ eventId: "evt-2", streamType: "progress", status: "active", message: "Build almost done" }],
        summary: { totalEvents: 1, progressEvents: 1 },
      },
      liveUpdateChannel: {
        transportMode: "websocket",
        serverTransport: "sse",
        deliveryEndpoint: "/api/projects/giftwallet/live-events",
        refreshStrategy: "push",
        reconnectPolicy: { initialDelayMs: 25 },
      },
      liveLogStream: {
        streamId: "live-log-stream:giftwallet",
        streams: {
          stdout: [{ logId: "log-2", message: "build almost done", source: "runtime" }],
          stderr: [],
        },
        commandOutputs: [{ commandOutputId: "command-output:log-2", stream: "stdout", message: "npm run build", timestamp: null }],
        summary: { totalEntries: 1 },
      },
      collaborationFeed: { summary: { totalItems: 0, containsWorkspaceTransitions: false }, items: [] },
      events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
    }),
  });

  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /64%/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /Build almost done/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /npm run build/);
  assert.match(fakeDocument.elements.get("#live-content").innerHTML, /build almost done/);
  app.closeLiveUpdates();
  assert.equal(eventSources[0].closed, true);
});

test("cockpit saves snapshot schedule and runs manual backup from versioning controls", async () => {
  const fakeDocument = createFakeDocument();
  const service = createProjectService();
  service.seedDemoProject();
  const requests = [];
  const projectId = "giftwallet";

  async function fetchImpl(url, options = {}) {
    requests.push({ url, method: options.method ?? "GET", body: options.body ?? null });

    if (url === "/api/projects") {
      return {
        ok: true,
        async json() {
          return { projects: service.listProjects() };
        },
      };
    }

    if (url === `/api/projects/${projectId}`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/presence`) {
      return {
        ok: true,
        async json() {
          return service.getProject(projectId);
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-backup-schedule`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.configureSnapshotBackupSchedule({
            projectId,
            scheduleInput: body.scheduleInput,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-backups/run`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.runSnapshotBackupNow({
            projectId,
            triggerType: body.triggerType ?? "manual",
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-retention-policy`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.configureSnapshotRetentionPolicy({
            projectId,
            retentionInput: body.retentionInput,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-retention-cleanup`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.runSnapshotRetentionCleanup({
            projectId,
            triggerType: body.triggerType ?? "manual-cleanup",
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-backup-worker`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.configureSnapshotBackupWorker({
            projectId,
            workerInput: body.workerInput,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/snapshot-backup-worker/run`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.runSnapshotBackupWorkerTick({
            projectId,
            triggerType: body.triggerType ?? "manual-worker-run",
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/disaster-recovery-checklist?refresh=1`) {
      return {
        ok: true,
        async json() {
          return service.getDisasterRecoveryChecklist({
            projectId,
            refresh: true,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/business-continuity?refresh=1`) {
      return {
        ok: true,
        async json() {
          return service.getBusinessContinuityState({
            projectId,
            refresh: true,
          });
        },
      };
    }

    if (url === `/api/projects/${projectId}/business-continuity/actions`) {
      const body = JSON.parse(options.body ?? "{}");
      return {
        ok: true,
        async json() {
          return service.applyBusinessContinuityAction({
            projectId,
            actionInput: body.actionInput,
          });
        },
      };
    }

    throw new Error(`Unexpected url: ${url}`);
  }

  const app = createCockpitApp({
    doc: fakeDocument,
    fetchImpl,
    setTimeoutImpl() {
      return 0;
    },
    clearTimeoutImpl() {},
  });
  await app.ready;
  app.setActiveWorkspace("release");

  fakeDocument.elements.get("#snapshot-interval-input").value = "120";
  fakeDocument.elements.get("#snapshot-triggers-input").value = "deploy,migration";
  await fakeDocument.elements.get("#snapshot-schedule-button").listeners.click();
  await fakeDocument.elements.get("#run-snapshot-backup-button").listeners.click();
  fakeDocument.elements.get("#snapshot-max-input").value = "2";
  await fakeDocument.elements.get("#snapshot-retention-button").listeners.click();
  await fakeDocument.elements.get("#snapshot-cleanup-button").listeners.click();
  await fakeDocument.elements.get("#snapshot-worker-run-button").listeners.click();
  await fakeDocument.elements.get("#snapshot-worker-toggle-button").listeners.click();
  await fakeDocument.elements.get("#disaster-recovery-refresh-button").listeners.click();
  fakeDocument.elements.get("#continuity-action-select").value = "start-recovery";
  await fakeDocument.elements.get("#continuity-action-button").listeners.click();
  await fakeDocument.elements.get("#continuity-refresh-button").listeners.click();
  service.configureSnapshotBackupSchedule({
    projectId,
    scheduleInput: {
      enabled: false,
    },
  });

  const updatedProject = service.getProject(projectId);
  assert.equal(updatedProject.snapshotSchedule.intervalSeconds, 120);
  assert.equal(updatedProject.snapshotSchedule.preChangeTriggers.includes("deploy"), true);
  assert.equal(updatedProject.snapshotRetentionPolicy.maxSnapshots, 2);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-backup-schedule`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-backups/run`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-retention-policy`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-retention-cleanup`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-backup-worker/run`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/snapshot-backup-worker`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/disaster-recovery-checklist?refresh=1`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/business-continuity/actions`), true);
  assert.equal(requests.some((request) => request.url === `/api/projects/${projectId}/business-continuity?refresh=1`), true);
  assert.match(fakeDocument.elements.get("#versioning-content").innerHTML, /scheduled/i);
  assert.match(fakeDocument.elements.get("#versioning-content").innerHTML, /Recovery readiness/i);
  assert.match(fakeDocument.elements.get("#versioning-content").innerHTML, /Business continuity/i);
});
