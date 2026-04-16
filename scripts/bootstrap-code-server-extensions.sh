#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/.code-server/extensions"
SOURCE_DIR="$HOME/.vscode/extensions"

mkdir -p "$TARGET_DIR"

copy_extension() {
  local pattern="$1"
  local source
  source="$(find "$SOURCE_DIR" -maxdepth 1 -type d -name "$pattern" | sort | tail -n 1)"

  if [[ -z "$source" ]]; then
    echo "Missing source extension: $pattern"
    return 1
  fi

  local dest="$TARGET_DIR/$(basename "$source")"
  rm -rf "$dest"
  cp -R "$source" "$dest"
  echo "Copied $(basename "$source")"
}

copy_extension "openai.chatgpt-*"
copy_extension "anthropic.claude-code-*"
copy_extension "dbaeumer.vscode-eslint-*"
copy_extension "esbenp.prettier-vscode-*"
copy_extension "davidanson.vscode-markdownlint-*"
copy_extension "eamodio.gitlens-*"

echo "Code-server extensions bootstrapped into $TARGET_DIR"
