#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASSWORD_FILE="$ROOT_DIR/run/code-server-password.txt"

if [[ ! -f "$PASSWORD_FILE" ]]; then
  echo "No code-server password file found. Start code-server first."
  exit 1
fi

echo "code-server password:"
cat "$PASSWORD_FILE"
