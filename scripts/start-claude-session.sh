#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SESSION_DIR="$ROOT_DIR/run/sessions"
TMUX_TMPDIR="$ROOT_DIR/run/tmux"
AUTOSTART_DIR="$ROOT_DIR/run/autostart"
mkdir -p "$SESSION_DIR" "$TMUX_TMPDIR" "$AUTOSTART_DIR"
export TMUX_TMPDIR

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed. Install it first with: brew install tmux"
  exit 1
fi

CLAUDE_BIN="$(command -v claude || true)"
if [[ -z "$CLAUDE_BIN" ]]; then
  echo "Claude CLI not found"
  exit 1
fi

SESSION_NAME="${1:-dashboard-claude}"
WORKSPACE="${2:-$ROOT_DIR}"
LOG_FILE="$SESSION_DIR/${SESSION_NAME}.log"
MARKER_FILE="$AUTOSTART_DIR/${SESSION_NAME}.session"

tmux has-session -t "$SESSION_NAME" 2>/dev/null && {
  echo "tmux session already exists: $SESSION_NAME"
  exit 0
}

tmux new-session -d -s "$SESSION_NAME" "cd '$WORKSPACE' && exec zsh -l"
tmux pipe-pane -o -t "$SESSION_NAME" "cat >> '$LOG_FILE'"
tmux send-keys -t "$SESSION_NAME" "'$CLAUDE_BIN'" Enter
printf '%s\t%s\t%s\n' "claude" "$SESSION_NAME" "$WORKSPACE" > "$MARKER_FILE"
echo "Started Claude tmux session: $SESSION_NAME"
echo "Workspace: $WORKSPACE"
echo "Log file: $LOG_FILE"
