import test from "node:test";
import assert from "node:assert/strict";

import { createFirstValueSummaryAssembler } from "../src/core/first-value-summary-assembler.js";

test("first value summary assembler combines project identity, first value, reality progress and explanation", () => {
  const { firstValueSummary } = createFirstValueSummaryAssembler({
    projectIdentityProfile: {
      projectId: "giftwallet",
      projectName: "GiftWallet",
      vision: "Ship the first working wallet flow",
    },
    firstValueOutput: {
      outputId: "first-value:giftwallet",
      preview: {
        headline: "Your starter app is ready",
        detail: "You already have a first app structure you can build on immediately.",
      },
      summary: {
        feelsReal: true,
      },
    },
    realityProgress: {
      signals: ["first-file-generated", "project-advanced"],
      userFacingMilestones: [
        "The first visible project files were generated",
      ],
      summary: {
        hasVisibleResult: true,
      },
    },
    explanationPayload: {
      nextAction: {
        summary: "Implement the next flow",
      },
      change: {
        summary: "Files were generated",
      },
    },
  });

  assert.equal(firstValueSummary.projectIdentity.projectName, "GiftWallet");
  assert.equal(firstValueSummary.summary.hasVisibleOutcome, true);
  assert.equal(firstValueSummary.summary.hasMomentum, true);
  assert.equal(firstValueSummary.reasonsToContinue.length >= 2, true);
  assert.match(firstValueSummary.message, /starter app is ready/i);
  assert.match(firstValueSummary.message, /first visible project files were generated/i);
  assert.doesNotMatch(firstValueSummary.message, /first visible artifact/i);
});

test("first value summary assembler falls back safely when project identity is missing", () => {
  const { firstValueSummary } = createFirstValueSummaryAssembler({
    firstValueOutput: {
      outputId: "first-value:unknown-project",
      summary: {
        feelsReal: false,
      },
    },
    realityProgress: {
      signals: [],
    },
  });

  assert.equal(typeof firstValueSummary.summaryId, "string");
  assert.equal(typeof firstValueSummary.projectIdentity.projectId, "string");
  assert.equal(firstValueSummary.summary.hasMomentum, false);
});
