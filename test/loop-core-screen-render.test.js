import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { renderLoopCoreScreen } from "../web/nexus-ui/screens/LoopCoreScreen.js";

test("loop core screen renders the first-skeleton eyebrow from the preview payload", () => {
  const project = {
    id: "crm-preview",
    name: "Clinic CRM",
    artifactExpectation: {
      projectType: "saas",
      title: "Clinic CRM follow-up dashboard",
      summary: "לוח follow-up עם בעלות ברורה והפעולה הבאה לכל ליד.",
    },
    proofArtifact: {
      artifactId: "proof-artifact:onboarding-preview:saas",
      artifactType: "followup-dashboard",
      title: "Clinic CRM follow-up dashboard",
      status: "ready",
      previewKind: "followup-dashboard",
      previewPayload: {
        kind: "followup-dashboard",
        eyebrow: "השלד הראשון שכבר יושב על המסך",
        title: "Clinic CRM follow-up dashboard",
        subtitle: "לוח follow-up עם בעלות ברורה והפעולה הבאה לכל ליד.",
        statusLine: "בתצוגה שנפתח נרצה לראות לוח עם follow-up ברור.",
        stats: [
          { label: "לידים במעקב", value: "12" },
        ],
        clients: [],
        nextAction: {
          title: "לסגור follow-up אחד שלא ייפול בין הכיסאות",
          reason: "אין בעלות ברורה על כל ליד.",
          recommendation: "השלד הראשון כבר מחזיק בעלים וצעד הבא.",
        },
        generatedMessage: {
          label: "הודעה מוכנה לשליחה",
          body: "תזכורת קצרה ללקוח.",
        },
        controls: ["שיוך owner"],
        proofMeta: {
          previewable: true,
          regionCount: 3,
        },
      },
    },
    cycle: {
      roadmap: [
        { summary: "לקדם את Clinic CRM follow-up dashboard", status: "assigned" },
      ],
    },
    developerWorkspace: {
      contextSummary: {
        progressStatus: "pending",
      },
    },
    projectBrainWorkspace: {
      overview: {
        currentPhase: "understanding-complete",
      },
      summary: {
        blockerCount: 0,
      },
    },
    releaseWorkspace: {
      validation: {},
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {},
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.previewSurfaceEyebrow, "השלד הראשון שכבר יושב על המסך");
  assert.equal(viewModel.surfaceWorkspace.surfaceContractId, "SURF-001");
  assert.equal(viewModel.surfaceWorkspace.regions.agentRail.regionId, "agent-conversation-rail");
  assert.equal(viewModel.surfaceWorkspace.regions.buildCanvas.regionId, "live-artifact-build-canvas");
  assert.match(html, /data-surface-contract="SURF-001"/);
  assert.match(html, /data-build-surface-contract="SURF-003"/);
  assert.match(html, /data-surface-id="build"/);
  assert.match(html, /data-transition-motion="discovery-chat-morphs-to-right-agent-rail"/);
  assert.match(html, /data-build-region="agent-conversation-rail"/);
  assert.match(html, /data-build-region="live-artifact-build-canvas"/);
  assert.match(html, /data-build-region="human-progress-state"/);
  assert.match(html, /data-build-region="change-direction-affordance"/);
  assert.match(html, /data-build-region="release-readiness-affordance"/);
  assert.match(html, /data-first-slice-trust-task="SLICE-008"/);
  assert.match(html, /גבול שחרור/);
  assert.match(html, /data-build-region="continuity-restore-anchor"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="home"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /class="nexus-build-agent-rail__body"/);
  assert.match(html, /data-agent-rail-composer/);
  assert.match(html, /data-agent-rail-input/);
  assert.match(html, /שיחה חיה עם Nexus/);
  assert.match(html, /השלד הראשון שכבר יושב על המסך/);
  assert.doesNotMatch(html, /nexus-stepper/);
  assert.doesNotMatch(html, /nexus-qa-nav/);
  assert.doesNotMatch(html, /nexus-workspace-layout/);
  assert.doesNotMatch(html, /nexus-loop-build-workspace__topbar/);
  assert.doesNotMatch(html, /nexus-loop-build-workspace__canvas-head/);
  assert.doesNotMatch(html, /nexus-build-canvas-progress/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
  assert.doesNotMatch(html, /Timeline/);
  assert.doesNotMatch(html, /למה זה חשוב עכשיו/);
  assert.doesNotMatch(html, /מה ברור עכשיו ומה צריך להמשיך/);
});

test("loop core screen renders first-release project team truth without internal task labels", () => {
  const project = {
    id: "team-project",
    name: "Team Project",
    state: {
      workspaceModel: {
        workspaceId: "workspace-owner-1",
        ownerUserId: "owner-1",
        memberCount: 2,
        members: [
          { userId: "owner-1", displayName: "דנה", role: "owner", status: "active", isOwner: true },
          { userId: "editor-1", displayName: "נועה", role: "editor", status: "active" },
        ],
        invitations: [
          { email: "ops@example.com", role: "viewer", status: "pending" },
        ],
      },
      teamMembershipBoundary: {
        taskId: "EXP-009",
        status: "ready",
      },
    },
    artifactExpectation: {
      projectType: "internal-tool",
      title: "ניהול לידים",
      summary: "כלי עבודה לצוות מכירות.",
    },
    cycle: { roadmap: [] },
    developerWorkspace: { contextSummary: {} },
    projectBrainWorkspace: { overview: {}, summary: {} },
    releaseWorkspace: { validation: {} },
    aiControlCenterSurface: { generatedSurfacePreview: {} },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.teamMembership.ownerLabel, "דנה");
  assert.match(html, /צוות הפרויקט/);
  assert.match(html, /בעלים/);
  assert.match(html, /נועה/);
  assert.match(html, /ops@example.com/);
  assert.doesNotMatch(html, /EXP-009/);
});

test("BUILD-APPROVAL-001 — Build screen renders mutation-backed approval decision controls", () => {
  const project = {
    id: "build-approval-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים.",
    buildAgentTurnState: {
      taskId: "BLD-AGT-001",
      intent: "product-truth-change",
      owner: "mutation-change-agent",
      ownerLabel: "שינוי מוצר",
      status: "approval-required",
      requiresApproval: true,
      mayClaimChanged: false,
      speechBoundary: "reply-must-not-claim-product-change",
      reason: "צריך אישור לפני החלפת הכיוון.",
    },
    mutationChangeDecision: {
      taskId: "MUT-001",
      status: "pending-approval",
      changeType: "product-truth",
      requiresApproval: true,
      requiresCheckpoint: true,
      requiresVerification: true,
      requiresProductTruthMutation: true,
      userReply: "צריך אישור לפני שינוי.",
      affectedAreas: {
        screens: ["מסך העבודה"],
        actions: ["הגדרת פעולות מחדש"],
        dataObjects: ["אמת מוצר מרכזית"],
      },
    },
    canonicalMutationFlow: {
      taskId: "EXP-002",
      ownerTaskId: "MUT-001",
      status: "pending-approval",
      requiresApproval: true,
      requiresProductTruthMutation: true,
      userFacingSummary: "השינוי משמעותי ולכן ממתין לאישור לפני שינוי המוצר.",
      historyCount: 1,
      steps: [
        { stepId: "request", label: "בקשה", status: "done", description: "הבקשה נכנסה למסלול שינוי." },
        { stepId: "approval", label: "אישור", status: "waiting", description: "המוצר לא משתנה עד שהמשתמש מאשר." },
        { stepId: "apply", label: "יישום", status: "blocked", description: "היישום ממתין לאישור." },
      ],
    },
    buildApprovalFlow: {
      taskId: "BUILD-APPROVAL-001",
      bridgeTaskId: "BLD-AGT-001",
      ownerTaskId: "MUT-001",
      status: "pending-approval",
      decisionStatus: "pending",
      approvalRequestId: "build-approval:screen:1",
      mutationDecisionId: "mutation-screen-1",
      backedByMutationTruth: true,
      currentTruthUnchanged: true,
      userFacingSummary: "זה שינוי כיוון משמעותי. נקסוס ממתינה לאישור לפני שינוי השלד.",
      targetDirection: {
        label: "ניהול הזמנות",
        replaces: "ניהול לידים",
        primaryObjectPlural: "הזמנות",
      },
      impactSummary: {
        title: "שינוי כיוון אל ניהול הזמנות",
        before: "ניהול לידים",
        after: "ניהול הזמנות",
        rejectionImpact: "אם תדחה, השלד והאמת הקיימת נשארים כמו שהם.",
        willChange: ["שם המוצר", "המודל של הרשומות"],
        willKeep: ["זהות הפרויקט", "היסטוריית הבקשות"],
      },
      allowedDecisions: ["approve", "reject", "cancel"],
    },
    companionConversation: {
      projectName: "ניהול לידים",
      transcript: [],
    },
  };

  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project }));

  assert.match(html, /data-build-approval-task="BUILD-APPROVAL-001"/);
  assert.match(html, /data-build-approval-backed-by-mutation="true"/);
  assert.match(html, /data-build-approval-current-truth-unchanged="true"/);
  assert.match(html, /data-build-approval-action="approve"/);
  assert.match(html, /data-build-approval-action="reject"/);
  assert.match(html, /data-build-approval-action="cancel"/);
  assert.match(html, /ניהול הזמנות/u);
  assert.doesNotMatch(html, />BUILD-APPROVAL-001</);
});

