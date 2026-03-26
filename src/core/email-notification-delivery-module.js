function normalizeNotificationEvent(notificationEvent) {
  return notificationEvent && typeof notificationEvent === "object" ? notificationEvent : {};
}

function normalizeDeliveryPreferences(deliveryPreferences) {
  return deliveryPreferences && typeof deliveryPreferences === "object" ? deliveryPreferences : {};
}

function resolveRecipient(notificationEvent, deliveryPreferences) {
  if (typeof deliveryPreferences.email === "string" && deliveryPreferences.email.trim()) {
    return deliveryPreferences.email.trim();
  }

  if (typeof notificationEvent.userEmail === "string" && notificationEvent.userEmail.trim()) {
    return notificationEvent.userEmail.trim();
  }

  return null;
}

function resolveChannelEnabled(notificationEvent, deliveryPreferences) {
  if (deliveryPreferences.emailEnabled === false) {
    return false;
  }

  if (Array.isArray(notificationEvent.channels) && notificationEvent.channels.length > 0) {
    return notificationEvent.channels.includes("email");
  }

  return true;
}

function resolveTemplate(notificationEvent) {
  switch (notificationEvent.eventType) {
    case "approval-required":
      return "approval-request";
    case "failure":
      return "failure-alert";
    case "invite":
      return "workspace-invite";
    case "security":
      return "security-alert";
    default:
      return "generic-notification";
  }
}

export function createEmailNotificationDeliveryModule({
  notificationEvent = null,
  deliveryPreferences = null,
} = {}) {
  const normalizedNotificationEvent = normalizeNotificationEvent(notificationEvent);
  const normalizedDeliveryPreferences = normalizeDeliveryPreferences(deliveryPreferences);
  const recipient = resolveRecipient(normalizedNotificationEvent, normalizedDeliveryPreferences);
  const channelEnabled = resolveChannelEnabled(normalizedNotificationEvent, normalizedDeliveryPreferences);
  const hasEvent = Boolean(normalizedNotificationEvent.notificationEventId);

  let deliveryStatus = "skipped";
  let reason = "No notification event available";

  if (hasEvent && !channelEnabled) {
    deliveryStatus = "suppressed";
    reason = "Email delivery disabled by preferences";
  } else if (hasEvent && !recipient) {
    deliveryStatus = "pending-recipient";
    reason = "Missing email recipient";
  } else if (hasEvent) {
    deliveryStatus = "queued";
    reason = null;
  }

  return {
    emailDeliveryResult: {
      notificationEventId: normalizedNotificationEvent.notificationEventId ?? null,
      deliveryChannel: "email",
      deliveryStatus,
      recipient,
      templateId: resolveTemplate(normalizedNotificationEvent),
      subject:
        typeof normalizedDeliveryPreferences.subjectOverride === "string" && normalizedDeliveryPreferences.subjectOverride.trim()
          ? normalizedDeliveryPreferences.subjectOverride.trim()
          : normalizedNotificationEvent.title ?? "Nexus notification",
      queuedAt: hasEvent && deliveryStatus === "queued" ? new Date().toISOString() : null,
      reason,
      metadata: {
        eventType: normalizedNotificationEvent.eventType ?? "generic-notification",
        projectId: normalizedNotificationEvent.projectId ?? null,
        priority: normalizedDeliveryPreferences.priority ?? "normal",
      },
    },
  };
}
