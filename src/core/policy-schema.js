function normalizePolicyDefinitions(policyDefinitions) {
  if (Array.isArray(policyDefinitions)) {
    return policyDefinitions.filter((definition) => definition && typeof definition === "object");
  }

  if (policyDefinitions && typeof policyDefinitions === "object") {
    return [policyDefinitions];
  }

  return [];
}

function groupPolicies(definitions, kind) {
  return definitions.filter((definition) => definition.kind === kind);
}

export function definePolicySchema({
  policyDefinitions,
} = {}) {
  const definitions = normalizePolicyDefinitions(policyDefinitions);
  const executionPolicies = groupPolicies(definitions, "execution");
  const approvalPolicies = groupPolicies(definitions, "approval");
  const credentialPolicies = groupPolicies(definitions, "credential");
  const deployPolicies = groupPolicies(definitions, "deploy");

  return {
    policySchema: {
      policySchemaId: "policy-schema:nexus",
      version: "1.0.0",
      policyDefinitions: definitions,
      execution: {
        policies: executionPolicies,
        allowedActions: executionPolicies.flatMap((policy) => policy.allowedActions ?? []).filter(Boolean),
      },
      approvals: {
        policies: approvalPolicies,
        approvalTypes: approvalPolicies.flatMap((policy) => policy.approvalTypes ?? []).filter(Boolean),
      },
      credentials: {
        policies: credentialPolicies,
        protectedFlows: credentialPolicies.flatMap((policy) => policy.protectedFlows ?? []).filter(Boolean),
      },
      deploy: {
        policies: deployPolicies,
        guardedTargets: deployPolicies.flatMap((policy) => policy.guardedTargets ?? []).filter(Boolean),
      },
      summary: {
        totalPolicies: definitions.length,
        hasExecutionPolicies: executionPolicies.length > 0,
        hasApprovalPolicies: approvalPolicies.length > 0,
        hasCredentialPolicies: credentialPolicies.length > 0,
        hasDeployPolicies: deployPolicies.length > 0,
      },
    },
  };
}