test("SLICE-008 — first user-ready slice does not claim release before a standalone product exists", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
  const releaseRouteCopy = appSource.slice(
    appSource.indexOf('release: {'),
    appSource.indexOf('share: {', appSource.indexOf('release: {')),
  );
  const project = {
    id: "slice-008-trust-cleanup",
    name: "ניהול לידים לעסק קטן",
    goal: "כלי פנימי ללידים, אחראי, תזכורת וצעד הבא בלי פרסום או חיבור חיצוני.",
    artifactExpectation: {
      projectType: "internal tool",
      title: "ניהול לידים לעסק קטן",
    },
    productSkeletonAgentOutput: {
      productType: "internal tool",
      dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
    },
  };
  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project }));

  assert.match(html, /data-first-slice-trust-task="SLICE-008"/);
  assert.match(html, /גבול שחרור/);
  assert.doesNotMatch(html, />שחרור<\/span>/);
  assert.match(releaseRouteCopy, /חסמי שחרור/);
  assert.match(releaseRouteCopy, /חבילת מוצר עצמאית/);
  assert.doesNotMatch(releaseRouteCopy, /publish/u);
  assert.doesNotMatch(appSource, /const title = "הפרויקט שלך מוכן"/u);
  assert.doesNotMatch(html, />name<\/li>|>status<\/li>|>owner<\/li>|>nextStep<\/li>/u);
});

test("loop core screen renders the live agent transcript inside the build rail", () => {
  const project = {
    id: "surf-001-live-proof",
    name: "SURF-001 Live Proof",
    goal: "Build surface proof",
    status: "working",
    artifactExpectation: {
      projectType: "saas",
      deliverableLabel: "Build surface",
    },
  };
  const companionConversation = {
    projectId: "surf-001-live-proof",
    projectName: "SURF-001 Live Proof",
    transcript: [
      {
        speaker: "user",
        text: "אני רוצה לבנות מערכת לצוות מכירות שמאבד לידים אחרי שיחות",
      },
      {
        speaker: "ai",
        text: "הבנתי. נבנה סביבת עבודה לצוות מכירות שבה כל ליד מקבל בעלות, סטטוס וצעד הבא.",
      },
    ],
  };

  const viewModel = buildLoopCoreViewModel({ project, companionConversation });
  const html = renderLoopCoreScreen(viewModel);

  assert.match(html, /אני רוצה לבנות מערכת לצוות מכירות שמאבד לידים אחרי שיחות/);
  assert.match(html, /הבנתי\. נבנה סביבת עבודה לצוות מכירות/);
  assert.match(html, /<textarea data-agent-rail-input/);
  assert.doesNotMatch(html, /בלחיצה נדייק את ההקשר לפני שממשיכים לבנות/);
});

test("SKELETON-CHOICE-001 — loop core renders user-facing skeleton directions without provider names", () => {
  const project = {
    id: "skeleton-choice-render",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
    artifactExpectation: {
      projectType: "internal tool",
      title: "רשימת לידים עם אחריות",
      summary: "כלי פנימי שמונע מלידים ליפול בין הכיסאות.",
    },
    productSkeletonAgentOutput: {
      agentId: "product-skeleton-agent",
      responseSource: "provider-composed",
      productType: "internal tool for lead follow up",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
      firstWorkflow: { title: "רשימת לידים", steps: ["הוסף ליד", "שייך אחראי"] },
      initialActions: ["הוסף ליד", "עדכן סטטוס", "שנה אחראי"],
      dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
      versionOneBoundary: { buildNow: ["טבלה", "אחראי"], doNotBuildNow: ["וואטסאפ"] },
    },
    cycle: { roadmap: [{ summary: "לבנות שלד", status: "assigned" }] },
    projectBrainWorkspace: { overview: { currentPhase: "understanding-complete" }, summary: {} },
    developerWorkspace: { contextSummary: {} },
    releaseWorkspace: { validation: {} },
    aiControlCenterSurface: { generatedSurfacePreview: {} },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.skeletonChoice.taskId, "SKELETON-CHOICE-001");
  assert.equal(viewModel.skeletonChoice.candidates.length, 3);
  assert.match(html, /data-skeleton-choice-task="SKELETON-CHOICE-001"/);
  assert.match(html, /בחר כיוון להמשך הבנייה/);
  assert.match(html, /כיוון עבודה ממוקד/);
  assert.match(html, /data-skeleton-choice-select/);
  assert.doesNotMatch(html, /nexus-operational-composition/);
  assert.doesNotMatch(html, /nexus-premium-composition/);
  assert.doesNotMatch(html, /external-figma-design-provider/);
  assert.doesNotMatch(html, /providerId/);
});

test("BLD-AGT-001 — loop core screen renders visible Build agent routing state", () => {
  const project = {
    id: "build-agent-routing-screen",
    name: "Daily Done",
    goal: "אפליקציה לניהול משימות יומי",
    status: "working",
    artifactExpectation: {
      projectType: "mobile app",
      deliverableLabel: "Daily Done",
    },
  };
  const companionConversation = {
    projectId: "build-agent-routing-screen",
    projectName: "Daily Done",
    buildAgentTurn: {
      taskId: "BLD-AGT-001",
      intent: "visual-change",
      owner: "visual-build-agent",
      ownerLabel: "עיצוב ושלד חזותי",
      status: "routed",
      requiresApproval: false,
      mayClaimChanged: false,
      speechBoundary: "reply-must-not-claim-product-change",
      reason: "זו בקשה חזותית, ולכן היא נשלחת למסלול בנייה חזותית לפני טענת שינוי.",
    },
    transcript: [
      {
        speaker: "user",
        text: "תוסיף לי דף סלאש סקרין עם שם האפליקציה",
      },
    ],
  };

  const viewModel = buildLoopCoreViewModel({ project, companionConversation });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.agentConversation.buildAgentTurn.owner, "visual-build-agent");
  assert.match(html, /data-build-agent-turn-task="BLD-AGT-001"/);
  assert.match(html, /data-build-agent-turn-owner="visual-build-agent"/);
  assert.match(html, /data-build-agent-turn-intent="visual-change"/);
  assert.match(html, /data-build-agent-turn-may-claim-changed="false"/);
  assert.match(html, /הבקשה האחרונה מנותבת אל/u);
  assert.match(html, /עיצוב ושלד חזותי/u);
  assert.match(html, /אסור להציג שינוי עד שיש תוצאה גלויה/u);
});

test("PROV-001 — loop core screen renders provider gateway boundary without provider plumbing", () => {
  const project = {
    id: "provider-gateway-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים",
    status: "working",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "ניהול לידים",
    },
    state: {
      providerGatewayBoundary: {
        taskId: "PROV-001",
        status: "blocked-pending-approval-or-scope",
        request: {
          requestClass: "payment",
        },
        provider: {
          connected: true,
          releaseDecision: "post-release",
          userFacingLabel: "תשלומים",
        },
        capability: {
          capability: "charge",
          canExecuteExternally: false,
        },
        blockers: ["explicit-approval-missing"],
        userFacingBoundary: "זו יכולת חיצונית. נקסוס לא תבצע אותה בלי חיבור מתאים, הרשאה מתאימה ואישור מפורש.",
      },
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.agentConversation.providerGateway.taskId, "PROV-001");
  assert.equal(viewModel.agentConversation.providerGateway.canExecuteExternally, false);
  assert.match(html, /data-provider-gateway-task="PROV-001"/);
  assert.match(html, /data-provider-gateway-can-execute="false"/);
  assert.match(html, /יכולת חיצונית חסומה עד אישור/u);
  assert.match(html, /החיבור לא נותן הרשאה אוטומטית לביצוע/u);
  assert.doesNotMatch(html, /stripe|providerSession|providerId/u);
});

