import test from "node:test";
import assert from "node:assert/strict";

import {
  acceptStudioHandoffReturn,
  buildStudioHandoffAgentEnvelope,
  createStudioHandoffAgentContract,
  validateStudioHandoffEnvelope,
} from "../src/core/studio-handoff-agent.js";

test("STD-HANDOFF-AGT-001 builds a bounded Web to Studio handoff envelope", () => {
  const result = buildStudioHandoffAgentEnvelope({
    now: new Date("2026-06-12T10:00:00.000Z"),
    requestedAction: "open-local-workspace",
    requiredLocalCapability: "local-file-runtime",
    project: {
      id: "studio-proof",
      name: "Studio proof",
      workspaceId: "workspace-studio-proof",
      cloudRevision: "revision-7",
      artifactExpectation: {
        projectType: "internal-tool",
        deliverableLabel: "כלי בדיקה",
      },
      studioWorkspace: {
        connectionStatus: "connected",
        userVisibleReason: "צריך להריץ את המוצר על המחשב.",
      },
    },
  });

  assert.equal(result.taskId, "STD-HANDOFF-AGT-001");
  assert.equal(result.agentId, "studio-handoff-agent");
  assert.equal(result.status, "connected-ready");
  assert.equal(result.decision, "open");
  assert.equal(result.envelope.handoffProtocolVersion, "studio-handoff-v1");
  assert.equal(result.envelope.projectId, "studio-proof");
  assert.equal(result.envelope.projectName, "Studio proof");
  assert.equal(result.envelope.workspaceId, "workspace-studio-proof");
  assert.equal(result.envelope.cloudRevision, "revision-7");
  assert.equal(result.envelope.requestedAction, "open-local-workspace");
  assert.equal(result.envelope.requiredLocalCapability, "local-file-runtime");
  assert.equal(result.envelope.entryState, "connected-ready");
  assert.equal(result.envelope.returnToWebUrl, "/loop?projectId=studio-proof");
  assert.match(result.desktopOpenUrl, /^nexus-studio:\/\/open\?handoffId=studio-handoff%3Astudio-proof%3A/);
  assert.doesNotMatch(result.desktopOpenUrl, /project=studio-proof/);
  assert.equal(result.deepLinkDoesNotProve.includes("studio-opened"), true);
  assert.equal(result.deepLinkDoesNotProve.includes("sync-succeeded"), true);
  assert.equal(result.forbiddenPayloadFields.includes("providerTokens"), true);

  const validation = validateStudioHandoffEnvelope(result);
  assert.equal(validation.isValid, true);
  assert.deepEqual(validation.missingFields, []);
  assert.deepEqual(validation.forbiddenFieldsPresent, []);
});

test("STD-HANDOFF-AGT-001 exposes truthful fallback when Studio is unavailable", () => {
  const result = buildStudioHandoffAgentEnvelope({
    now: new Date("2026-06-12T10:00:00.000Z"),
    project: {
      id: "studio-unavailable",
      name: "No Studio",
      studioWorkspace: {
        connectionStatus: "not-installed",
      },
    },
  });

  assert.equal(result.status, "unavailable-fallback");
  assert.equal(result.decision, "prepare-with-fallback");
  assert.equal(result.connection.isConnected, false);
  assert.equal(result.envelope.entryState, "desktop-unavailable");
  assert.match(result.unavailableFallback.body, /לא מבטיח גישה לקבצים/);
  assert.equal(validateStudioHandoffEnvelope(result).isValid, true);
});

test("STD-HANDOFF-AGT-001 accepts only known Studio return states with an envelope", () => {
  const result = buildStudioHandoffAgentEnvelope({
    now: new Date("2026-06-12T10:00:00.000Z"),
    project: {
      id: "studio-return-proof",
      name: "Return proof",
    },
  });

  assert.deepEqual(
    acceptStudioHandoffReturn({ agentResult: result, returnState: "surprise-success" }),
    {
      taskId: "STD-HANDOFF-AGT-001",
      accepted: false,
      reason: "unsupported-studio-return-state",
    },
  );

  const accepted = acceptStudioHandoffReturn({
    agentResult: result,
    returnState: "sync-ready",
    evidence: { summary: "local changes ready" },
  });
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.taskId, "STD-HANDOFF-AGT-001");
  assert.equal(accepted.returnState, "sync-ready");
  assert.equal(accepted.projectId, "studio-return-proof");
  assert.equal(accepted.handoffId, result.envelope.handoffId);
  assert.equal(accepted.evidence.summary, "local changes ready");
});

test("STD-HANDOFF-AGT-001 contract declares required fields and forbidden local payload", () => {
  const contract = createStudioHandoffAgentContract();

  assert.equal(contract.taskId, "STD-HANDOFF-AGT-001");
  assert.equal(contract.agentId, "studio-handoff-agent");
  assert.equal(contract.requiredEnvelopeFields.includes("handoffId"), true);
  assert.equal(contract.requiredEnvelopeFields.includes("cloudRevisionHash"), true);
  assert.equal(contract.forbiddenPayloadFields.includes("rawLocalPaths"), true);
  assert.equal(contract.forbiddenPayloadFields.includes("providerTokens"), true);
  assert.equal(contract.returnStates.includes("sync-accepted"), true);
  assert.equal(contract.webMustNotPromise.includes("studio-installed-without-connection-proof"), true);
});
