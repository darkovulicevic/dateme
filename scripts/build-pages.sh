#!/usr/bin/env bash
# Builds a static site in out/ for GitHub Pages.
# Route handlers cannot be exported, so the API folder is set aside for this build only.
set -euo pipefail

cd "$(dirname "$0")/.."

api_dir="src/app/api"
stash=""

if [ -d "$api_dir" ]; then
  stash="$(mktemp -d)"
  mv "$api_dir" "$stash/api"
fi

cleanup() {
  if [ -n "$stash" ] && [ -d "$stash/api" ]; then
    mkdir -p src/app
    rm -rf "$api_dir"
    mv "$stash/api" "$api_dir"
  fi
  if [ -n "$stash" ]; then
    rm -rf "$stash"
  fi
}
trap cleanup EXIT

export GITHUB_PAGES=1
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/datememagdalena}"

# Drop the dev server's generated types. They still point at the API routes
# that this build temporarily moves aside.
rm -rf .next

npx next build
echo "Static site written to out/"
