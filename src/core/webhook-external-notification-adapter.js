function normalizeNotificationEvent(notificationEvent) {
  return notificationEvent && typeof notificationEvent === "object" ? notificationEvent : {};
}

function normalizeChannelConfig(channelConfig) {
  return channelConfig && typeof channelConfig === "object" ? channelConfig : {};
}

function resolveChannelType(channelConfig) {
  if (typeof channelConfig.channelType === "string" && channelConfig.channelType.trim()) {
    return channelConfig.channelType.trim();
  }

  if (typeof channelConfig.provider === "string" && channelConfig.provider.trim()) {
    return channelConfig.provider.trim();
  }

  return "webhook";
}

function resolveTarget(channelConfig) {
  if (typeof channelConfig.webhookUrl === "string" && channelConfig.webhookUrl.trim()) {
    return channelConfig.webhookUrl.trim();
  }

  if (typeof channelConfig.target === "string" && channelConfig.target.trim()) {
    return channelConfig.target.trim();
  }

  return null;
}

export function createWebhookExternalNotificationAdapter({
  notificationEvent = null,
  channelConfig = null,
} = {}) {
  const normalizedNotificationEvent = normalizeNotificationEvent(notificationEvent);
  const normalizedChannelConfig = normalizeChannelConfig(channelConfig);
  const hasEvent = Boolean(normalizedNotificationEvent.notificationEventId);
  const channelType = resolveChannelType(normalizedChannelConfig);
  const target = resolveTarget(normalizedChannelConfig);

  let deliveryStatus = "skipped";
  let reason = "No notification event available";

  if (hasEvent && !target) {
    deliveryStatus = "pending-target";
    reason = "Missing external channel target";
  } else if (hasEvent) {
    deliveryStatus = "queued";
    reason = null;
  }

  return {
    externalDeliveryResult: {
      notificationEventId: normalizedNotificationEvent.notificationEventId ?? null,
      deliveryChannel: channelType,
      deliveryStatus,
      target,
      providerSessionId: normalizedChannelConfig.providerSessionId ?? null,
      payloadPreview: {
        title: normalizedNotificationEvent.title ?? normalizedNotificationEvent.eventType ?? "Notification",
        message: normalizedNotificationEvent.message ?? "Notification event created",
        projectId: normalizedNotificationEvent.projectId ?? null,
      },
      queuedAt: hasEvent && deliveryStatus === "queued" ? new Date().toISOString() : null,
      reason,
      metadata: {
        eventType: normalizedNotificationEvent.eventType ?? "generic-notification",
        provider: normalizedChannelConfig.provider ?? channelType,
      },
    },
  };
}
