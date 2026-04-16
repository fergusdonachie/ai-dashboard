#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMUX_TMPDIR="$ROOT_DIR/run/tmux"
AUTOSTART_DIR="$ROOT_DIR/run/autostart"
SESSION_NAME="${1:-}"

if [[ -z "$SESSION_NAME" ]]; then
  echo "Usage: scripts/stop-ai-session.sh <session-name>"
  exit 1
fi

mkdir -p "$TMUX_TMPDIR" "$AUTOSTART_DIR"
export TMUX_TMPDIR

if command -v tmux >/dev/null 2>&1; then
  tmux kill-session -t "$SESSION_NAME" >/dev/null 2>&1 || true
fi

rm -f "$AUTOSTART_DIR/$SESSION_NAME.session"
echo "Stopped AI session and removed reboot restore marker: $SESSION_NAME"
