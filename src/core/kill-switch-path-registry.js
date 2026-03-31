const INCIDENT_PATH_REGISTRY = {
  "connector-outage": ["provider-execution"],
  "queue-stall": ["agent-runtime"],
  "execution-failure": ["risky-capabilities"],
};

const COMPONENT_PATH_REGISTRY = {
  connector: ["provider-execution"],
  provider: ["provider-execution"],
  queue: ["agent-runtime"],
  worker: ["agent-runtime"],
  runtime: ["agent-runtime"],
  execution: ["risky-capabilities"],
};

const FEATURE_FLAG_KILL_SWITCH_REGISTRY = {
  "emergency-execution-stop": ["agent-runtime", "provider-execution", "risky-capabilities"],
};

function mapAffectedComponents(affectedComponents = []) {
  const killedPaths = new Set();
  for (const component of affectedComponents) {
    const normalized = String(component ?? "").toLowerCase();
    for (const [token, paths] of Object.entries(COMPONENT_PATH_REGISTRY)) {
      if (normalized.includes(token)) {
        for (const path of paths) {
          killedPaths.add(path);
        }
      }
    }
  }
  return [...killedPaths];
}

export function createKillSwitchPathRegistry() {
  return {
    incidentPathRegistry: INCIDENT_PATH_REGISTRY,
    componentPathRegistry: COMPONENT_PATH_REGISTRY,
    featureFlagKillSwitchRegistry: FEATURE_FLAG_KILL_SWITCH_REGISTRY,
    mapAffectedComponents,
  };
}
