import test from "node:test";
import assert from "node:assert/strict";

import { createVersioningService } from "../src/core/versioning-service.js";

test("versioning service increments patch by default", () => {
  const result = createVersioningService({
    currentVersion: "1.2.3",
  });

  assert.equal(result.nextVersion, "1.2.4");
  assert.equal(result.releaseTag, "v1.2.4");
});

test("versioning service increments minor policy", () => {
  const result = createVersioningService({
    releasePolicy: "minor",
    currentVersion: "1.2.3",
  });

  assert.equal(result.nextVersion, "1.3.0");
  assert.equal(result.releaseTag, "v1.3.0");
});
