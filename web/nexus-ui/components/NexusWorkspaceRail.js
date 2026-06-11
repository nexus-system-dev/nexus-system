import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";
import { shellToEngineIntegrationContract } from "../contracts/shell-to-engine-integration-contract.js";

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${escapeAttribute(key)}="${escapeAttribute(value === true ? "" : value)}"`)
    .join(" ");
}

export const NEXUS_WORKSPACE_RAIL_SECTIONS = [
  [
    { title: "יצירה", target: "create", icon: "＋" },
    { title: "בנייה", target: "loop", icon: "▦" },
    { title: "שחרור", target: "release", icon: "✓" },
    { title: "שיתוף", target: "share", icon: "⇄" },
    { title: "צמיחה", target: "growth", icon: "↗" },
    { title: "Studio", target: "studio", icon: "◇" },
    { title: "היסטוריה", target: "timeline", icon: "◷" },
  ],
  [
    { title: "בית", target: "home", icon: "⌂" },
    { title: "קבצים", target: "files", icon: "⌘" },
  ],
  [
    { title: "הגדרות", target: "settings", icon: "⚙" },
    { title: "עזרה", target: "help", icon: "?" },
  ],
];

export function normalizeNexusWorkspaceRailRoute(route = "loop") {
  const normalized = String(route ?? "loop")
    .trim()
    .replace(/^\//, "");
  const aliases = {
    "": "create",
    build: "loop",
    brain: "project-brain",
    "project-brain": "files",
    developer: "files",
  };
  const candidate = aliases[normalized] ?? normalized;
  const targets = new Set(NEXUS_WORKSPACE_RAIL_SECTIONS.flat().map((item) => item.target));
  return targets.has(candidate) ? candidate : "create";
}

function renderRailButton(item, currentRoute) {
  const normalizedCurrentRoute = normalizeNexusWorkspaceRailRoute(currentRoute);
  const isCurrent = item.target === normalizedCurrentRoute;
  return `
    <button
      class="nexus-workspace-rail__button"
      type="button"
      data-nexus-ui-target="${escapeAttribute(item.target)}"
      aria-label="${escapeAttribute(item.title)}"
      title="${escapeAttribute(item.title)}"
      ${isCurrent ? 'aria-current="page"' : ""}
    >${escapeVisibleShellCopy(item.icon)}</button>
  `;
}

export function renderNexusWorkspaceRail({
  currentRoute = "loop",
  className = "",
  attributes = {},
} = {}) {
  const normalizedCurrentRoute = normalizeNexusWorkspaceRailRoute(currentRoute);
  const classes = [
    "nexus-loop-build-workspace__nav",
    "nexus-workspace-rail",
    className,
  ].filter(Boolean).join(" ");
  const renderedAttributes = renderAttributes({
    "data-nexus-workspace-rail": "canonical-right-rail",
    "data-nexus-rail-active-route": normalizedCurrentRoute,
    "data-shell-engine-integration-contract": shellToEngineIntegrationContract.contractId,
    "data-shell-engine-bridge-mode": shellToEngineIntegrationContract.bridgeMode,
    "data-shell-engine-truth-owner": shellToEngineIntegrationContract.truthOwner,
    "data-shell-agent-reality-rule": shellToEngineIntegrationContract.agentRealityRule,
    ...attributes,
  });

  return `
    <nav class="${escapeAttribute(classes)}" ${renderedAttributes} aria-label="ניווט Nexus">
      <div class="nexus-loop-build-workspace__nav-mark nexus-workspace-rail__mark">N</div>
      ${NEXUS_WORKSPACE_RAIL_SECTIONS.map((section, index) => `
        <div class="nexus-workspace-rail__section nexus-workspace-rail__section--${index + 1}">
          ${section.map((item) => renderRailButton(item, normalizedCurrentRoute)).join("")}
        </div>
      `).join("")}
    </nav>
  `;
}
