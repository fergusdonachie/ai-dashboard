#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ai-dashboard.ai-sessions"
PLIST_PATH="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

/bin/zsh "$ROOT_DIR/scripts/install-ai-session-launch-agent.sh"

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$PLIST_PATH"
launchctl kickstart -k "$DOMAIN/$LABEL"

echo "Started AI session restore via launchctl"
echo "LaunchAgent: $PLIST_PATH"