test("BLD-AGT-001 — loop core renders approval, verification, and release boundaries distinctly", () => {
  const baseProject = {
    id: "build-agent-boundary-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים",
    status: "working",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "ניהול לידים",
    },
  };

  const cases = [
    {
      intent: "product-truth-change",
      owner: "mutation-change-agent",
      ownerLabel: "שינוי אמת מוצר",
      status: "approval-required",
      requiresApproval: true,
      reason: "זו החלפת אמת מוצרית, ולכן צריך אישור והשפעה לפני שינוי השלד.",
      expectedLabel: "ממתין לאישור שינוי כיוון",
      expectedHelper: "השלד לא משתנה עד שיש אישור והשפעה ברורה.",
    },
    {
      intent: "verification-request",
      owner: "verification-qa-agent",
      ownerLabel: "בדיקה",
      status: "routed",
      requiresApproval: false,
      reason: "הבקשה היא לבדוק את השלד, ולכן היא צריכה לעבור למסלול בדיקה ולא לשינוי מוצר.",
      expectedLabel: "ממתין למסלול בדיקה",
      expectedHelper: "לא מוצגת הצלחת בדיקה עד שיש תוצאה אמיתית.",
    },
    {
      intent: "release-request",
      owner: "release-agent",
      ownerLabel: "שחרור",
      status: "blocked-or-approval-required",
      requiresApproval: true,
      reason: "הבקשה דורשת חיבור חיצוני, פרסום, תשלום או אישור מפורש, ולכן אסור להציג אותה כשינוי שבוצע.",
      expectedLabel: "חסום לשחרור או פרסום",
      expectedHelper: "לא מתבצע פרסום, ספק, תשלום או חיבור חיצוני בלי אישור ומסלול מתאים.",
    },
  ];

  for (const boundaryCase of cases) {
    const viewModel = buildLoopCoreViewModel({
      project: baseProject,
      companionConversation: {
        projectId: "build-agent-boundary-screen",
        projectName: "ניהול לידים",
        buildAgentTurn: {
          taskId: "BLD-AGT-001",
          intent: boundaryCase.intent,
          owner: boundaryCase.owner,
          ownerLabel: boundaryCase.ownerLabel,
          status: boundaryCase.status,
          requiresApproval: boundaryCase.requiresApproval,
          mayClaimChanged: false,
          speechBoundary: "reply-must-not-claim-product-change",
          reason: boundaryCase.reason,
        },
        transcript: [
          {
            speaker: "user",
            text: "בקשת בדיקה",
          },
        ],
      },
    });
    const html = renderLoopCoreScreen(viewModel);

    assert.match(html, new RegExp(`data-build-agent-turn-intent="${boundaryCase.intent}"`, "u"));
    assert.match(html, new RegExp(boundaryCase.expectedLabel, "u"));
    assert.match(html, new RegExp(boundaryCase.expectedHelper, "u"));
    assert.match(html, /data-build-agent-turn-may-claim-changed="false"/u);
  }
});

