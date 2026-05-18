const PADDING_CLASS_MAP = {
  none: "",
  sm: "nexus-ui-card--padding-sm",
  md: "nexus-ui-card--padding-md",
  lg: "nexus-ui-card--padding-lg",
  xl: "nexus-ui-card--padding-xl",
};

export function getNexusCardClassName({ padding = "lg", hover = false, className = "" } = {}) {
  return [
    "nexus-ui-card",
    PADDING_CLASS_MAP[padding] || "",
    hover ? "nexus-ui-card--hoverable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function renderNexusCard({ content = "", padding = "lg", hover = false, className = "" } = {}) {
  return `<section class="${getNexusCardClassName({ padding, hover, className })}">${content}</section>`;
}
