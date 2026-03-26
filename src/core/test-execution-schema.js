const DEFAULT_TEST_TYPES = ["unit", "integration", "smoke", "sanity"];

function normalizeTestTypes(testTypes = []) {
  if (!Array.isArray(testTypes) || testTypes.length === 0) {
    return DEFAULT_TEST_TYPES;
  }

  return [...new Set(testTypes.filter(Boolean))];
}

function inferReleaseStage(buildTarget, testConfig) {
  if (typeof testConfig?.releaseStage === "string" && testConfig.releaseStage) {
    return testConfig.releaseStage;
  }

  if (typeof buildTarget === "string" && buildTarget.includes("deploy")) {
    return "pre-deploy";
  }

  return "build-validation";
}

function inferRunner(buildTarget) {
  if (typeof buildTarget !== "string") {
    return "generic-test-runner";
  }

  if (buildTarget.includes("mobile")) {
    return "mobile-test-runner";
  }

  if (buildTarget.includes("web") || buildTarget.includes("auth")) {
    return "web-test-runner";
  }

  return "generic-test-runner";
}

export function defineTestExecutionSchema({
  buildTarget = null,
  testConfig = null,
} = {}) {
  const normalizedBuildTarget = typeof buildTarget === "string" ? buildTarget : "unknown-build";
  const testTypes = normalizeTestTypes(testConfig?.testTypes);

  return {
    testExecutionRequest: {
      buildTarget: normalizedBuildTarget,
      releaseStage: inferReleaseStage(normalizedBuildTarget, testConfig),
      testTypes,
      runner: inferRunner(normalizedBuildTarget),
      coverageThreshold: typeof testConfig?.coverageThreshold === "number" ? testConfig.coverageThreshold : 0.8,
      retries: Number.isInteger(testConfig?.retries) ? testConfig.retries : 0,
      environment: typeof testConfig?.environment === "string" ? testConfig.environment : "ci",
      suites: testTypes.map((testType) => ({
        id: `${normalizedBuildTarget}-${testType}`,
        type: testType,
        required: testType !== "e2e",
      })),
    },
  };
}
