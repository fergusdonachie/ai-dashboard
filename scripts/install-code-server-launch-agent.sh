#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT_DIR/run"
LOG_DIR="$ROOT_DIR/logs"
DATA_DIR="$ROOT_DIR/.code-server"
CONFIG_HOME_DIR="$DATA_DIR/config-home"
PASSWORD_FILE="$RUN_DIR/code-server-password.txt"
LOG_FILE="$LOG_DIR/code-server.log"
PLIST_DIR="$HOME/Library/LaunchAgents"
LABEL="com.ai-dashboard.code-server"
PLIST_PATH="$PLIST_DIR/$LABEL.plist"
CODE_SERVER_BIN="${CODE_SERVER_BIN:-}"
BIND_ADDR="${CODE_SERVER_BIND_ADDR:-127.0.0.1:8443}"
WORKSPACE="${CODE_SERVER_WORKSPACE:-$ROOT_DIR}"

mkdir -p "$RUN_DIR" "$LOG_DIR" "$DATA_DIR" "$CONFIG_HOME_DIR" "$PLIST_DIR"

if [[ -z "$CODE_SERVER_BIN" && -x "$HOME/.local/bin/code-server" ]]; then
  CODE_SERVER_BIN="$HOME/.local/bin/code-server"
fi

if [[ -z "$CODE_SERVER_BIN" ]]; then
  CODE_SERVER_BIN="$(command -v code-server || true)"
fi

if [[ -z "$CODE_SERVER_BIN" ]]; then
  echo "code-server is not installed. Install it first with: brew install code-server"
  exit 1
fi

if [[ ! -f "$PASSWORD_FILE" ]]; then
  openssl rand -hex 16 > "$PASSWORD_FILE"
  chmod 600 "$PASSWORD_FILE"
fi

PASSWORD="$(cat "$PASSWORD_FILE")"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PASSWORD</key>
      <string>$PASSWORD</string>
      <key>XDG_CONFIG_HOME</key>
      <string>$CONFIG_HOME_DIR</string>
    </dict>
    <key>ProgramArguments</key>
    <array>
      <string>$CODE_SERVER_BIN</string>
      <string>$WORKSPACE</string>
      <string>--bind-addr</string>
      <string>$BIND_ADDR</string>
      <string>--auth</string>
      <string>password</string>
      <string>--user-data-dir</string>
      <string>$DATA_DIR/user-data</string>
      <string>--extensions-dir</string>
      <string>$DATA_DIR/extensions</string>
      <string>--disable-telemetry</string>
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

echo "Installed code-server launch agent"
echo "LaunchAgent: $PLIST_PATH"
echo "Bind address: $BIND_ADDR"
echo "Workspace: $WORKSPACE"
echo "Password file: $PASSWORD_FILE"
echo "Log file: $LOG_FILE"
