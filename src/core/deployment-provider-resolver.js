import { createHostingProviderAdapterContract } from "./hosting-provider-adapter-contract.js";

function resolveProviderConfig(deploymentRequest = null) {
  return {
    provider: deploymentRequest?.provider ?? "generic",
    target: deploymentRequest?.target ?? "private-deployment",
    region: deploymentRequest?.region ?? null,
  };
}

export function createDeploymentProviderResolver({
  deploymentRequest = null,
} = {}) {
  const { hostingAdapter } = createHostingProviderAdapterContract({
    providerConfig: resolveProviderConfig(deploymentRequest),
  });

  return {
    providerAdapter: {
      provider: hostingAdapter.provider,
      target: hostingAdapter.target,
      capabilities: hostingAdapter.capabilities,
      executionModes: hostingAdapter.executionModes,
      environments: hostingAdapter.environments,
      providerCapabilityMatrix: hostingAdapter.providerCapabilityMatrix,
      requestMetadata: {
        requestId: deploymentRequest?.requestId ?? null,
        environment: deploymentRequest?.environment ?? null,
        artifactCount: deploymentRequest?.deploymentMetadata?.artifactCount ?? 0,
      },
    },
  };
}
