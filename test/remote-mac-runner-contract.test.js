import test from "node:test";
import assert from "node:assert/strict";

import { createRemoteMacRunnerContract } from "../src/core/remote-mac-runner-contract.js";

test("remote mac runner contract returns canonical apple execution contract", () => {
  const { remoteMacRunner } = createRemoteMacRunnerContract({
    executionTopology: {
      topologyId: "execution-topology:mobile-app",
      projectId: "mobile-app",
      topologies: [
        {
          mode: "xcode",
          topologyType: "remote-specialized",
          runnerType: "remote-xcode-runner",
          readiness: "ready",
          capabilities: ["apple-build", "mobile-signing"],
        },
      ],
    },
    appleBuildConfig: {
      host: "mac-builder-01",
      platform: "ios",
      xcodeVersion: "15.4",
      bundleId: "com.nexus.app",
      scheme: "NexusApp",
      signing: {
        teamId: "TEAM123",
        signingStyle: "automatic",
        provisioningProfile: "NexusProfile",
        requiresManualApproval: true,
      },
      archive: {
        exportMethod: "app-store",
        artifactPath: "artifacts/ios/app.ipa",
        shouldArchive: true,
      },
    },
  });

  assert.equal(remoteMacRunner.runnerId, "remote-mac-runner:mobile-app");
  assert.equal(remoteMacRunner.connection.mode, "xcode");
  assert.equal(remoteMacRunner.appleTooling.bundleId, "com.nexus.app");
  assert.equal(remoteMacRunner.signing.teamId, "TEAM123");
  assert.equal(remoteMacRunner.archive.exportMethod, "app-store");
  assert.equal(remoteMacRunner.summary.isReady, true);
});

test("remote mac runner contract falls back to canonical empty state", () => {
  const { remoteMacRunner } = createRemoteMacRunnerContract();

  assert.equal(remoteMacRunner.runnerId, "remote-mac-runner:unknown-project");
  assert.equal(remoteMacRunner.connection.mode, "xcode");
  assert.equal(remoteMacRunner.capabilities.supportsAppleTooling, true);
  assert.equal(remoteMacRunner.summary.isReady, false);
});
