import test from "node:test";
import assert from "node:assert/strict";

import {
  createShareSurfaceCanonicalStructureContract,
} from "../src/core/share-surface-canonical-structure-contract.js";
import { buildShareSurfaceViewModel } from "../web/nexus-ui/adapters/share-surface-adapter.js";
import { renderShareSurfaceScreen } from "../web/nexus-ui/screens/ShareSurfaceScreen.js";

test("SURF-007 defines Share as an experience-oriented review/demo workspace", () => {
  const contract = createShareSurfaceCanonicalStructureContract();

  assert.equal(contract.contractId, "SURF-007");
  assert.equal(contract.surfaceId, "share");
  assert.equal(contract.purpose, "experience-oriented-review-demo-workspace");
  assert.equal(contract.shareLaw, "experience-oriented-share-not-permissions-admin");
  assert.equal(contract.dependsOn.includes("SURF-001"), true);
  assert.equal(contract.requiredRegions.includes("share-experience-preview"), true);
  assert.equal(contract.requiredRegions.includes("share-audience-access-boundary"), true);
  assert.equal(contract.requiredRegions.includes("share-review-demo-link"), true);
  assert.equal(contract.requiredRegions.includes("share-copy-open-actions"), true);
  assert.equal(contract.requiredRegions.includes("share-privacy-scope"), true);
  assert.equal(contract.requiredRegions.includes("share-return-to-build"), true);
  assert.equal(contract.forbiddenShapes.includes("share-as-permissions-admin"), true);
  assert.equal(contract.forbiddenShapes.includes("fake-public-share-link"), true);
  assert.equal(contract.forbiddenShapes.includes("internal-debug-share-state"), true);
});