test("BLD-AGT-001 — loop core renders visual build result from project truth", () => {
  const project = {
    id: "build-agent-visual-truth-screen",
    name: "Daily Done",
    goal: "אפליקציה לניהול משימות יומי",
    status: "working",
    artifactExpectation: {
      projectType: "mobile app",
      deliverableLabel: "Daily Done",
    },
    visualBuildTruth: {
      taskId: "VBUILD-001",
      bridgeTaskId: "BLD-AGT-001",
      status: "applied",
      visualBuildId: "visual-build:build-agent-visual-truth-screen:1",
      lastOperationId: "visual.screen.addSplash",
      selectedDesignPluginId: "design-plugin:internal-tool",
      selectedDesignPluginName: "שפת עיצוב תפעולית",
      boundary: "שינוי חזותי בשלד הריצה, לא שחרור ולא אפליקציית ייצור.",
      screens: [
        {
          screenId: "splash-screen",
          title: "מסך פתיחה",
          headline: "Daily Done",
          body: "פתיחה קצרה לפני הכניסה לשלד העבודה.",
          primaryAction: "המשך למוצר",
          affectedRegion: "splash-screen",
        },
      ],
      lastVisualDiff: {
        visibleSummary: "נוסף מסך פתיחה חזותי לשלד הריצה.",
      },
      history: [
        { diffId: "visual-build:build-agent-visual-truth-screen:1" },
      ],
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.visualBuildTruth.taskId, "VBUILD-001");
  assert.match(html, /data-visual-build-task="VBUILD-001"/);
  assert.match(html, /data-visual-build-bridge-task="BLD-AGT-001"/);
  assert.match(html, /data-visual-build-operation="visual.screen.addSplash"/);
  assert.match(html, /data-visual-build-added-screen="splash-screen"/);
  assert.match(html, /Daily Done/u);
  assert.match(html, /נוסף מסך פתיחה חזותי/u);
  assert.match(html, /לא שחרור ולא אפליקציית ייצור/u);
});

test("MUT-001 — loop core renders mutation decision ownership on the Build rail", () => {
  const project = {
    id: "mutation-decision-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים",
    status: "working",
    mutationChangeDecision: {
      taskId: "MUT-001",
      agentId: "mutation-change-agent",
      status: "pending-approval",
      changeType: "product-truth",
      requiresApproval: true,
      requiresCheckpoint: true,
      requiresVerification: true,
      requiresProductTruthMutation: true,
      mayApplyAutomatically: false,
      userReply: "זה שינוי משמעותי. אני לא משנה את המוצר בשקט לפני אישור.",
      affectedAreas: {
        screens: ["מסך העבודה הראשי"],
        actions: ["הגדרת פעולות מחדש"],
        dataObjects: ["אמת מוצר מרכזית"],
      },
    },
    mutationChangeHistory: [
      { historyRecordId: "mutation-history:1" },
    ],
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.mutationChangeDecision.taskId, "MUT-001");
  assert.match(html, /data-mutation-change-task="MUT-001"/u);
  assert.match(html, /data-mutation-change-status="pending-approval"/u);
  assert.match(html, /data-mutation-change-type="product-truth"/u);
  assert.match(html, /data-mutation-change-requires-approval="true"/u);
  assert.match(html, /data-mutation-change-history-count="1"/u);
  assert.match(html, /לא משנה את המוצר בשקט/u);
});

test("EXP-002 — loop core renders canonical mutation flow steps on the Build rail", () => {
  const project = {
    id: "mutation-flow-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים",
    status: "working",
    canonicalMutationFlow: {
      taskId: "EXP-002",
      ownerTaskId: "MUT-001",
      status: "pending-approval",
      changeType: "product-truth",
      requiresApproval: true,
      requiresProductTruthMutation: true,
      userFacingSummary: "השינוי משמעותי ולכן ממתין לאישור לפני שינוי המוצר.",
      historyCount: 1,
      buildMutationHistoryCount: 0,
      boundary: "הזרימה מציגה מצב שינוי. אישור עמוק שייך למשימת המשך.",
      steps: [
        { stepId: "request", label: "בקשה", status: "done", description: "הבקשה נכנסה למסלול שינוי." },
        { stepId: "decision", label: "החלטה", status: "done", description: "נבדק אם זה שינוי קטן או שינוי שמצריך אישור." },
        { stepId: "approval", label: "אישור", status: "waiting", description: "המוצר לא משתנה עד שהמשתמש מאשר." },
        { stepId: "apply", label: "יישום", status: "blocked", description: "היישום ממתין לאישור." },
        { stepId: "history", label: "רישום", status: "done", description: "נוצר רישום מוצרי שמסביר מה קרה." },
      ],
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.canonicalMutationFlow.taskId, "EXP-002");
  assert.match(html, /data-canonical-mutation-flow-task="EXP-002"/u);
  assert.match(html, /data-canonical-mutation-flow-owner="MUT-001"/u);
  assert.match(html, /data-canonical-mutation-flow-status="pending-approval"/u);
  assert.match(html, /data-canonical-mutation-flow-step="approval"/u);
  assert.match(html, /data-canonical-mutation-flow-step-status="blocked"/u);
  assert.match(html, /ממתין לאישור לפני שינוי המוצר/u);
});

test("VBUILD-001 — loop core renders cards and follow-up region from visual build truth", () => {
  const project = {
    id: "visual-build-cards-screen",
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים",
    status: "working",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "ניהול לידים",
    },
    visualBuildTruth: {
      taskId: "VBUILD-001",
      bridgeTaskId: "BLD-AGT-001",
      status: "applied",
      visualBuildId: "visual-build:visual-build-cards-screen:1",
      lastOperationId: "visual.leads.cardsFollowupToday",
      selectedDesignPluginId: "design-plugin:internal-tool",
      selectedDesignPluginName: "שפת עיצוב תפעולית",
      boundary: "שינוי חזותי בשלד הריצה, לא שחרור ולא אפליקציית ייצור.",
      screens: [
        {
          screenId: "lead-cards-follow-up",
          title: "מסך לידים",
          headline: "ניהול לידים",
          body: "רשימת הלידים מוצגת ככרטיסים עם אזור חזרה היום.",
          affectedRegion: "lead-cards-and-follow-up",
          layoutMode: "cards-with-follow-up-today",
          leadCards: [
            { name: "רוני כהן", status: "פתוח", owner: "דנה", reminder: "היום 14:00", nextStep: "לחזור עם הצעת מחיר" },
          ],
          followUpToday: ["רוני כהן · לחזור עם הצעת מחיר"],
        },
      ],
      lastVisualDiff: {
        visibleSummary: "רשימת הלידים הפכה לכרטיסים ונוסף אזור חזרה היום.",
        affectedRegions: ["lead-list", "follow-up-today"],
      },
      history: [
        { diffId: "visual-build:visual-build-cards-screen:1" },
      ],
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.match(html, /data-visual-build-task="VBUILD-001"/);
  assert.match(html, /data-visual-build-operation="visual.leads.cardsFollowupToday"/);
  assert.match(html, /data-visual-build-cards="lead-list"/);
  assert.match(html, /data-visual-build-region-added="follow-up-today"/);
  assert.match(html, /חזרה היום/u);
  assert.match(html, /רוני כהן/u);
  assert.match(html, /רשימת הלידים הפכה לכרטיסים/u);
});

test("SKEL-001 — loop core renders the first skeleton from Product Skeleton Agent output", () => {
  const project = {
    id: "skel-loop-project",
    name: "Lead Tool",
    artifactExpectation: {
      projectType: "lead-management",
      title: "טיפול בליד ראשון",
    },
    productSkeletonAgentOutput: {
      agentId: "product-skeleton-agent",
      responseSource: "provider-composed",
      productType: "כלי פנימי לניהול לידים",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
      firstWorkflow: {
        title: "טיפול בליד ראשון",
        whyThisFirst: "זו הפעולה הראשונה שמוכיחה שהמוצר שימושי.",
        steps: ["הוספת ליד", "שיוך אחראי", "קביעת תזכורת"],
      },
      initialScreens: [
        { name: "מסך לידים", purpose: "ניהול טיפול יומי", regions: ["כל הלידים", "חזרה היום"] },
      ],
      initialActions: ["הוסף ליד", "סמן צעד הבא"],
      dataObjects: [
        { name: "ליד", fields: ["שם", "סטטוס", "אחראי"] },
      ],
      versionOneBoundary: {
        buildNow: ["רשימת לידים", "תזכורת", "אחראי"],
        doNotBuildNow: ["אוטומציות", "חיבור וואטסאפ", "דוחות מתקדמים"],
      },
      assumptions: ["הזנה ידנית בשלב הראשון"],
      unknowns: [],
      needsQuestion: false,
      questionForDiscoveryAgent: null,
      handoffToVisualSkeleton: { allowed: true, reason: "יש שלד ברור." },
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.productSkeletonAgent.agentId, "product-skeleton-agent");
  assert.equal(viewModel.productSkeletonAgent.responseSource, "provider-composed");
  assert.match(html, /data-product-skeleton-task="SKEL-001"/);
  assert.match(html, /data-product-skeleton-agent="product-skeleton-agent"/);
  assert.match(html, /data-product-skeleton-source="provider-composed"/);
  assert.match(html, /טיפול בליד ראשון/);
  assert.match(html, /אוטומציות/);
  assert.match(html, /חיבור וואטסאפ/);
});

test("VSKEL-001 — loop core renders the first visible screen from Visual Product Skeleton Agent output", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "זו הפעולה הראשונה שמוכיחה שהמוצר שימושי.",
      steps: ["הוספת ליד", "שיוך אחראי", "קביעת תזכורת"],
    },
    initialScreens: [
      { name: "מסך לידים", purpose: "ניהול טיפול יומי", regions: ["כל הלידים", "חזרה היום"] },
    ],
    initialActions: ["הוסף ליד", "סמן צעד הבא"],
    dataObjects: [
      { name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] },
    ],
    versionOneBoundary: {
      buildNow: ["רשימת לידים", "תזכורת", "אחראי"],
      doNotBuildNow: ["אוטומציות", "חיבור וואטסאפ"],
    },
    handoffToVisualSkeleton: { allowed: true, reason: "יש שלד ברור." },
  }, {
    visualProductSkeletonAgentOutput: {
      agentId: "visual-product-skeleton-agent",
      responseSource: "provider-composed",
      productType: "כלי פנימי לניהול לידים",
      firstScreen: {
        name: "מסך טיפול בלידים",
        purpose: "להראות לידים שדורשים טיפול ולתת פעולה אחת ברורה.",
        primaryUser: "בעל עסק קטן",
        primaryAction: "הוסף ליד",
      },
      regions: [
        {
          id: "today",
          kind: "primary-workspace",
          title: "לחזור היום",
          purpose: "לידים שחייבים טיפול עכשיו.",
          priority: "primary",
          traceToProductSkeleton: "firstWorkflow.steps",
          content: ["נועה כהן · חדש · אין אחראי", "רמי לוי · לחזור היום · דנה"],
        },
        {
          id: "owner",
          kind: "detail-panel",
          title: "אחראי ותזכורת",
          purpose: "מי מטפל ומתי חוזרים.",
          priority: "secondary",
          traceToProductSkeleton: "dataObjects.fields",
          content: ["אחראי", "תזכורת", "צעד הבא"],
        },
      ],
      components: [
        { id: "add-lead", type: "primary-button", label: "הוסף ליד", regionId: "today", intent: "start first workflow" },
      ],
      hierarchy: {
        primary: "לחזור היום",
        secondary: ["אחראי ותזכורת"],
        deferred: ["אוטומציות"],
        appearsFirst: "לידים שמחכים לטיפול",
      },
      initialCopy: [{ regionId: "today", text: "היום מטפלים קודם בלידים שיכולים ליפול." }],
      designPlugin: {
        pluginId: "israeli-smb",
        pluginName: "Israeli SMB Work Tool",
        reason: "המוצר הוא כלי עבודה פנימי לבעל עסק קטן.",
        matchedBy: "product-class",
      },
      visualTone: "נקי, מקומי, תפעולי ולא דשבורדי.",
      assumptions: ["הזנה ידנית בשלב הראשון"],
      unknowns: [],
      doNotBuildNow: ["חיבור וואטסאפ", "אוטומציות"],
      handoff: { nextAgent: "visual-build-agent", nextMove: "render-first-screen-in-build-canvas" },
    },
  });

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.visualProductSkeletonAgent.agentId, "visual-product-skeleton-agent");
  assert.equal(viewModel.visualProductSkeletonAgent.responseSource, "provider-composed");
  assert.equal(viewModel.visualProductSkeletonAgent.firstScreen.name, "מסך טיפול בלידים");
  assert.match(html, /data-visual-skeleton-task="VSKEL-001"/);
  assert.match(html, /data-visual-skeleton-agent="visual-product-skeleton-agent"/);
  assert.match(html, /data-visual-skeleton-source="provider-composed"/);
  assert.match(html, /data-visual-skeleton-plugin-id="israeli-smb"/);
  assert.match(html, /data-visual-skeleton-region="today"/);
  assert.match(html, /נועה כהן/);
  assert.match(html, /לא דשבורדי/);
});

