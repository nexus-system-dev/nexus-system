import test from "node:test";
import assert from "node:assert/strict";

import { createLandingPageInformationArchitecture } from "../src/core/landing-page-information-architecture.js";

test("landing page information architecture builds canonical sections from website schema and messaging", () => {
  const { landingPageIa } = createLandingPageInformationArchitecture({
    nexusWebsiteSchema: {
      nexusWebsiteSchemaId: "website-schema:operators",
      status: "ready",
      pages: [
        {
          pageId: "page:home",
          primaryCta: {
            ctaId: "cta:request-access",
            label: "Request access",
          },
        },
      ],
    },
    messagingFramework: {
      status: "ready",
      headline: "Nexus executes scoped work with governed multi-agent flows",
    },
  });

  assert.equal(landingPageIa.status, "ready");
  assert.equal(landingPageIa.sections.length, 5);
  assert.equal(landingPageIa.sections[0].sectionId, "section:hero");
  assert.equal(landingPageIa.sections[4].ctaAnchor, "cta:request-access");
});

test("landing page information architecture exposes missing-inputs when website schema is absent", () => {
  const { landingPageIa } = createLandingPageInformationArchitecture({
    messagingFramework: {
      status: "ready",
      headline: "Nexus executes scoped work with governed multi-agent flows",
    },
  });

  assert.equal(landingPageIa.status, "missing-inputs");
  assert.deepEqual(landingPageIa.missingInputs, ["nexusWebsiteSchema"]);
  assert.deepEqual(landingPageIa.sections, []);
});
