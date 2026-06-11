import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

const SIZE_CLASS_MAP = {
  sm: "nexus-ui-button--sm",
  md: "",
  lg: "nexus-ui-button--lg",
};

export function getNexusButtonClassName({ variant = "primary", size = "md", className = "" } = {}) {
  return [
    "nexus-ui-button",
    `nexus-ui-button--${variant}`,
    SIZE_CLASS_MAP[size] || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function renderNexusButton({
  label,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  attrs = {},
} = {}) {
  const extraAttrs = Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value).replaceAll('"', "&quot;")}"`)
    .join(" ");

  return `
    <button
      type="${type}"
      class="${getNexusButtonClassName({ variant, size, className })}"
      ${disabled ? "disabled" : ""}
      ${extraAttrs}
    >${escapeVisibleShellCopy(label ?? "")}</button>
  `;
}
