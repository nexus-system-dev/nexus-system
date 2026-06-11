#!/bin/zsh
set -euo pipefail

ROOT="/Users/yogevlavian/Desktop/The Nexus"
LOG_DIR="/private/tmp/nexus-live-onboarding-audit"
mkdir -p "$LOG_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/live-onboarding-audit-$STAMP.log"
STATUS_FILE="$LOG_DIR/current-status.json"

cd "$ROOT"

echo "{\"startedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"cwd\":\"$ROOT\",\"mode\":\"background-live-audit\"}" > "$STATUS_FILE"

while true; do
  {
    echo "===== LIVE ONBOARDING AUDIT CYCLE $(date -u +%Y-%m-%dT%H:%M:%SZ) ====="
    node scripts/run-live-class-sweep.mjs
    echo "===== CYCLE COMPLETE $(date -u +%Y-%m-%dT%H:%M:%SZ) ====="
  } >> "$RUN_LOG" 2>&1 || {
    {
      echo "===== CYCLE FAILED $(date -u +%Y-%m-%dT%H:%M:%SZ) ====="
      echo "status=failed"
    } >> "$RUN_LOG"
  }

  printf '{"lastHeartbeat":"%s","log":"%s","status":"running"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$RUN_LOG" > "$STATUS_FILE"

  sleep 60
done
