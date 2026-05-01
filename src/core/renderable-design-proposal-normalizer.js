function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createRenderableDesignProposalNormalizer({
  aiDesignProposal = null,
  renderableScreenModel = null,
  screenComponentMapping = null,
} = {}) {
  const normalizedProposal = normalizeObject(aiDesignProposal);
  const normalizedScreenModel = normalizeObject(renderableScreenModel);
  const normalizedComponentMapping = normalizeObject(screenComponentMapping);
  const mappedRegions = normalizeArray(normalizedProposal.regions).map((region, index) => {
    const slot = normalizeString(region?.slot, "content");
    const mapping = normalizeArray(normalizedComponentMapping.regions).find((entry) => entry?.slot === slot) ?? null;
    return {
      regionId: normalizeString(region?.regionId, `proposal-region-${index + 1}`),
      slot,
      component: normalizeString(mapping?.componentType, region?.componentIntent ?? "panel"),
      order: index + 1,
      isVisible: true,
      isApproved: false,
      constraints: normalizeObject(region?.constraints),
      label: normalizeString(region?.label, slot),
    };
  });

  return {
    renderableDesignProposal: {
      proposalId: normalizeString(normalizedProposal.proposalId),
      screenId: normalizeString(normalizedProposal.screenId, normalizedScreenModel.screenId ?? null),
      compositionId: `renderable-design-proposal:${normalizeString(normalizedProposal.proposalId, "unknown")}`,
      currentPhase: "generated",
      activeVariantKey: normalizeString(normalizedScreenModel.activeVariantKey, "default"),
      layoutType: normalizeString(normalizedScreenModel.layoutType, "single-column"),
      sectionRhythm: normalizeString(normalizedScreenModel.sectionRhythm, "comfortable"),
      regions: mappedRegions,
      ctaAnchors: normalizeArray(normalizedProposal.interactions).map((interaction, index) => ({
        ctaId: normalizeString(interaction?.ctaId, `proposal-cta-${index + 1}`),
        label: normalizeString(interaction?.label, "Action"),
        anchor: normalizeString(interaction?.anchor, "primary"),
        actionIntent: normalizeString(interaction?.actionIntent, "review"),
        isVisible: true,
      })),
      meta: {
        isRenderable: mappedRegions.length > 0,
        regionCount: mappedRegions.length,
        sourceProposalId: normalizeString(normalizedProposal.proposalId),
      },
    },
  };
}
