#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ai-dashboard.code-server"
DOMAIN="gui/$(id -u)"
PASSWORD_FILE="$ROOT_DIR/run/code-server-password.txt"

if ! command -v code-server >/dev/null 2>&1; then
  echo "code-server not installed"
  exit 1
fi

if ! launchctl print "$DOMAIN/$LABEL" >/tmp/ai-dashboard-code-server-status.txt 2>&1; then
  echo "code-server installed but launch agent is not loaded"
  exit 1
fi

STATUS_OUTPUT="$(cat /tmp/ai-dashboard-code-server-status.txt)"
rm -f /tmp/ai-dashboard-code-server-status.txt

PID_LINE="$(printf '%s\n' "$STATUS_OUTPUT" | grep -m 1 'pid = ' || true)"
STATE_LINE="$(printf '%s\n' "$STATUS_OUTPUT" | grep -m 1 'state = ' || true)"

if [[ -f "$PASSWORD_FILE" ]]; then
  echo "${STATE_LINE:-running}; ${PID_LINE:-pid unknown}; password stored in $PASSWORD_FILE"
else
  echo "${STATE_LINE:-running}; ${PID_LINE:-pid unknown}"
fi
