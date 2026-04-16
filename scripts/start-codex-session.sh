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

CODEX_BIN="${CODEX_BIN:-$HOME/.vscode/extensions/openai.chatgpt-26.409.20454-darwin-arm64/bin/macos-aarch64/codex}"
if [[ ! -x "$CODEX_BIN" ]]; then
  CODEX_BIN="$(command -v codex || true)"
fi

if [[ -z "$CODEX_BIN" ]]; then
  echo "Codex CLI not found"
  exit 1
fi

SESSION_NAME="${1:-dashboard-codex}"
WORKSPACE="${2:-$ROOT_DIR}"
LOG_FILE="$SESSION_DIR/${SESSION_NAME}.log"
MARKER_FILE="$AUTOSTART_DIR/${SESSION_NAME}.session"

tmux has-session -t "$SESSION_NAME" 2>/dev/null && {
  echo "tmux session already exists: $SESSION_NAME"
  exit 0
}

tmux new-session -d -s "$SESSION_NAME" "cd '$WORKSPACE' && exec zsh -l"
tmux pipe-pane -o -t "$SESSION_NAME" "cat >> '$LOG_FILE'"
tmux send-keys -t "$SESSION_NAME" "'$CODEX_BIN'" Enter
printf '%s\t%s\t%s\n' "codex" "$SESSION_NAME" "$WORKSPACE" > "$MARKER_FILE"
echo "Started Codex tmux session: $SESSION_NAME"
echo "Workspace: $WORKSPACE"
echo "Log file: $LOG_FILE"
