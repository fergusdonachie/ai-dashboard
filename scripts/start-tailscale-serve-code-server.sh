#!/bin/zsh

set -euo pipefail

TAILSCALE_BIN="/Applications/Tailscale.app/Contents/MacOS/Tailscale"

if [[ ! -x "$TAILSCALE_BIN" ]]; then
  echo "Tailscale CLI not found at $TAILSCALE_BIN"
  exit 1
fi

"$TAILSCALE_BIN" serve reset >/dev/null 2>&1 || true
"$TAILSCALE_BIN" serve --bg --https=443 127.0.0.1:3000
"$TAILSCALE_BIN" serve --bg --https=443 --set-path /code 127.0.0.1:8443
echo "Tailscale Serve configured for the dashboard at / and code-server at /code"
