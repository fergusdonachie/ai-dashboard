#!/bin/zsh

set -euo pipefail

LABEL="com.ai-dashboard.code-server"
DOMAIN="gui/$(id -u)"

if launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  echo "Stopped code-server launch agent"
  exit 0
fi

echo "code-server launch agent is not loaded"
exit 1
