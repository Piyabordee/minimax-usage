# AGENTS.md — minimax-usage

## Project Overview

VS Code extension that displays MiniMax Token Plan usage on the status bar.
Single-file architecture — all logic lives in `extension.js`.

## Architecture

```
extension.js
├── activate()          — entry point, registers commands + status bar + auto-refresh
├── setupAutoRefresh()  — configurable polling interval via vscode config
├── setApiKey()         — stores key in vscode.SecretStorage (never plaintext)
├── refreshUsage()      — orchestrator: read key → fetch → update bar
├── fetchUsage()        — raw HTTPS GET to MiniMax API, returns parsed JSON
├── updateStatusBar()   — formats numbers + applies color thresholds
└── showDetails()       — webview panel with KPI cards, progress bar, raw JSON
```

No build step. No bundling. Pure Node.js + VS Code API.

## API

- **Endpoint:** `GET https://www.minimax.io/v1/token_plan/remains`
- **Auth:** `Authorization: Bearer <key>`
- **Response shape varies** — the `get()` helper searches multiple known key names (`used`, `token_used`, `tokens_used`, `total`, `limit`, `remaining`, etc.) across top-level and nested objects. Any changes to field extraction should update both `updateStatusBar()` and `showDetails()`.

## Key Decisions

- **Secrets** stored via `context.secrets` (VS Code SecretStorage), never in settings.json.
- **Status bar colors:** normal < 75%, warning (yellow) 75–89%, error (red) 90%+.
- **Number formatting:** `fmt()` uses K/M suffixes for status bar compactness; `toLocaleString()` for detail view.
- **No external dependencies** — uses only `vscode` and Node built-in `https`.
- **Time remaining calculation:** uses `end_time - Date.now()` instead of `remains_time` (API may return seconds vs milliseconds inconsistently).
- **Status bar text always shows**: percentage + time left when available (e.g. `7% (1h26m)`), even when usage is low or `total = 0`.

## Modification History

- **v1.0.2** — `updateStatusBar()`: fixed time display bug when `total = 0`; now uses `end_time` (absolute) instead of `remains_time` (relative) for reliable countdown.
- **v1.0.1** — Fixed publisher ID from `undefined_publisher` to `minimax-usage` (required for extension updates to work).

## Commands

| Command | What it does |
|---|---|
| `minimaxUsage.setApiKey` | Opens input box (masked), stores key |
| `minimaxUsage.refresh` | Manual refresh of usage data |
| `minimaxUsage.showDetails` | Opens webview with KPI + raw JSON |

## Configuration

- `minimaxUsage.refreshIntervalMinutes` — auto-refresh interval (1–60 min, default 5).

## Modification Guidelines

- Keep it single-file. This extension is intentionally minimal.
- The `get()` lookup helper is duplicated in `updateStatusBar()` and `showDetails()` — if the API response shape changes, update both.
- All UI strings use VS Code theme colors (`var(--vscode-*)`) — do not hardcode colors in the webview HTML.
- Test manually: install locally into `~/.vscode/extensions/minimax-usage-1.0.0/` and reload VS Code.
