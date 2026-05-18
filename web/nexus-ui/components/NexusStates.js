import { renderNexusButton } from "./NexusButton.js";
import { renderNexusCard } from "./NexusCard.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderNexusState({
  variant = "empty",
  icon = "•",
  title = "",
  description = "",
  action = null,
} = {}) {
  const actionHtml = action
    ? renderNexusButton({
        label: action.label,
        variant: action.variant || "primary",
        attrs: action.attrs || {},
      })
    : "";

  return renderNexusCard({
    className: "nexus-ui-state",
    padding: "lg",
    content: `
      <div class="nexus-ui-state" data-variant="${escapeHtml(variant)}">
        <div class="nexus-ui-state__icon">${escapeHtml(icon)}</div>
        ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        ${actionHtml}
      </div>
    `,
  });
}
