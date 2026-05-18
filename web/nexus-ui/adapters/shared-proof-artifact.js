function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function looksLikeInternalIdentifier(value = "") {
  const text = escapeText(value, "");
  return text.includes(":") || text.includes(".preview") || text.startsWith("generated-");
}

export function formatArtifactStatus(status) {
  const normalizedStatus = escapeText(status, "").toLowerCase();
  if (normalizedStatus === "needs-attention") {
    return "מוכן לסבב שיפור ואישור";
  }
  if (normalizedStatus === "proven" || normalizedStatus === "ready") {
    return "מוכן להצגה";
  }
  if (normalizedStatus === "blocked") {
    return "מחכה להחלטה";
  }
  return escapeText(status, "מוכן להצגה");
}

export function resolveCanonicalArtifact(project) {
  const safeProject = normalizeObject(project);
  const artifact = normalizeObject(safeProject.proofArtifact);
  if (artifact.artifactId) {
    const payload = normalizeObject(artifact.previewPayload);
    const kind = escapeText(payload.kind, artifact.previewKind);
    const isDownloadableProductSurface = kind === "followup-dashboard" || kind === "internal-ops-dashboard" || kind === "commerce-ops-dashboard" || kind === "landing-page" || kind === "mobile-app";
    return {
      ...artifact,
      actions: {
        ...normalizeObject(artifact.actions),
        open: {
          ...normalizeObject(artifact.actions?.open),
          label: "פתח את התוצר",
          supported: artifact.actions?.open?.supported === true || Boolean(kind),
        },
        download: {
          ...normalizeObject(artifact.actions?.download),
          label: isDownloadableProductSurface ? "הורד את התוצר" : "הורד קבצים",
          supported: artifact.actions?.download?.supported === true || isDownloadableProductSurface,
        },
      },
    };
  }

  return {
    artifactId: "fallback-proof-artifact",
    artifactType: "generated-surface",
    title: "תצוגת תוצר",
    status: "ready",
    previewKind: "generated-surface",
    previewPayload: {
      kind: "generated-surface",
      title: "תצוגת תוצר",
      subtitle: "התוצר עדיין מוצג דרך שכבת מעבר עד שהארטיפקט הקנוני המלא נטען.",
      statusLine: "תצוגת מעבר זמנית",
      regions: [],
      ctas: [],
      proofMeta: {
        previewable: false,
        regionCount: 0,
      },
    },
    actions: {
      open: { supported: false, label: "פתח את התוצר" },
      download: { supported: false, label: "הורד את התוצר" },
    },
    provenance: {},
  };
}

function buildArtifactTypeLabel(artifact) {
  if (artifact.artifactType === "followup-dashboard") {
    return "לוח מעקב חי";
  }
  if (artifact.artifactType === "internal-ops-dashboard") {
    return "לוח עבודה פנימי חי";
  }
  if (artifact.artifactType === "commerce-ops-dashboard") {
    return "מרכז מסחר ותפעול חי";
  }
  if (artifact.artifactType === "landing-page") {
    return "דף נחיתה חי";
  }
  if (artifact.artifactType === "mobile-app") {
    return "זרימת מובייל חיה";
  }
  if (artifact.previewKind === "generated-surface" || artifact.artifactType === "generated-surface") {
    return "תצוגת מוצר קנונית";
  }
  return escapeText(artifact.artifactType, "תוצר קנוני");
}

export function buildArtifactTruthViewModel(project) {
  const artifact = resolveCanonicalArtifact(project);
  const payload = normalizeObject(artifact.previewPayload);
  const provenance = normalizeObject(artifact.provenance);
  const proofMeta = normalizeObject(payload.proofMeta);
  const regions = normalizeArray(payload.regions);

  const summaryItems = [
    buildArtifactTypeLabel(artifact),
    payload.audience
      ? `מיועד עבור ${payload.audience}`
      : provenance.screenId && !looksLikeInternalIdentifier(provenance.screenId)
        ? `תצוגה: ${provenance.screenId}`
        : null,
    proofMeta.previewable === true ? "מסלול תצוגה קיים וחי" : "אין תצוגה חיצונית קנונית נוספת",
    payload.kind === "internal-ops-dashboard" || payload.kind === "commerce-ops-dashboard"
      ? `עמודות עבודה: ${normalizeArray(payload.queueColumns).length}`
      : payload.kind === "followup-dashboard"
        ? `לקוחות במעקב: ${escapeText(payload.stats?.[0]?.value, String(normalizeArray(payload.clients).length || 0))}`
      : payload.kind === "mobile-app"
        ? `מסכים גלויים: ${normalizeArray(payload.screens).length}`
      : artifact.previewKind === "generated-surface" || artifact.artifactType === "generated-surface"
        ? "התצוגה כבר מחזיקה את חלקי הליבה של המוצר"
        : typeof proofMeta.regionCount === "number" ? `חלקים גלויים: ${proofMeta.regionCount}` : null,
  ].filter(Boolean);

  return {
    artifact,
    title: escapeText(payload.title, artifact.title),
    subtitle: escapeText(
      payload.subtitle,
      "זה התוצר הקנוני שנשמר מהלופ ונמשך דרך מסכי ההמשך.",
    ),
    statusLine: escapeText(payload.statusLine, formatArtifactStatus(artifact.status)),
    artifactTypeLabel: buildArtifactTypeLabel(artifact),
    summaryItems,
    proofId: escapeText(provenance.proofId, artifact.artifactId),
    screenId: escapeText(provenance.screenId, ""),
    visibleRegionCount: typeof proofMeta.regionCount === "number" ? proofMeta.regionCount : regions.length,
    displayStatus: formatArtifactStatus(artifact.status),
    openAction: {
      label: artifact.actions?.open?.label ?? "פתח artifact",
      supported: artifact.actions?.open?.supported === true,
      target: artifact.actions?.open?.routeKey ?? "artifact",
    },
  };
}
