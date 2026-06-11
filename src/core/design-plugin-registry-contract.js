export {
  DESIGN_PLUGIN_REGISTRY_TASK_ID,
  BUILT_IN_DESIGN_PLUGINS_TASK_ID,
  USER_DESIGN_PREFERENCE_TASK_ID,
  DESIGN_PLUGIN_REQUIRED_OUTPUT_SCHEMA,
  createDesignPluginRegistryContract,
  getBuiltInDesignPluginDefinitions,
  normalizeUserDesignSourceInput,
  resolveDesignPluginForVisualSkeletonRequest,
  assertDesignPluginSelectionPreservesProductTruth,
} from "../../web/shared/design-plugin-registry-contract.js";
