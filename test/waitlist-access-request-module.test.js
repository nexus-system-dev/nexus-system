import test from "node:test";
import assert from "node:assert/strict";

import { createWaitlistAndAccessRequestModule } from "../src/core/waitlist-access-request-module.js";

test("waitlist and access request module captures visitor access intent from conversion flow", () => {
  const { waitlistRecord, accessRequest } = createWaitlistAndAccessRequestModule({
    visitorInput: {
      email: "visitor@example.com",
    },
    websiteConversionFlow: {
      status: "ready",
      entryRoute: "signup",
    },
  });

  assert.equal(waitlistRecord.status, "captured");
  assert.equal(accessRequest.status, "submitted");
  assert.equal(accessRequest.email, "visitor@example.com");
});
