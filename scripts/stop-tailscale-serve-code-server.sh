#!/bin/zsh

set -euo pipefail

TAILSCALE_BIN="/Applications/Tailscale.app/Contents/MacOS/Tailscale"

if [[ ! -x "$TAILSCALE_BIN" ]]; then
  echo "Tailscale CLI not found at $TAILSCALE_BIN"
  exit 1
fi

"$TAILSCALE_BIN" serve reset
echo "Tailscale Serve configuration reset"
