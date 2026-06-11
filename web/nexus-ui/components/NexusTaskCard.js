import { renderNexusCard } from "./NexusCard.js";
import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

function escapeHtml(value) {
  return escapeVisibleShellCopy(value);
}

function resolveStatusLabel(status = "") {
  const normalized = String(status ?? "").trim().toLowerCase();
  switch (normalized) {
    case "active":
      return "נבנה עכשיו";
    case "blocked":
      return "ממתין להבהרה";
    case "done":
      return "הושלם";
    case "pending":
      return "מוכן להמשך";
    default:
      return String(status ?? "").trim() || "מוכן להמשך";
  }
}

export function renderNexusTaskCard({
  title = "",
  description = "",
  status = "pending",
  icon = "◉",
  metadata = [],
} = {}) {
  const statusLabel = resolveStatusLabel(status);
  const metadataHtml = metadata.length
    ? `
      <div class="nexus-ui-task-card__meta">
        ${metadata
          .map(
            (item) => `
              <span><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</span>
            `,
          )
          .join("")}
      </div>
    `
    : "";

  return renderNexusCard({
    hover: true,
    padding: "lg",
    className: "nexus-ui-task-card",
    content: `
      <div class="nexus-ui-task-card__header">
        <div class="nexus-ui-task-card__main">
          <div class="nexus-ui-task-card__icon">${escapeHtml(icon)}</div>
          <div>
            <h3 class="nexus-ui-task-card__title">${escapeHtml(title)}</h3>
            <p class="nexus-ui-task-card__body">${escapeHtml(description)}</p>
          </div>
        </div>
        <span class="nexus-ui-task-card__status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
      </div>
      ${metadataHtml}
    `,
  });
}
