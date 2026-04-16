#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
XDG_CONFIG_HOME="$ROOT_DIR/.code-server/config-home" \
code-server \
  --extensions-dir "$ROOT_DIR/.code-server/extensions" \
  --user-data-dir "$ROOT_DIR/.code-server/user-data" \
  --list-extensions
