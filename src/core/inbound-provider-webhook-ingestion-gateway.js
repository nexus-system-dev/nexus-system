function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildMissingInputs({ externalCapabilityRegistry, connectorCredentialBinding }) {
  const missingInputs = [];
  if (normalizeString(externalCapabilityRegistry?.externalCapabilityRegistryId) === null) {
    missingInputs.push("externalCapabilityRegistry");
  }
  if (normalizeString(connectorCredentialBinding?.connectorCredentialBindingId) === null) {
    missingInputs.push("connectorCredentialBinding");
  }
  return missingInputs;
}

function resolveChannelType(channelConfig, notificationEvent, connectorCredentialBinding) {
  return normalizeString(
    channelConfig?.channelType,
    normalizeString(channelConfig?.provider, normalizeString(notificationEvent?.eventType, normalizeString(connectorCredentialBinding?.binding?.providerType, "webhook"))),
  );
}

function resolveTarget(channelConfig) {
  return normalizeString(channelConfig?.webhookUrl, normalizeString(channelConfig?.target, null));
}

export function createInboundProviderWebhookIngestionGateway({
  projectId = null,
  notificationEvent = null,
  externalCapabilityRegistry = null,
  connectorCredentialBinding = null,
  channelConfig = null,
} = {}) {
  const registry = normalizeObject(externalCapabilityRegistry);
  const bindingState = normalizeObject(connectorCredentialBinding);
  const config = normalizeObject(channelConfig);
  const event = normalizeObject(notificationEvent);
  const missingInputs = buildMissingInputs({
    externalCapabilityRegistry: registry,
    connectorCredentialBinding: bindingState,
  });
  const target = resolveTarget(config);
  const deliveryChannel = resolveChannelType(config, event, bindingState);
  const safeForRuntimeUse = bindingState.summary?.safeForRuntimeUse === true;
  const ready = missingInputs.length === 0 && safeForRuntimeUse && target !== null;

  return {
    inboundWebhookIngestion: {
      inboundWebhookIngestionId: `inbound-webhook-ingestion:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: missingInputs.length > 0 ? "missing-inputs" : ready ? "ready" : "pending-target",
      missingInputs,
      gateway: {
        deliveryChannel,
        target,
        providerType: normalizeString(bindingState.binding?.providerType),
        connectorStatus: normalizeString(bindingState.binding?.connectorStatus, "unknown"),
        credentialReference: normalizeString(bindingState.binding?.credentialReference),
        providerSessionId: normalizeString(config.providerSessionId, null),
      },
      eventEnvelope: {
        notificationEventId: normalizeString(event.notificationEventId),
        eventType: normalizeString(event.eventType, "generic-notification"),
        projectId: normalizeString(event.projectId, normalizeString(projectId)),
        requiresApproval: event.requiresApproval === true,
      },
      ingestionReadiness: {
        safeForRuntimeUse,
        targetConfigured: target !== null,
        idempotencyKey: normalizeString(config.idempotencyKey, `webhook:${normalizeString(projectId, "project")}:${normalizeString(event.notificationEventId, "notification")}`),
      },
      summary: {
        canIngestWebhook: ready,
        secretValueExposed: false,
      },
    },
  };
}
