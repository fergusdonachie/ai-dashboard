#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT_DIR/run"
LOG_DIR="$ROOT_DIR/logs"
PLIST_DIR="$HOME/Library/LaunchAgents"
LABEL="com.ai-dashboard.server"
PLIST_PATH="$PLIST_DIR/$LABEL.plist"
NODE_BIN="$(command -v node || true)"
PROFILE="${DASHBOARD_PROFILE_DEFAULT:-main-mac}"
HOST="${DASHBOARD_HOST:-0.0.0.0}"
PORT="${DASHBOARD_PORT:-3000}"
LOG_FILE="$LOG_DIR/dashboard-server.log"

mkdir -p "$RUN_DIR" "$LOG_DIR" "$PLIST_DIR"

if [[ -z "$NODE_BIN" ]]; then
  echo "node is not installed or not on PATH"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/dist/server/index.js" ]]; then
  echo "Built dashboard server not found at dist/server/index.js"
  echo "Run npm run build first"
  exit 1
fi

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>EnvironmentVariables</key>
    <dict>
      <key>DASHBOARD_PROFILE</key>
      <string>$PROFILE</string>
      <key>HOST</key>
      <string>$HOST</string>
      <key>PORT</key>
      <string>$PORT</string>
    </dict>
    <key>ProgramArguments</key>
    <array>
      <string>$NODE_BIN</string>
      <string>$ROOT_DIR/dist/server/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$ROOT_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOG_FILE</string>
    <key>StandardErrorPath</key>
    <string>$LOG_FILE</string>
  </dict>
</plist>
EOF

echo "Installed dashboard launch agent"
echo "LaunchAgent: $PLIST_PATH"
echo "Profile: $PROFILE"
echo "Host: $HOST"
echo "Port: $PORT"
