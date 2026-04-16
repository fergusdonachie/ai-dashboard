#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AUTOSTART_DIR="$ROOT_DIR/run/autostart"

mkdir -p "$AUTOSTART_DIR"

setopt null_glob
MARKERS=("$AUTOSTART_DIR"/*.session)

if (( ${#MARKERS[@]} == 0 )); then
  echo "No AI sessions marked for restore"
  exit 0
fi

for marker in "${MARKERS[@]}"; do
  IFS=$'\t' read -r session_type session_name workspace < "$marker"

  case "$session_type" in
    codex)
      /bin/zsh "$ROOT_DIR/scripts/start-codex-session.sh" "$session_name" "$workspace"
      ;;
    claude)
      /bin/zsh "$ROOT_DIR/scripts/start-claude-session.sh" "$session_name" "$workspace"
      ;;
    *)
      echo "Skipping unknown AI session type in $marker: $session_type"
      ;;
  esac
done
