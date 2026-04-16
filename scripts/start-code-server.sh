#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ai-dashboard.code-server"
PLIST_PATH="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

/bin/zsh "$ROOT_DIR/scripts/install-code-server-launch-agent.sh"

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$PLIST_PATH"
launchctl kickstart -k "$DOMAIN/$LABEL"

echo "Started code-server via launchctl"
echo "LaunchAgent: $PLIST_PATH"
