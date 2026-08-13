#!/bin/bash
# Cloud VM setup for claude.ai/code sessions. The environment's "setup script"
# field contains: `cd /home/user/fitbatchcooker && bash scripts/cloud-setup.sh`
# (the setup phase does NOT start in the repo checkout).
set -eo pipefail

# The repo pins Node in .nvmrc; the default VM image ships Node 22. Guard makes
# this a no-op the day the image catches up — no time wasted, nothing to watch.
# Direct tarball install: nvm's shell magic breaks under strict mode (exit 3).
WANTED_NODE="$(cat .nvmrc)"
WANTED_MAJOR="${WANTED_NODE%%.*}"
CURRENT_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"

if [ "$CURRENT_MAJOR" != "$WANTED_MAJOR" ]; then
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) NODE_ARCH="x64" ;;
    aarch64) NODE_ARCH="arm64" ;;
    *) echo "Unsupported arch: $ARCH" >&2; exit 1 ;;
  esac
  echo "Node $(node -v 2>/dev/null || echo none) → installing $WANTED_NODE (tarball, $NODE_ARCH)"
  curl -fsSL "https://nodejs.org/dist/v${WANTED_NODE}/node-v${WANTED_NODE}-linux-${NODE_ARCH}.tar.xz" \
    | tar -xJ -C /opt
  # Tool calls run in non-login shells with an inherited PATH; /root/.local/bin
  # is the one hook ahead of /opt/node22/bin in both cases.
  NODE_BIN="/opt/node-v${WANTED_NODE}-linux-${NODE_ARCH}/bin"
  mkdir -p /root/.local/bin
  ln -sfn "$NODE_BIN/node" /root/.local/bin/node
  ln -sfn "$NODE_BIN/npm"  /root/.local/bin/npm
  ln -sfn "$NODE_BIN/npx"  /root/.local/bin/npx
  export PATH="/root/.local/bin:$PATH"
else
  echo "Node $(node -v) already matches .nvmrc — skipping install"
fi

node -v && npm -v

npm ci

# Env vars are injected when Claude Code starts, NOT during this setup phase —
# and prisma.config.ts requires DIRECT_URL at load time. Defer when absent.
if [ -n "${DIRECT_URL:-}" ]; then
  npx prisma generate
else
  echo "DIRECT_URL not set at setup time — run 'npx prisma generate' in-session"
fi

npx playwright install chromium --with-deps
