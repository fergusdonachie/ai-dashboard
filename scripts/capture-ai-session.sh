#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMUX_TMPDIR="$ROOT_DIR/run/tmux"
mkdir -p "$TMUX_TMPDIR"
export TMUX_TMPDIR

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed. Install it first with: brew install tmux"
  exit 1
fi

SESSION_NAME="${1:-dashboard-codex}"
tmux capture-pane -pt "$SESSION_NAME" -S -200
