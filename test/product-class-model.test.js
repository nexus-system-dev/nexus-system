import test from "node:test";
import assert from "node:assert/strict";

import {
  detectCanonicalProductClass,
  normalizeCanonicalProductClass,
  resolveCanonicalProductClass,
  resolveCanonicalProductClassProfile,
} from "../web/shared/product-class-model.js";

test("normalizeCanonicalProductClass resolves canonical aliases", () => {
  assert.equal(normalizeCanonicalProductClass("marketing-site"), "landing-page");
  assert.equal(normalizeCanonicalProductClass("small-saas"), "saas");
  assert.equal(normalizeCanonicalProductClass("workspace"), "internal-tool");
  assert.equal(normalizeCanonicalProductClass("unknown"), "unknown");
});

test("detectCanonicalProductClass recognizes wave 4 core classes from free text", () => {
  assert.equal(
    detectCanonicalProductClass("Build a marketing site with a strong CTA and trust sections."),
    "landing-page",
  );
  assert.equal(
    detectCanonicalProductClass("Need an internal queue workspace for ops handoff."),
    "internal-tool",
  );
  assert.equal(
    detectCanonicalProductClass("Create a React Native mobile app with onboarding screens."),
    "mobile-app",
  );
});

test("resolveCanonicalProductClass prefers explicit or hinted class before detection", () => {
  assert.deepEqual(
    resolveCanonicalProductClass({
      explicitClass: "commerce-ops",
      texts: ["Build a landing page"],
    }),
    {
      productClass: "commerce-ops",
      source: "explicit",
    },
  );

  assert.deepEqual(
    resolveCanonicalProductClass({
      hintedClass: "mobile-app",
      texts: ["Build a dashboard"],
    }),
    {
      productClass: "mobile-app",
      source: "hint",
    },
  );
});

test("resolveCanonicalProductClassProfile exposes downstream wave 4 execution families", () => {
  const profile = resolveCanonicalProductClassProfile("landing-page");

  assert.equal(profile.previewFamily, "web-preview");
  assert.equal(profile.runtimeFamily, "web-static");
  assert.equal(profile.releasePathFamily, "web-deployment");
  assert.equal(profile.bootstrapFamily, "landing-page-skeleton");
});