test("Share surface renders SURF-007 regions with canonical right rail and no permissions/admin fallback", () => {
  const viewModel = buildShareSurfaceViewModel({
    project: {
      id: "surf-007-proof",
      name: "Share proof",
      goal: "להראות תוצר review בלי לחשוף workspace פנימי",
      artifactExpectation: {
        projectType: "landing-page",
        title: "Landing page",
        summary: "Landing page שמוכן לבדיקה חיצונית.",
      },
      releaseWorkspace: {
        releaseTarget: "private-demo",
        deployment: {
          shareLink: "https://demo.nexus.local/surf-007-proof",
        },
        validation: {
          status: "ready",
        },
        timeline: {
          events: [{ eventId: "release-preview-ready" }],
        },
      },
      releaseableProductStateContract: {
        readinessDecision: "ready",
        previewPath: "workspace-preview",
        visibleChecks: [{ label: "Preview checked", status: "passed" }],
      },
      companionConversation: {
        understoodItems: ["הקהל הוא מייסד שרוצה לבדוק חוויית מוצר לפני שליחה."],
      },
      shareWorkspace: {
        accessMode: "review-demo",
      },
    },
  });
  const html = renderShareSurfaceScreen(viewModel);

  assert.equal(viewModel.contract.contractId, "SURF-007");
  assert.equal(viewModel.share.isShareReady, true);
  assert.match(html, /data-share-surface-contract="SURF-007"/);
  assert.match(html, /data-share-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="share"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="share"/);
  assert.match(html, /data-nexus-ui-target="growth"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-surface-id="share"/);
  assert.match(html, /data-surface-purpose="experience-oriented-review-demo-workspace"/);
  assert.match(html, /data-share-law="experience-oriented-share-not-permissions-admin"/);
  assert.match(html, /data-share-region="share-experience-preview"/);
  assert.match(html, /data-share-region="share-audience-access-boundary"/);
  assert.match(html, /data-share-region="share-review-demo-link"/);
  assert.match(html, /data-share-region="share-copy-open-actions"/);
  assert.match(html, /data-share-region="share-privacy-scope"/);
  assert.match(html, /data-share-region="share-return-to-build"/);
  assert.doesNotMatch(html, /permissions admin/i);
  assert.doesNotMatch(html, /QA זמני/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
});

test("Share surface does not fabricate a public link when release has no share link", () => {
  const viewModel = buildShareSurfaceViewModel({
    project: {
      id: "surf-007-no-link",
      name: "No link",
      goal: "Review product",
      releaseWorkspace: {
        validation: { status: "ready" },
      },
    },
  });
  const html = renderShareSurfaceScreen(viewModel);

  assert.equal(viewModel.share.isShareReady, false);
  assert.equal(viewModel.share.shareLink, "");
  assert.match(html, /קישור סקירה עדיין לא נוצר/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /https:\/\/demo\.nexus\.local/);
});

test("Share surface consumes SHARE-AGT-001 truth without exposing provider plumbing", () => {
  const viewModel = buildShareSurfaceViewModel({
    project: {
      id: "share-agent-proof",
      name: "Lead Manager",
      goal: "להציג דמו בטוח ללקוח",
      shareDemoAgent: {
        taskId: "SHARE-AGT-001",
        status: "approval-required",
        approvalStatus: "waiting",
        active: false,
        mode: "snapshot",
        productSummary: {
          title: "Lead Manager",
          goal: "כלי לניהול לידים",
        },
        audience: {
          viewerType: "לקוח",
          purpose: "בדיקת חוויית מוצר מוגבלת",
        },
        visibilityBoundary: {
          include: ["מסך תצוגה של Lead Manager"],
          exclude: ["שיחה פרטית עם Nexus", "שמות סוכנים ומשימות פנימיות"],
          privacyScope: "הנמען רואה תצוגת מוצר מוגבלת בלבד.",
        },
        userReply: "הכנתי הצעת שיתוף בטוחה. לפני שזה יוצא החוצה צריך אישור מפורש.",
        shareLink: "",
      },
    },
  });
  const html = renderShareSurfaceScreen(viewModel);

  assert.equal(viewModel.share.agentTaskId, "SHARE-AGT-001");
  assert.equal(viewModel.share.agentStatus, "approval-required");
  assert.equal(viewModel.share.approvalStatus, "waiting");
  assert.equal(viewModel.share.isShareReady, false);
  assert.match(html, /data-share-agent-task="SHARE-AGT-001"/);
  assert.match(html, /data-share-agent-status="approval-required"/);
  assert.match(html, /data-share-approval-status="waiting"/);
  assert.match(html, /data-share-demo-action="approve"/);
  assert.match(html, /הצעת שיתוף ממתינה לאישור/);
  assert.doesNotMatch(html, /provider/i);
  assert.doesNotMatch(html, /debug/i);
});

test("EXP-005 Share path starts with prepare action and no fabricated review link", () => {
  const viewModel = buildShareSurfaceViewModel({
    project: {
      id: "exp-005-not-prepared",
      name: "Lead Manager",
      goal: "להכין תצוגת סקירה בטוחה",
      artifactExpectation: {
        projectType: "internal-tool",
        title: "Lead Manager",
      },
    },
  });
  const html = renderShareSurfaceScreen(viewModel);

  assert.equal(viewModel.share.agentStatus, "not-prepared");
  assert.equal(viewModel.share.isShareReady, false);
  assert.equal(viewModel.share.shareLink, "");
  assert.match(html, /data-share-demo-action="prepare"/);
  assert.match(html, /data-share-review-link/);
  assert.match(html, /קישור סקירה עדיין לא נוצר/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test("EXP-005 Share path enables approve only after a bounded proposal exists", () => {
  const preparedViewModel = buildShareSurfaceViewModel({
    project: {
      id: "exp-005-prepared",
      name: "Lead Manager",
      goal: "להציג דמו בטוח ללקוח",
      shareDemoAgent: {
        taskId: "SHARE-AGT-001",
        status: "approval-required",
        approvalStatus: "waiting",
        active: false,
        productSummary: {
          title: "Lead Manager",
          goal: "כלי לניהול לידים",
        },
        visibilityBoundary: {
          include: ["מסך תצוגה של Lead Manager"],
          exclude: ["שיחה פרטית עם Nexus"],
          privacyScope: "הנמען רואה תצוגת מוצר מוגבלת בלבד.",
        },
        shareLink: "",
      },
    },
  });
  const approvedViewModel = buildShareSurfaceViewModel({
    project: {
      id: "exp-005-approved",
      name: "Lead Manager",
      goal: "להציג דמו בטוח ללקוח",
      shareDemoAgent: {
        taskId: "SHARE-AGT-001",
        status: "approved-snapshot",
        approvalStatus: "approved",
        active: true,
        localReviewPath: "/share?projectId=exp-005-approved&shareId=review",
        shareLink: "/share?projectId=exp-005-approved&shareId=review",
        productSummary: {
          title: "Lead Manager",
          goal: "כלי לניהול לידים",
        },
        visibilityBoundary: {
          include: ["מסך תצוגה של Lead Manager"],
          exclude: ["שיחה פרטית עם Nexus"],
          privacyScope: "הנמען רואה תצוגת מוצר מוגבלת בלבד.",
        },
      },
    },
  });

  const preparedHtml = renderShareSurfaceScreen(preparedViewModel);
  const approvedHtml = renderShareSurfaceScreen(approvedViewModel);

  assert.equal(preparedViewModel.share.isShareReady, false);
  assert.match(preparedHtml, /data-share-agent-status="approval-required"/);
  assert.match(preparedHtml, /data-share-demo-action="approve" /);
  assert.doesNotMatch(preparedHtml, /data-share-active="true"/);

  assert.equal(approvedViewModel.share.isShareReady, true);
  assert.match(approvedHtml, /data-share-agent-status="approved-snapshot"/);
  assert.match(approvedHtml, /data-share-active="true"/);
  assert.match(approvedHtml, /data-share-demo-action="revoke" /);
  assert.match(approvedHtml, /\/share\?projectId=exp-005-approved&amp;shareId=review/);
});
