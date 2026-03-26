import { SourceAdapter } from "./source-adapter.js";

function joinDefined(values) {
  return values.filter(Boolean).join(", ");
}

export class CasinoSourceAdapter extends SourceAdapter {
  constructor() {
    super({ type: "casino-api" });
  }

  normalize({ snapshot, existingGoal }) {
    const { health, features, flows, technical, roadmapContext } = snapshot;
    const flowEntries = Object.entries(flows).filter(([key]) =>
      !["apiVersion", "schemaVersion", "generatedAt"].includes(key),
    );

    const blockedFlows = flowEntries
      .filter(([, value]) => value?.status === "blocked" || value?.status === "partial")
      .map(([name, value]) => `${name}: ${value.notes}`);

    return {
      name: health.projectName ?? "Casino Project",
      goal: roadmapContext.mainGoal ?? existingGoal,
      status: health.status === "ok" ? "active" : "blocked",
      stack: joinDefined([
        technical.stack?.backend,
        technical.stack?.frontend,
        technical.stack?.database,
      ]),
      state: {
        businessGoal: roadmapContext.mainGoal ?? existingGoal,
        product: {
          hasAuth: Boolean(features.hasAuth),
          hasStagingEnvironment: false,
          hasLandingPage: false,
          hasPaymentIntegration: Boolean(features.hasPayments),
        },
        analytics: {
          hasBaselineCampaign: Boolean(features.hasAnalytics),
        },
        knowledge: {
          knownGaps: [
            ...(roadmapContext.knownMissingParts ?? []),
            ...(technical.knownTechnicalGaps ?? []),
            ...(health.blockingIssues ?? []),
          ],
        },
        stack: {
          frontend: technical.stack?.frontend ?? "לא זוהה",
          backend: technical.stack?.backend ?? "לא זוהה",
          database: technical.stack?.database ?? "לא זוהה",
        },
      },
      approvals: (roadmapContext.criticalDependencies ?? []).map(
        (dependency) => `נדרש אישור או פתרון עבור: ${dependency}`,
      ),
      externalSnapshot: {
        source: "casino-api",
        confidence: 0.9,
        syncedAt: new Date().toISOString(),
        health,
        features,
        flows,
        technical,
        roadmapContext,
        blockedFlows,
      },
    };
  }
}