test("SLICE-005 — Build canvas renders a mobile app as a simulator-like runtime skeleton", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "mobile app for iOS couriers",
    primaryUser: "שליחים",
    primaryProblem: "צריך לדעת מאיפה להתחיל עם מסלול משלוחים",
    firstWorkflow: {
      title: "מסך פתיחת מסלול",
      whyThisFirst: "השליח צריך פעולה ראשונה ברורה.",
      steps: ["פתיחת אפליקציה", "בחירת חבילה", "התחלת ניווט"],
    },
    initialScreens: [
      { name: "מסך מסלול", purpose: "להציג את החבילה הראשונה" },
      { name: "מסך פרטי חבילה", purpose: "להציג כתובת וסטטוס" },
    ],
    initialActions: ["התחל מסלול", "פתח פרטים"],
    dataObjects: [{ name: "חבילה", fields: ["כתובת", "סטטוס", "מרחק"] }],
    versionOneBoundary: { buildNow: ["מסך ראשון", "ניווט בסיסי"], doNotBuildNow: ["App Store", "תשלום"] },
  }, {
    visualProductSkeletonAgentOutput: visualSkeletonFor("מסך מסלול", "התחל מסלול"),
  });

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.runtimeSkeleton.taskId, "SLICE-005");
  assert.equal(viewModel.runtimeSkeleton.truthTaskId, "RUNTIME-TRUTH-001");
  assert.equal(viewModel.runtimeSkeleton.projectId, project.id);
  assert.equal(viewModel.runtimeSkeleton.runtimeSkeletonId, `runtime-skeleton:${project.id}:mobile-app`);
  assert.equal(viewModel.runtimeSkeleton.artifactBuildId, `runtime-build:${project.id}:first-skeleton`);
  assert.equal(viewModel.runtimeSkeleton.productDomainSkeleton.domainTaskId, "PRODUCT-BACKEND-SKEL-001");
  assert.equal(viewModel.runtimeSkeleton.productDomainSkeleton.productDomainSkeletonId, `product-domain:${project.id}:mobile-app`);
  assert.equal(viewModel.runtimeSkeleton.productOwnedBackendSkeleton.taskId, "PRODUCT-BACKEND-SKEL-002");
  assert.equal(viewModel.runtimeSkeleton.productOwnedBackendSkeleton.productOwnedBackendSkeletonId, `product-owned-backend:${project.id}:mobile-app`);
  assert.equal(viewModel.runtimeSkeleton.productOwnedBackendSkeleton.frontendBackendPairing.status, "paired-from-first-skeleton");
  assert.equal(viewModel.runtimeSkeleton.productClass, "mobile-app");
  assert.equal(viewModel.runtimeSkeleton.shellFamily, "mobile-simulator");
  assert.match(html, /data-runtime-skeleton-task="SLICE-005"/);
  assert.match(html, /data-runtime-truth-task="RUNTIME-TRUTH-001"/);
  assert.match(html, /data-runtime-project-id="design-plugin-live-proof-project"/);
  assert.match(html, /data-runtime-artifact-build-id="runtime-build:design-plugin-live-proof-project:first-skeleton"/);
  assert.match(html, /data-runtime-skeleton-id="runtime-skeleton:design-plugin-live-proof-project:mobile-app"/);
  assert.match(html, /data-product-domain-task="PRODUCT-BACKEND-SKEL-001"/);
  assert.match(html, /data-product-domain-skeleton-id="product-domain:design-plugin-live-proof-project:mobile-app"/);
  assert.match(html, /data-product-owned-backend-task="PRODUCT-BACKEND-SKEL-002"/);
  assert.match(html, /data-product-owned-backend-skeleton-id="product-owned-backend:design-plugin-live-proof-project:mobile-app"/);
  assert.match(html, /data-product-owned-backend-pairing="paired-from-first-skeleton"/);
  assert.match(html, /data-product-domain-operation="task\.create"/);
  assert.match(html, /data-runtime-product-class="mobile-app"/);
  assert.match(html, /data-runtime-shell-family="mobile-simulator"/);
  assert.match(html, /nexus-runtime-mobile-frame__device/);
  assert.match(html, /התחל מסלול/);
  assert.doesNotMatch(html, /מסוכן/);
});

test("RUNTIME-001 — Build canvas exposes preview sandbox boundary on runtime skeleton", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים בלי אחראי ותזכורת",
    firstWorkflow: {
      title: "רשימת לידים",
      whyThisFirst: "צריך לטפל בליד בלי לעבור למסך אחר.",
      steps: ["בחר ליד", "שנה אחראי", "קבע תזכורת"],
    },
    initialScreens: [{ name: "לידים", purpose: "ניהול רשימת לידים" }],
    initialActions: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
    versionOneBoundary: { buildNow: ["בחירת ליד", "עריכת אחראי ותזכורת"], doNotBuildNow: ["וואטסאפ", "פרסום"] },
  }, {
    buildMutationTruth: {
      taskId: "BUILD-MUTATION-TRUTH-001",
      status: "applied",
      lastMutationId: "mutation-runtime-001",
      lastOperationId: "record.create",
    },
  });

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.buildPreviewSandbox.taskId, "RUNTIME-001");
  assert.equal(viewModel.buildPreviewSandbox.status, "ready");
  assert.equal(viewModel.buildPreviewSandbox.previewStatus, "sandbox-preview-ready");
  assert.match(html, /data-runtime-boundary-task="RUNTIME-001"/);
  assert.match(html, /data-runtime-boundary-status="ready"/);
  assert.match(html, /data-runtime-build-status="ready"/);
  assert.match(html, /data-runtime-preview-status="sandbox-preview-ready"/);
  assert.match(html, /data-runtime-sandbox-boundary="nexus-internal-sandbox-not-production"/);
  assert.match(html, /data-runtime-artifact-fallback="not-needed"/);
  assert.match(html, /data-runtime-retry-available="false"/);
  assert.match(html, /data-runtime-trace-mutation-id="mutation-runtime-001"/);
  assert.match(html, /התצוגה מוכנה לבדיקה בתוך Nexus/);
  assert.match(html, /לא פרסום חי ולא גרסת ייצור/);
});

test("RUNTIME-001 — missing preview artifact renders retry-safe fallback state", () => {
  const project = {
    id: "runtime-001-missing-artifact",
    name: "פרויקט בלי שלד",
    buildPreviewState: {
      buildStatus: "failed",
      error: "לא נוצר נכס תצוגה",
    },
  };

  const viewModel = {
    projectName: project.name,
    whatHappensNext: "ממתינים לבנייה אמינה.",
    previewSurfaceTitle: "אין תצוגה מוכנה",
    previewSurfaceSubtitle: "צריך לנסות שוב כדי ליצור שלד ראשון.",
    buildPreviewSandbox: buildLoopCoreViewModel({ project }).buildPreviewSandbox,
  };
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.buildPreviewSandbox.status, "failed");
  assert.match(html, /data-runtime-boundary-task="RUNTIME-001"/);
  assert.match(html, /data-runtime-boundary-status="failed"/);
  assert.match(html, /data-runtime-preview-status="preview-unavailable"/);
  assert.match(html, /data-runtime-artifact-fallback="show-failure-recovery"/);
  assert.match(html, /data-runtime-retry-available="true"/);
  assert.match(html, /data-runtime-preview-retry="retry-build-preview"/);
  assert.match(html, /בניית התצוגה נכשלה/);
  assert.match(html, /לא נוצר נכס תצוגה/);
});

