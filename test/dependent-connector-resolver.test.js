import test from "node:test";
import assert from "node:assert/strict";

import { createDependentConnectorResolver } from "../src/core/dependent-connector-resolver.js";

test("dependent connector resolver finds all linked accounts using a credential reference", () => {
  const { affectedConnectors } = createDependentConnectorResolver({
    project: {
      linkedAccounts: [
        {
          accountRecord: { accountId: "account-1", provider: "hosting", accountType: "hosting", credentialReference: "credref_old" },
          credentialReference: "credref_old",
        },
        {
          accountRecord: { accountId: "account-2", provider: "hosting", accountType: "hosting", credentialReference: "credref_old" },
          credentialReference: "credref_old",
        },
      ],
    },
    credentialReference: "credref_old",
  });

  assert.equal(affectedConnectors.length, 2);
  assert.equal(affectedConnectors[0].accountId, "account-1");
  assert.equal(affectedConnectors[1].accountId, "account-2");
});
