---
name: version-bump-on-code-change
description: Use when modifying code in any versioned package (VSCode extension, npm, pip, cargo crate) - every code-changing commit must bump the version AND carry a truthful commit message describing what actually changed
---

# Version Bump on Code Change

## Overview

Code changes in versioned packages are contracts. The version says "this is a different release"; the commit message says "this is what changed". Both must be updated on every code-changing commit. No batching, no "fix is too small", no "user will do it manually".

**Violating the letter of this rule is violating the spirit.** "I'll bump in the next commit" is not allowed; the next commit will have its own changes.

## When to Use

- Project has a version manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, `extension.vsixmanifest`)
- You changed code (feature, fix, refactor, cleanup, dead-code removal, log change)
- Project ships a build artifact (`.vsix`, `dist/`, wheel, crate) needing re-bundling
- About to commit

Skip ONLY for: docs-only changes with no version reference, or the initial commit.

## How to Apply

### 1. Pick the bump level (semver)

| Level | When |
|-------|------|
| **patch** (1.0.3 → 1.0.4) | bug fix, dead-code removal, log cleanup, no API change |
| **minor** (1.0.3 → 1.1.0) | new feature, new command, new exported function |
| **major** (1.0.3 → 2.0.0) | breaking change to public API or default behavior |

Default to **patch** when unsure. You can always bump again.

### 2. Edit manifest, rebuild, stage, commit

- Update the `version` field (auto-propagates to `extension.vsixmanifest` on next vsce build)
- Rebuild the artifact if one exists — stale artifacts in a repo are a bug
- Stage code + manifest + artifact + any other touched files
- Message format: `<what changed>; bump to <X.Y.Z>`

Examples: `Fix status bar percentage when API returns total=0; bump to 1.0.4` · `Add dark-mode toggle; bump to 1.1.0` · `Drop Python 3.7 support; bump to 2.0.0`

## Red Flags - STOP and Reset

"Just a typo fix / dead-code cleanup" · "User didn't ask" · "We'll batch bumps" · "Docs / tests / config don't count" · "Previous commit had the bump" · "User will bump it manually" · "Too small for a new version" · "User might have unstaged work" → `git status` first; if clean, commit · "PR description has the details" → no, the commit message IS the history

**All of these mean: bump the version, write what actually changed, commit.**

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "Too small for a bump" | semver patch exists for small changes. Use it. |
| "User didn't ask" | Discipline is automatic, not opt-in. |
| "We'll batch bumps" | Artifact goes out of sync with source. Bump now. |
| "Tests / docs / config don't count" | If they shipped in the artifact, they count. |
| "Last commit was the bump" | Then last commit should've included the code. Don't decouple. |
| "User might have unstaged work" | `git status` first. If clean, commit. If not, surface and ask. |
| "Commit can be vague, PR has details" | No. Commit IS the history. Be specific. |

## Verification

After committing, confirm: (1) `git log -1` mentions the new version · (2) `git show HEAD --stat` shows manifest in the diff with bumped version · (3) build artifact (if any) is in the commit and matches the manifest version