test("W4-FIX-007 — Build opens a visible runtime skeleton from discovery truth when skeleton agents are pending", () => {
  const project = {
    id: "w4-fix-007-auto-handoff",
    name: "ניהול לידים לעסק קטן",
    goal: "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות וצריך כלי פנימי עם סטטוס, אחראי, תזכורת וצעד הבא.",
    artifactExpectation: {
      projectType: "internal tool",
      title: "ניהול לידים לעסק קטן",
      deliverableLabel: "רשימת לידים עם אחראי ותזכורת",
      loopReadyMessage: "פותחים שלד ריצה ראשון מתוך ההבנה הקנונית בזמן שסוכן השלד ממשיך להיבדק.",
      sourceAgent: "project-discovery-agent",
      responseSource: "agent-composed-transcript",
      pendingSkeletonAgent: "product-skeleton-agent",
    },
    onboardingStateHandoff: {
      handoffStatus: "ready",
      summary: { canBuildProjectState: true },
      firstSkeletonHandoff: {
        taskId: "W4-FIX-007",
        status: "opened-from-discovery-truth",
        automaticTransition: true,
        visibleRuntimeSkeleton: true,
      },
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.runtimeSkeleton.taskId, "SLICE-005");
  assert.equal(viewModel.runtimeSkeleton.productClass, "internal-tool");
  assert.equal(viewModel.runtimeSkeleton.shellFamily, "workspace-state-shell");
  assert.match(html, /data-runtime-skeleton-task="SLICE-005"/);
  assert.match(html, /data-runtime-product-class="internal-tool"/);
  assert.match(html, /data-runtime-shell-family="workspace-state-shell"/);
  assert.match(html, /ניהול לידים לעסק קטן/);
  assert.match(html, /אחראי/);
  assert.match(html, /תזכורת/);
  assert.match(html, /צעד הבא/);
  assert.doesNotMatch(html, /מכין שלד/);
  assert.doesNotMatch(html, /אין לופ פעיל/);
});

test("EXP-001 — Build exposes selected record and direct edit actions on the runtime skeleton", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים בלי אחראי ותזכורת",
    firstWorkflow: {
      title: "רשימת לידים",
      whyThisFirst: "צריך לטפל בליד בלי לעבור למסך אחר.",
      steps: ["בחר ליד", "שנה אחראי", "קבע תזכורת"],
    },
    initialScreens: [{ name: "לידים", purpose: "ניהול רשימת לידים" }],
    initialActions: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
    versionOneBoundary: { buildNow: ["בחירת ליד", "עריכת אחראי ותזכורת"], doNotBuildNow: ["וואטסאפ", "פרסום"] },
  }, {
    visualProductSkeletonAgentOutput: visualSkeletonFor("מסך לידים", "הוסף ליד"),
  });

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.match(html, /data-exp-selection-direct-edit-task="EXP-001"/);
  assert.match(html, /data-exp-product-owned-backend-task="PRODUCT-BACKEND-SKEL-002"/);
  assert.match(html, /data-product-domain-operation="record\.select"/);
  assert.match(html, /data-product-domain-operation="record\.assignOwner"/);
  assert.match(html, /data-product-domain-operation="record\.updateReminder"/);
  assert.match(html, /עריכה ישירה/);
  assert.match(html, /זה עדיין לא פריסת ייצור/);
});

test("SLICE-005 — Build canvas renders landing page, internal tool, and game as distinct runtime shells", () => {
  const landingHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "landing page for a boutique clinic",
      primaryUser: "לקוחות חדשים",
      primaryProblem: "לא מבינים למה לקבוע פגישה",
      firstWorkflow: { title: "דף הרשמה", steps: ["קריאת הבטחה", "צפייה בהוכחה", "השארת פרטים"] },
      initialActions: ["קבע פגישה"],
      dataObjects: [{ name: "פנייה", fields: ["שם", "טלפון"] }],
      versionOneBoundary: { buildNow: ["Hero", "CTA"], doNotBuildNow: ["פרסום"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("דף הרשמה", "קבע פגישה"),
    }),
  }));
  const internalToolViewModel = buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "internal tool for small business lead follow up",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "לידים נופלים כי אין אחראי ואין תזכורת",
      firstWorkflow: { title: "רשימת לידים", steps: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"] },
      initialActions: ["הוסף ליד"],
      dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
      versionOneBoundary: { buildNow: ["טבלה", "סטטוס", "אחראי"], doNotBuildNow: ["וואטסאפ"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("רשימת לידים", "הוסף ליד"),
      generationIntent: {
        generationGoal: "Landing page stale QA hint that must not override product skeleton truth",
      },
    }),
  });
  const internalHtml = renderLoopCoreScreen(internalToolViewModel);
  const gameHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "game with a simple arcade loop",
      primaryUser: "שחקנים מזדמנים",
      primaryProblem: "צריך להבין את הפעולה הראשונה מיד",
      firstWorkflow: { title: "זירת פתיחה", steps: ["התחל", "אסוף נקודות", "הימנע ממכשול"] },
      initialActions: ["התחל משחק", "זוז"],
      dataObjects: [{ name: "מצב משחק", fields: ["ניקוד", "זמן", "חיים"] }],
      versionOneBoundary: { buildNow: ["Scene", "HUD"], doNotBuildNow: ["חנות"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("זירת פתיחה", "התחל משחק"),
    }),
  }));

  assert.match(landingHtml, /data-runtime-product-class="landing-page"/);
  assert.match(landingHtml, /data-runtime-shell-family="web-page-preview"/);
  assert.match(landingHtml, /data-runtime-section="hero"/);
  assert.match(landingHtml, /data-runtime-live-state/);
  assert.match(landingHtml, /data-product-domain-operation="lead\.submit"/);
  assert.equal(internalToolViewModel.runtimeSkeleton.productClass, "internal-tool");
  assert.equal(internalToolViewModel.runtimeSkeleton.shellFamily, "workspace-state-shell");
  assert.match(internalHtml, /data-runtime-product-class="internal-tool"/);
  assert.match(internalHtml, /data-runtime-shell-family="workspace-state-shell"/);
  assert.match(internalHtml, /data-runtime-live-state/);
  assert.match(internalHtml, /data-product-domain-operation="record\.create"/);
  assert.match(internalHtml, /data-runtime-workspace-filter="no-owner"/);
  assert.match(internalHtml, /data-runtime-workspace-filter="reminder-today"/);
  assert.match(internalHtml, /data-runtime-record-owner=/);
  assert.match(internalHtml, /הצעד הבא/);
  assert.match(gameHtml, /data-runtime-product-class="game"/);
  assert.match(gameHtml, /data-runtime-shell-family="playable-preview"/);
  assert.match(gameHtml, /data-runtime-score/);
  assert.match(gameHtml, /data-product-domain-operation="game\.start"/);
  assert.match(gameHtml, /nexus-runtime-game-scene__hud/);
  assert.doesNotMatch(landingHtml + internalHtml + gameHtml, /מסוכן/);
});

