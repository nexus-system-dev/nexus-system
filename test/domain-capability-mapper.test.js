import test from "node:test";
import assert from "node:assert/strict";

import { mapDomainCapabilities } from "../src/core/domain-capability-mapper.js";

test("domain capability mapper returns context fields task types and execution modes for mobile app", () => {
  const mapped = mapDomainCapabilities("mobile-app");

  assert.equal(mapped.domainCapabilities.domain, "mobile-app");
  assert.equal(mapped.domainCapabilities.releaseTargets.includes("app-store"), true);
  assert.equal(mapped.domainCapabilities.taskTypes.includes("mobile"), true);
  assert.equal(mapped.requiredContextFields.includes("navigation"), true);
  assert.equal(mapped.executionModes.includes("xcode"), true);
});

test("domain capability mapper falls back to generic for unknown domain", () => {
  const mapped = mapDomainCapabilities("unknown-domain");

  assert.equal(mapped.domainCapabilities.domain, "generic");
  assert.deepEqual(mapped.requiredContextFields, ["vision", "goal", "scope"]);
  assert.deepEqual(mapped.executionModes, ["agent"]);
});
