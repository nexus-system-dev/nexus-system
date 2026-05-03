import test from "node:test";
import assert from "node:assert/strict";

import { createInboundProviderWebhookIngestionGateway } from "../src/core/inbound-provider-webhook-ingestion-gateway.js";

test("inbound provider webhook ingestion gateway becomes ready when binding and target exist", () => {
  const { inboundWebhookIngestion } = createInboundProviderWebhookIngestionGateway({
    projectId: "giftwallet",
    notificationEvent: {
      notificationEventId: "notification-1",
      eventType: "release-failed",
      projectId: "giftwallet",
    },
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
    },
    connectorCredentialBinding: {
      connectorCredentialBindingId: "connector-credential-binding:giftwallet",
      binding: {
        providerType: "github",
        connectorStatus: "connected",
        credentialReference: "credref_github-primary",
      },
      summary: {
        safeForRuntimeUse: true,
      },
    },
    channelConfig: {
      channelType: "webhook",
      webhookUrl: "https://example.com/hooks/provider",
      providerSessionId: "provider-session-1",
    },
  });

  assert.equal(inboundWebhookIngestion.status, "ready");
  assert.equal(inboundWebhookIngestion.gateway.target, "https://example.com/hooks/provider");
  assert.equal(inboundWebhookIngestion.ingestionReadiness.targetConfigured, true);
  assert.equal(inboundWebhookIngestion.summary.secretValueExposed, false);
});

test("inbound provider webhook ingestion gateway stays pending-target when binding is safe but target is missing", () => {
  const { inboundWebhookIngestion } = createInboundProviderWebhookIngestionGateway({
    projectId: "giftwallet",
    notificationEvent: {
      notificationEventId: "notification-2",
      eventType: "security",
    },
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
    },
    connectorCredentialBinding: {
      connectorCredentialBindingId: "connector-credential-binding:giftwallet",
      summary: {
        safeForRuntimeUse: true,
      },
      binding: {
        providerType: "github",
      },
    },
    channelConfig: {
      channelType: "webhook",
    },
  });

  assert.equal(inboundWebhookIngestion.status, "pending-target");
  assert.equal(inboundWebhookIngestion.ingestionReadiness.targetConfigured, false);
});