test("RUNTIME-SKEL-001 — runtime families expose interactive state and domain operations", () => {
  const mobileHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "mobile app for daily tasks",
      primaryUser: "משתמש יומי",
      primaryProblem: "צריך לסמן משימות שבוצעו",
      firstWorkflow: { title: "Daily Done", steps: ["פתח היום", "הוסף משימה", "סמן בוצע"] },
      initialScreens: [{ name: "היום" }, { name: "סיכום" }],
      initialActions: ["הוסף משימה", "סמן בוצע"],
      dataObjects: [{ name: "Task", fields: ["title", "status", "owner"] }],
      versionOneBoundary: { buildNow: ["מסך היום", "סיכום"], doNotBuildNow: ["App Store"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("היום", "הוסף משימה"),
    }),
  }));
  const commerceHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "commerce store product site",
      primaryUser: "קונה",
      primaryProblem: "צריך לבחור מוצר ולהוסיף לעגלה",
      firstWorkflow: { title: "חנות קטנה", steps: ["בחר מוצר", "הוסף לעגלה"] },
      initialActions: ["הוסף לעגלה"],
      dataObjects: [{ name: "Product", fields: ["name", "price", "inventory"] }],
      versionOneBoundary: { buildNow: ["מוצר", "עגלה"], doNotBuildNow: ["תשלום אמיתי"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("חנות קטנה", "הוסף לעגלה"),
    }),
  }));
  const toolHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "software tool for text cleanup",
      primaryUser: "יוצר תוכן",
      primaryProblem: "צריך להפוך קלט לפלט נקי",
      firstWorkflow: { title: "מנקה טקסט", steps: ["הכנס טקסט", "הרץ פעולה"] },
      initialActions: ["הרץ פעולה"],
      dataObjects: [{ name: "ToolRun", fields: ["input", "output", "mode"] }],
      versionOneBoundary: { buildNow: ["קלט", "פלט"], doNotBuildNow: ["אינטגרציות"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("מנקה טקסט", "הרץ פעולה"),
    }),
  }));

  assert.match(mobileHtml, /data-runtime-screen-nav="0"/);
  assert.match(mobileHtml, /data-professional-skeleton-task="PRO-SKEL-001"/);
  assert.match(mobileHtml, /data-professional-skeleton-status="pass"/);
  assert.match(mobileHtml, /data-professional-skeleton-level="professional-product-grade"/);
  assert.match(mobileHtml, /data-professional-build-continuation="allowed"/);
  assert.match(mobileHtml, /data-market-skeleton-task="PRO-SKEL-002"/);
  assert.match(mobileHtml, /data-market-skeleton-status="pass"/);
  assert.match(mobileHtml, /data-market-skeleton-level="market-calibrated-nexus-standard"/);
  assert.match(mobileHtml, /data-market-skeleton-learning-uplift="ready"/);
  assert.match(mobileHtml, /data-runtime-screen-nav="2"/);
  assert.match(mobileHtml, /data-runtime-app-tab="2"/);
  assert.match(mobileHtml, /nexus-runtime-mobile-frame__tasks/);
  assert.match(mobileHtml, /שלד מקצועי מוכן להמשך/);
  assert.match(mobileHtml, /השלד עומד ברף שוק מקצועי/);
  assert.match(mobileHtml, /data-runtime-active-screen/);
  assert.match(mobileHtml, /data-runtime-live-state/);
  assert.match(mobileHtml, /data-product-domain-operation="task\.create"/);
  assert.match(commerceHtml, /data-runtime-shell-family="commerce-flow-preview"/);
  assert.match(commerceHtml, /data-professional-skeleton-status="pass"/);
  assert.match(commerceHtml, /data-market-skeleton-status="pass"/);
  assert.match(commerceHtml, /data-product-domain-operation="cart\.addItem"/);
  assert.match(commerceHtml, /עגלה ריקה/);
  assert.match(toolHtml, /data-runtime-shell-family="tool-control-shell"/);
  assert.match(toolHtml, /data-professional-skeleton-status="pass"/);
  assert.match(toolHtml, /data-market-skeleton-status="pass"/);
  assert.match(toolHtml, /data-product-domain-operation="tool\.run"/);
  assert.match(toolHtml, /מוכן להרצת כלי/);
});

test("PRO-SKEL-001 — Build canvas renders professional-grade surfaces for landing and internal tools", () => {
  const landingHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "landing page for small business leads",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "לידים נופלים כי אין אחראי",
      firstWorkflow: { title: "Lead Rescue", steps: ["הסבר", "הוכחה", "השאר פרטים"] },
      initialActions: ["השאר פרטים"],
      versionOneBoundary: { buildNow: ["דף", "טופס"], doNotBuildNow: ["פרסום"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("Lead Rescue", "השאר פרטים"),
    }),
  }));
  const internalHtml = renderLoopCoreScreen(buildLoopCoreViewModel({
    project: buildProjectWithProductSkeleton({
      productType: "internal tool for managing leads",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "אין אחראי ותזכורת ללידים",
      firstWorkflow: { title: "לוח לידים", steps: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"] },
      initialActions: ["הוסף ליד", "עדכן סטטוס", "שנה אחראי"],
      dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
      versionOneBoundary: { buildNow: ["טבלה", "סטטוס", "אחראי"], doNotBuildNow: ["וואטסאפ"] },
    }, {
      visualProductSkeletonAgentOutput: visualSkeletonFor("לוח לידים", "הוסף ליד"),
    }),
  }));

  assert.match(landingHtml, /data-professional-skeleton-task="PRO-SKEL-001"/);
  assert.match(landingHtml, /data-professional-skeleton-status="pass"/);
  assert.match(landingHtml, /data-market-skeleton-task="PRO-SKEL-002"/);
  assert.match(landingHtml, /data-market-skeleton-status="pass"/);
  assert.match(landingHtml, /data-realistic-skeleton-task="PRO-SKEL-003"/);
  assert.match(landingHtml, /data-realistic-skeleton-status="pass"/);
  assert.match(landingHtml, /data-runtime-section="value"/);
  assert.match(landingHtml, /data-runtime-section="trust"/);
  assert.match(landingHtml, /data-runtime-section="form"/);
  assert.match(landingHtml, /nexus-runtime-landing-page__form/);
  assert.match(internalHtml, /data-professional-skeleton-task="PRO-SKEL-001"/);
  assert.match(internalHtml, /data-professional-skeleton-status="pass"/);
  assert.match(internalHtml, /data-market-skeleton-task="PRO-SKEL-002"/);
  assert.match(internalHtml, /data-market-skeleton-status="pass"/);
  assert.match(internalHtml, /data-realistic-skeleton-task="PRO-SKEL-003"/);
  assert.match(internalHtml, /data-realistic-skeleton-status="pass"/);
  assert.match(internalHtml, /nexus-runtime-workspace-metrics/);
  assert.match(internalHtml, /nexus-runtime-workspace-filters/);
  assert.match(internalHtml, /nexus-runtime-workspace-table/);
  assert.match(internalHtml, /data-product-domain-operation="record\.create"/);
  assert.doesNotMatch(landingHtml + internalHtml, /nexus-live-build-preview/);
  assert.doesNotMatch(landingHtml + internalHtml, /PRO-SKEL-001 —/);
  assert.doesNotMatch(landingHtml + internalHtml, /v0|Lovable|Bolt|Replit|Cursor|Framer|Wix/u);
});

test("SLICE-006 — runtime workspace filters are wired into the click interaction gate", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
  const clickGate = appSource.slice(
    appSource.indexOf('target?.matches?.("[data-product-domain-operation]")'),
    appSource.indexOf("doc.addEventListener(\"input\"", appSource.indexOf('target?.matches?.("[data-product-domain-operation]")')),
  );

  assert.match(clickGate, /data-runtime-workspace-filter/);
});

test("W4-FIX-007 — Build canvas renders a runtime skeleton from discovery truth during automatic handoff", () => {
  const project = {
    id: "w4-fix-007-discovery-handoff",
    name: "ניהול לידים לעסק קטן",
    goal: "בעל עסק קטן צריך כלי פנימי פשוט לרשימת לידים, אחראי, תזכורת וצעד הבא.",
    artifactExpectation: {
      projectType: "internal tool",
      title: "רשימת לידים עם אחריות ותזכורת",
      deliverableLabel: "שלד ריצה לניהול לידים",
      loopReadyMessage: "פותחים שלד ריצה ראשון מתוך ההבנה הקנונית בזמן שסוכן השלד ממשיך להיבדק.",
      sourceAgent: "project-discovery-agent",
      responseSource: "agent-composed-transcript",
      pendingSkeletonAgent: "product-skeleton-agent",
    },
    onboardingStateHandoff: {
      handoffStatus: "ready",
      artifactExpectation: {
        projectType: "internal tool",
        title: "רשימת לידים עם אחריות ותזכורת",
        deliverableLabel: "שלד ריצה לניהול לידים",
      },
      summary: {
        canBuildProjectState: true,
      },
      firstSkeletonHandoff: {
        taskId: "W4-FIX-007",
        status: "opened-from-discovery-truth",
        automaticTransition: true,
        visibleRuntimeSkeleton: true,
      },
    },
  };

  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.runtimeSkeleton.taskId, "SLICE-005");
  assert.equal(viewModel.runtimeSkeleton.productClass, "internal-tool");
  assert.equal(viewModel.runtimeSkeleton.shellFamily, "workspace-state-shell");
  assert.match(html, /data-runtime-skeleton-task="SLICE-005"/);
  assert.match(html, /data-runtime-product-class="internal-tool"/);
  assert.match(html, /data-runtime-shell-family="workspace-state-shell"/);
  assert.match(html, /רשימת לידים עם אחריות ותזכורת/);
  assert.match(html, /הצעד הבא/);
  assert.doesNotMatch(html, /QA/);
});

function buildProjectWithProductSkeleton(productSkeletonAgentOutput, overrides = {}) {
  return {
    id: overrides.id ?? "design-plugin-live-proof-project",
    name: overrides.name ?? "Design Plugin Proof",
    artifactExpectation: {
      projectType: productSkeletonAgentOutput.productType,
      title: productSkeletonAgentOutput.firstWorkflow?.title,
    },
    productSkeletonAgentOutput: {
      agentId: "product-skeleton-agent",
      responseSource: "provider-composed",
      ...productSkeletonAgentOutput,
    },
    ...overrides,
  };
}

