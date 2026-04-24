#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ai-dashboard.server"
PLIST_PATH="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

cd "$ROOT_DIR"
npm run build
/bin/zsh "$ROOT_DIR/scripts/install-dashboard-launch-agent.sh"

service_is_loaded() {
  launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1
}

retry_bootstrap() {
  local exit_code=1

  for _attempt in 1 2 3; do
    if launchctl bootstrap "$DOMAIN" "$PLIST_PATH"; then
      return 0
    fi

    exit_code=$?

    if service_is_loaded; then
      return 0
    fi

    sleep 1
  done

  return "$exit_code"
}

retry_kickstart() {
  local exit_code=1

  for _attempt in 1 2 3; do
    if launchctl kickstart -k "$DOMAIN/$LABEL"; then
      return 0
    fi

    exit_code=$?
    sleep 1
  done

  return "$exit_code"
}

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
retry_bootstrap
retry_kickstart

echo "Started dashboard server via launchctl"
echo "LaunchAgent: $PLIST_PATH"
