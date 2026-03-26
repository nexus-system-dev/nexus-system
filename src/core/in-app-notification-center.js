function normalizeNotificationEvent(notificationEvent) {
  return notificationEvent && typeof notificationEvent === "object" ? notificationEvent : {};
}

function normalizeUserIdentity(userIdentity) {
  return userIdentity && typeof userIdentity === "object" ? userIdentity : {};
}

export function createInAppNotificationCenter({
  notificationEvent = null,
  userIdentity = null,
} = {}) {
  const normalizedNotificationEvent = normalizeNotificationEvent(notificationEvent);
  const normalizedUserIdentity = normalizeUserIdentity(userIdentity);
  const hasEvent = Boolean(normalizedNotificationEvent.notificationEventId);
  const entry = hasEvent
    ? {
        id: normalizedNotificationEvent.notificationEventId,
        type: normalizedNotificationEvent.eventType ?? "generic-notification",
        title: normalizedNotificationEvent.title ?? normalizedNotificationEvent.eventType ?? "Notification",
        message: normalizedNotificationEvent.message ?? "Notification event created",
        status: normalizedNotificationEvent.status ?? "pending",
        isRead: false,
        actionLinks: [normalizedNotificationEvent.nextAction].filter(Boolean),
        createdAt: normalizedNotificationEvent.createdAt ?? null,
      }
    : null;

  return {
    notificationCenterState: {
      userId: normalizedUserIdentity.userId ?? null,
      inbox: entry ? [entry] : [],
      unreadCount: entry ? 1 : 0,
      totalNotifications: entry ? 1 : 0,
      latestNotificationId: entry?.id ?? null,
    },
  };
}
