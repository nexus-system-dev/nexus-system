function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderNexusInput({
  id,
  label,
  placeholder = "",
  value = "",
  type = "text",
  required = false,
  helperText = "",
  multiline = false,
  rows = 4,
  className = "",
} = {}) {
  const control = multiline
    ? `<textarea id="${escapeHtml(id)}" class="nexus-ui-textarea ${className}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`
    : `<input id="${escapeHtml(id)}" class="nexus-ui-input ${className}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" />`;

  return `
    <label class="nexus-ui-field" for="${escapeHtml(id)}">
      ${
        label
          ? `<span class="nexus-ui-field__label">${escapeHtml(label)}${required ? '<span class="nexus-ui-field__required"> *</span>' : ""}</span>`
          : ""
      }
      ${control}
      ${helperText ? `<span class="nexus-ui-field__helper">${escapeHtml(helperText)}</span>` : ""}
    </label>
  `;
}
