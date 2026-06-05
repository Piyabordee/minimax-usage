#!/usr/bin/env bash
# scripts/release.sh — release minimax-usage to GitHub Releases
#
# Usage:
#   1. gh auth login                        # interactive, opens browser
#   2. ./scripts/release.sh [VERSION]       # defaults to 1.0.4
#
# What it does:
#   - Verifies gh auth and repo access (preflight, exits on failure)
#   - Fixes the package.json URL placeholder if still present (commits locally)
#   - Pushes local commits to origin/main
#   - Creates a DRAFT GitHub release with the .vsix attached
#
# Review the draft at: https://github.com/Piyabordee/minimax-usage/releases
# Then click "Publish release" to make it visible.

set -euo pipefail

VERSION="${1:-1.0.4}"
VSIX_FILE="minimax-usage-${VERSION}.vsix"
REPO="Piyabordee/minimax-usage"

# --- Preflight ---

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found. Install from https://cli.github.com"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh not authenticated. Run: gh auth login first."
  exit 1
fi

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "ERROR: Cannot access $REPO. Check ownership and permissions."
  exit 1
fi

# --- Step 1: Fix package.json URL placeholder if still present ---

if grep -q "YOUR_USERNAME" package.json; then
  echo "Fixing package.json URL placeholder..."
  sed -i.bak 's/YOUR_USERNAME/Piyabordee/g' package.json && rm -f package.json.bak
  git add package.json
  git commit -m "Fix repository URL placeholder in package.json"
fi

# --- Step 2: Push local commits ---

echo "Pushing local commits to origin/main..."
git push origin main

# --- Step 3: Verify the .vsix exists ---

if [ ! -f "$VSIX_FILE" ]; then
  echo "ERROR: $VSIX_FILE not found. Rebuild with: npx vsce package"
  exit 1
fi

# --- Step 4: Write release notes to a temp file (avoids heredoc/escaping issues) ---

NOTES_FILE=$(mktemp)
trap "rm -f $NOTES_FILE" EXIT

cat > "$NOTES_FILE" <<'EOF'
## Bug fix
- Status bar now correctly shows used percentage when the API returns `current_interval_total_count=0`. Falls back through: `status===3 → current_interval_remaining_percent → current_weekly_remaining_percent`, clamped to 0-100.

## Maintenance
- Removed dead `get`/`fmt` helpers in `updateStatusBar` and the DEBUG `console.log`.
- `.vscodeignore` now excludes `.remember/**` so personal session logs don't ship in the VSIX.
- Repository URL in `package.json` updated from placeholder to actual GitHub URL.

**Full Changelog**: https://github.com/Piyabordee/minimax-usage/compare/v1.0.3...v1.0.4
EOF

# --- Step 5: Create the release as DRAFT (review before publishing) ---

echo "Creating DRAFT release v${VERSION}..."
gh release create "v${VERSION}" \
  "$VSIX_FILE" \
  --title "v${VERSION}" \
  --notes-file "$NOTES_FILE" \
  --target main \
  --draft

echo ""
echo "Draft release created!"
echo "Review and publish at: https://github.com/${REPO}/releases/tag/v${VERSION}"
