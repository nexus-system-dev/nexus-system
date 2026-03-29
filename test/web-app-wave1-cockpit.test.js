import test from "node:test";
import assert from "node:assert/strict";

import { createCockpitApp } from "../web/app.js";

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    hidden: false,
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

function createFakeDocument() {
  const selectors = [
    "#project-select",
    "#sync-casino-button",
    "#analyze-button",
    "#run-cycle-button",
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
  assert.match(fakeDocument.elements.get("#growth-content").innerHTML, /Draft Wave 2 teaser/);
  assert.match(fakeDocument.elements.get("#developer-workspace-summary").innerHTML, /36%/);
  assert.match(fakeDocument.elements.get("#project-brain-summary").innerHTML, /saas/);
  assert.match(fakeDocument.elements.get("#decision-content").innerHTML, /Approve deploy/);
  assert.match(fakeDocument.elements.get("#decision-content").innerHTML, /This recommendation needs approval before it can move forward/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /שלח לאישור/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /Checkout dashboard/);
  assert.match(fakeDocument.elements.get("#primitive-components-content").innerHTML, /Ready/);
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
