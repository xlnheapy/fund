#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building the Next.js project..."
pnpm next build

echo "Bundling server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"

echo "Packaging build artifacts..."
zip -r /tmp/fund-project-build.zip .next/ dist/ public/ package.json next.config.* .coze scripts/ --exclude="node_modules/*" > /dev/null 2>&1
echo "Build package created: /tmp/fund-project-build.zip"
