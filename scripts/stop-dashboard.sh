#!/bin/zsh

set -euo pipefail

LABEL="com.ai-dashboard.server"
DOMAIN="gui/$(id -u)"

if launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  echo "Stopped dashboard server launch agent"
  exit 0
fi

echo "dashboard server launch agent is not loaded"
