#!/bin/sh
# One-time per clone: point git at the versioned hooks in .githooks/.
set -e
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true
echo "git hooks installed: core.hooksPath=$(git config core.hooksPath)"
echo "  pre-push      refuses release/* pushes without ALLOW_PROD_DEPLOY=1, and non-fast-forward pushes to main/release/*"
echo "  post-checkout warns when you land on a release/* branch"