function visualSkeletonFor(screenName, primaryAction) {
  return {
    agentId: "visual-product-skeleton-agent",
    responseSource: "provider-composed",
    firstScreen: {
      name: screenName,
      purpose: "להציג מסגרת ראשונה שאפשר לבדוק.",
      primaryAction,
    },
    regions: [
      {
        id: "primary",
        kind: "primary",
        title: screenName,
        purpose: "האזור הראשון של המוצר.",
        priority: "primary",
        content: ["פריט ראשון", "פריט שני", "פריט שלישי"],
      },
    ],
    designPlugin: { pluginId: "israeli-smb", pluginName: "Israeli SMB Work Tool" },
  };
}

test("DESIGN-PLUG-004 — Build canvas records lead-management plugin live proof", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות",
    primaryProblem: "לידים נופלים כי אין אחראי ואין תזכורת",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "צריך לראות מי חייב חזרה היום.",
      steps: ["הוספת ליד", "שיוך אחראי", "קביעת תזכורת"],
    },
    initialScreens: [{ name: "מסך לידים", purpose: "רשימת לידים עם אחראי ותזכורת" }],
    initialActions: ["הוסף ליד", "קבע תזכורת"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
    versionOneBoundary: { buildNow: ["לידים"], doNotBuildNow: ["חיבור וואטסאפ"] },
  });
  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.designPluginLiveProof.taskId, "DESIGN-PLUG-004");
  assert.equal(viewModel.designPluginLiveProof.selectedPluginId, "israeli-smb");
  assert.equal(viewModel.designPluginLiveProof.proofKind, "work-tool-lead-flow");
  assert.match(html, /data-design-plugin-task="DESIGN-PLUG-004"/);
  assert.match(html, /data-design-plugin-id="israeli-smb"/);
  assert.match(html, /data-design-plugin-proof-kind="work-tool-lead-flow"/);
  assert.match(html, /data-design-plugin-boundary="plugin-live-proof-not-visual-agent-closure"/);
  assert.match(html, /data-design-plugin-region="lead-list"/);
  assert.match(html, /לחזור היום/);
  assert.match(html, /אחראי ותזכורת/);
  assert.match(html, /הוסף ליד/);
});

test("DESIGN-PLUG-004 — premium gifts render different plugin and visual structure", () => {
  const leadProject = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות",
    primaryProblem: "לידים נופלים כי אין אחראי ואין תזכורת",
    firstWorkflow: { title: "טיפול בליד ראשון", steps: ["הוספת ליד"] },
    initialActions: ["הוסף ליד"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי"] }],
    versionOneBoundary: { buildNow: ["לידים"], doNotBuildNow: ["וואטסאפ"] },
  });
  const giftProject = buildProjectWithProductSkeleton({
    productType: "מותג מתנות רקמה יוקרתי",
    primaryUser: "לקוחה שרוצה לקנות מתנה אישית ומרגשת",
    primaryProblem: "קשה לבחור מתנה שנראית אישית ולא גנרית",
    firstWorkflow: {
      title: "בחירת מתנה מותאמת אישית",
      whyThisFirst: "זה מוכיח את התאמת המתנה לפני תשלום אמיתי.",
      steps: ["בחירת מוצר", "בחירת רקמה", "אישור עיצוב"],
    },
    initialScreens: [{ name: "מסך מתנות", purpose: "הצגת מוצרים אישיים ותחושת מותג" }],
    initialActions: ["בחר מתנה", "אשר רקמה"],
    dataObjects: [{ name: "מתנה", fields: ["שם", "חומר", "צבע", "רקמה"] }],
    versionOneBoundary: { buildNow: ["קטלוג קטן", "בחירת רקמה"], doNotBuildNow: ["תשלום אמיתי"] },
  });
  const leadHtml = renderLoopCoreScreen(buildLoopCoreViewModel({ project: leadProject }));
  const giftViewModel = buildLoopCoreViewModel({ project: giftProject });
  const giftHtml = renderLoopCoreScreen(giftViewModel);

  assert.equal(giftViewModel.designPluginLiveProof.selectedPluginId, "premium-brand");
  assert.equal(giftViewModel.designPluginLiveProof.proofKind, "premium-commerce-brand");
  assert.match(giftHtml, /data-design-plugin-id="premium-brand"/);
  assert.match(giftHtml, /data-design-plugin-proof-kind="premium-commerce-brand"/);
  assert.match(giftHtml, /data-design-plugin-region="hero"/);
  assert.match(giftHtml, /מוצרים מותאמים אישית/);
  assert.match(giftHtml, /בחירת רקמה/);
  assert.match(giftHtml, /הכן דמו ללקוחה/);
  assert.notEqual(
    leadHtml.match(/data-design-plugin-proof-kind="([^"]+)"/)?.[1],
    giftHtml.match(/data-design-plugin-proof-kind="([^"]+)"/)?.[1],
  );
  assert.notEqual(
    leadHtml.match(/data-design-plugin-id="([^"]+)"/)?.[1],
    giftHtml.match(/data-design-plugin-id="([^"]+)"/)?.[1],
  );
});

test("BLD-AGT-001 — Build agent rail renders pending state instead of silent send", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים כי אין אחראי",
    firstWorkflow: { title: "ניהול לידים", steps: ["הוספת ליד"] },
    initialActions: ["הוסף ליד"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי"] }],
    versionOneBoundary: { buildNow: ["לידים"], doNotBuildNow: ["וואטסאפ"] },
  });
  const html = renderLoopCoreScreen(buildLoopCoreViewModel({
    project,
    companionConversation: {
      projectName: "ניהול לידים",
      pending: true,
      draftMessage: "תוסיף סינון לפי אחראי",
      transcript: [
        { speaker: "user", text: "תוסיף סינון לפי אחראי" },
      ],
    },
  }));

  assert.match(html, /data-build-agent-loading="true"/);
  assert.match(html, /אני בודק את הבקשה מול ההקשר של השלד/);
  assert.match(html, /data-agent-rail-send aria-label="שלח לסוכן" disabled/);
  assert.match(html, /<textarea data-agent-rail-input rows="2"[^>]+disabled/);
});

test("PRODUCT-KIND-001 — loop surface exposes product pattern selection for unfamiliar editor products", () => {
  const project = buildProjectWithProductSkeleton({
    productType: "רעיון לא מוכר",
    primaryUser: "מעצב",
    primaryProblem: "צריך לערוך אובייקטים על קנבס עם שכבות ובטל חזור",
    firstWorkflow: { title: "עורך קנבס", steps: ["בחר אובייקט", "שנה צבע", "בטל"] },
    initialActions: ["בחר", "הוסף צורה", "בטל"],
    versionOneBoundary: { buildNow: ["קנבס", "סרגל כלים"], doNotBuildNow: ["ייצוא אמיתי"] },
  }, {
    id: "product-kind-editor-proof",
    name: "עורך קנבס",
    goal: "כלי עריכה עם קנבס, שכבות, אובייקט נבחר, סרגל כלים ובטל חזור",
  });
  const viewModel = buildLoopCoreViewModel({ project });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.runtimeSkeleton.productKindTaskId, "PRODUCT-KIND-001");
  assert.equal(viewModel.runtimeSkeleton.productPattern, "editor-canvas");
  assert.equal(viewModel.runtimeSkeleton.shellFamily, "editor-canvas-shell");
  assert.equal(viewModel.runtimeSkeleton.productDomainSkeleton.domainKind, "editor-document-local-state");
  assert.match(html, /data-product-kind-task="PRODUCT-KIND-001"/);
  assert.match(html, /data-product-kind-pattern="editor-canvas"/);
  assert.match(html, /data-product-kind-skeleton-family="editor-canvas-shell"/);
  assert.match(html, /data-product-learning-task="LEARNING-PRODUCT-INTELLIGENCE-001"/);
  assert.match(html, /data-product-learning-status="empty"/);
  assert.match(html, /data-product-learning-boundary="learning-product-intelligence-recommends-only-does-not-overwrite-project-truth"/);
  assert.match(html, /data-runtime-shell-family="editor-canvas-shell"/);
  assert.match(html, /data-product-domain-kind="editor-document-local-state"/);
  assert.doesNotMatch(html, />LEARNING-PRODUCT-INTELLIGENCE-001</);
});
