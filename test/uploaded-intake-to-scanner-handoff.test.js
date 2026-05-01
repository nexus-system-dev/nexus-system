import test from "node:test";
import assert from "node:assert/strict";

import { createUploadedIntakeToScannerHandoff } from "../src/core/uploaded-intake-to-scanner-handoff.js";

test("uploaded intake to scanner handoff materializes intake files and links into scanner-readable evidence", () => {
  const result = createUploadedIntakeToScannerHandoff({
    projectId: "imported-growth-app",
    projectIntake: {
      projectName: "Imported Growth App",
      projectType: "saas",
      visionText: "אפליקציה עם signup, billing ו-growth funnel",
      requestedDeliverables: ["auth", "payments", "growth"],
      uploadedFiles: [
        {
          name: "README.md",
          type: "markdown",
          content: "# Imported App\n\nTODO: onboarding flow\n",
        },
        {
          name: "docs/spec.md",
          type: "markdown",
          content: "# Spec\n\nmissing: analytics import\n",
        },
      ],
      externalLinks: ["https://github.com/example/imported-growth-app"],
    },
  });

  assert.equal(result.status, "ready");
  assert.equal(typeof result.scanRoot, "string");
  assert.equal(result.scan.exists, true);
  assert.equal(result.scan.knowledge.readme.path, "README.md");
  assert.equal(result.scan.knowledge.docs.some((doc) => doc.path === "docs/spec.md"), true);
  assert.equal(result.scan.knowledge.knownMissingParts.includes("onboarding flow"), true);
  assert.equal(result.scan.knowledge.knownMissingParts.includes("analytics import"), true);
  assert.equal(result.scan.knowledge.summary.includes("Docs:"), true);
});
