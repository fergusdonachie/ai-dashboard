#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ai-dashboard.server"
PLIST_PATH="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

cd "$ROOT_DIR"
npm run build
/bin/zsh "$ROOT_DIR/scripts/install-dashboard-launch-agent.sh"

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$PLIST_PATH"
launchctl kickstart -k "$DOMAIN/$LABEL"

echo "Started dashboard server via launchctl"
echo "LaunchAgent: $PLIST_PATH"
