#!/usr/bin/env bash
set -euo pipefail

echo "Building..."
pnpm build

echo "Deploying dist/ to gh-pages branch..."
# Force-push the dist folder as the root of the gh-pages branch
git add -f dist/
TREE=$(git write-tree --prefix=dist/)
COMMIT=$(echo "Deploy $(git rev-parse --short HEAD)" | git commit-tree "$TREE" -p refs/heads/gh-pages 2>/dev/null || \
         echo "Deploy $(git rev-parse --short HEAD)" | git commit-tree "$TREE")
git update-ref refs/heads/gh-pages "$COMMIT"
git push origin gh-pages --force
git rm -r --cached dist/ 2>/dev/null || true
git reset HEAD dist/ 2>/dev/null || true

echo "Deployed to https://binbuf.github.io/browser-fingerprint/"
