#!/bin/zsh

set -euo pipefail

LABEL="com.ai-dashboard.server"
DOMAIN="gui/$(id -u)"
TMP_FILE="/tmp/ai-dashboard-server-status.txt"

if ! launchctl print "$DOMAIN/$LABEL" >"$TMP_FILE" 2>&1; then
  echo "dashboard server launch agent is not loaded"
  rm -f "$TMP_FILE"
  exit 1
fi

if curl -fsS "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  echo "dashboard server is running on http://127.0.0.1:3000"
  rm -f "$TMP_FILE"
  exit 0
fi

echo "dashboard launch agent is loaded but the health check failed"
rm -f "$TMP_FILE"
exit 1
