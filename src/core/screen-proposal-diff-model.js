function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createScreenProposalDiffModel({
  renderableScreenComposition = null,
  designProposalPreviewState = null,
} = {}) {
  const baseline = normalizeObject(renderableScreenComposition);
  const preview = normalizeObject(designProposalPreviewState?.previewScreenViewModel);
  const baselineRegions = normalizeArray(baseline.regions);
  const previewRegions = normalizeArray(preview.regions);

  const changedRegions = previewRegions.map((region) => {
    const baselineRegion = baselineRegions.find((item) => item?.slot === region?.slot) ?? null;
    return {
      slot: region?.slot ?? null,
      baselineComponent: baselineRegion?.component ?? null,
      proposedComponent: region?.component ?? null,
      changed: baselineRegion?.component !== region?.component || baselineRegion?.order !== region?.order,
    };
  });

  return {
    screenProposalDiff: {
      diffId: `screen-proposal-diff:${baseline.compositionId ?? preview.compositionId ?? "unknown"}`,
      baselineCompositionId: baseline.compositionId ?? null,
      previewCompositionId: preview.compositionId ?? null,
      changedRegions,
      summary: {
        baselineRegionCount: baselineRegions.length,
        proposedRegionCount: previewRegions.length,
        changedRegionCount: changedRegions.filter((region) => region.changed).length,
      },
    },
  };
}
