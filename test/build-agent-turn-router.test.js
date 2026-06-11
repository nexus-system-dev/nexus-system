import test from "node:test";
import assert from "node:assert/strict";

import { createBuildAgentTurnDecision } from "../src/core/build-agent-turn-router.js";

const baseProject = {
  id: "daily-done-project",
  name: "Daily Done",
};

test("BLD-AGT-001 — routes visual Build requests to the visual build owner", () => {
  const decision = createBuildAgentTurnDecision({
    project: baseProject,
    message: "תוסיף לי דף סלאש סקרין עם שם האפליקציה",
    learningInstructions: {
      status: "ready",
      runtimeSkeletonId: "runtime-1",
      productDomainSkeletonId: "domain-1",
    },
  });

  assert.equal(decision.taskId, "BLD-AGT-001");
  assert.equal(decision.projectId, "daily-done-project");
  assert.equal(decision.intent, "visual-change");
  assert.equal(decision.owner, "visual-build-agent");
  assert.equal(decision.status, "routed");
  assert.equal(decision.mayClaimChanged, false);
  assert.equal(decision.speechBoundary, "reply-must-not-claim-product-change");
  assert.equal(decision.runtimeSkeletonId, "runtime-1");
  assert.equal(decision.productDomainSkeletonId, "domain-1");
});

test("BLD-AGT-001 — routes verification requests to the verification owner", () => {
  const decision = createBuildAgentTurnDecision({
    project: baseProject,
    message: "תבדוק שהמסך עובד",
    learningInstructions: { status: "ready" },
  });

  assert.equal(decision.intent, "verification-request");
  assert.equal(decision.owner, "verification-qa-agent");
  assert.equal(decision.status, "routed");
  assert.equal(decision.requiresApproval, false);
  assert.equal(decision.mayClaimChanged, false);
});

test("BLD-AGT-001 — product direction replacement requires approval", () => {
  const decision = createBuildAgentTurnDecision({
    project: baseProject,
    message: "תשנה את זה להזמנות במקום לידים",
    learningInstructions: { status: "ready" },
  });

  assert.equal(decision.intent, "product-truth-change");
  assert.equal(decision.owner, "mutation-change-agent");
  assert.equal(decision.status, "approval-required");
  assert.equal(decision.requiresApproval, true);
  assert.equal(decision.mayClaimChanged, false);
});

test("BLD-AGT-001 — provider and release boundary prevents fake success", () => {
  const decision = createBuildAgentTurnDecision({
    project: baseProject,
    message: "תחבר לי וואטסאפ אמיתי ותפרסם לי את זה",
    learningInstructions: {
      status: "ready",
      routingHints: ["provider-release-boundary"],
    },
  });

  assert.equal(decision.intent, "release-request");
  assert.equal(decision.owner, "release-agent");
  assert.equal(decision.status, "blocked-or-approval-required");
  assert.equal(decision.requiresApproval, true);
  assert.equal(decision.mayClaimChanged, false);
});

test("PROV-001 — untrained creative payment and campaign requests route through provider gateway", () => {
  const creative = createBuildAgentTurnDecision({
    project: baseProject,
    message: "Generate a Higgsfield video ad and spend 200 שקל באינסטגרם",
    learningInstructions: { status: "ready" },
  });
  const payment = createBuildAgentTurnDecision({
    project: baseProject,
    message: "תחבר סליקה ותחייב לקוחות",
    learningInstructions: { status: "ready" },
  });

  assert.equal(creative.intent, "provider-capability-request");
  assert.equal(creative.status, "blocked-or-approval-required");
  assert.equal(creative.requiresApproval, true);
  assert.equal(payment.intent, "provider-capability-request");
  assert.equal(payment.status, "blocked-or-approval-required");
  assert.equal(payment.mayClaimChanged, false);
});
