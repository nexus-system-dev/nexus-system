import { renderProofArtifactSurface } from "../components/ProofArtifactSurface.js";
import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";
import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

function escapeHtml(value) {
  return escapeVisibleShellCopy(value);
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderAgentTranscript(viewModel) {
  const transcript = viewModel.agentConversation?.transcript?.length
    ? viewModel.agentConversation.transcript
    : [
        {
          speaker: "ai",
          text: viewModel.whatHappensNext,
        },
      ];

  return transcript.map((entry) => `
    <article class="nexus-build-agent-message" data-speaker="${escapeHtml(entry.speaker)}">
      <span class="nexus-build-agent-message__label">${entry.speaker === "user" ? "אתה" : "Nexus"}</span>
      <p>${escapeHtml(entry.text)}</p>
    </article>
  `).join("") + (viewModel.agentConversation?.pending ? `
    <article class="nexus-build-agent-message" data-speaker="ai" data-build-agent-loading="true" aria-live="polite">
      <span class="nexus-build-agent-message__label">Nexus</span>
      <p>אני בודק את הבקשה מול ההקשר של השלד...</p>
    </article>
  ` : "");
}

function renderBuildAgentTurnState(agentConversation = {}) {
  const turn = agentConversation?.buildAgentTurn;
  if (!turn?.taskId) {
    return "";
  }
  const routeCopyByIntent = {
    "product-truth-change": {
      label: "ממתין לאישור שינוי כיוון",
      helper: "השלד לא משתנה עד שיש אישור והשפעה ברורה.",
    },
    "verification-request": {
      label: "ממתין למסלול בדיקה",
      helper: "לא מוצגת הצלחת בדיקה עד שיש תוצאה אמיתית.",
    },
    "release-request": {
      label: "חסום לשחרור או פרסום",
      helper: "לא מתבצע פרסום, ספק, תשלום או חיבור חיצוני בלי אישור ומסלול מתאים.",
    },
    "provider-connection-request": {
      label: "חסום לחיבור ספק",
      helper: "לא מתבצע חיבור חיצוני בלי אישור ומסלול מתאים.",
    },
  };
  const routeCopy = routeCopyByIntent[turn.intent] ?? {
    label: "הבקשה האחרונה מנותבת אל",
    helper: turn.requiresApproval
      ? "צריך אישור לפני שינוי גלוי."
      : "אסור להציג שינוי עד שיש תוצאה גלויה.",
  };

  return `
    <section
      class="nexus-build-agent-rail__route"
      aria-label="ניתוב בקשת הסוכן"
      data-build-agent-turn-task="${escapeAttribute(turn.taskId)}"
      data-build-agent-turn-owner="${escapeAttribute(turn.owner)}"
      data-build-agent-turn-intent="${escapeAttribute(turn.intent)}"
      data-build-agent-turn-status="${escapeAttribute(turn.status)}"
      data-build-agent-turn-requires-approval="${turn.requiresApproval ? "true" : "false"}"
      data-build-agent-turn-may-claim-changed="${turn.mayClaimChanged ? "true" : "false"}"
      data-build-agent-turn-speech-boundary="${escapeAttribute(turn.speechBoundary)}"
      data-build-agent-turn-boundary-label="${escapeAttribute(routeCopy.label)}"
      data-build-agent-turn-selected-candidate-id="${escapeAttribute(turn.selectedSkeletonCandidateId)}"
      data-build-agent-turn-selected-composition-style="${escapeAttribute(turn.selectedCompositionStyle)}"
    >
      <span>${escapeHtml(routeCopy.label)}</span>
      <strong>${escapeHtml(turn.ownerLabel ?? "שיחת בנייה")}</strong>
      <p>${escapeHtml(turn.reason ?? "נדרש מסלול ברור לפני שמציגים שינוי במוצר.")}</p>
      <small>${escapeHtml(routeCopy.helper)}</small>
    </section>
  `;
}

function renderBuildSpeechTruthState(agentConversation = {}) {
  const speechTruth = agentConversation?.speechTruth;
  if (!speechTruth?.taskId) {
    return "";
  }
  const stateCopy = {
    applied: { label: "השינוי נשמר באמת הפרויקט", helper: "יש רישום שינוי אמיתי מאחורי התשובה." },
    "pending-approval": { label: "ממתין לאישור שלך", helper: "המוצר לא משתנה עד אישור." },
    "clarification-needed": { label: "צריך עוד פרט אחד", helper: "בלי הפרט הזה לא יבוצע שינוי אמיתי." },
    "unsupported-not-yet": { label: "עדיין לא נתמך כשינוי אוטומטי", helper: "הבקשה נשמרה כבקשה פתוחה, המוצר לא השתנה." },
    failed: { label: "השינוי לא עבר", helper: "המוצר נשאר כמו שהיה, אפשר לנסות ניסוח אחר." },
    routed: { label: "הבקשה במסלול ייעודי", helper: "לא תוצג תוצאה לפני שיש תוצאה אמיתית." },
    "answer-only": { label: "תשובה בלבד", helper: "ההודעה האחרונה לא שינתה את המוצר." },
  };
  const copy = stateCopy[speechTruth.speechState] ?? stateCopy["answer-only"];
  return `
    <section
      class="nexus-build-speech-truth"
      aria-label="מצב אמת של התשובה האחרונה"
      data-build-speech-truth-task="${escapeAttribute(speechTruth.taskId)}"
      data-build-speech-state="${escapeAttribute(speechTruth.speechState)}"
      data-build-speech-request-class="${escapeAttribute(speechTruth.requestClass)}"
      data-build-speech-reply-rewritten="${speechTruth.replyWasRewritten ? "true" : "false"}"
      data-build-speech-may-claim-changed="${speechTruth.mayClaimChanged ? "true" : "false"}"
      data-build-speech-applied-mutation-id="${escapeAttribute(speechTruth.appliedMutationId)}"
    >
      <strong>${escapeHtml(copy.label)}</strong>
      <small>${escapeHtml(copy.helper)}</small>
    </section>
  `;
}

function renderProviderGatewayBoundary(agentConversation = {}) {
  const providerGateway = agentConversation?.providerGateway;
  if (!providerGateway?.taskId) {
    return "";
  }
  const label = providerGateway.canExecuteExternally
    ? "יכולת חיצונית מוכנה לאישור סופי"
    : "יכולת חיצונית חסומה עד אישור";
  const helper = providerGateway.connected
    ? "החיבור לא נותן הרשאה אוטומטית לביצוע."
    : "נדרש חיבור מתאים, הרשאה מתאימה ואישור מפורש.";
  return `
    <section
      class="nexus-provider-gateway-boundary"
      aria-label="גבול ספקים חיצוניים"
      data-provider-gateway-task="${escapeAttribute(providerGateway.taskId)}"
      data-provider-gateway-status="${escapeAttribute(providerGateway.status)}"
      data-provider-gateway-request-class="${escapeAttribute(providerGateway.requestClass)}"
      data-provider-gateway-capability="${escapeAttribute(providerGateway.capability)}"
      data-provider-gateway-can-execute="${providerGateway.canExecuteExternally ? "true" : "false"}"
      data-provider-gateway-connected="${providerGateway.connected ? "true" : "false"}"
      data-provider-gateway-release-decision="${escapeAttribute(providerGateway.releaseDecision)}"
      data-provider-gateway-blocker-count="${escapeAttribute(String(providerGateway.blockerCount ?? 0))}"
    >
      <span>${escapeHtml(providerGateway.userFacingLabel || "יכולת חיצונית")}</span>
      <strong>${escapeHtml(label)}</strong>
      <p>${escapeHtml(providerGateway.boundaryCopy || "זו יכולת חיצונית ולא פעולה שבוצעה.")}</p>
      <small>${escapeHtml(helper)}</small>
    </section>
  `;
}

function renderTeamMembershipSurface(viewModel) {
  const team = viewModel.teamMembership;
  if (!team) {
    return "";
  }
  const members = Array.isArray(team.members) ? team.members : [];
  const invitations = Array.isArray(team.invitations) ? team.invitations : [];
  return `
    <section class="nexus-team-membership-surface" aria-label="צוות הפרויקט">
      <header>
        <div>
          <span>בעלות וגישה</span>
          <h3>${escapeHtml(team.title)}</h3>
          <p>${escapeHtml(team.subtitle)}</p>
        </div>
        <strong>${escapeHtml(team.memberCount)} חברים</strong>
      </header>
      <div class="nexus-team-membership-surface__grid">
        <article>
          <span>בעלים</span>
          <strong>${escapeHtml(team.ownerLabel)}</strong>
        </article>
        ${members.slice(0, 4).map((member) => `
          <article>
            <span>${escapeHtml(member.status)}</span>
            <strong>${escapeHtml(member.name)}</strong>
            <em>${escapeHtml(member.role)}</em>
          </article>
        `).join("")}
      </div>
      ${invitations.length ? `
        <div class="nexus-team-membership-surface__pending">
          ${invitations.slice(0, 3).map((invitation) => `
            <span>${escapeHtml(invitation.email)} · ${escapeHtml(invitation.role)} · ${escapeHtml(invitation.status)}</span>
          `).join("")}
        </div>
      ` : ""}
      <p>${escapeHtml(team.boundary)}</p>
    </section>
  `;
}

function renderMutationChangeDecision(decision = null) {
  if (!decision?.taskId) {
    return "";
  }
  const statusLabel = decision.requiresApproval
    ? "ממתין לאישור"
    : decision.status === "applied"
      ? "השינוי נשמר"
      : decision.status === "routed-to-visual-agent"
        ? "נשלח לעדכון חזותי"
        : "נבדק לפני שינוי";
  const boundary = decision.requiresApproval
    ? "נקסוס לא משנה אמת מוצר בלי אישור."
    : decision.requiresProductTruthMutation
      ? "השינוי עובר דרך אמת הפרויקט ונרשם להמשך."
      : "זה שינוי תצוגה או גבול, לא שינוי זהות מוצר.";

  return `
    <section
      class="nexus-build-agent-rail__route"
      aria-label="החלטת שינוי"
      data-mutation-change-task="${escapeAttribute(decision.taskId)}"
      data-mutation-change-status="${escapeAttribute(decision.status)}"
      data-mutation-change-type="${escapeAttribute(decision.changeType)}"
      data-mutation-change-requires-approval="${decision.requiresApproval ? "true" : "false"}"
      data-mutation-change-requires-product-truth="${decision.requiresProductTruthMutation ? "true" : "false"}"
      data-mutation-change-history-count="${escapeAttribute(decision.historyCount)}"
    >
      <span>${escapeHtml(statusLabel)}</span>
      <strong>${escapeHtml(decision.requiresApproval ? "דרוש אישור לפני שינוי" : "מסלול שינוי מסודר")}</strong>
      <p>${escapeHtml(decision.userReply || boundary)}</p>
      <small>${escapeHtml(boundary)}</small>
    </section>
  `;
}

function renderCanonicalMutationFlow(flow = null) {
  if (!flow?.taskId) {
    return "";
  }
  return `
    <section
      class="nexus-build-agent-rail__route nexus-build-agent-rail__route--flow"
      aria-label="זרימת שינוי"
      data-canonical-mutation-flow-task="${escapeAttribute(flow.taskId)}"
      data-canonical-mutation-flow-owner="${escapeAttribute(flow.ownerTaskId)}"
      data-canonical-mutation-flow-status="${escapeAttribute(flow.status)}"
      data-canonical-mutation-flow-requires-approval="${flow.requiresApproval ? "true" : "false"}"
      data-canonical-mutation-flow-requires-product-truth="${flow.requiresProductTruthMutation ? "true" : "false"}"
      data-canonical-mutation-flow-history-count="${escapeAttribute(flow.historyCount)}"
    >
      <span>זרימת שינוי</span>
      <strong>${escapeHtml(flow.userFacingSummary || "השינוי נבדק לפני ביצוע.")}</strong>
      <ol class="nexus-build-agent-rail__flow">
        ${(flow.steps ?? []).map((step) => `
          <li
            data-canonical-mutation-flow-step="${escapeAttribute(step.stepId)}"
            data-canonical-mutation-flow-step-status="${escapeAttribute(step.status)}"
          >
            <span>${escapeHtml(step.label)}</span>
            <small>${escapeHtml(step.description)}</small>
          </li>
        `).join("")}
      </ol>
      <small>${escapeHtml(flow.boundary || "אישור, שחזור ושחרור שייכים למשימות ההמשך.")}</small>
    </section>
  `;
}

function renderBuildApprovalFlow(approval = null) {
  if (!approval?.taskId) {
    return "";
  }
  const isPending = approval.decisionStatus === "pending";
  const statusLabel = isPending
    ? "ממתין להחלטה שלך"
    : approval.decisionStatus === "approved"
      ? "אושר והוחל"
      : approval.decisionStatus === "rejected"
        ? "נדחה ללא שינוי"
        : "בוטל ללא שינוי";

  return `
    <section
      class="nexus-build-approval"
      aria-label="אישור שינוי כיוון"
      data-build-approval-task="${escapeAttribute(approval.taskId)}"
      data-build-approval-status="${escapeAttribute(approval.status)}"
      data-build-approval-decision-status="${escapeAttribute(approval.decisionStatus)}"
      data-build-approval-backed-by-mutation="${approval.backedByMutationTruth ? "true" : "false"}"
      data-build-approval-current-truth-unchanged="${approval.currentTruthUnchanged ? "true" : "false"}"
      data-build-approval-request-id="${escapeAttribute(approval.approvalRequestId)}"
      data-build-approval-mutation-id="${escapeAttribute(approval.mutationDecisionId)}"
    >
      <span>${escapeHtml(statusLabel)}</span>
      <strong>${escapeHtml(approval.impactSummary?.title || approval.userFacingSummary)}</strong>
      <p>${escapeHtml(approval.userFacingSummary)}</p>
      <dl class="nexus-build-approval__impact">
        <div><dt>עכשיו</dt><dd>${escapeHtml(approval.impactSummary?.before || approval.targetDirection?.replaces)}</dd></div>
        <div><dt>אחרי אישור</dt><dd>${escapeHtml(approval.impactSummary?.after || approval.targetDirection?.label)}</dd></div>
      </dl>
      <div class="nexus-build-approval__lists">
        <div>
          <small>ישתנה</small>
          <ul>${(approval.impactSummary?.willChange ?? []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <small>יישמר</small>
          <ul>${(approval.impactSummary?.willKeep ?? []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
      <small>${escapeHtml(approval.impactSummary?.rejectionImpact || "אם לא תאשר, המוצר נשאר כמו שהוא.")}</small>
      ${isPending ? `
        <div class="nexus-build-approval__actions" aria-label="החלטת שינוי">
          <button type="button" data-build-approval-action="approve">אשר שינוי</button>
          <button type="button" data-build-approval-action="reject">דחה</button>
          <button type="button" data-build-approval-action="cancel">בטל</button>
        </div>
      ` : ""}
    </section>
  `;
}

function renderFallbackLiveBuildCanvas(viewModel) {
  return `
    <section class="nexus-live-build-preview" aria-label="שלד מוצר חי">
      ${renderBuildPreviewSandboxBoundary(viewModel.buildPreviewSandbox)}
      <div class="nexus-live-build-preview__badge">RTL · Live skeleton</div>
      <header class="nexus-live-build-preview__hero">
        <div>
          <h3>${escapeHtml(viewModel.previewSurfaceTitle)}</h3>
          <p>${escapeHtml(viewModel.previewSurfaceSubtitle)}</p>
        </div>
        <div class="nexus-live-build-preview__glow"></div>
      </header>
      <div class="nexus-live-build-preview__stats" aria-label="מדדי השלד">
        <article>
          <strong>12</strong>
          <span>פריטים פתוחים</span>
        </article>
        <article>
          <strong>4</strong>
          <span>דורשים טיפול</span>
        </article>
        <article>
          <strong>92%</strong>
          <span>זוהו בזמן</span>
        </article>
      </div>
      <div class="nexus-live-build-preview__table" role="table" aria-label="תצוגת מוצר ראשונה">
        <div role="row">
          <span role="columnheader">פריט</span>
          <span role="columnheader">סטטוס</span>
          <span role="columnheader">אחראי</span>
          <span role="columnheader">צעד הבא</span>
        </div>
        <div role="row">
          <strong role="cell">NX-44821</strong>
          <em role="cell">בדרך</em>
          <span role="cell">דנה</span>
          <span role="cell">שליחת עדכון</span>
        </div>
        <div role="row">
          <strong role="cell">NX-77104</strong>
          <em role="cell">תקוע</em>
          <span role="cell">עומר</span>
          <span role="cell">בדיקת חסם</span>
        </div>
        <div role="row">
          <strong role="cell">NX-22518</strong>
          <em role="cell">נסגר</em>
          <span role="cell">מיכל</span>
          <span role="cell">סגירת טיפול</span>
        </div>
      </div>
    </section>
  `;
}

function renderBuildPreviewSandboxBoundary(boundary = null) {
  if (!boundary?.taskId) {
    return "";
  }
  return `
    <aside
      class="nexus-runtime-sandbox-boundary"
      aria-label="גבול תצוגת הרצה"
      data-runtime-boundary-task="${escapeAttribute(boundary.taskId)}"
      data-runtime-boundary-status="${escapeAttribute(boundary.status)}"
      data-runtime-build-status="${escapeAttribute(boundary.buildStatus)}"
      data-runtime-preview-status="${escapeAttribute(boundary.previewStatus)}"
      data-runtime-sandbox-boundary="${escapeAttribute(boundary.sandboxBoundary)}"
      data-runtime-artifact-fallback="${escapeAttribute(boundary.artifactFallback)}"
      data-runtime-retry-available="${boundary.retryPolicy?.canRetry ? "true" : "false"}"
      data-runtime-retry-action="${escapeAttribute(boundary.retryPolicy?.retryAction)}"
      data-runtime-timeout-policy="${escapeAttribute(boundary.timeoutPolicy?.status)}"
      data-runtime-trace-project-id="${escapeAttribute(boundary.trace?.projectId)}"
      data-runtime-trace-skeleton-id="${escapeAttribute(boundary.trace?.runtimeSkeletonId)}"
      data-runtime-trace-artifact-build-id="${escapeAttribute(boundary.trace?.artifactBuildId)}"
      data-runtime-trace-mutation-id="${escapeAttribute(boundary.trace?.mutationId)}"
      data-runtime-no-fake-live-product="${boundary.noFakeLiveProductClaim ? "true" : "false"}"
    >
      <span>${boundary.status === "ready" ? "סביבת בדיקה" : "צריך טיפול"}</span>
      <strong>${escapeHtml(boundary.userFacing?.title ?? "מצב התצוגה")}</strong>
      <p>${escapeHtml(boundary.userFacing?.body ?? "התצוגה מוגבלת לגבול בדיקה בתוך Nexus.")}</p>
      <small>${escapeHtml(boundary.userFacing?.nextAction ?? "אפשר לנסות שוב או להמשיך בבנייה.")}</small>
      ${boundary.retryPolicy?.canRetry ? `<button type="button" data-runtime-preview-retry="${escapeAttribute(boundary.retryPolicy.retryAction)}">נסה שוב</button>` : ""}
    </aside>
  `;
}

function renderRuntimeSkeletonTrace(runtime) {
  const domain = runtime.productDomainSkeleton ?? {};
  return `
    <footer class="nexus-runtime-skeleton__trace" aria-label="גבולות שלד הריצה" hidden aria-hidden="true">
      <article>
        <span>אמת מוצר</span>
        <strong>${escapeHtml(runtime.productClass)}</strong>
        <p>${escapeHtml(runtime.futureImplementationBoundary)}</p>
      </article>
      <article data-product-domain-state="${escapeAttribute(domain.productDomainSkeletonId)}">
        <span>דומיין מוצר</span>
        <strong>${escapeHtml(domain.domainKind ?? "mock-local-domain-state")}</strong>
        <p>${escapeHtml(domain.persistenceBoundary ?? "מצב מקומי מדומה בתוך אמת הפרויקט, לא בקאנד ייצור.")}</p>
      </article>
      <article>
        <span>מסלול ריצה</span>
        <strong>${escapeHtml(runtime.runtimeFamily)} → ${escapeHtml(runtime.releasePathFamily)}</strong>
        <p>${escapeHtml(runtime.previewFrameFamily)} · ${escapeHtml(runtime.packagingFamily)}</p>
      </article>
    </footer>
  `;
}

function renderProfessionalSkeletonQuality(runtime) {
  const quality = runtime.professionalSkeletonQuality;
  if (!quality?.taskId) {
    return "";
  }
  const marketQuality = quality.marketCalibratedSkeletonQuality;
  const realismQuality = quality.productRealisticSkeletonQuality ?? marketQuality?.productRealisticSkeletonQuality;
  const visibleCriteria = Array.isArray(quality.criteria) ? quality.criteria.slice(0, 4) : [];
  const visibleMarketCriteria = Array.isArray(marketQuality?.criteria) ? marketQuality.criteria.slice(0, 4) : [];
  const visibleRealismCriteria = Array.isArray(realismQuality?.criteria) ? realismQuality.criteria.slice(0, 5) : [];
  return `
    <aside
      class="nexus-professional-skeleton-quality"
      data-professional-skeleton-quality="${escapeAttribute(quality.status)}"
      data-market-skeleton-quality="${escapeAttribute(marketQuality?.status)}"
      data-realistic-skeleton-quality="${escapeAttribute(realismQuality?.status)}"
      hidden
      aria-hidden="true"
      aria-label="איכות השלד המקצועי"
    >
      <div>
        <span>${escapeHtml(quality.classLabel)}</span>
        <strong>${quality.status === "pass" ? "שלד מקצועי מוכן להמשך" : "השלד צריך חיזוק לפני המשך"}</strong>
        <p>${escapeHtml(quality.userFacingSummary)}</p>
        ${marketQuality?.taskId ? `<small>${escapeHtml(marketQuality.userFacingSummary)}</small>` : ""}
      </div>
      <ul>
        ${visibleCriteria.map((criterion) => `<li data-professional-criterion="${escapeAttribute(criterion.id)}" data-professional-criterion-ok="${criterion.ok ? "true" : "false"}">${criterion.ok ? "עבר" : "חסר"} · ${escapeHtml(criterion.label)}</li>`).join("")}
        ${visibleMarketCriteria.map((criterion) => `<li data-market-criterion="${escapeAttribute(criterion.id)}" data-market-criterion-ok="${criterion.ok ? "true" : "false"}">${criterion.ok ? "עבר" : "חסר"} · ${escapeHtml(criterion.label)}</li>`).join("")}
        ${visibleRealismCriteria.map((criterion) => `<li data-realistic-criterion="${escapeAttribute(criterion.id)}" data-realistic-criterion-ok="${criterion.ok ? "true" : "false"}">${criterion.ok ? "עבר" : "חסר"} · ${escapeHtml(criterion.label)}</li>`).join("")}
      </ul>
    </aside>
  `;
}

function renderRuntimeSkeletonList(items = []) {
  return items.slice(0, 4).map((item) => `<li>${escapeHtml(formatVisibleRuntimeItem(item))}</li>`).join("");
}

function formatVisibleRuntimeItem(item = "") {
  const normalized = typeof item === "string" ? item.trim() : "";
  const labels = {
    name: "שם",
    title: "כותרת",
    status: "סטטוס",
    owner: "אחראי",
    assignee: "אחראי",
    reminder: "תזכורת",
    nextStep: "צעד הבא",
    source: "מקור",
    priority: "עדיפות",
  };
  return labels[normalized] ?? normalized;
}

function resolveDomainOperation(runtime, fallback = "") {
  return runtime.productDomainSkeleton?.operations?.[0]?.id ?? fallback;
}

function resolveWorkspaceFilterId(label = "") {
  if (/ללא אחראי/u.test(label)) return "no-owner";
  if (/תזכורת|היום/u.test(label)) return "reminder-today";
  if (/תקועים/u.test(label)) return "stuck";
  return "all";
}

function createRuntimePayloadAttribute(payload = {}) {
  return escapeAttribute(JSON.stringify(payload));
}

function resolveRuntimeRowActions(runtime, row = {}) {
  const operations = Array.isArray(runtime.productDomainSkeleton?.operations)
    ? runtime.productDomainSkeleton.operations
    : [];
  const hasOperation = (operationId) => operations.some((operation) => operation.id === operationId);
  const recordId = row.id || "rec-1";
  const recordName = row.name || "רשומה";
  const actions = [
    {
      label: "בחר",
      operationId: hasOperation("record.select") ? "record.select" : "record.updateStatus",
      payload: hasOperation("record.select") ? { recordId, recordName } : { recordId, recordName, status: row.status || "פתוח" },
    },
    {
      label: "שייך אחראי",
      operationId: hasOperation("record.assignOwner") ? "record.assignOwner" : "record.updateStatus",
      payload: hasOperation("record.assignOwner") ? { recordId, recordName, owner: "נועה" } : { recordId, recordName, status: "בטיפול" },
    },
    {
      label: "קבע תזכורת",
      operationId: hasOperation("record.updateReminder") ? "record.updateReminder" : "record.updateStatus",
      payload: hasOperation("record.updateReminder") ? { recordId, recordName, reminder: "מחר 09:00" } : { recordId, recordName, status: "בטיפול" },
    },
  ];
  return actions;
}

function renderRuntimeLiveState(runtime, initialState = "מוכן לפעולה מדומה") {
  const visibleBoundary = "המצב נשמר כאן לצורך בדיקה, בלי חיבור חיצוני או פרסום.";
  return `
    <aside class="nexus-runtime-live-state" data-runtime-live-state aria-live="polite">
      <span>מצב חי</span>
      <strong>${escapeHtml(initialState)}</strong>
      <small>${escapeHtml(visibleBoundary)}</small>
    </aside>
  `;
}

function renderBuildMutationSummary(mutationTruth = {}) {
  if (!mutationTruth?.taskId || !mutationTruth.visibleSummary) {
    return "";
  }
  return `
    <aside class="nexus-runtime-mutation-summary" data-build-mutation-user-summary aria-live="polite">
      <span>שינוי אחרון</span>
      <strong>${escapeHtml(mutationTruth.visibleSummary)}</strong>
      <small>השינוי נשמר בפרויקט ויחזור אחרי רענון.</small>
    </aside>
  `;
}

function renderRuntimeSelectionDirectEditPanel(runtime) {
  const selectedRecordId = runtime.productDomainSkeleton?.state?.selectedRecordId ?? "";
  const rows = Array.isArray(runtime.tableRows) ? runtime.tableRows : [];
  const selectedRow = rows.find((row) => row.id === selectedRecordId) ?? rows[0] ?? null;
  if (!selectedRow) {
    return "";
  }

  return `
    <aside
      class="nexus-runtime-direct-edit"
      data-exp-selection-direct-edit-task="EXP-001"
      data-exp-selected-record-id="${escapeAttribute(selectedRow.id)}"
      data-exp-product-owned-backend-task="${escapeAttribute(runtime.productOwnedBackendSkeleton?.taskId)}"
      aria-label="בחירה ועריכה ישירה"
    >
      <span>עריכה ישירה</span>
      <strong>${escapeHtml(selectedRow.name)}</strong>
      <p>בחר ליד ואז שנה אחראי, תזכורת או סטטוס מתוך אותה טבלת עבודה.</p>
      <dl>
        <div><dt>סטטוס</dt><dd>${escapeHtml(selectedRow.status)}</dd></div>
        <div><dt>אחראי</dt><dd>${escapeHtml(selectedRow.owner)}</dd></div>
        <div><dt>תזכורת</dt><dd>${escapeHtml(selectedRow.reminder)}</dd></div>
      </dl>
      <small>העריכה נשמרת באמת הפרויקט ובצד האחורי המקומי של המוצר; זה עדיין לא פריסת ייצור.</small>
    </aside>
  `;
}

function renderRuntimeSkeletonSurface(viewModel) {
  const runtime = viewModel.runtimeSkeleton;
  if (!runtime) {
    return "";
  }
  const mutationTruth = viewModel.buildMutationTruth ?? {};
  const sandboxBoundary = viewModel.buildPreviewSandbox ?? runtime.buildPreviewSandboxBoundary ?? null;
  const marketQuality = runtime.professionalSkeletonQuality?.marketCalibratedSkeletonQuality ?? {};
  const realismQuality = runtime.professionalSkeletonQuality?.productRealisticSkeletonQuality
    ?? marketQuality.productRealisticSkeletonQuality
    ?? {};

  const commonAttrs = `
    data-runtime-skeleton-task="${escapeAttribute(runtime.taskId)}"
    data-runtime-truth-task="${escapeAttribute(runtime.truthTaskId)}"
    data-runtime-project-id="${escapeAttribute(runtime.projectId)}"
    data-runtime-artifact-build-id="${escapeAttribute(runtime.artifactBuildId)}"
    data-runtime-skeleton-id="${escapeAttribute(runtime.runtimeSkeletonId)}"
    data-runtime-product-class="${escapeAttribute(runtime.productClass)}"
    data-runtime-shell-family="${escapeAttribute(runtime.shellFamily)}"
    data-product-kind-task="${escapeAttribute(runtime.productKindTaskId)}"
    data-product-kind-status="${escapeAttribute(runtime.productKindStatus)}"
    data-product-kind-pattern="${escapeAttribute(runtime.productPattern)}"
    data-product-kind-confidence="${escapeAttribute(runtime.productKindConfidence)}"
    data-product-kind-skeleton-family="${escapeAttribute(runtime.productKindSkeletonSelection?.shellFamily)}"
    data-product-kind-needs-clarification="${runtime.productKindNeedsClarification ? "true" : "false"}"
    data-product-learning-task="${escapeAttribute(runtime.productPatternLearningDecision?.taskId)}"
    data-product-learning-status="${escapeAttribute(runtime.productPatternLearningStatus)}"
    data-product-learning-applied="${runtime.productPatternLearningApplied ? "true" : "false"}"
    data-product-learning-boundary="${escapeAttribute(runtime.productPatternLearningBoundary)}"
    data-runtime-preview-family="${escapeAttribute(runtime.previewFrameFamily)}"
    data-runtime-workspace-family="${escapeAttribute(runtime.workspaceFamily)}"
    data-professional-skeleton-task="${escapeAttribute(runtime.professionalSkeletonQuality?.taskId)}"
    data-professional-skeleton-status="${escapeAttribute(runtime.professionalSkeletonQuality?.status)}"
    data-professional-skeleton-level="${escapeAttribute(runtime.professionalSkeletonQuality?.level)}"
    data-professional-skeleton-score="${escapeAttribute(runtime.professionalSkeletonQuality?.score)}"
    data-professional-build-continuation="${runtime.professionalSkeletonQuality?.buildContinuationAllowed ? "allowed" : "blocked"}"
    data-market-skeleton-task="${escapeAttribute(marketQuality.taskId)}"
    data-market-skeleton-status="${escapeAttribute(marketQuality.status)}"
    data-market-skeleton-level="${escapeAttribute(marketQuality.level)}"
    data-market-skeleton-score="${escapeAttribute(marketQuality.score)}"
    data-market-skeleton-learning-uplift="${marketQuality.status === "pass" ? "ready" : "blocked"}"
    data-realistic-skeleton-task="${escapeAttribute(realismQuality.taskId)}"
    data-realistic-skeleton-status="${escapeAttribute(realismQuality.status)}"
    data-realistic-skeleton-level="${escapeAttribute(realismQuality.level)}"
    data-realistic-skeleton-score="${escapeAttribute(realismQuality.score)}"
    data-product-domain-task="${escapeAttribute(runtime.productDomainSkeleton?.domainTaskId)}"
    data-product-domain-skeleton-id="${escapeAttribute(runtime.productDomainSkeleton?.productDomainSkeletonId)}"
    data-product-domain-kind="${escapeAttribute(runtime.productDomainSkeleton?.domainKind)}"
    data-runtime-skeleton-title="${escapeAttribute(runtime.title)}"
    data-product-owned-backend-task="${escapeAttribute(runtime.productOwnedBackendSkeleton?.taskId)}"
    data-product-owned-backend-skeleton-id="${escapeAttribute(runtime.productOwnedBackendSkeleton?.productOwnedBackendSkeletonId)}"
    data-product-owned-backend-root="${escapeAttribute(runtime.productOwnedBackendSkeleton?.artifactRoot)}"
    data-product-owned-backend-pairing="${escapeAttribute(runtime.productOwnedBackendSkeleton?.frontendBackendPairing?.status)}"
    data-build-mutation-task="${escapeAttribute(mutationTruth.taskId)}"
    data-conversation-mutation-task="${escapeAttribute(mutationTruth.sliceTaskId)}"
    data-build-mutation-status="${escapeAttribute(mutationTruth.status)}"
    data-build-mutation-last-id="${escapeAttribute(mutationTruth.lastMutationId)}"
    data-build-mutation-operation="${escapeAttribute(mutationTruth.lastOperationId)}"
    data-build-mutation-history-count="${escapeAttribute(mutationTruth.historyCount)}"
    data-build-mutation-user-summary="${escapeAttribute(mutationTruth.visibleSummary)}"
    data-runtime-boundary-task="${escapeAttribute(sandboxBoundary?.taskId)}"
    data-runtime-boundary-status="${escapeAttribute(sandboxBoundary?.status)}"
    data-runtime-build-status="${escapeAttribute(sandboxBoundary?.buildStatus)}"
    data-runtime-preview-status="${escapeAttribute(sandboxBoundary?.previewStatus)}"
    data-runtime-sandbox-boundary="${escapeAttribute(sandboxBoundary?.sandboxBoundary)}"
    data-runtime-artifact-fallback="${escapeAttribute(sandboxBoundary?.artifactFallback)}"
    data-runtime-retry-available="${sandboxBoundary?.retryPolicy?.canRetry ? "true" : "false"}"
    data-runtime-timeout-policy="${escapeAttribute(sandboxBoundary?.timeoutPolicy?.status)}"
    data-runtime-trace-project-id="${escapeAttribute(sandboxBoundary?.trace?.projectId)}"
    data-runtime-trace-skeleton-id="${escapeAttribute(sandboxBoundary?.trace?.runtimeSkeletonId)}"
    data-runtime-trace-artifact-build-id="${escapeAttribute(sandboxBoundary?.trace?.artifactBuildId)}"
    data-runtime-trace-mutation-id="${escapeAttribute(sandboxBoundary?.trace?.mutationId)}"
    data-runtime-no-fake-live-product="${sandboxBoundary?.noFakeLiveProductClaim ? "true" : "false"}"
  `;

  if (runtime.shellFamily === "mobile-simulator") {
    return `
      <section class="nexus-runtime-skeleton nexus-runtime-skeleton--mobile" ${commonAttrs} aria-label="שלד ריצה של אפליקציה">
        <header class="nexus-runtime-skeleton__header">
          <span>${escapeHtml(runtime.frameLabel)}</span>
          <strong>${escapeHtml(runtime.title)}</strong>
          <p>${escapeHtml(runtime.subtitle)}</p>
        </header>
        ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
        ${renderProfessionalSkeletonQuality(runtime)}
        ${renderBuildMutationSummary(mutationTruth)}
        <main class="nexus-runtime-mobile-frame">
          <div class="nexus-runtime-mobile-frame__device">
            <div class="nexus-runtime-mobile-frame__status"><span>9:41</span><span>LTE</span></div>
            <nav class="nexus-runtime-mobile-frame__nav" aria-label="ניווט אפליקציה">
              ${runtime.screens.map((screen, index) => `<button type="button" data-runtime-screen-nav="${escapeAttribute(index)}" data-runtime-screen-title="${escapeAttribute(screen.title)}" data-runtime-screen-detail="${escapeAttribute(screen.detail)}" aria-current="${screen.active ? "page" : "false"}">${escapeHtml(screen.title)}</button>`).join("")}
            </nav>
            <section class="nexus-runtime-mobile-frame__screen" data-runtime-active-screen>
              <div class="nexus-runtime-mobile-frame__app-header">
                <span>${escapeHtml(runtime.title)}</span>
                <h4 data-runtime-active-screen-title>${escapeHtml(runtime.screens[0]?.title ?? runtime.title)}</h4>
                <p data-runtime-active-screen-detail>${escapeHtml(runtime.screens[0]?.detail ?? runtime.subtitle)}</p>
              </div>
              <div class="nexus-runtime-mobile-frame__quick-stats" aria-label="מצב יומי">
                ${(runtime.quickStats ?? []).map((stat) => `<article><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></article>`).join("")}
              </div>
              <div class="nexus-runtime-mobile-frame__tasks" aria-label="נתוני אפליקציה">
                ${(runtime.taskRows ?? []).map((task) => `
                  <article>
                    <strong>${escapeHtml(task.title)}</strong>
                    <span>${escapeHtml(task.meta)}</span>
                    <em>${escapeHtml(task.status)}</em>
                  </article>
                `).join("")}
              </div>
              <button type="button" data-product-domain-operation="${escapeAttribute(resolveDomainOperation(runtime, "task.create"))}">${escapeHtml(runtime.primaryAction)}</button>
            </section>
            <footer class="nexus-runtime-mobile-frame__tabs" aria-label="ניווט תחתון">
              ${(runtime.appTabs ?? []).map((tab, index) => `<button type="button" data-runtime-app-tab="${escapeAttribute(index)}">${escapeHtml(tab)}</button>`).join("")}
            </footer>
          </div>
          <aside class="nexus-runtime-skeleton__side">
            ${runtime.stateRows.map((row) => `<article><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></article>`).join("")}
            ${(runtime.summaryRows ?? []).map((row) => `<article><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></article>`).join("")}
          </aside>
          ${renderRuntimeLiveState(runtime, "מסך ראשון פעיל")}
        </main>
        ${renderRuntimeSkeletonTrace(runtime)}
      </section>
    `;
  }

  if (runtime.shellFamily === "web-page-preview") {
    return `
      <section class="nexus-runtime-skeleton nexus-runtime-skeleton--landing" ${commonAttrs} aria-label="שלד ריצה של דף נחיתה">
        <header class="nexus-runtime-browser-bar"><span></span><span></span><span></span><strong>${escapeHtml(runtime.title.toLowerCase().replace(/\s+/g, "-"))}.local</strong></header>
        ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
        ${renderProfessionalSkeletonQuality(runtime)}
        ${renderBuildMutationSummary(mutationTruth)}
        <main class="nexus-runtime-landing-page">
          ${runtime.sections.map((section) => `
            <section data-runtime-section="${escapeAttribute(section.kind)}">
              <span>${escapeHtml(section.label ?? "")}</span>
              <h3>${escapeHtml(section.title)}</h3>
              <p>${escapeHtml(section.body)}</p>
              ${section.kind === "form" ? `
                <div class="nexus-runtime-landing-page__form" aria-label="טופס שמירת ליד">
                  <label>שם<input value="דוגמה" readonly /></label>
                  <label>טלפון<input value="050-0000000" readonly /></label>
                </div>
              ` : ""}
              ${section.action ? `<button type="button" data-product-domain-operation="${escapeAttribute(resolveDomainOperation(runtime, "lead.submit"))}">${escapeHtml(section.action)}</button>` : ""}
            </section>
          `).join("")}
          ${renderRuntimeLiveState(runtime, "טופס מוכן לשליחה מדומה")}
        </main>
        ${renderRuntimeSkeletonTrace(runtime)}
      </section>
    `;
  }

  if (runtime.shellFamily === "playable-preview") {
    return `
      <section class="nexus-runtime-skeleton nexus-runtime-skeleton--game" ${commonAttrs} aria-label="שלד ריצה של משחק">
        <header class="nexus-runtime-skeleton__header">
          <span>${escapeHtml(runtime.frameLabel)}</span>
          <strong>${escapeHtml(runtime.scene.title)}</strong>
          <p>${escapeHtml(runtime.scene.objective)}</p>
        </header>
        ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
        ${renderProfessionalSkeletonQuality(runtime)}
        ${renderBuildMutationSummary(mutationTruth)}
        <main class="nexus-runtime-game-scene">
          <div class="nexus-runtime-game-scene__hud">
            ${runtime.scene.hud.slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="nexus-runtime-game-scene__stage">
            <div class="nexus-runtime-game-scene__player"></div>
            <strong data-runtime-score>ניקוד 0</strong>
          </div>
          <div class="nexus-runtime-game-scene__controls">
            ${runtime.controls.map((control, index) => `<button type="button" data-product-domain-operation="${escapeAttribute(runtime.productDomainSkeleton?.operations?.[index]?.id ?? "game.start")}">${escapeHtml(control)}</button>`).join("")}
          </div>
        </main>
        ${renderRuntimeSkeletonTrace(runtime)}
      </section>
    `;
  }

  if (runtime.shellFamily === "commerce-flow-preview") {
    return `
      <section class="nexus-runtime-skeleton nexus-runtime-skeleton--commerce" ${commonAttrs} aria-label="שלד ריצה של מסחר">
        <header class="nexus-runtime-skeleton__header">
          <span>${escapeHtml(runtime.frameLabel)}</span>
          <strong>${escapeHtml(runtime.title)}</strong>
          <p>${escapeHtml(runtime.subtitle)}</p>
        </header>
        ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
        ${renderProfessionalSkeletonQuality(runtime)}
        ${renderBuildMutationSummary(mutationTruth)}
        <main class="nexus-runtime-board">
          ${runtime.lanes.map((lane) => `
            <section>
              <h4>${escapeHtml(lane.title)}</h4>
              <ul>${renderRuntimeSkeletonList(lane.items)}</ul>
              <button type="button" data-product-domain-operation="${escapeAttribute(resolveDomainOperation(runtime, "cart.addItem"))}">הפעל פעולה מדומה</button>
            </section>
          `).join("")}
          ${renderRuntimeLiveState(runtime, "עגלה ריקה")}
        </main>
        ${renderRuntimeSkeletonTrace(runtime)}
      </section>
    `;
  }

  if (runtime.shellFamily === "workspace-state-shell" || runtime.shellFamily === "product-workflow-shell") {
    return `
      <section class="nexus-runtime-skeleton nexus-runtime-skeleton--workspace" ${commonAttrs} aria-label="שלד ריצה של כלי עבודה">
        <header class="nexus-runtime-skeleton__header">
          <span>${escapeHtml(runtime.frameLabel)}</span>
          <strong>${escapeHtml(runtime.title)}</strong>
          <p>${escapeHtml(runtime.subtitle)}</p>
        </header>
        ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
        ${renderProfessionalSkeletonQuality(runtime)}
        ${renderBuildMutationSummary(mutationTruth)}
        <div class="nexus-runtime-workspace-metrics" aria-label="מדדי עבודה">
          ${(runtime.metrics ?? []).map((metric) => `<article><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></article>`).join("")}
        </div>
        <nav class="nexus-runtime-workspace-filters" aria-label="סינון עבודה">
          ${(runtime.filters ?? []).map((filter, index) => `<button type="button" data-runtime-workspace-filter="${escapeAttribute(resolveWorkspaceFilterId(filter))}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(filter)}</button>`).join("")}
        </nav>
        <main class="nexus-runtime-board">
          ${runtime.columns.map((column) => `
            <section>
              <h4>${escapeHtml(column.title)}</h4>
              <ul>${renderRuntimeSkeletonList(column.items)}</ul>
              <button type="button" data-product-domain-operation="${escapeAttribute(runtime.productDomainSkeleton?.operations?.[0]?.id ?? "record.create")}">${escapeHtml(runtime.workflowActions?.[0] ?? "הוסף רשומה")}</button>
            </section>
          `).join("")}
          ${renderRuntimeLiveState(runtime, "רשומה ראשונה נבחרה")}
        </main>
        <div class="nexus-runtime-workspace-table" role="table" aria-label="רשומות עבודה">
          <div role="row">
            <span role="columnheader">שם</span>
            <span role="columnheader">סטטוס</span>
            <span role="columnheader">אחראי</span>
              <span role="columnheader">תזכורת</span>
              <span role="columnheader">צעד הבא</span>
              <span role="columnheader">פעולות</span>
            </div>
          ${(runtime.tableRows ?? []).map((row) => `
            <div
              role="row"
              data-runtime-record-id="${escapeAttribute(row.id)}"
              data-runtime-record-status="${escapeAttribute(row.status)}"
              data-runtime-record-owner="${escapeAttribute(row.owner)}"
              data-runtime-record-reminder="${escapeAttribute(row.reminder)}"
              data-runtime-record-next-step="${escapeAttribute(row.nextStep)}"
              aria-selected="${runtime.productDomainSkeleton?.state?.selectedRecordId === row.id ? "true" : "false"}"
            >
              <strong role="cell">${escapeHtml(row.name)}</strong>
              <span role="cell">${escapeHtml(row.status)}</span>
              <span role="cell">${escapeHtml(row.owner)}</span>
              <span role="cell">${escapeHtml(row.reminder)}</span>
              <span role="cell">${escapeHtml(row.nextStep)}</span>
              <span role="cell" class="nexus-runtime-workspace-table__actions">${resolveRuntimeRowActions(runtime, row).map((action) => `<button type="button" data-product-domain-operation="${escapeAttribute(action.operationId)}" data-product-domain-payload="${createRuntimePayloadAttribute(action.payload)}">${escapeHtml(action.label)}</button>`).join("")}</span>
            </div>
          `).join("")}
        </div>
        ${renderRuntimeSelectionDirectEditPanel(runtime)}
        ${renderRuntimeSkeletonTrace(runtime)}
      </section>
    `;
  }

  return `
    <section class="nexus-runtime-skeleton nexus-runtime-skeleton--tool" ${commonAttrs} aria-label="שלד ריצה של כלי">
      <header class="nexus-runtime-skeleton__header">
        <span>${escapeHtml(runtime.frameLabel)}</span>
        <strong>${escapeHtml(runtime.title)}</strong>
        <p>${escapeHtml(runtime.subtitle)}</p>
      </header>
      ${renderBuildPreviewSandboxBoundary(sandboxBoundary)}
      ${renderProfessionalSkeletonQuality(runtime)}
      ${renderBuildMutationSummary(mutationTruth)}
      <main class="nexus-runtime-tool-shell">
        ${runtime.panels.map((panel) => `<article><span>${escapeHtml(panel.title)}</span><strong>${escapeHtml(panel.body)}</strong></article>`).join("")}
      </main>
      <div class="nexus-runtime-tool-shell__controls">
        ${runtime.controls.map((control, index) => `<button type="button" data-product-domain-operation="${escapeAttribute(runtime.productDomainSkeleton?.operations?.[index]?.id ?? "tool.run")}">${escapeHtml(control)}</button>`).join("")}
      </div>
      ${renderRuntimeLiveState(runtime, "מוכן להרצת כלי")}
      ${renderRuntimeSkeletonTrace(runtime)}
    </section>
  `;
}

function renderSkeletonChoiceSurface(viewModel) {
  const choice = viewModel.skeletonChoice;
  if (!choice?.taskId) {
    return "";
  }
  const candidates = Array.isArray(choice.candidates) ? choice.candidates : [];
  return `
    <section
      class="nexus-skeleton-choice"
      aria-label="בחירת כיוון שלד"
      data-skeleton-choice-task="${escapeAttribute(choice.taskId)}"
      data-skeleton-choice-status="${escapeAttribute(choice.status)}"
      data-skeleton-choice-selection-status="${escapeAttribute(choice.selectionStatus)}"
      data-skeleton-choice-selected-candidate-id="${escapeAttribute(choice.selectedSkeletonCandidateId)}"
      data-skeleton-choice-provider-failure-count="${escapeAttribute(choice.providerFailureCount)}"
    >
      <header class="nexus-skeleton-choice__header">
        <span>כיוון שלד</span>
        <strong>${choice.selectedSkeletonCandidateId ? "הכיוון נבחר להמשך" : "בחר כיוון להמשך הבנייה"}</strong>
        <p>${escapeHtml(choice.boundaryText)}</p>
      </header>
      <div class="nexus-skeleton-choice__grid">
        ${candidates.map((candidate) => `
          <article
            class="nexus-skeleton-choice__candidate${candidate.isSelected ? " is-selected" : ""}"
            data-skeleton-choice-candidate-id="${escapeAttribute(candidate.candidateId)}"
            data-skeleton-choice-candidate-label="${escapeAttribute(candidate.label)}"
            data-skeleton-choice-candidate-selected="${candidate.isSelected ? "true" : "false"}"
          >
            <span>${candidate.isRecommended ? "מומלץ" : "אפשרות"}</span>
            <strong>${escapeHtml(candidate.label)}</strong>
            <p>${escapeHtml(candidate.productDirection || candidate.visualSummary)}</p>
            <small>${escapeHtml(candidate.operationCount ? `${candidate.operationCount} פעולות מחוברות לדומיין` : "מחובר לאמת המוצר")}</small>
            <button
              type="button"
              data-skeleton-choice-select
              data-skeleton-choice-select-candidate-id="${escapeAttribute(candidate.candidateId)}"
              ${candidate.isSelected ? "disabled" : ""}
            >${candidate.isSelected ? "נבחר" : "בחר כיוון"}</button>
          </article>
        `).join("")}
      </div>
      ${choice.selectedSkeletonCandidateId ? `
        <p class="nexus-skeleton-choice__locked" data-skeleton-choice-locked="true">
          ממשיכים מאותו כיוון. החלפת כיוון דורשת אישור.
        </p>
      ` : `
        <p class="nexus-skeleton-choice__locked" data-skeleton-choice-locked="false">
          Nexus לא ממשיך ככיוון קבוע עד שיש בחירה או אישור לכיוון המומלץ.
        </p>
      `}
    </section>
  `;
}

function renderProductSkeletonAgentCard(viewModel) {
  const skeleton = viewModel.productSkeletonAgent;
  if (!skeleton) {
    return "";
  }
  const steps = Array.isArray(skeleton.firstWorkflow?.steps) ? skeleton.firstWorkflow.steps : [];
  const screens = Array.isArray(skeleton.initialScreens) ? skeleton.initialScreens : [];
  const buildNow = Array.isArray(skeleton.buildNow) ? skeleton.buildNow : [];
  const doNotBuildNow = Array.isArray(skeleton.doNotBuildNow) ? skeleton.doNotBuildNow : [];
  return `
    <section
      class="nexus-product-skeleton-agent-card"
      data-product-skeleton-task="${escapeAttribute(skeleton.taskId ?? "SKEL-001")}"
      data-product-skeleton-agent="${escapeAttribute(skeleton.agentId ?? "product-skeleton-agent")}"
      data-product-skeleton-source="${escapeAttribute(skeleton.responseSource ?? "provider-composed")}"
      aria-label="עקבות שלד מוצר ראשון"
    >
      <header>
        <span>עקבות שלד מוצר</span>
        <strong>${escapeHtml(skeleton.productType ?? "מוצר")}</strong>
      </header>
      <div class="nexus-product-skeleton-agent-card__summary">
        <article>
          <span>משתמש מרכזי</span>
          <strong>${escapeHtml(skeleton.primaryUser ?? "")}</strong>
        </article>
        <article>
          <span>בעיה מרכזית</span>
          <strong>${escapeHtml(skeleton.primaryProblem ?? "")}</strong>
        </article>
      </div>
      <article class="nexus-product-skeleton-agent-card__workflow">
        <span>הזרימה הראשונה</span>
        <h3>${escapeHtml(skeleton.firstWorkflow?.title ?? "זרימה ראשונה")}</h3>
        <p>${escapeHtml(skeleton.firstWorkflow?.whyThisFirst ?? "השלד נבחר לפי הערך הראשון למשתמש.")}</p>
        <ol>
          ${steps.slice(0, 5).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
      </article>
      <div class="nexus-product-skeleton-agent-card__grid">
        <section>
          <span>מסכים ראשונים</span>
          <ul>${screens.slice(0, 4).map((screen) => `<li>${escapeHtml(screen?.name ?? screen)}</li>`).join("")}</ul>
        </section>
        <section>
          <span>בונים עכשיו</span>
          <ul>${buildNow.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <section>
          <span>לא בונים עכשיו</span>
          <ul>${doNotBuildNow.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
      </div>
    </section>
  `;
}

function renderVisualProductSkeletonAgentSurface(viewModel) {
  const visual = viewModel.visualProductSkeletonAgent;
  if (!visual) {
    return "";
  }
  const regions = Array.isArray(visual.regions) ? visual.regions : [];
  const primaryRegion = regions.find((region) => region.priority === "primary") ?? regions[0] ?? {};
  const supportingRegions = regions.filter((region) => region !== primaryRegion);
  const assumptions = Array.isArray(visual.assumptions) ? visual.assumptions : [];
  const doNotBuildNow = Array.isArray(visual.doNotBuildNow) ? visual.doNotBuildNow : [];
  return `
    <section
      class="nexus-visual-product-skeleton"
      data-visual-skeleton-task="${escapeAttribute(visual.taskId ?? "VSKEL-001")}"
      data-visual-skeleton-agent="${escapeAttribute(visual.agentId ?? "visual-product-skeleton-agent")}"
      data-visual-skeleton-source="${escapeAttribute(visual.responseSource ?? "provider-composed")}"
      data-visual-skeleton-plugin-id="${escapeAttribute(visual.designPlugin?.pluginId)}"
      data-visual-skeleton-first-screen="${escapeAttribute(visual.firstScreen?.name)}"
      aria-label="עקבות שלד ויזואלי ראשון"
    >
      <header class="nexus-visual-product-skeleton__header">
        <div>
          <span>עקבות שלד ויזואלי</span>
          <h3>${escapeHtml(visual.firstScreen?.name ?? "מסך ראשון")}</h3>
          <p>${escapeHtml(visual.firstScreen?.purpose ?? "")}</p>
        </div>
        <button type="button" class="nexus-visual-product-skeleton__primary-action">
          ${escapeHtml(visual.firstScreen?.primaryAction ?? "התחל")}
        </button>
      </header>
      <main class="nexus-visual-product-skeleton__workspace">
        <section
          class="nexus-visual-product-skeleton__primary-region"
          data-visual-skeleton-region="${escapeAttribute(primaryRegion.id ?? "primary")}"
          data-visual-skeleton-region-kind="${escapeAttribute(primaryRegion.kind ?? "primary")}"
        >
          <span>${escapeHtml(primaryRegion.kind ?? "primary")}</span>
          <strong>${escapeHtml(primaryRegion.title ?? visual.firstScreen?.primaryAction ?? "")}</strong>
          <p>${escapeHtml(primaryRegion.purpose ?? "")}</p>
          <div class="nexus-visual-product-skeleton__items">
            ${(primaryRegion.content ?? []).slice(0, 6).map((item) => `<article>${escapeHtml(item)}</article>`).join("")}
          </div>
        </section>
        <aside class="nexus-visual-product-skeleton__side-regions">
          ${supportingRegions.slice(0, 4).map((region) => `
            <article
              data-visual-skeleton-region="${escapeAttribute(region.id)}"
              data-visual-skeleton-region-kind="${escapeAttribute(region.kind)}"
            >
              <span>${escapeHtml(region.kind)}</span>
              <strong>${escapeHtml(region.title)}</strong>
              <p>${escapeHtml(region.purpose)}</p>
              <small>${escapeHtml((region.content ?? []).slice(0, 2).join(" · "))}</small>
            </article>
          `).join("")}
        </aside>
      </main>
      <footer class="nexus-visual-product-skeleton__footer">
        <article>
          <span>שפת עיצוב</span>
          <strong>${escapeHtml(visual.designPlugin?.pluginName ?? "")}</strong>
          <p>${escapeHtml(visual.designPlugin?.reason ?? "")}</p>
        </article>
        <article>
          <span>טון ויזואלי</span>
          <strong>${escapeHtml(visual.visualTone ?? "")}</strong>
          <p>${escapeHtml(assumptions.slice(0, 1).join(" ") || "השלד מציג מסך ראשון בלבד.")}</p>
        </article>
        <article>
          <span>מחוץ לגבול עכשיו</span>
          <strong>${escapeHtml(doNotBuildNow.slice(0, 2).join(" · ") || "אין הרחבות נוספות")}</strong>
          <p>${escapeHtml(visual.handoff?.nextMove ?? "מסירה לבנייה ויזואלית הבאה.")}</p>
        </article>
      </footer>
    </section>
  `;
}

function renderDesignPluginLiveProof(viewModel) {
  const proof = viewModel.designPluginLiveProof;
  if (!proof) {
    return "";
  }
  const colors = proof.colors ?? {};
  const style = [
    colors.background ? `--design-plugin-bg:${escapeAttribute(colors.background)}` : "",
    colors.surface ? `--design-plugin-surface:${escapeAttribute(colors.surface)}` : "",
    colors.primary ? `--design-plugin-primary:${escapeAttribute(colors.primary)}` : "",
    colors.accent ? `--design-plugin-accent:${escapeAttribute(colors.accent)}` : "",
    colors.text ? `--design-plugin-text:${escapeAttribute(colors.text)}` : "",
  ].filter(Boolean).join(";");
  const regions = Array.isArray(proof.regions) ? proof.regions : [];
  const antiGenericRules = Array.isArray(proof.antiGenericDesignRules) ? proof.antiGenericDesignRules : [];
  return `
    <section
      class="nexus-design-plugin-live-proof nexus-design-plugin-live-proof--${escapeAttribute(proof.selectedPluginId)}"
      style="${style}"
      data-design-plugin-task="${escapeAttribute(proof.taskId ?? "DESIGN-PLUG-004")}"
      data-design-plugin-id="${escapeAttribute(proof.selectedPluginId)}"
      data-design-plugin-name="${escapeAttribute(proof.selectedPluginName)}"
      data-design-plugin-proof-kind="${escapeAttribute(proof.proofKind)}"
      data-design-plugin-boundary="${escapeAttribute(proof.boundary)}"
      data-design-plugin-matched-by="${escapeAttribute(proof.matchedBy)}"
      aria-label="הוכחת בחירת שפת עיצוב"
    >
      <header class="nexus-design-plugin-live-proof__header">
        <div>
          <span>הוכחת שפת עיצוב</span>
          <strong>${escapeHtml(proof.styleName || proof.selectedPluginName)}</strong>
        </div>
        <p>${escapeHtml(proof.selectionReason || "נבחרה שפת עיצוב לפי המוצר והעדפת המשתמש.")}</p>
      </header>
      <div class="nexus-design-plugin-live-proof__regions" data-design-plugin-region-count="${escapeAttribute(regions.length)}">
        ${regions.map((region) => `
          <article data-design-plugin-region="${escapeAttribute(region.kind)}">
            <span>${escapeHtml(region.kind)}</span>
            <strong>${escapeHtml(region.title)}</strong>
            <p>${escapeHtml(region.body)}</p>
          </article>
        `).join("")}
      </div>
      <footer class="nexus-design-plugin-live-proof__footer">
        <span>לא סגירת ${escapeHtml("VSKEL-001")}</span>
        <p>${antiGenericRules.slice(0, 1).map(escapeHtml).join("") || "הפלאגין משפיע על מראה בלבד ולא משנה אמת מוצרית."}</p>
      </footer>
    </section>
  `;
}

function renderVisualBuildTruthSurface(viewModel) {
  const visual = viewModel.visualBuildTruth;
  if (!visual) {
    return "";
  }
  const primaryScreen = visual.screens?.[0] ?? {};
  const diff = visual.lastVisualDiff ?? {};
  const isLeadCards = primaryScreen.layoutMode === "cards-with-follow-up-today";
  return `
    <section
      class="nexus-visual-build-truth"
      data-visual-build-task="${escapeAttribute(visual.taskId)}"
      data-visual-build-bridge-task="${escapeAttribute(visual.bridgeTaskId)}"
      data-visual-build-status="${escapeAttribute(visual.status)}"
      data-visual-build-id="${escapeAttribute(visual.visualBuildId)}"
      data-visual-build-operation="${escapeAttribute(visual.lastOperationId)}"
      data-visual-build-screen="${escapeAttribute(primaryScreen.screenId)}"
      data-visual-build-design-plugin="${escapeAttribute(visual.selectedDesignPluginId)}"
      data-visual-build-history-count="${escapeAttribute(visual.historyCount)}"
      aria-label="שינוי חזותי שבוצע בשלד"
    >
      <header class="nexus-visual-build-truth__header">
        <span>שינוי חזותי חי</span>
        <strong>${escapeHtml(primaryScreen.title ?? "מסך חדש")}</strong>
        <p>${escapeHtml(diff.visibleSummary ?? "השינוי נשמר כחלק משלד הריצה.")}</p>
      </header>
      <main class="nexus-visual-build-truth__canvas" data-visual-build-region="${escapeAttribute(primaryScreen.affectedRegion)}">
        ${isLeadCards ? `
          <section class="nexus-visual-build-truth__lead-cards" data-visual-build-cards="lead-list" dir="rtl">
            <header>
              <small>${escapeHtml(visual.selectedDesignPluginName)}</small>
              <h3>${escapeHtml(primaryScreen.headline ?? viewModel.projectName)}</h3>
              <p>${escapeHtml(primaryScreen.body ?? "תצוגת כרטיסים שנוספה לשלד.")}</p>
            </header>
            <aside class="nexus-visual-build-truth__followup" data-visual-build-region-added="follow-up-today">
              <span>חזרה היום</span>
              ${primaryScreen.followUpToday?.map((item) => `<strong>${escapeHtml(item)}</strong>`).join("") ?? ""}
            </aside>
            <div class="nexus-visual-build-truth__cards">
              ${primaryScreen.leadCards?.map((card) => `
                <article data-visual-build-card="lead">
                  <span>${escapeHtml(card.status)}</span>
                  <strong>${escapeHtml(card.name)}</strong>
                  <p>${escapeHtml(card.nextStep)}</p>
                  <small>${escapeHtml(card.owner)} · ${escapeHtml(card.reminder)}</small>
                </article>
              `).join("") ?? ""}
            </div>
          </section>
        ` : `
          <section class="nexus-visual-build-truth__splash" data-visual-build-added-screen="splash-screen">
            <small>${escapeHtml(visual.selectedDesignPluginName)}</small>
            <h3>${escapeHtml(primaryScreen.headline ?? viewModel.projectName)}</h3>
            <p>${escapeHtml(primaryScreen.body ?? "מסך פתיחה שנוסף לשלד.")}</p>
            <button type="button">${escapeHtml(primaryScreen.primaryAction ?? "המשך")}</button>
          </section>
        `}
      </main>
      <footer>
        <span>${escapeHtml(visual.boundary)}</span>
      </footer>
    </section>
  `;
}

function renderBuildWorkspaceSurface(viewModel) {
  const workspace = viewModel.surfaceWorkspace ?? {};
  const buildSurface = viewModel.buildSurfaceContract ?? {};
  const agentRail = workspace.regions?.agentRail ?? {};
  const buildCanvas = workspace.regions?.buildCanvas ?? {};
  const dataOwnership = viewModel.dataOwnershipBoundary ?? {};
  const dataEntities = Array.isArray(dataOwnership.entities) ? dataOwnership.entities : [];
  const providerDecision = dataOwnership.persistenceProviderDecision ?? {};

  return `
    <section
      class="nexus-loop-build-workspace"
      data-surface-contract="SURF-001"
      data-build-surface-contract="${escapeAttribute(buildSurface.contractId ?? "SURF-003")}"
      data-surface-id="${escapeAttribute(buildSurface.surfaceId ?? "build")}"
      data-surface-purpose="${escapeAttribute(buildSurface.purpose ?? "live-creation-workspace")}"
      data-legacy-route-boundary="${escapeAttribute(buildSurface.legacyRouteCompatibility ?? "loop-route-renders-build-surface")}"
      data-workspace-law="${escapeAttribute(workspace.workspaceLaw ?? "persistent-agent-rail-plus-live-build-canvas")}"
      data-data-ownership-task="${escapeAttribute(dataOwnership.taskId)}"
      data-data-ownership-status="${escapeAttribute(dataOwnership.status)}"
      data-data-ownership-entity-count="${escapeAttribute(dataEntities.length)}"
      data-data-ownership-provider-decision="${escapeAttribute(providerDecision.decision)}"
      data-transition-motion="discovery-chat-morphs-to-right-agent-rail"
      data-primary-workspace-from="first-skeleton"
      data-primary-workspace-until="release"
    >
      ${renderNexusWorkspaceRail({
        currentRoute: "loop",
        attributes: { "data-build-region": "continuity-restore-anchor" },
      })}

      <aside
        class="nexus-loop-build-workspace__agent-rail"
        data-build-region="agent-conversation-rail"
        data-agent-rail-writable="true"
        aria-label="שיחת Nexus שמלווה את הבנייה"
      >
        <header class="nexus-build-agent-rail__header">
          <div>
            <span>שיחה חיה עם Nexus</span>
            <strong>${escapeHtml(viewModel.agentConversation?.projectName ?? viewModel.projectName)}</strong>
          </div>
        </header>

        <section class="nexus-build-agent-rail__promise" aria-label="מצב שיחה">
          <h2>הסוכן נשאר איתך בזמן שהמוצר נבנה</h2>
          <p>השיחה, ההבנה והבנייה נשארים באותו workspace עד לשחרור.</p>
        </section>

        <div class="nexus-build-agent-rail__body">
          ${renderBuildAgentTurnState(viewModel.agentConversation)}
          ${renderBuildSpeechTruthState(viewModel.agentConversation)}
          ${renderProviderGatewayBoundary(viewModel.agentConversation)}
          ${renderMutationChangeDecision(viewModel.mutationChangeDecision)}
          ${renderCanonicalMutationFlow(viewModel.canonicalMutationFlow)}
          ${renderBuildApprovalFlow(viewModel.buildApprovalFlow)}

          <div class="nexus-build-agent-rail__thread" data-agent-rail-thread>
            ${renderAgentTranscript(viewModel)}
          </div>
        </div>

        <form class="nexus-build-agent-rail__composer" data-agent-rail-composer aria-label="שליחת שינוי או בקשה לסוכן">
          <button type="submit" data-agent-rail-send aria-label="שלח לסוכן" ${viewModel.agentConversation?.pending ? "disabled" : ""}>↗</button>
          <textarea data-agent-rail-input rows="2" placeholder="כתוב שינוי, תיקון או בקשה להמשך..." ${viewModel.agentConversation?.pending ? "disabled" : ""}>${escapeHtml(viewModel.agentConversation?.draftMessage ?? "")}</textarea>
        </form>
      </aside>

      <section
        class="nexus-loop-build-workspace__canvas"
        data-build-region="live-artifact-build-canvas"
        data-build-canvas-primary="true"
        data-first-slice-trust-task="SLICE-008"
        aria-label="התוצר החי שנבנה עכשיו"
      >
        <div class="nexus-build-surface-truth-anchors" aria-label="עוגני Build" data-build-region="human-progress-state">
          <span data-build-region="change-direction-affordance">שינוי</span>
          <span data-build-region="release-readiness-affordance">גבול שחרור</span>
          <span
            data-data-ownership-visible-status="${escapeAttribute(dataOwnership.status || "pending")}"
            data-data-ownership-provider="${escapeAttribute(providerDecision.provider || "none")}"
          >
            אמת נתונים
          </span>
        </div>
        <div class="nexus-build-canvas-body">
          <div class="nexus-build-canvas-body__preview">
            ${renderTeamMembershipSurface(viewModel)}
            ${renderSkeletonChoiceSurface(viewModel)}
            ${renderRuntimeSkeletonSurface(viewModel)}
            <div class="nexus-preserved-hidden-engines" hidden aria-hidden="true">
              ${renderProductSkeletonAgentCard(viewModel)}
              ${renderVisualProductSkeletonAgentSurface(viewModel)}
              ${renderDesignPluginLiveProof(viewModel)}
            </div>
            ${renderVisualBuildTruthSurface(viewModel)}
            ${viewModel.previewArtifact
              ? renderProofArtifactSurface(viewModel.previewArtifact, { surfaceId: "loop-live-build-canvas" })
              : viewModel.runtimeSkeleton ? "" : renderFallbackLiveBuildCanvas(viewModel)}
          </div>
        </div>
      </section>
    </section>
  `;
}

export function renderLoopCoreScreen(viewModel) {
  return `
    <section
      class="nexus-loop-page"
      data-build-surface="agent-rail-plus-live-canvas"
      data-build-surface-contract="SURF-003"
    >
      ${renderBuildWorkspaceSurface(viewModel)}
    </section>
  `;
}
