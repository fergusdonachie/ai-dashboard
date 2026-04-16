#!/bin/zsh

set -euo pipefail

curl -fsSL https://code-server.dev/install.sh | sh -s -- --method=standalone
