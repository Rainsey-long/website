#!/bin/bash
# SessionStart hook (cloud sessions only). Two jobs:
#  1. Make tests and lint work in a fresh container: install dependencies when
#     node_modules is missing or older than package-lock.json. `npm install`
#     (not `npm ci`) so the cached container state is reused.
#  2. Save tokens: print a short status (branch, recent commits, uncommitted
#     files, doc budget) so the session starts knowing where things stand
#     instead of spending tool calls to rediscover it. The committed memory
#     (.claude/memory/MEMORY.md) is already loaded through CLAUDE.md.
# Synchronous on purpose: nothing should run tests before the install ends.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm install --no-audit --no-fund --loglevel=error >&2
fi
# Shared git hooks (pre-push guard on release/*), harmless to repeat.
git config core.hooksPath .githooks 2>/dev/null || true

echo "## Session status (from .claude/hooks/session-start.sh)"
echo "- Branch: $(git branch --show-current 2>/dev/null || echo '?')"
echo "- Uncommitted files: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
echo "- Recent commits:"
git log --oneline -5 2>/dev/null | sed 's/^/  - /'
echo "- $(node scripts/doc-budget.mjs --quiet 2>/dev/null || true)"
echo "- Read .claude/system-state.md for open items and .claude/memory/sessions.md for what happened last time."
