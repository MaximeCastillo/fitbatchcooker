#!/bin/bash
# Cloud VM setup for claude.ai/code sessions. The environment's "setup script"
# field should contain a single line: `bash scripts/cloud-setup.sh` — keeping
# the real logic versioned here.
set -euo pipefail

# The repo pins Node in .nvmrc; the default VM image ships Node 22. Guard makes
# this a no-op the day the image catches up — no time wasted, nothing to watch.
WANTED_NODE="$(cat .nvmrc)"
WANTED_MAJOR="${WANTED_NODE%%.*}"
CURRENT_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"

if [ "$CURRENT_MAJOR" != "$WANTED_MAJOR" ]; then
  echo "Node $(node -v 2>/dev/null || echo none) → installing $WANTED_NODE via nvm"
  export NVM_DIR=/opt/nvm
  . "$NVM_DIR/nvm.sh"
  nvm install "$WANTED_NODE"
  # Tool calls run in non-login shells with an inherited PATH; /root/.local/bin
  # is the one hook ahead of /opt/node22/bin in both cases.
  NODE_BIN="$NVM_DIR/versions/node/v$WANTED_NODE/bin"
  mkdir -p /root/.local/bin
  ln -sfn "$NODE_BIN/node" /root/.local/bin/node
  ln -sfn "$NODE_BIN/npm"  /root/.local/bin/npm
  ln -sfn "$NODE_BIN/npx"  /root/.local/bin/npx
  export PATH="/root/.local/bin:$PATH"
else
  echo "Node $(node -v) already matches .nvmrc — skipping install"
fi

npm ci
npx prisma generate
npx playwright install chromium --with-deps
