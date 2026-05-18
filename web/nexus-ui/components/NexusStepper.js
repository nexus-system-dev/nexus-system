function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderNexusStepper(steps = []) {
  return `
    <section class="nexus-ui-stepper" aria-label="Primary loop steps">
      ${steps
        .map(
          (step, index) => `
            <div class="nexus-ui-stepper__item" data-status="${escapeHtml(step.status || "inactive")}">
              <div class="nexus-ui-stepper__circle">${escapeHtml(step.glyph || String(index + 1))}</div>
              <span class="nexus-ui-stepper__label">${escapeHtml(step.label)}</span>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}
