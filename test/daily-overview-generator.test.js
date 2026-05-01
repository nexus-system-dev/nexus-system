import test from "node:test";
import assert from "node:assert/strict";
import { createDailyOverviewGenerator } from "../src/core/daily-overview-generator.js";

test("daily overview generator summarizes open issues and decisions", () => {
  const { dailyOwnerOverview } = createDailyOverviewGenerator({
    ownerControlCenter: {
      ownerControlCenterId: "center-1",
      status: "ready",
      recommendedActionCount: 4,
      maintenanceStatus: "ready",
      requiresMaintenanceReview: true,
    },
    platformLogs: [{}, {}],
    incidentAlert: { summary: "Queue is degraded" },
    maintenanceBacklog: {
      status: "ready",
      items: [{}, {}, {}],
    },
  });
  assert.equal(dailyOwnerOverview.status, "ready");
  assert.equal(dailyOwnerOverview.openIssues, 3);
  assert.equal(dailyOwnerOverview.overviewHeadline, "Maintenance backlog requires attention (3)");
  assert.equal(dailyOwnerOverview.maintenanceTaskCount, 3);
  assert.equal(dailyOwnerOverview.requiresMaintenanceReview, true);
});
